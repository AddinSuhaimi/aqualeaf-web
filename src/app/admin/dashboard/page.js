// app/dashboard/page.js
export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import DashboardClient from './DashboardClient'

export default async function AdminDashboardPage() {
  const token = cookies().get('token')?.value
  if (!token) redirect('/admin/login')

  let admin
  try {
    admin = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    redirect('/admin/login')
  }

  // render the client wrapper
  return <DashboardClient admin={admin} />
}