import api from './client'

export const listDocuments = async (limit = 50, offset = 0) => {
  const res = await api.get('/metadata', { params: { limit, offset } })
  return res.data
}

export const uploadFiles = async (files: File[], folder?: string) => {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  const res = await api.post('/upload', form, {
    params: folder ? { folder } : {},
  })
  return res.data
}

export const deleteDocument = async (name: string) => {
  await api.delete(`/${name}`)
}

export const listTrash = async () => {
  const res = await api.get('/trash')
  return res.data
}

export const emptyTrash = async () => {
  await api.delete('/trash')
}

export const restoreDocument = async (name: string) => {
  const res = await api.post(`/restore/${name}`)
  return res.data
}

export const archiveDocument = async (name: string) => {
  const res = await api.post(`/metadata/archive/${name}`)
  return res.data
}

export const listArchive = async () => {
  const res = await api.get('/metadata/archive/list')
  return res.data
}

export const unarchiveDocument = async (name: string) => {
  const res = await api.post(`/metadata/un-archive/${name}`)
  return res.data
}

export const downloadDocument = async (name: string): Promise<void> => {
  const res = await api.get(`/file/${name}/download`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export const shareLink = async (name: string, visits: number, shareTo: string[]) => {
  const res = await api.post(`/share-link/${name}`, { visits, share_to: shareTo })
  return res.data as { personal_url: string; share_this: string }
}

export const previewDocument = async (name: string): Promise<string> => {
  const res = await api.get(`/preview/${name}`, { responseType: 'blob' })
  return URL.createObjectURL(res.data)
}

export const getNotifications = async () => {
  const res = await api.get('/notifications')
  return res.data
}
