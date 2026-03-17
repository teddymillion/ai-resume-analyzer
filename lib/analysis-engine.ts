/**
 * Analysis Engine - Generates realistic analysis based on resume content
 * All calculations are deterministic based on actual resume data
 */

import { ParsedResume } from './resume-parser';

export interface AnalysisResult {
  overallScore: number;
  atsScore: number;
  matchScore: number | null;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  atsIssues: string[];
  atsSuggestions: string[];
  keywordDensity: number;
  formattingQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface KeywordMatchResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalJobKeywords: number;
  matchedCount: number;
}

/**
 * Main analysis function - generates comprehensive analysis
 */
export function analyzeResume(resume: ParsedResume): AnalysisResult {
  const overallScore = calculateOverallScore(resume);
  const atsScore = calculateATSScore(resume);
  const strengths = identifyStrengths(resume);
  const weaknesses = identifyWeaknesses(resume);
  const missingSkills = identifyMissingSkills(resume);
  const atsIssues = identifyATSIssues(resume);
  const atsSuggestions = generateATSSuggestions(resume, atsIssues);
  const keywordDensity = calculateKeywordDensity(resume);
  const formattingQuality = assessFormattingQuality(resume);

  return {
    overallScore,
    atsScore,
    matchScore: null, // Set when job description is provided
    strengths,
    weaknesses,
    missingSkills,
    atsIssues,
    atsSuggestions,
    keywordDensity,
    formattingQuality,
  };
}

/**
 * Calculate overall score (0-100) based on multiple factors
 */
function calculateOverallScore(resume: ParsedResume): number {
  const wordCountScore = Math.min((resume.wordCount / 500) * 25, 25);
  const hasExperienceSection = resume.sections.some((s) => s.type === 'experience');
  const experienceScore = hasExperienceSection ? 25 : 10;
  const skillsCount = resume.skills.length;
  const skillsScore = Math.min((skillsCount / 15) * 25, 25);
  const sectionDiversity = Math.min((resume.sections.length / 4) * 25, 25);

  return Math.round(wordCountScore + experienceScore + skillsScore + sectionDiversity);
}

/**
 * Calculate ATS score (0-100) based on ATS-friendly formatting
 */
function calculateATSScore(resume: ParsedResume): number {
  let score = 50; // Base score

  // Check for common ATS-friendly practices
  const hasExperienceSection = resume.sections.some((s) => s.type === 'experience');
  const hasSkillsSection = resume.sections.some((s) => s.type === 'skills');
  const hasEducationSection = resume.sections.some((s) => s.type === 'education');

  if (hasExperienceSection) score += 15;
  if (hasSkillsSection) score += 15;
  if (hasEducationSection) score += 10;

  // Word count check (too short or too long is bad for ATS)
  if (resume.wordCount >= 250 && resume.wordCount <= 1000) {
    score += 10;
  } else if (resume.wordCount < 250) {
    score -= 10;
  }

  // Keyword density (avoid keyword stuffing)
  const density = calculateKeywordDensity(resume);
  if (density >= 1 && density <= 4) {
    score += 5;
  } else if (density > 6) {
    score -= 5;
  }

  // Check for bullet points (ATS-friendly format)
  const totalBullets = resume.sections.reduce((sum, s) => (sum += s.bullets?.length ?? 0), 0);
  if (totalBullets > 0) {
    score += 5;
  }

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Calculate keyword density (% of keywords in resume)
 */
function calculateKeywordDensity(resume: ParsedResume): number {
  if (resume.wordCount === 0) return 0;
  return Math.round((resume.keywords.length / resume.wordCount) * 100 * 10) / 10;
}

/**
 * Identify strengths based on resume content
 */
function identifyStrengths(resume: ParsedResume): string[] {
  const strengths: string[] = [];

  if (resume.wordCount > 400) {
    strengths.push('Comprehensive resume with detailed descriptions');
  }

  if (resume.skills.length >= 10) {
    strengths.push('Strong technical skill set with variety');
  }

  if (resume.sections.some((s) => s.type === 'experience')) {
    strengths.push('Clear work experience section');
  }

  if (resume.sections.some((s) => s.type === 'education')) {
    strengths.push('Educational background clearly outlined');
  }

  const experienceSection = resume.sections.find((s) => s.type === 'experience');
  if (experienceSection?.bullets && experienceSection.bullets.length > 3) {
    strengths.push('Well-detailed achievement bullets');
  }

  if (resume.keywords.includes('leadership')) {
    strengths.push('Leadership experience highlighted');
  }

  if (
    resume.keywords.some((k) =>
      ['project', 'team', 'managed', 'led', 'developed'].includes(k),
    )
  ) {
    strengths.push('Strong action verbs in descriptions');
  }

  return strengths.slice(0, 5);
}

/**
 * Identify weaknesses and areas for improvement
 */
function identifyWeaknesses(resume: ParsedResume): string[] {
  const weaknesses: string[] = [];

  if (resume.wordCount < 300) {
    weaknesses.push('Resume is too brief - consider adding more details');
  }

  if (resume.wordCount > 1200) {
    weaknesses.push('Resume is too long - consider condensing to 1 page');
  }

  if (!resume.sections.some((s) => s.type === 'experience')) {
    weaknesses.push('Missing work experience section');
  }

  if (!resume.sections.some((s) => s.type === 'skills')) {
    weaknesses.push('Missing dedicated skills section');
  }

  if (!resume.sections.some((s) => s.type === 'education')) {
    weaknesses.push('Missing education information');
  }

  const experienceSection = resume.sections.find((s) => s.type === 'experience');
  if (!experienceSection?.bullets || experienceSection.bullets.length < 2) {
    weaknesses.push('Experience bullets lack detail and impact');
  }

  if (resume.skills.length < 5) {
    weaknesses.push('Limited technical skills listed');
  }

  if (!resume.allText.includes('@') && !resume.allText.includes('email')) {
    weaknesses.push('Contact information not clearly visible');
  }

  return weaknesses.slice(0, 5);
}

/**
 * Identify missing important skills
 */
function identifyMissingSkills(resume: ParsedResume): string[] {
  const inResume = resume.skills;
  const commonTechSkills = [
    'project management',
    'communication',
    'problem solving',
    'teamwork',
    'time management',
    'adaptability',
    'analytical skills',
    'attention to detail',
  ];

  return commonTechSkills.filter(
    (skill) => !inResume.some((s) => s.toLowerCase().includes(skill.toLowerCase())),
  );
}

/**
 * Identify specific ATS issues
 */
function identifyATSIssues(resume: ParsedResume): string[] {
  const issues: string[] = [];

  if (!resume.sections.some((s) => s.type === 'experience')) {
    issues.push('No experience section header detected');
  }

  if (!resume.sections.some((s) => s.type === 'skills')) {
    issues.push('No skills section header detected');
  }

  const experienceSection = resume.sections.find((s) => s.type === 'experience');
  if (experienceSection && !experienceSection.bullets?.length) {
    issues.push('Experience section lacks bullet points');
  }

  if (resume.wordCount < 200) {
    issues.push('Resume too short for comprehensive ATS parsing');
  }

  if (resume.allText.includes('image') || resume.allText.includes('photo')) {
    issues.push('Potential images detected - ATS may not parse correctly');
  }

  return issues;
}

/**
 * Generate specific ATS improvement suggestions
 */
function generateATSSuggestions(resume: ParsedResume, issues: string[]): string[] {
  const suggestions: string[] = [];

  if (issues.includes('No experience section header detected')) {
    suggestions.push('Add a clear "Experience" or "Work History" section header');
  }

  if (issues.includes('No skills section header detected')) {
    suggestions.push('Add a dedicated "Skills" section for better parsing');
  }

  if (resume.wordCount < 300) {
    suggestions.push('Expand descriptions to 250-1000 words for better ATS matching');
  }

  if (resume.wordCount > 1200) {
    suggestions.push('Condense to fit on 1 page for optimal ATS parsing');
  }

  if (issues.includes('Experience section lacks bullet points')) {
    suggestions.push('Use bullet points (- or •) for each achievement or responsibility');
  }

  if (resume.skills.length < 8) {
    suggestions.push('Add more specific technical and soft skills');
  }

  if (!resume.allText.match(/\d{4}.*\d{4}/)) {
    suggestions.push('Include dates in standard format (YYYY - YYYY or MM/YYYY)');
  }

  suggestions.push('Use standard fonts and formatting to avoid parsing errors');
  suggestions.push('Include relevant keywords from job descriptions naturally');

  return suggestions.slice(0, 5);
}

/**
 * Assess formatting quality
 */
function assessFormattingQuality(resume: ParsedResume): 'excellent' | 'good' | 'fair' | 'poor' {
  const hasSections = resume.sections.length >= 3;
  const hasBullets = resume.sections.some((s) => s.bullets && s.bullets.length > 0);
  const goodLength = resume.wordCount >= 300 && resume.wordCount <= 1000;

  const qualityScore =
    (hasSections ? 1 : 0) + (hasBullets ? 1 : 0) + (goodLength ? 1 : 0);

  if (qualityScore >= 3) return 'excellent';
  if (qualityScore >= 2) return 'good';
  if (qualityScore >= 1) return 'fair';
  return 'poor';
}

/**
 * Match resume against job description
 */
export function matchJobDescription(resume: ParsedResume, jobDescription: string): KeywordMatchResult {
  const jobKeywords = extractJobKeywords(jobDescription);
  const resumeKeywords = new Set(
    resume.keywords.concat(resume.skills).map((k) => k.toLowerCase()),
  );

  const matchedKeywords = jobKeywords.filter((keyword) =>
    resumeKeywords.has(keyword.toLowerCase()),
  );

  const missingKeywords = jobKeywords.filter((keyword) =>
    !resumeKeywords.has(keyword.toLowerCase()),
  );

  const matchScore = Math.round((matchedKeywords.length / jobKeywords.length) * 100);

  return {
    matchScore,
    matchedKeywords,
    missingKeywords,
    totalJobKeywords: jobKeywords.length,
    matchedCount: matchedKeywords.length,
  };
}

/**
 * Extract keywords from job description
 */
function extractJobKeywords(jobDescription: string): string[] {
  const keywords = new Set<string>();

  // Extract skills and technologies (common patterns)
  const patterns = [
    /\b(javascript|typescript|react|nodejs|python|java|sql|html|css|aws|docker|kubernetes|git|agile|scrum|project\s+management|leadership|communication|data\s+analysis|machine\s+learning|api|rest|graphql|mongodb|postgres|mysql|firebase|azure|gcp|devops|ci\/cd|testing|jest|webpack|next\.js|vue|angular|php|golang|rust|c\+\+)\b/gi,
    /\b\d+\+?\s+years?\s+of\s+(\w+)/gi,
  ];

  patterns.forEach((pattern) => {
    const matches = jobDescription.matchAll(pattern);
    Array.from(matches).forEach((match) => {
      if (match[1]) {
        keywords.add(match[1].toLowerCase().trim());
      }
    });
  });

  // Extract general important words
  const words = jobDescription
    .toLowerCase()
    .match(/\b\w{4,}\b/g) // Words with 4+ characters
    ?.slice(0, 40) ?? [];

  words.forEach((word) => keywords.add(word));

  return Array.from(keywords).slice(0, 30);
}
