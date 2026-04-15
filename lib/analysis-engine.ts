import type { ParsedResume } from './resume-parser'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  overallScore: number
  atsScore: number
  matchScore: number | null
  strengths: string[]
  weaknesses: string[]
  missingSkills: string[]
  atsIssues: string[]
  atsSuggestions: string[]
  keywordDensity: number
  formattingQuality: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface KeywordMatchResult {
  matchScore: number
  matchedKeywords: string[]
  missingKeywords: string[]
  totalJobKeywords: number
  matchedCount: number
}

// ─── Main Analysis ────────────────────────────────────────────────────────────

export function analyzeResume(resume: ParsedResume): AnalysisResult {
  return {
    overallScore: calculateOverallScore(resume),
    atsScore: calculateATSScore(resume),
    matchScore: null,
    strengths: identifyStrengths(resume),
    weaknesses: identifyWeaknesses(resume),
    missingSkills: identifyMissingSkills(resume),
    atsIssues: identifyATSIssues(resume),
    atsSuggestions: generateATSSuggestions(resume),
    keywordDensity: calculateKeywordDensity(resume),
    formattingQuality: assessFormattingQuality(resume),
  }
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function calculateOverallScore(resume: ParsedResume): number {
  const wordCountScore = Math.min((resume.wordCount / 500) * 25, 25)
  const experienceScore = resume.sections.some((s) => s.type === 'experience') ? 25 : 10
  const skillsScore = Math.min((resume.skills.length / 15) * 25, 25)
  const sectionDiversity = Math.min((resume.sections.length / 4) * 25, 25)
  return Math.round(wordCountScore + experienceScore + skillsScore + sectionDiversity)
}

function calculateATSScore(resume: ParsedResume): number {
  let score = 50

  if (resume.sections.some((s) => s.type === 'experience')) score += 15
  if (resume.sections.some((s) => s.type === 'skills')) score += 15
  if (resume.sections.some((s) => s.type === 'education')) score += 10

  if (resume.wordCount >= 250 && resume.wordCount <= 1000) {
    score += 10
  } else if (resume.wordCount < 250) {
    score -= 10
  }

  const density = calculateKeywordDensity(resume)
  if (density >= 1 && density <= 4) {
    score += 5
  } else if (density > 6) {
    score -= 5
  }

  // Fixed: was using += side-effect inside reduce accumulator
  const totalBullets = resume.sections.reduce(
    (sum, s) => sum + (s.bullets?.length ?? 0),
    0,
  )
  if (totalBullets > 0) score += 5

  return Math.min(Math.max(score, 0), 100)
}

function calculateKeywordDensity(resume: ParsedResume): number {
  if (resume.wordCount === 0) return 0
  return Math.round((resume.keywords.length / resume.wordCount) * 100 * 10) / 10
}

// ─── Strengths / Weaknesses ───────────────────────────────────────────────────

function identifyStrengths(resume: ParsedResume): string[] {
  const strengths: string[] = []

  if (resume.wordCount > 400) strengths.push('Comprehensive resume with detailed descriptions')
  if (resume.skills.length >= 10) strengths.push('Strong technical skill set with variety')
  if (resume.sections.some((s) => s.type === 'experience')) strengths.push('Clear work experience section')
  if (resume.sections.some((s) => s.type === 'education')) strengths.push('Educational background clearly outlined')

  const expSection = resume.sections.find((s) => s.type === 'experience')
  if (expSection?.bullets && expSection.bullets.length > 3) {
    strengths.push('Well-detailed achievement bullets')
  }

  if (resume.keywords.includes('leadership')) strengths.push('Leadership experience highlighted')

  if (resume.keywords.some((k) => ['project', 'team', 'managed', 'led', 'developed'].includes(k))) {
    strengths.push('Strong action verbs in descriptions')
  }

  return strengths.slice(0, 5)
}

function identifyWeaknesses(resume: ParsedResume): string[] {
  const weaknesses: string[] = []

  if (resume.wordCount < 300) weaknesses.push('Resume is too brief — consider adding more details')
  if (resume.wordCount > 1200) weaknesses.push('Resume is too long — consider condensing to 1 page')
  if (!resume.sections.some((s) => s.type === 'experience')) weaknesses.push('Missing work experience section')
  if (!resume.sections.some((s) => s.type === 'skills')) weaknesses.push('Missing dedicated skills section')
  if (!resume.sections.some((s) => s.type === 'education')) weaknesses.push('Missing education information')

  const expSection = resume.sections.find((s) => s.type === 'experience')
  if (!expSection?.bullets || expSection.bullets.length < 2) {
    weaknesses.push('Experience bullets lack detail and impact')
  }

  if (resume.skills.length < 5) weaknesses.push('Limited technical skills listed')
  if (!resume.allText.includes('@') && !resume.allText.includes('email')) {
    weaknesses.push('Contact information not clearly visible')
  }

  return weaknesses.slice(0, 5)
}

function identifyMissingSkills(resume: ParsedResume): string[] {
  const commonSkills = [
    'project management',
    'communication',
    'problem solving',
    'teamwork',
    'time management',
    'adaptability',
    'analytical skills',
    'attention to detail',
  ]
  return commonSkills.filter(
    (skill) => !resume.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase())),
  )
}

// ─── ATS ──────────────────────────────────────────────────────────────────────

function identifyATSIssues(resume: ParsedResume): string[] {
  const issues: string[] = []

  if (!resume.sections.some((s) => s.type === 'experience')) issues.push('No experience section header detected')
  if (!resume.sections.some((s) => s.type === 'skills')) issues.push('No skills section header detected')

  const expSection = resume.sections.find((s) => s.type === 'experience')
  if (expSection && !expSection.bullets?.length) issues.push('Experience section lacks bullet points')
  if (resume.wordCount < 200) issues.push('Resume too short for comprehensive ATS parsing')
  if (resume.allText.includes('image') || resume.allText.includes('photo')) {
    issues.push('Potential images detected — ATS may not parse correctly')
  }

  return issues
}

function generateATSSuggestions(resume: ParsedResume): string[] {
  const issues = identifyATSIssues(resume)
  const suggestions: string[] = []

  if (issues.includes('No experience section header detected')) {
    suggestions.push('Add a clear "Experience" or "Work History" section header')
  }
  if (issues.includes('No skills section header detected')) {
    suggestions.push('Add a dedicated "Skills" section for better parsing')
  }
  if (resume.wordCount < 300) {
    suggestions.push('Expand descriptions to 250–1000 words for better ATS matching')
  }
  if (resume.wordCount > 1200) {
    suggestions.push('Condense to fit on 1 page for optimal ATS parsing')
  }
  if (issues.includes('Experience section lacks bullet points')) {
    suggestions.push('Use bullet points (- or •) for each achievement or responsibility')
  }
  if (resume.skills.length < 8) {
    suggestions.push('Add more specific technical and soft skills')
  }
  if (!resume.allText.match(/\d{4}.*\d{4}/)) {
    suggestions.push('Include dates in standard format (YYYY – YYYY or MM/YYYY)')
  }

  suggestions.push('Use standard fonts and formatting to avoid parsing errors')
  suggestions.push('Include relevant keywords from job descriptions naturally')

  return suggestions.slice(0, 5)
}

function assessFormattingQuality(resume: ParsedResume): AnalysisResult['formattingQuality'] {
  const score =
    (resume.sections.length >= 3 ? 1 : 0) +
    (resume.sections.some((s) => s.bullets && s.bullets.length > 0) ? 1 : 0) +
    (resume.wordCount >= 300 && resume.wordCount <= 1000 ? 1 : 0)

  if (score >= 3) return 'excellent'
  if (score >= 2) return 'good'
  if (score >= 1) return 'fair'
  return 'poor'
}

// ─── Job Matching ─────────────────────────────────────────────────────────────

export function matchJobDescription(resume: ParsedResume, jobDescription: string): KeywordMatchResult {
  const jobKeywords = extractJobKeywords(jobDescription)
  const resumeTerms = new Set(
    [...resume.keywords, ...resume.skills].map((k) => k.toLowerCase()),
  )

  const matchedKeywords = jobKeywords.filter((kw) => resumeTerms.has(kw.toLowerCase()))
  const missingKeywords = jobKeywords.filter((kw) => !resumeTerms.has(kw.toLowerCase()))
  const matchScore = jobKeywords.length > 0
    ? Math.round((matchedKeywords.length / jobKeywords.length) * 100)
    : 0

  return {
    matchScore,
    matchedKeywords,
    missingKeywords,
    totalJobKeywords: jobKeywords.length,
    matchedCount: matchedKeywords.length,
  }
}

/**
 * Extract only meaningful tech/skill keywords from a job description.
 * Deliberately avoids generic words to keep match scores meaningful.
 */
function extractJobKeywords(jobDescription: string): string[] {
  const keywords = new Set<string>()

  // Tech skills, tools, methodologies
  const techPattern =
    /\b(javascript|typescript|react|next\.?js|node\.?js|python|java|sql|html|css|aws|docker|kubernetes|git|agile|scrum|project\s+management|leadership|communication|data\s+analysis|machine\s+learning|deep\s+learning|api|rest|graphql|mongodb|postgres|postgresql|mysql|firebase|azure|gcp|devops|ci\/cd|testing|jest|webpack|vue|angular|php|golang|go|rust|c\+\+|scala|swift|kotlin|redis|elasticsearch|terraform|ansible|linux|bash|shell|figma|sketch|jira|confluence|tableau|power\s+bi|excel|r\b|matlab|spark|hadoop|kafka|microservices|serverless|oauth|jwt|websocket|tailwind|sass|scss|redux|graphql|prisma|supabase|vercel|netlify)\b/gi

  for (const match of jobDescription.matchAll(techPattern)) {
    keywords.add(match[0].toLowerCase().trim())
  }

  // "X+ years of <skill>" patterns
  for (const match of jobDescription.matchAll(/\b\d+\+?\s+years?\s+of\s+(\w[\w\s]*?)(?:\s+experience|\s+background|[,.])/gi)) {
    if (match[1]) keywords.add(match[1].toLowerCase().trim())
  }

  return Array.from(keywords).slice(0, 40)
}
