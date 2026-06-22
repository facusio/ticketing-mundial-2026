import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { decodeJwt } from '@/lib/utils'

export default async function RootPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) redirect('/login')

  const payload = decodeJwt(token)
  if (!payload) redirect('/login')

  if (payload.rol === 'ADMIN_PAIS') redirect('/admin')
  if (payload.rol === 'FUNCIONARIO') redirect('/validar')
  redirect('/dashboard')
}
