// app/dashboard/page.js
export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const token = cookies().get('token')?.value
  if (!token) redirect('/login')

  let user
  try {
    user = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    redirect('/login')
  }

  // render the client wrapper
  return <DashboardClient user={user} />
}