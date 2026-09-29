import { db } from '@/lib/db'
import { CmsClient } from './cms-client'

export default async function LandingPageCmsPage() {
  const configs = await db.landingPageConfig.findMany({
    orderBy: { order: 'asc' },
  })

  return <CmsClient initialConfigs={configs} />
}
