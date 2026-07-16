// LZX decompressor for CAB folders — the compression OneNote desktop uses in
// .onepkg exports. Ported from the [MS-CAB]/LZX specification (see also
// libmspack's lzxd, the de-facto reference). Browser-compatible, no deps.
//
// Stream model: little-endian 16-bit words, bits consumed MSB-first. Output is
// produced in 32 KB frames; the bitstream realigns to 16 bits at every frame
// boundary, and Intel E8 call translation (when enabled by the stream header)
// is undone per frame.

const MIN_MATCH = 2;
const NUM_CHARS = 256;
const PRETREE_NUM_ELEMENTS = 20;
const ALIGNED_NUM_ELEMENTS = 8;
const NUM_PRIMARY_LENGTHS = 7;
const NUM_SECONDARY_LENGTHS = 249;
const FRAME_SIZE = 32768;

const BLOCKTYPE_VERBATIM = 1;
const BLOCKTYPE_ALIGNED = 2;
const BLOCKTYPE_UNCOMPRESSED = 3;

// Position slot tables. extra_bits: 0,0,0,0,1,1,2,2,... capped at 17.
// position_base: cumulative sums of 1 << extra_bits.
const EXTRA_BITS: number[] = [];
const POSITION_BASE: number[] = [];
{
  let base = 0;
  for (let slot = 0; slot <= 50; slot++) {
    const extra = slot < 4 ? 0 : Math.min(17, (slot >> 1) - 1);
    EXTRA_BITS.push(extra);
    POSITION_BASE.push(base);
    base += 1 << extra;
  }
}

class BitReader {
  private buf = 0; // bits left-justified in a 32-bit register
  private n = 0; // number of valid bits in buf
  pos = 0;

  constructor(private data: Uint8Array) {}

  private fill() {
    // Append one little-endian 16-bit word below the existing bits.
    const lo = this.pos < this.data.length ? this.data[this.pos] : 0;
    const hi = this.pos + 1 < this.data.length ? this.data[this.pos + 1] : 0;
    this.pos += 2;
    this.buf = (this.buf | (((hi << 8) | lo) << (16 - this.n))) >>> 0;
    this.n += 16;
  }

  /** Read up to 16 bits, MSB-first. */
  read(k: number): number {
    if (k === 0) return 0;
    while (this.n < k) this.fill();
    const v = this.buf >>> (32 - k);
    this.buf = (this.buf << k) >>> 0;
    this.n -= k;
    return v;
  }

  read24(): number {
    return (this.read(16) << 8) | this.read(8);
  }

  /** Realign to a 16-bit boundary (frame boundaries). */
  align16() {
    const misaligned = this.n & 15;
    if (misaligned) this.read(misaligned);
  }

  /**
   * Alignment before an uncompressed block: discard 1-16 bits — if already
   * aligned, a full 16-bit word is skipped.
   */
  alignForUncompressed() {
    if (this.n === 0) this.fill();
    this.buf = 0;
    this.n = 0;
  }

  readRawByte(): number {
    return this.pos < this.data.length ? this.data[this.pos++] : 0;
  }

  /** Resume bitstream reading after raw bytes. */
  resetBitBuffer() {
    this.buf = 0;
    this.n = 0;
  }
}

// Canonical Huffman decoder (MSB-first) as a binary trie.
class HuffTree {
  // nodes[i] = [zero-branch, one-branch]; negative values encode symbol -(s+1)
  private nodes: Int32Array;
  private count = 1;
  readonly empty: boolean;

  constructor(lengths: Uint8Array) {
    let maxLen = 0;
    for (const l of lengths) if (l > maxLen) maxLen = l;
    this.empty = maxLen === 0;
    this.nodes = new Int32Array(Math.max(2, lengths.length * 2 * 2)).fill(0);

    if (this.empty) return;

    // canonical codes: shorter codes first, ties by symbol index
    const blCount = new Array(maxLen + 1).fill(0);
    for (const l of lengths) if (l > 0) blCount[l]++;
    const nextCode = new Array(maxLen + 1).fill(0);
    let code = 0;
    for (let len = 1; len <= maxLen; len++) {
      code = (code + blCount[len - 1]) << 1;
      nextCode[len] = code;
    }

    for (let sym = 0; sym < lengths.length; sym++) {
      const len = lengths[sym];
      if (len === 0) continue;
      this.insert(nextCode[len]++, len, sym);
    }
  }

  private insert(code: number, len: number, sym: number) {
    let node = 0;
    for (let i = len - 1; i >= 0; i--) {
      const bit = (code >>> i) & 1;
      const idx = node * 2 + bit;
      if (i === 0) {
        this.nodes[idx] = -(sym + 1);
        return;
      }
      if (this.nodes[idx] === 0) {
        if ((this.count + 1) * 2 > this.nodes.length) {
          const grown = new Int32Array(this.nodes.length * 2);
          grown.set(this.nodes);
          this.nodes = grown;
        }
        this.nodes[idx] = this.count++;
      }
      node = this.nodes[idx];
    }
  }

  decode(bits: BitReader): number {
    if (this.empty) throw new Error('LZX: decode from empty Huffman tree');
    let node = 0;
    for (;;) {
      const bit = bits.read(1);
      const next = this.nodes[node * 2 + bit];
      if (next < 0) return -next - 1;
      if (next === 0) throw new Error('LZX: invalid Huffman code');
      node = next;
    }
  }
}

/**
 * Read a set of code lengths (delta-coded against the previous block's
 * lengths via a 20-symbol pretree).
 */
function readLengths(bits: BitReader, lengths: Uint8Array, first: number, last: number) {
  const pretreeLengths = new Uint8Array(PRETREE_NUM_ELEMENTS);
  for (let i = 0; i < PRETREE_NUM_ELEMENTS; i++) pretreeLengths[i] = bits.read(4);
  const pretree = new HuffTree(pretreeLengths);

  let x = first;
  while (x < last) {
    const z = pretree.decode(bits);
    if (z === 17) {
      let n = bits.read(4) + 4;
      while (n-- > 0 && x < last) lengths[x++] = 0;
    } else if (z === 18) {
      let n = bits.read(5) + 20;
      while (n-- > 0 && x < last) lengths[x++] = 0;
    } else if (z === 19) {
      let n = bits.read(1) + 4;
      const z2 = pretree.decode(bits);
      const value = (lengths[x] + 17 - z2) % 17;
      while (n-- > 0 && x < last) lengths[x++] = value;
    } else {
      lengths[x] = (lengths[x] + 17 - z) % 17;
      x++;
    }
  }
}

/**
 * Decompress a CAB LZX folder stream.
 *
 * @param input concatenated CFDATA payloads of the folder
 * @param outputLength total uncompressed size (sum of cbUncomp)
 * @param windowBits 15-21, from the folder's typeCompress field
 */
export function decompressLzx(
  input: Uint8Array,
  outputLength: number,
  windowBits: number
): Uint8Array {
  if (windowBits < 15 || windowBits > 21) {
    throw new Error(`LZX: invalid window size (${windowBits} bits)`);
  }
  const positionSlots = windowBits === 21 ? 50 : windowBits === 20 ? 42 : windowBits << 1;
  const mainElements = NUM_CHARS + (positionSlots << 3);

  const bits = new BitReader(input);
  const out = new Uint8Array(outputLength);
  let outPos = 0;

  // Intel E8 preprocessing header — once per stream.
  const intelFileSize = bits.read(1) === 1 ? ((bits.read(16) << 16) | bits.read(16)) >>> 0 : 0;

  let R0 = 1;
  let R1 = 1;
  let R2 = 1;

  // Delta-coded tree lengths persist across blocks.
  const mainLengths = new Uint8Array(mainElements);
  const lengthLengths = new Uint8Array(NUM_SECONDARY_LENGTHS + 1);

  let blockRemaining = 0;
  let blockLength = 0;
  let blockType = 0;
  let mainTree: HuffTree | null = null;
  let lengthTree: HuffTree | null = null;
  let alignedTree: HuffTree | null = null;

  while (outPos < outputLength) {
    const frameEnd = Math.min(outPos + FRAME_SIZE - (outPos % FRAME_SIZE), outputLength);

    while (outPos < frameEnd) {
      if (blockRemaining === 0) {
        blockType = bits.read(3);
        blockRemaining = bits.read24();
        blockLength = blockRemaining;

        if (blockType === BLOCKTYPE_ALIGNED) {
          const alignedLengths = new Uint8Array(ALIGNED_NUM_ELEMENTS);
          for (let i = 0; i < ALIGNED_NUM_ELEMENTS; i++) alignedLengths[i] = bits.read(3);
          alignedTree = new HuffTree(alignedLengths);
        }

        if (blockType === BLOCKTYPE_VERBATIM || blockType === BLOCKTYPE_ALIGNED) {
          readLengths(bits, mainLengths, 0, NUM_CHARS);
          readLengths(bits, mainLengths, NUM_CHARS, mainElements);
          mainTree = new HuffTree(mainLengths);
          readLengths(bits, lengthLengths, 0, NUM_SECONDARY_LENGTHS);
          lengthTree = new HuffTree(lengthLengths);
        } else if (blockType === BLOCKTYPE_UNCOMPRESSED) {
          bits.alignForUncompressed();
          R0 = bits.readRawByte() | (bits.readRawByte() << 8) | (bits.readRawByte() << 16) | (bits.readRawByte() << 24);
          R1 = bits.readRawByte() | (bits.readRawByte() << 8) | (bits.readRawByte() << 16) | (bits.readRawByte() << 24);
          R2 = bits.readRawByte() | (bits.readRawByte() << 8) | (bits.readRawByte() << 16) | (bits.readRawByte() << 24);
          R0 = R0 >>> 0;
          R1 = R1 >>> 0;
          R2 = R2 >>> 0;
        } else {
          throw new Error(`LZX: invalid block type ${blockType}`);
        }
      }

      let run = Math.min(blockRemaining, frameEnd - outPos);

      if (blockType === BLOCKTYPE_UNCOMPRESSED) {
        for (let i = 0; i < run; i++) out[outPos++] = bits.readRawByte();
        blockRemaining -= run;
        if (blockRemaining === 0) {
          // Odd-length raw blocks carry a pad byte to stay 16-bit aligned.
          if (blockLength & 1) bits.readRawByte();
          bits.resetBitBuffer();
        }
        continue;
      }

      if (!mainTree || !lengthTree) throw new Error('LZX: block without trees');

      while (run > 0) {
        const mainSym = mainTree.decode(bits);
        if (mainSym < NUM_CHARS) {
          out[outPos++] = mainSym;
          run--;
          blockRemaining--;
          continue;
        }

        const adjusted = mainSym - NUM_CHARS;
        const positionSlot = adjusted >> 3;
        let matchLength = adjusted & NUM_PRIMARY_LENGTHS;
        if (matchLength === NUM_PRIMARY_LENGTHS) {
          matchLength += lengthTree.decode(bits);
        }
        matchLength += MIN_MATCH;

        let matchOffset: number;
        if (positionSlot === 0) {
          matchOffset = R0;
        } else if (positionSlot === 1) {
          matchOffset = R1;
          R1 = R0;
          R0 = matchOffset;
        } else if (positionSlot === 2) {
          matchOffset = R2;
          R2 = R0;
          R0 = matchOffset;
        } else {
          const extra = EXTRA_BITS[positionSlot];
          if (blockType === BLOCKTYPE_ALIGNED && extra >= 3) {
            if (!alignedTree) throw new Error('LZX: aligned block without aligned tree');
            const verbatim = extra > 3 ? bits.read(extra - 3) << 3 : 0;
            matchOffset = POSITION_BASE[positionSlot] + verbatim + alignedTree.decode(bits) - 2;
          } else if (extra > 0) {
            matchOffset = POSITION_BASE[positionSlot] + bits.read(extra) - 2;
          } else {
            matchOffset = 1;
          }
          R2 = R1;
          R1 = R0;
          R0 = matchOffset;
        }

        if (matchLength > run) {
          throw new Error('LZX: match crosses frame boundary');
        }
        if (matchOffset > outPos) {
          throw new Error('LZX: match offset before start of output');
        }
        let src = outPos - matchOffset;
        for (let i = 0; i < matchLength; i++) out[outPos++] = out[src++];
        run -= matchLength;
        blockRemaining -= matchLength;
      }
    }

    // Frame boundary: realign the bitstream to 16 bits (raw blocks are
    // byte-oriented and need no realignment mid-block).
    if (outPos < outputLength && outPos % FRAME_SIZE === 0 && !(blockType === BLOCKTYPE_UNCOMPRESSED && blockRemaining > 0)) {
      bits.align16();
    }
  }

  // Undo Intel E8 call translation, frame by frame.
  if (intelFileSize !== 0) {
    for (let frameStart = 0; frameStart < out.length; frameStart += FRAME_SIZE) {
      const frameLen = Math.min(FRAME_SIZE, out.length - frameStart);
      if (frameLen <= 10) continue;
      const end = frameStart + frameLen - 10;
      for (let i = frameStart; i < end; i++) {
        if (out[i] !== 0xe8) continue;
        const curPos = i;
        let absVal =
          out[i + 1] | (out[i + 2] << 8) | (out[i + 3] << 16) | (out[i + 4] << 24);
        absVal = absVal | 0; // signed
        if (absVal >= -curPos && absVal < intelFileSize) {
          const relVal = absVal >= 0 ? absVal - curPos : absVal + intelFileSize;
          out[i + 1] = relVal & 0xff;
          out[i + 2] = (relVal >>> 8) & 0xff;
          out[i + 3] = (relVal >>> 16) & 0xff;
          out[i + 4] = (relVal >>> 24) & 0xff;
        }
        i += 4;
      }
    }
  }

  return out;
}
