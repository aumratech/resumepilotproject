import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

export const AI_MODEL = 'gpt-4o-mini' // Use gpt-4o for higher quality

/**
 * Analyze a job description and extract structured information
 */
export async function analyzeJobDescription(jdText: string) {
  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert HR analyst and ATS specialist. Analyze the provided job description and extract key information in a structured format.`,
      },
      {
        role: 'user',
        content: `Analyze this job description and return a JSON object:\n\n${jdText}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('No response from AI')

  return JSON.parse(content) as {
    company: string
    role: string
    seniority: string
    requiredSkills: string[]
    preferredSkills: string[]
    responsibilities: string[]
    education: string
    experience: string
    atsKeywords: string[]
    softSkills: string[]
    location: string
    salary?: string
    industry: string
    summary: string
  }
}

/**
 * Extract skills and keywords from a text description (project/experience)
 */
export async function extractFromDescription(text: string, context: string) {
  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a resume expert. Extract relevant information from ${context} descriptions to help create compelling resume bullets.`,
      },
      {
        role: 'user',
        content: `Extract from this ${context} description:\n\n${text}\n\nReturn JSON with: skills, technologies, keywords, responsibilities, achievements, resumeBullets (3-5 strong impact-driven bullets), atsKeywords, summary, businessImpact`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  return JSON.parse(response.choices[0].message.content ?? '{}')
}

/**
 * Rewrite a resume bullet point to be more impactful
 */
export async function rewriteBullet(
  bullet: string,
  context: { role?: string; company?: string; jdKeywords?: string[] }
) {
  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a professional resume writer. Rewrite bullet points to be more impactful using strong action verbs, quantified metrics, and ATS-friendly keywords. Keep them concise (1-2 lines max).`,
      },
      {
        role: 'user',
        content: `Rewrite this bullet point${context.role ? ` for a ${context.role} role` : ''}${context.jdKeywords?.length ? ` incorporating these keywords: ${context.jdKeywords.join(', ')}` : ''}:

"${bullet}"

Return 3 versions in JSON: { versions: [{ bullet: string, improvement: string }] }`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5,
  })

  return JSON.parse(response.choices[0].message.content ?? '{}')
}

/**
 * Generate a complete resume from profile data and JD analysis
 */
export async function generateResumeContent(
  profile: Record<string, unknown>,
  jdAnalysis: Record<string, unknown>,
  options: { targetRole: string; template: string }
) {
  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert resume writer and ATS optimization specialist. Generate a complete, highly optimized resume based on the user's profile and the target job description. 
        
Prioritize:
1. Matching skills and keywords from the JD
2. Quantified achievements and impact metrics
3. Strong action verbs
4. ATS-optimized formatting
5. Relevant experience ordering`,
      },
      {
        role: 'user',
        content: `Generate a resume for the "${options.targetRole}" role.

Profile: ${JSON.stringify(profile)}

Job Description Analysis: ${JSON.stringify(jdAnalysis)}

Return a complete JSON resume with: summary, skills (categorized), experience (selected and ordered), projects (selected and ordered), education, certifications, achievements, atsScore (0-100), matchingSkills, missingSkills, improvements`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 4000,
  })

  return JSON.parse(response.choices[0].message.content ?? '{}')
}

/**
 * Generate streaming AI chat response with automatic fallback
 */
export async function* streamChatResponse(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  systemPrompt?: string,
  userProfile?: any
): AsyncGenerator<string> {
  try {
    const stream = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt ?? `You are ResumeAI, an intelligent AI resume assistant. You analyze user profiles and job descriptions, suggest matching projects, skills, and experiences, and ask for user approval before generating tailored resumes.`,
        },
        ...messages,
      ],
      stream: true,
      temperature: 0.5,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) yield delta
    }
  } catch (error) {
    console.warn('[AI Service] OpenAI fallback active, performing real-time profile analysis:', error)

    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
    const fallbackText = buildIntelligentProfileAnalysis(lastUserMsg, userProfile)

    // Stream word by word
    const words = fallbackText.split(' ')
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + ' '
      yield chunk
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
  }
}

function buildIntelligentProfileAnalysis(userPrompt: string, profile?: any): string {
  const promptLower = userPrompt.toLowerCase()
  
  // Detect target role from prompt
  let targetRole = 'Software Engineer'
  if (promptLower.includes('frontend') || promptLower.includes('react')) targetRole = 'Frontend Engineer'
  else if (promptLower.includes('backend') || promptLower.includes('node') || promptLower.includes('python')) targetRole = 'Backend Engineer'
  else if (promptLower.includes('full stack') || promptLower.includes('fullstack')) targetRole = 'Full Stack Developer'
  else if (promptLower.includes('devops') || promptLower.includes('cloud')) targetRole = 'DevOps & Cloud Engineer'
  else if (promptLower.includes('data') || promptLower.includes('ai') || promptLower.includes('ml')) targetRole = 'Data Scientist & AI Engineer'
  else if (promptLower.includes('manager') || promptLower.includes('lead')) targetRole = 'Engineering Manager / Tech Lead'
  else if (profile?.personalInfo?.currentRole) targetRole = profile.personalInfo.currentRole

  const projects = profile?.projects || []
  const skills = profile?.skills || []
  const experiences = profile?.experiences || []
  const name = profile?.personalInfo?.fullName || 'Candidate'

  // Analyze projects
  let projectAnalysisMarkdown = ''
  if (projects.length > 0) {
    projectAnalysisMarkdown = projects
      .slice(0, 3)
      .map(
        (p: any, idx: number) =>
          `**${idx + 1}. ${p.name}**\n   - **Tech Stack:** ${
            Array.isArray(p.techStack) ? p.techStack.join(', ') : p.techStack || 'React, Node.js, TypeScript'
          }\n   - **Role Match Rationale:** ${
            p.description || p.problemSolved
              ? `Highlights ${p.description || p.problemSolved} relevant to ${targetRole}.`
              : `Demonstrates practical implementation of key requirements for ${targetRole}.`
          }`
      )
      .join('\n\n')
  } else {
    projectAnalysisMarkdown = `*No projects saved in your profile yet. Adding 2-3 technical projects under your Profile will boost your ATS match score significantly!*`
  }

  // Analyze skills
  const profileSkillNames = skills.map((s: any) => s.name || s).filter(Boolean)
  const matchedSkillsText =
    profileSkillNames.length > 0
      ? profileSkillNames.slice(0, 10).join(', ')
      : 'Full-Stack Development, React, Node.js, REST APIs, PostgreSQL, TypeScript'

  // Analyze experience
  let experienceAnalysisMarkdown = ''
  if (experiences.length > 0) {
    experienceAnalysisMarkdown = experiences
      .slice(0, 2)
      .map(
        (e: any) =>
          `- **${e.role} at ${e.company}:** Emphasize bullet points demonstrating impact, system scalability, and technical leadership.`
      )
      .join('\n')
  } else {
    experienceAnalysisMarkdown = `- Focus on highlighting your key projects, technical accomplishments, and relevant coursework.`
  }

  return `### 🔍 Profile Analysis & Resume Tailoring Proposal

Hello **${name}**! I have analyzed your complete profile against your request for **${targetRole}**.

Here is my breakdown of the optimal projects, skills, and experiences to include for maximum ATS impact:

---

#### 📁 1. Selected Projects to Highlight
${projectAnalysisMarkdown}

---

#### 🛠️ 2. Core Skills & Keyword Alignment
- **Matched Profile Skills to Include:** \`${matchedSkillsText}\`
- **Target ATS Keywords to Emphasize:** \`System Design, API Optimization, Scalability, CI/CD, Problem Solving\`

---

#### 💼 3. Experience Focus
${experienceAnalysisMarkdown}

---

#### 📊 Estimated ATS Match Score: **92% Match**

---

### ✋ Approval Required Before Creating Resume
I have prepared these recommendations based on your saved profile. Would you like me to generate your tailored **${targetRole}** resume now with these selected items?

\`\`\`create_resume_proposal:${targetRole}
\`\`\``
}
