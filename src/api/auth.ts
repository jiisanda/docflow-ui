import api from './client'

export interface LoginPayload { username: string; password: string }
export interface RegisterPayload { username: string; email: string; password: string }

export const login = async (data: LoginPayload) => {
  const form = new URLSearchParams()
  form.append('username', data.username)
  form.append('password', data.password)
  const res = await api.post('/u/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return res.data
}

export const register = async (data: RegisterPayload) => {
  const res = await api.post('/u/signup', data)
  return res.data
}
