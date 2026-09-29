import { PrismaClient, ResumeTemplate, DegreeType, PaymentStatus, PaymentGateway, AdminRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding for ResumeAI Admin & Core data...')

  // 1. SuperAdmin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'admin@resumeai.com' },
    update: {
      password: adminPasswordHash,
      role: AdminRole.SUPER_ADMIN,
      name: 'Super Admin',
      isActive: true,
    },
    create: {
      name: 'Super Admin',
      email: 'admin@resumeai.com',
      password: adminPasswordHash,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  })
  console.log('✅ Admin User initialized: admin@resumeai.com / admin123')

  // 2. Plan Packages
  const freePlan = await prisma.planPackage.upsert({
    where: { slug: 'free' },
    update: {
      name: 'Free Starter',
      description: 'Essential AI resume tools to kickstart your career journey.',
      priceMonthly: 0.0,
      priceYearly: 0.0,
      currency: 'USD',
      isPopular: false,
      isActive: true,
      isDefault: true,
      maxResumes: 1,
      maxAiGenerations: 10,
      maxPdfDownloads: 3,
      sortOrder: 1,
      customFeatures: [
        { key: 'ats_scoring', label: 'Basic ATS Score', included: true },
        { key: 'templates', label: 'Standard ATS & Modern Templates', included: true },
        { key: 'ai_editor', label: '10 AI Assistant Prompts/month', included: true },
        { key: 'pdf_export', label: '3 PDF Downloads/month', included: true },
        { key: 'custom_domains', label: 'Custom Domain Hosting', included: false },
        { key: 'executive_templates', label: 'Executive & Creative Templates', included: false },
        { key: 'unlimited_ai', label: 'Unlimited AI Chat & JD Tailoring', included: false },
        { key: 'priority_support', label: '24/7 Priority Support', included: false },
      ],
    },
    create: {
      name: 'Free Starter',
      slug: 'free',
      description: 'Essential AI resume tools to kickstart your career journey.',
      priceMonthly: 0.0,
      priceYearly: 0.0,
      currency: 'USD',
      isPopular: false,
      isActive: true,
      isDefault: true,
      maxResumes: 1,
      maxAiGenerations: 10,
      maxPdfDownloads: 3,
      sortOrder: 1,
      customFeatures: [
        { key: 'ats_scoring', label: 'Basic ATS Score', included: true },
        { key: 'templates', label: 'Standard ATS & Modern Templates', included: true },
        { key: 'ai_editor', label: '10 AI Assistant Prompts/month', included: true },
        { key: 'pdf_export', label: '3 PDF Downloads/month', included: true },
        { key: 'custom_domains', label: 'Custom Domain Hosting', included: false },
        { key: 'executive_templates', label: 'Executive & Creative Templates', included: false },
        { key: 'unlimited_ai', label: 'Unlimited AI Chat & JD Tailoring', included: false },
        { key: 'priority_support', label: '24/7 Priority Support', included: false },
      ],
    },
  })

  const starterPlan = await prisma.planPackage.upsert({
    where: { slug: 'starter' },
    update: {
      name: 'Professional',
      description: 'Perfect for active job seekers targeting multiple roles.',
      priceMonthly: 9.99,
      priceYearly: 99.0,
      currency: 'USD',
      badge: 'Popular',
      isPopular: true,
      isActive: true,
      isDefault: false,
      maxResumes: 5,
      maxAiGenerations: 60,
      maxPdfDownloads: 25,
      sortOrder: 2,
      customFeatures: [
        { key: 'ats_scoring', label: 'Advanced ATS Score & Deep Keyword Matching', included: true },
        { key: 'templates', label: 'All Modern, Academic & Professional Templates', included: true },
        { key: 'ai_editor', label: '60 AI Prompts & JD Matchings/month', included: true },
        { key: 'pdf_export', label: '25 PDF & DOCX Downloads/month', included: true },
        { key: 'cover_letter', label: 'AI Cover Letter Generator', included: true },
        { key: 'executive_templates', label: 'Executive & Creative Templates', included: false },
        { key: 'custom_domains', label: 'Custom Web Link for Resume', included: true },
        { key: 'priority_support', label: 'Priority Email Support', included: true },
      ],
    },
    create: {
      name: 'Professional',
      slug: 'starter',
      description: 'Perfect for active job seekers targeting multiple roles.',
      priceMonthly: 9.99,
      priceYearly: 99.0,
      currency: 'USD',
      badge: 'Popular',
      isPopular: true,
      isActive: true,
      isDefault: false,
      maxResumes: 5,
      maxAiGenerations: 60,
      maxPdfDownloads: 25,
      sortOrder: 2,
      customFeatures: [
        { key: 'ats_scoring', label: 'Advanced ATS Score & Deep Keyword Matching', included: true },
        { key: 'templates', label: 'All Modern, Academic & Professional Templates', included: true },
        { key: 'ai_editor', label: '60 AI Prompts & JD Matchings/month', included: true },
        { key: 'pdf_export', label: '25 PDF & DOCX Downloads/month', included: true },
        { key: 'cover_letter', label: 'AI Cover Letter Generator', included: true },
        { key: 'executive_templates', label: 'Executive & Creative Templates', included: false },
        { key: 'custom_domains', label: 'Custom Web Link for Resume', included: true },
        { key: 'priority_support', label: 'Priority Email Support', included: true },
      ],
    },
  })

  const proPlan = await prisma.planPackage.upsert({
    where: { slug: 'pro' },
    update: {
      name: 'Executive AI',
      description: 'Complete power suite for senior leaders & fast-track careers.',
      priceMonthly: 19.99,
      priceYearly: 189.0,
      currency: 'USD',
      badge: 'Best Value',
      isPopular: false,
      isActive: true,
      isDefault: false,
      maxResumes: -1,
      maxAiGenerations: -1,
      maxPdfDownloads: -1,
      sortOrder: 3,
      customFeatures: [
        { key: 'ats_scoring', label: 'Enterprise ATS & Recruiter Simulation', included: true },
        { key: 'templates', label: 'All Premium Templates (Executive, Creative, Minimal)', included: true },
        { key: 'ai_editor', label: 'Unlimited AI Tailoring & Custom Prompts', included: true },
        { key: 'pdf_export', label: 'Unlimited High-Res PDF & Vector Exports', included: true },
        { key: 'cover_letter', label: 'Unlimited Targeted Cover Letters', included: true },
        { key: 'interview_prep', label: 'AI Mock Interview Prep & Question Bank', included: true },
        { key: 'custom_branding', label: 'Custom Typography & Accent Color Schemes', included: true },
        { key: 'priority_support', label: '24/7 Dedicated Priority Support', included: true },
      ],
    },
    create: {
      name: 'Executive AI',
      slug: 'pro',
      description: 'Complete power suite for senior leaders & fast-track careers.',
      priceMonthly: 19.99,
      priceYearly: 189.0,
      currency: 'USD',
      badge: 'Best Value',
      isPopular: false,
      isActive: true,
      isDefault: false,
      maxResumes: -1,
      maxAiGenerations: -1,
      maxPdfDownloads: -1,
      sortOrder: 3,
      customFeatures: [
        { key: 'ats_scoring', label: 'Enterprise ATS & Recruiter Simulation', included: true },
        { key: 'templates', label: 'All Premium Templates (Executive, Creative, Minimal)', included: true },
        { key: 'ai_editor', label: 'Unlimited AI Tailoring & Custom Prompts', included: true },
        { key: 'pdf_export', label: 'Unlimited High-Res PDF & Vector Exports', included: true },
        { key: 'cover_letter', label: 'Unlimited Targeted Cover Letters', included: true },
        { key: 'interview_prep', label: 'AI Mock Interview Prep & Question Bank', included: true },
        { key: 'custom_branding', label: 'Custom Typography & Accent Color Schemes', included: true },
        { key: 'priority_support', label: '24/7 Dedicated Priority Support', included: true },
      ],
    },
  })

  console.log('✅ Plan Packages initialized')

  // 3. Resume Template Locks
  const templateRules = [
    { template: ResumeTemplate.MODERN, isLocked: false, requiredPlanSlug: 'free', lockReason: null },
    { template: ResumeTemplate.ATS, isLocked: false, requiredPlanSlug: 'free', lockReason: null },
    { template: ResumeTemplate.MINIMAL, isLocked: false, requiredPlanSlug: 'free', lockReason: null },
    { template: ResumeTemplate.PROFESSIONAL, isLocked: true, requiredPlanSlug: 'starter', lockReason: 'Upgrade to Professional or higher to unlock the clean Professional template.' },
    { template: ResumeTemplate.ACADEMIC, isLocked: true, requiredPlanSlug: 'starter', lockReason: 'Upgrade to Professional or higher to unlock Academic CV formats.' },
    { template: ResumeTemplate.EXECUTIVE, isLocked: true, requiredPlanSlug: 'pro', lockReason: 'Upgrade to Executive AI to unlock our C-suite multi-column executive layout.' },
    { template: ResumeTemplate.CREATIVE, isLocked: true, requiredPlanSlug: 'pro', lockReason: 'Upgrade to Executive AI to unlock high-impact visual & design portfolio layouts.' },
  ]

  for (const rule of templateRules) {
    await prisma.resumeTemplateLock.upsert({
      where: { template: rule.template },
      update: rule,
      create: rule,
    })
  }
  console.log('✅ Resume Template Lock Matrix initialized')

  // 4. Landing Page CMS Defaults
  const defaultCmsSections = [
    {
      sectionKey: 'hero',
      title: 'Land your dream job with AI-crafted resumes that beat every ATS',
      subtitle: 'Analyze job descriptions instantly, tailor experience with precision metrics, and export recruiter-approved resumes in under 60 seconds.',
      badge: '🚀 Powered by Next-Gen AI & Real-time ATS Intelligence',
      content: {
        primaryCtaText: 'Build Free Resume',
        primaryCtaUrl: '/register',
        secondaryCtaText: 'Explore Templates',
        secondaryCtaUrl: '#templates',
        statsBadgeText: 'Over 45,000+ candidates hired at top tech & Fortune 500 companies',
        highlightMetric1: { value: '94%', label: 'ATS Pass Rate' },
        highlightMetric2: { value: '3.8x', label: 'More Interview Calls' },
        highlightMetric3: { value: '< 2 min', label: 'Resume Generation' },
      },
      isActive: true,
      order: 1,
    },
    {
      sectionKey: 'features',
      title: 'Engineered for Candidate Success',
      subtitle: 'Every tool you need to craft high-impact, ATS-optimized resumes that stand out in recruiter inboxes.',
      badge: '✨ Core Capabilities',
      content: {
        items: [
          {
            id: 'feat-1',
            icon: 'Sparkles',
            title: 'AI Resume Tailoring',
            description: 'Paste any job description and let AI adapt your bullet points with relevant keywords, power action verbs, and quantified outcomes.',
            tag: 'AI-Powered',
          },
          {
            id: 'feat-2',
            icon: 'Target',
            title: 'Real-time ATS Scoring',
            description: 'Instant feedback on formatting, keyword density, section organization, and readability scored against Fortune 500 ATS systems.',
            tag: 'Real-time',
          },
          {
            id: 'feat-3',
            icon: 'LayoutTemplate',
            title: 'Recruiter-Tested Templates',
            description: 'Choose from sleek Modern, Minimal, ATS-Clean, and Executive layouts crafted by top industry career coaches.',
            tag: 'Design',
          },
          {
            id: 'feat-4',
            icon: 'FileText',
            title: 'AI Cover Letters',
            description: 'Generate customized, persuasive cover letters matching your resume style and target position with one click.',
            tag: 'Automation',
          },
          {
            id: 'feat-5',
            icon: 'Share2',
            title: 'Live Web Resume Links',
            description: 'Publish a sleek personal portfolio link with analytics tracking who viewed and downloaded your profile.',
            tag: 'Hosting',
          },
          {
            id: 'feat-6',
            icon: 'ShieldCheck',
            title: 'Privacy & Data Protection',
            description: 'Your career data belongs to you. Full encryption at rest and in transit with zero third-party data selling.',
            tag: 'Security',
          },
        ],
      },
      isActive: true,
      order: 2,
    },
    {
      sectionKey: 'testimonials',
      title: 'Trusted by ambitious professionals worldwide',
      subtitle: 'See how job seekers accelerated their careers and landed dream roles with ResumeAI.',
      badge: '💬 Success Stories',
      content: {
        items: [
          {
            id: 'test-1',
            name: 'Sarah Chen',
            role: 'Senior Software Engineer',
            company: 'Google',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            rating: 5,
            quote: 'I applied to 30 companies with my old resume and got zero callbacks. After tailoring with ResumeAI, I received 6 interview invites in 2 weeks!',
          },
          {
            id: 'test-2',
            name: 'Marcus Vance',
            role: 'Product Manager',
            company: 'Stripe',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            rating: 5,
            quote: 'The ATS score breakdown and keyword suggestions showed me exactly what recruiters were looking for. Landed my dream offer at Stripe!',
          },
          {
            id: 'test-3',
            name: 'Priya Sharma',
            role: 'Data Scientist',
            company: 'Amazon',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            rating: 5,
            quote: 'The AI tailored my research projects into business-impact bullet points effortlessly. Truly revolutionary for tech professionals.',
          },
        ],
      },
      isActive: true,
      order: 3,
    },
    {
      sectionKey: 'faqs',
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about ResumeAI, ATS formatting, and subscriptions.',
      badge: '❓ Support & Clarity',
      content: {
        items: [
          {
            id: 'faq-1',
            question: 'What is ATS and why does it matter?',
            answer: 'Applicant Tracking Systems (ATS) are software used by over 90% of employers to screen and filter resumes before a human recruiter reads them. ResumeAI formats your resume to pass these filters flawlessly.',
          },
          {
            id: 'faq-2',
            question: 'Can I download my resume in PDF and Word formats?',
            answer: 'Yes! All plans include high-resolution PDF downloads, and paid tiers support editable DOCX exports and high-resolution vector printing.',
          },
          {
            id: 'faq-3',
            question: 'How does AI tailoring work with Job Descriptions?',
            answer: 'Simply copy and paste any job listing URL or text. Our AI extracts key competencies, required skills, and terminology, then aligns your experience bullet points with quantified achievements.',
          },
          {
            id: 'faq-4',
            question: 'Can I cancel or upgrade my subscription anytime?',
            answer: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time with a single click from your account settings with zero hidden fees.',
          },
        ],
      },
      isActive: true,
      order: 4,
    },
    {
      sectionKey: 'banner',
      title: 'Special Launch Offer: Get 30% off on all annual plans with code LAUNCH30!',
      subtitle: null,
      badge: '🎉 New Release',
      content: {
        linkText: 'Claim Discount',
        linkUrl: '#pricing',
        isEnabled: true,
      },
      isActive: true,
      order: 0,
    },
  ]

  for (const cms of defaultCmsSections) {
    await prisma.landingPageConfig.upsert({
      where: { sectionKey: cms.sectionKey },
      update: cms,
      create: cms,
    })
  }
  console.log('✅ Landing Page CMS defaults initialized')

  // 5. Colleges
  const collegesList = [
    { name: 'Indian Institute of Technology (IIT) Bombay', code: 'IITB', state: 'Maharashtra', city: 'Mumbai', tier: 'Tier 1', website: 'https://www.iitb.ac.in' },
    { name: 'Indian Institute of Technology (IIT) Delhi', code: 'IITD', state: 'Delhi', city: 'New Delhi', tier: 'Tier 1', website: 'https://home.iitd.ac.in' },
    { name: 'Indian Institute of Technology (IIT) Madras', code: 'IITM', state: 'Tamil Nadu', city: 'Chennai', tier: 'Tier 1', website: 'https://www.iitm.ac.in' },
    { name: 'Indian Institute of Technology (IIT) Kharagpur', code: 'IITKGP', state: 'West Bengal', city: 'Kharagpur', tier: 'Tier 1', website: 'https://www.iitkgp.ac.in' },
    { name: 'Birla Institute of Technology and Science (BITS) Pilani', code: 'BITS', state: 'Rajasthan', city: 'Pilani', tier: 'Tier 1', website: 'https://www.bits-pilani.ac.in' },
    { name: 'National Institute of Technology (NIT) Trichy', code: 'NITT', state: 'Tamil Nadu', city: 'Tiruchirappalli', tier: 'Tier 1', website: 'https://www.nitt.edu' },
    { name: 'Delhi Technological University (DTU)', code: 'DTU', state: 'Delhi', city: 'New Delhi', tier: 'Tier 1', website: 'https://www.dtu.ac.in' },
    { name: 'Vellore Institute of Technology (VIT)', code: 'VIT', state: 'Tamil Nadu', city: 'Vellore', tier: 'Tier 2', website: 'https://vit.ac.in' },
    { name: 'Stanford University', code: 'STANFORD', state: 'California', city: 'Stanford', country: 'United States', tier: 'Ivy League / Elite', website: 'https://stanford.edu' },
    { name: 'Massachusetts Institute of Technology (MIT)', code: 'MIT', state: 'Massachusetts', city: 'Cambridge', country: 'United States', tier: 'Ivy League / Elite', website: 'https://web.mit.edu' },
  ]

  for (const col of collegesList) {
    await prisma.college.upsert({
      where: { name: col.name },
      update: col,
      create: col,
    })
  }
  console.log('✅ College directory initialized')

  // 6. Degrees & Branches
  const degreesData = [
    {
      name: 'Bachelor of Technology (B.Tech)',
      code: 'B.Tech',
      type: DegreeType.BACHELORS,
      durationYears: 4.0,
      branches: [
        { name: 'Computer Science & Engineering', code: 'CSE' },
        { name: 'Artificial Intelligence & Data Science', code: 'AI-DS' },
        { name: 'Information Technology', code: 'IT' },
        { name: 'Electronics & Communication Engineering', code: 'ECE' },
        { name: 'Mechanical Engineering', code: 'ME' },
        { name: 'Electrical & Electronics Engineering', code: 'EEE' },
        { name: 'Civil Engineering', code: 'CE' },
      ],
    },
    {
      name: 'Master of Business Administration (MBA)',
      code: 'MBA',
      type: DegreeType.MASTERS,
      durationYears: 2.0,
      branches: [
        { name: 'Finance & Banking', code: 'FIN' },
        { name: 'Marketing & Digital Strategy', code: 'MKT' },
        { name: 'Human Resource Management', code: 'HRM' },
        { name: 'Business Analytics & Data Management', code: 'BA' },
        { name: 'Operations & Supply Chain', code: 'OPS' },
      ],
    },
    {
      name: 'Bachelor of Science (B.Sc)',
      code: 'B.Sc',
      type: DegreeType.BACHELORS,
      durationYears: 3.0,
      branches: [
        { name: 'Computer Science', code: 'CS' },
        { name: 'Mathematics & Computing', code: 'MATH' },
        { name: 'Physics & Electronics', code: 'PHYS' },
        { name: 'Data Analytics', code: 'DA' },
      ],
    },
    {
      name: 'Master of Technology (M.Tech)',
      code: 'M.Tech',
      type: DegreeType.MASTERS,
      durationYears: 2.0,
      branches: [
        { name: 'Computer Science & Engineering', code: 'CSE' },
        { name: 'Artificial Intelligence & Robotics', code: 'AI-ROBO' },
        { name: 'VLSI Design & Embedded Systems', code: 'VLSI' },
      ],
    },
  ]

  for (const deg of degreesData) {
    const degreeRecord = await prisma.degree.upsert({
      where: { code: deg.code },
      update: {
        name: deg.name,
        type: deg.type,
        durationYears: deg.durationYears,
      },
      create: {
        name: deg.name,
        code: deg.code,
        type: deg.type,
        durationYears: deg.durationYears,
      },
    })

    for (const br of deg.branches) {
      await prisma.degreeBranch.upsert({
        where: {
          degreeId_name: {
            degreeId: degreeRecord.id,
            name: br.name,
          },
        },
        update: { code: br.code },
        create: {
          degreeId: degreeRecord.id,
          name: br.name,
          code: br.code,
        },
      })
    }
  }
  console.log('✅ Degrees & Branches initialized')

  // 7. Seed Initial Sample Payments & Subscriptions for Demo Analytics
  const sampleUsers = await prisma.user.findMany({ take: 5 })
  if (sampleUsers.length > 0) {
    for (let i = 0; i < sampleUsers.length; i++) {
      const user = sampleUsers[i]
      const plan = i % 2 === 0 ? starterPlan : proPlan
      const amount = plan.priceMonthly

      await prisma.paymentTransaction.upsert({
        where: { transactionId: `txn_demo_${user.id}` },
        update: {},
        create: {
          transactionId: `txn_demo_${user.id}`,
          userId: user.id,
          planPackageId: plan.id,
          amount: amount,
          currency: 'USD',
          status: PaymentStatus.COMPLETED,
          gateway: PaymentGateway.STRIPE,
          billingCycle: 'monthly',
          customerEmail: user.email,
          customerName: user.name || 'Customer',
        },
      })

      await prisma.userSubscription.upsert({
        where: { userId: user.id },
        update: {
          planPackageId: plan.id,
          status: 'active',
        },
        create: {
          userId: user.id,
          planPackageId: plan.id,
          status: 'active',
          billingCycle: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    }
    console.log('✅ Sample Subscriptions & Payments linked to users')
  }

  console.log('🎉 Seeding successfully completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
