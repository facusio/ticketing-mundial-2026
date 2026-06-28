'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(_prevState: { error: string }, formData: FormData) {
  const mail = formData.get('mail') as string
  const password = formData.get('password') as string

  let res: Response
  try {
    res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mail, password }),
    })
  } catch {
    return { error: 'Error de conexión. Verificá que el servidor esté activo.' }
  }

  if (!res.ok) {
    return { error: 'Credenciales incorrectas' }
  }

  const data = await res.json() as { token: string; rol: string }
  const cookieStore = await cookies()
  cookieStore.set('token', data.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  if (data.rol === 'ADMIN_PAIS') redirect('/admin')
  if (data.rol === 'FUNCIONARIO') redirect('/validar')
  if (data.rol === 'SUPERADMIN') redirect('/superadmin')
  redirect('/dashboard')
}
