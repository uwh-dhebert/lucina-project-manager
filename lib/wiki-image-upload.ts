export async function uploadWikiImage(subjectId: string, file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`/api/wiki/subjects/${subjectId}/images`, {
    method: 'POST',
    body: formData,
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to upload screenshot')
  }

  if (typeof data.url !== 'string') {
    throw new Error('Image upload did not return a URL')
  }

  return data.url
}
