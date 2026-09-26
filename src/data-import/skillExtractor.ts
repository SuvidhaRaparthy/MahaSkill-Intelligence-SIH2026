import { normalizeSkillText } from './skillNormalizer.ts';
import type { NormalizedSkillResult } from './skillNormalizer.ts';
import type { MappingMethod, ProficiencyLevel } from '../types/database';

export interface ExtractedSkillItem {
  raw_skill_text: string;
  canonical_name: string;
  category: string;
  proficiency: ProficiencyLevel;
  extraction_confidence: number;
  mapping_method: MappingMethod;
  taxonomy_status: 'official' | 'normalized' | 'emerging' | 'unmapped';
}

/**
 * Extracts contextual proficiency from surrounding job text sentences.
 */
function detectProficiency(text: string, skillName: string): ProficiencyLevel {
  const textLower = text.toLowerCase();
  const skillLower = skillName.toLowerCase();

  if (textLower.includes(`expert ${skillLower}`) || textLower.includes(`advanced ${skillLower}`) || textLower.includes('5+ years')) {
    return 'advanced';
  }
  if (textLower.includes(`required`) || textLower.includes(`must have ${skillLower}`) || textLower.includes('mandatory')) {
    return 'required';
  }
  if (textLower.includes(`preferred`) || textLower.includes(`desirable`) || textLower.includes('plus')) {
    return 'preferred';
  }
  if (textLower.includes(`basic`) || textLower.includes(`familiarity with ${skillLower}`)) {
    return 'basic';
  }

  return 'intermediate';
}

/**
 * Deterministic skill extractor analyzing title, raw skills field, and description.
 */
export function extractSkillsDeterministic(
  title: string,
  description: string,
  rawSkillsStr?: string
): ExtractedSkillItem[] {
  const combinedText = `${title} ${rawSkillsStr || ''} ${description}`;
  const extractedMap = new Map<string, ExtractedSkillItem>();

  // Tokenize explicit raw skills if provided in CSV
  let tokens: string[] = [];
  if (rawSkillsStr && rawSkillsStr.trim()) {
    tokens = rawSkillsStr.split(/[,|;]/).map(s => s.trim()).filter(Boolean);
  }

  // Pre-defined key term triggers for job text scan
  const triggerTerms = [
    'EV Battery Diagnostics', 'EV Battery', 'BMS Diagnostics', 'BMS', 'CAN Bus Diagnostics', 'CAN Bus',
    'React.js', 'ReactJS', 'React JS', 'React', 'TypeScript', 'TS',
    'Generative AI & LLM', 'Generative AI', 'GenAI', 'LLM',
    'Cloud Architecture', 'AWS', 'Azure', 'Cloud',
    'Legacy PHP Maintenance', 'Legacy PHP', 'PHP',
    'Docker', 'Kubernetes', 'Python', 'REST API', 'SQL', 'PostgreSQL', 'Microservices'
  ];

  triggerTerms.forEach((term) => {
    if (combinedText.toLowerCase().includes(term.toLowerCase())) {
      tokens.push(term);
    }
  });

  // Unique tokens processing
  tokens.forEach((rawToken) => {
    const norm: NormalizedSkillResult = normalizeSkillText(rawToken);
    const proficiency = detectProficiency(combinedText, rawToken);

    let mappingMethod: MappingMethod = 'ALIAS_MATCH';
    if (norm.taxonomy_status === 'official') mappingMethod = 'EXACT_MATCH';
    else if (norm.taxonomy_status === 'normalized') mappingMethod = 'ALIAS_MATCH';
    else if (norm.taxonomy_status === 'emerging') mappingMethod = 'UNRESOLVED';

    if (!extractedMap.has(norm.canonical_name)) {
      extractedMap.set(norm.canonical_name, {
        raw_skill_text: rawToken,
        canonical_name: norm.canonical_name,
        category: norm.category,
        proficiency,
        extraction_confidence: norm.confidence,
        mapping_method: mappingMethod,
        taxonomy_status: norm.taxonomy_status
      });
    }
  });

  return Array.from(extractedMap.values());
}

/**
 * Server-side AI Skill Extractor utilizing Gemini API when available.
 */
export async function extractSkillsWithGemini(
  title: string,
  description: string
): Promise<ExtractedSkillItem[]> {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';

  if (!apiKey || apiKey.startsWith('your-')) {
    // Fallback to high-accuracy deterministic extraction if Gemini key is unset
    return extractSkillsDeterministic(title, description);
  }

  try {
    const prompt = `Extract technical and non-technical skills from this job posting as structured JSON.
Job Title: ${title}
Job Description: ${description}

Return JSON with structure:
{
  "skills": [
    {
      "raw_text": "...",
      "canonical_skill": "...",
      "category": "...",
      "proficiency": "required|preferred|basic|intermediate|advanced",
      "confidence": 0-100
    }
  ]
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!res.ok) throw new Error(`Gemini API HTTP ${res.status}`);

    const json = await res.json();
    const rawAnswer = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawAnswer.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return (parsed.skills || []).map((s: any) => {
      const norm = normalizeSkillText(s.canonical_skill || s.raw_text);
      return {
        raw_skill_text: s.raw_text || norm.raw_text,
        canonical_name: norm.canonical_name,
        category: norm.category || s.category,
        proficiency: s.proficiency || 'intermediate',
        extraction_confidence: s.confidence || norm.confidence,
        mapping_method: 'SEMANTIC_LLM',
        taxonomy_status: norm.taxonomy_status
      };
    });

  } catch (err) {
    console.warn('[Gemini Extractor Fallback]', err);
    return extractSkillsDeterministic(title, description);
  }
}

export { extractSkillsWithGemini as extractSkillsFromText };
