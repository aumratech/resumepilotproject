import { db } from '@/lib/db'
import { CollegesClient } from './colleges-client'

export default async function CollegesManagementPage() {
  const [colleges, totalCount] = await Promise.all([
    db.college.findMany({
      take: 25,
      orderBy: [{ tier: 'asc' }, { name: 'asc' }],
    }),
    db.college.count(),
  ])

  return <CollegesClient initialColleges={colleges} totalColleges={totalCount} />
}
