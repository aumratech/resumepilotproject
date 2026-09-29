import { db } from '@/lib/db'
import { ResumesClient } from './resumes-client'

export default async function ResumesManagementPage() {
  const [resumes, totalCount, templateLocks, plans] = await Promise.all([
    db.resumeVersion.findMany({
      take: 25,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        jd: { select: { title: true } },
      },
    }),
    db.resumeVersion.count(),
    db.resumeTemplateLock.findMany({
      orderBy: { template: 'asc' },
    }),
    db.planPackage.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  return (
    <ResumesClient
      initialResumes={resumes}
      totalResumes={totalCount}
      initialLocks={templateLocks}
      availablePlans={plans}
    />
  )
}
