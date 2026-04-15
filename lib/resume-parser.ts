// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResumeSection {
  type: 'summary' | 'experience' | 'skills' | 'education' | 'other'
  title: string
  content: string
  bullets: string[]
}

export interface ParsedResume {
  rawText: string
  sections: ResumeSection[]
  allText: string
  skills: string[]
  keywords: string[]
  wordCount: number
  charCount: number
}

// ─── Section Header Patterns ──────────────────────────────────────────────────

const SECTION_PATTERNS: Array<{ pattern: RegExp; type: ResumeSection['type'] }> = [
  { pattern: /^(professional\s+summary|summary|profile|objective|about\s+me)/im, type: 'summary' },
  { pattern: /^(work\s+experience|experience|employment\s+history|employment|work\s+history|professional\s+experience)/im, type: 'experience' },
  { pattern: /^(skills|core\s+skills|technical\s+skills|key\s+skills|competencies)/im, type: 'skills' },
  { pattern: /^(education|academic\s+background|academic|qualifications)/im, type: 'education' },
]

// ─── Main Parser ──────────────────────────────────────────────────────────────

export function parseResume(text: string): ParsedResume {
  const trimmedText = text.trim()
  const wordCount = trimmedText ? trimmedText.split(/\s+/).length : 0
  const charCount = trimmedText.length

  const sections = extractSections(trimmedText)
  const skills = extractSkills(trimmedText)
  const keywords = extractKeywords(trimmedText)

  return {
    rawText: text,
    sections,
    allText: trimmedText,
    skills,
    keywords,
    wordCount,
    charCount,
  }
}

// ─── Section Extraction ───────────────────────────────────────────────────────

function extractSections(text: string): ResumeSection[] {
  // Collect all section header positions across all patterns
  const matches: Array<{ index: number; title: string; type: ResumeSection['type'] }> = []

  for (const { pattern, type } of SECTION_PATTERNS) {
    // Use global flag to find ALL occurrences, not just the first
    const globalPattern = new RegExp(pattern.source, 'gim')
    for (const match of text.matchAll(globalPattern)) {
      if (match.index !== undefined) {
        matches.push({ index: match.index, title: match[0].trim(), type })
      }
    }
  }

  if (matches.length === 0) {
    // No recognizable sections — treat entire text as a single block
    return [
      {
        type: 'other',
        title: 'Resume Content',
        content: text,
        bullets: extractBullets(text),
      },
    ]
  }

  // Sort by position in document
  matches.sort((a, b) => a.index - b.index)

  // Deduplicate overlapping matches (keep earliest per position)
  const deduped = matches.filter(
    (m, i) => i === 0 || m.index > matches[i - 1].index + matches[i - 1].title.length,
  )

  // Slice content between consecutive headers
  return deduped.map((item, idx) => {
    const contentStart = item.index + item.title.length
    const contentEnd = idx < deduped.length - 1 ? deduped[idx + 1].index : text.length
    const content = text.slice(contentStart, contentEnd).trim()

    return {
      type: item.type,
      title: item.title,
      content,
      bullets: extractBullets(content),
    }
  })
}

// ─── Bullet Extraction ────────────────────────────────────────────────────────

function extractBullets(text: string): string[] {
  const results: string[] = []
  for (const match of text.matchAll(/^[\s]*[-•*▪▸]\s+(.+)$/gm)) {
    const bullet = match[1].trim()
    if (bullet) results.push(bullet)
  }
  return results
}

// ─── Skills Extraction ────────────────────────────────────────────────────────

const KNOWN_SKILLS = [
  'javascript', 'typescript', 'react', 'nodejs', 'python', 'java', 'sql',
  'html', 'css', 'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
  'project management', 'leadership', 'communication', 'data analysis',
  'machine learning', 'api', 'rest', 'graphql', 'mongodb', 'postgres',
  'mysql', 'firebase', 'azure', 'gcp', 'devops', 'ci/cd', 'testing',
  'jest', 'webpack', 'next.js', 'vue', 'angular', 'php', 'golang', 'rust',
  'c++', 'scala', 'swift', 'kotlin', 'redis', 'terraform', 'linux',
  'figma', 'jira', 'tableau', 'excel', 'spark', 'kafka', 'microservices',
  'tailwind', 'sass', 'redux', 'prisma', 'supabase',
]

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase()
  return KNOWN_SKILLS.filter((skill) => lower.includes(skill))
}

// ─── Keyword Extraction ───────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'will', 'would', 'could', 'should',
  'this', 'that', 'these', 'those', 'their', 'they', 'them', 'then', 'than',
  'also', 'into', 'over', 'after', 'such', 'when', 'where', 'which', 'while',
])

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/\b\w{4,}\b/g) ?? []
  const freq = new Map<string, number>()

  for (const word of words) {
    if (!STOP_WORDS.has(word)) {
      freq.set(word, (freq.get(word) ?? 0) + 1)
    }
  }

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word)
}
