const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
export const apiEnabled = Boolean(baseUrl)

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!baseUrl) throw new Error('VITE_API_URL sozlanmagan.')
  const headers = new Headers(options.headers)
  if (options.body) headers.set('Content-Type', 'application/json')
  const token = localStorage.getItem('dachastay-token')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({})) as { error?: string }
  if (!response.ok) throw new Error(data.error || 'Server bilan bog‘lanishda xatolik yuz berdi.')
  return data as T
}
