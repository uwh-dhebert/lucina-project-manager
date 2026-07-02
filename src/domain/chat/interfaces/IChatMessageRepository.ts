/**
 * Chat Domain - Repository Interface
 */

import { ChatMessage, ChatMessageId } from './entities/ChatMessage';
import { Repository, UUID } from '../shared/types';

export interface IChatMessageRepository extends Repository<ChatMessage> {
  findByConversationId(conversationId: UUID): Promise<ChatMessage[]>;
  findByUserId(userId: UUID): Promise<ChatMessage[]>;
  findByConversationIdOrdered(conversationId: UUID): Promise<ChatMessage[]>;
}

export const IChatMessageRepository = Symbol('IChatMessageRepository');

