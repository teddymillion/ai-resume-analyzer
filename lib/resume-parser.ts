/**
 * Resume Parser - Extracts and structures resume content
 * Simulates PDF/DOCX parsing by converting text to structured format
 */

export interface ResumeSection {
  type: 'summary' | 'experience' | 'skills' | 'education' | 'other';
  title: string;
  content: string;
  bullets?: string[];
}

export interface ParsedResume {
  rawText: string;
  sections: ResumeSection[];
  allText: string;
  skills: string[];
  keywords: string[];
  wordCount: number;
  charCount: number;
}

/**
 * Extract resume text and structure it into sections
 * Simulates parsing of PDF/DOCX files
 */
export function parseResume(text: string): ParsedResume {
  const trimmedText = text.trim();
  const wordCount = trimmedText.split(/\s+/).length;
  const charCount = trimmedText.length;

  // Simple section detection - look for common section headers
  const sectionPatterns = [
    { pattern: /^(professional\s+summary|summary|profile)/mi, type: 'summary' as const },
    { pattern: /^(work\s+experience|experience|employment)/mi, type: 'experience' as const },
    { pattern: /^(skills|core\s+skills|technical\s+skills)/mi, type: 'skills' as const },
    { pattern: /^(education|academic)/mi, type: 'education' as const },
  ];

  const sections: ResumeSection[] = [];
  let lastIndex = 0;

  // Find all section headers
  const matches: Array<{ pattern: RegExp; type: string; match: RegExpMatchArray }> = [];
  sectionPatterns.forEach(({ pattern, type }) => {
    const match = text.match(pattern);
    if (match && match.index !== undefined) {
      matches.push({ pattern, type, match });
    }
  });

  // Sort matches by position
  matches.sort((a, b) => (a.match.index ?? 0) - (b.match.index ?? 0));

  // Extract sections
  matches.forEach((item, idx) => {
    const startIdx = item.match.index ?? 0;
    const sectionTitle = item.match[0];
    const endIdx =
      idx < matches.length - 1 ? matches[idx + 1].match.index ?? text.length : text.length;

    const sectionContent = text.substring(startIdx + sectionTitle.length, endIdx).trim();

    sections.push({
      type: item.type as 'summary' | 'experience' | 'skills' | 'education' | 'other',
      title: sectionTitle,
      content: sectionContent,
      bullets: extractBullets(sectionContent),
    });
  });

  // If no sections found, treat entire text as summary
  if (sections.length === 0) {
    sections.push({
      type: 'summary',
      title: 'Resume Content',
      content: trimmedText,
      bullets: [],
    });
  }

  // Extract skills (look for skill-like patterns)
  const skills = extractSkills(trimmedText);
  const keywords = extractKeywords(trimmedText);

  return {
    rawText: text,
    sections,
    allText: trimmedText,
    skills,
    keywords,
    wordCount,
    charCount,
  };
}

/**
 * Extract bullet points from text (lines starting with -, •, *, etc.)
 */
function extractBullets(text: string): string[] {
  const bulletPattern = /^[\s]*[-•*]\s+(.+)$/gm;
  const matches = text.matchAll(bulletPattern);
  return Array.from(matches).map((m) => m[1].trim());
}

/**
 * Extract common technical and professional skills
 */
function extractSkills(text: string): string[] {
  const commonSkills = [
    'javascript',
    'typescript',
    'react',
    'nodejs',
    'python',
    'java',
    'sql',
    'html',
    'css',
    'aws',
    'docker',
    'kubernetes',
    'git',
    'agile',
    'scrum',
    'project management',
    'leadership',
    'communication',
    'data analysis',
    'machine learning',
    'api',
    'rest',
    'graphql',
    'mongodb',
    'postgres',
    'mysql',
    'firebase',
    'azure',
    'gcp',
    'devops',
    'ci/cd',
    'testing',
    'jest',
    'webpack',
    'next.js',
    'vue',
    'angular',
    'php',
    'golang',
    'rust',
    'c++',
    'scala',
  ];

  const lowerText = text.toLowerCase();
  return commonSkills.filter((skill) => lowerText.includes(skill));
}

/**
 * Extract general keywords for analysis
 */
function extractKeywords(text: string): string[] {
  // Remove common stop words and get meaningful keywords
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'as',
    'is',
    'was',
    'are',
    'were',
    'be',
    'been',
    'being',
  ]);

  const words = text
    .toLowerCase()
    .match(/\b\w{4,}\b/g) // Words with 4+ characters
    ?.filter((word) => !stopWords.has(word)) ?? [];

  // Get unique words and limit to top keywords
  const keywordFreq = new Map<string, number>();
  words.forEach((word) => {
    keywordFreq.set(word, (keywordFreq.get(word) ?? 0) + 1);
  });

  return Array.from(keywordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word);
}
