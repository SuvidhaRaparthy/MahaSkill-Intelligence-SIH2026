// MahaSkill Intelligence - Skill Normalization Engine (Phase 3)

// Known canonical mappings dictionary
const CANONICAL_MAPPINGS: Record<string, { canonical: string; category: string }> = {
  // React variants
  'react js': { canonical: 'React.js', category: 'Software Development' },
  'reactjs': { canonical: 'React.js', category: 'Software Development' },
  'react.js': { canonical: 'React.js', category: 'Software Development' },
  'react': { canonical: 'React.js', category: 'Software Development' },
  'react developer': { canonical: 'React.js', category: 'Software Development' },
  'react frontend': { canonical: 'React.js', category: 'Software Development' },
  'react.js developer': { canonical: 'React.js', category: 'Software Development' },
  'reactjs developer': { canonical: 'React.js', category: 'Software Development' },
  'react js developer': { canonical: 'React.js', category: 'Software Development' },

  // Node variants
  'node js': { canonical: 'Node.js', category: 'Software Development' },
  'nodejs': { canonical: 'Node.js', category: 'Software Development' },
  'node.js': { canonical: 'Node.js', category: 'Software Development' },
  'node': { canonical: 'Node.js', category: 'Software Development' },

  // Machine Learning variants
  'ml': { canonical: 'Machine Learning', category: 'Artificial Intelligence' },
  'machine learning': { canonical: 'Machine Learning', category: 'Artificial Intelligence' },
  'machine-learning': { canonical: 'Machine Learning', category: 'Artificial Intelligence' },
  'ml engineer': { canonical: 'Machine Learning', category: 'Artificial Intelligence' },

  // EV Battery variants
  'ev battery diagnostics': { canonical: 'EV Battery Diagnostics', category: 'Automotive Engineering' },
  'ev battery health check': { canonical: 'EV Battery Diagnostics', category: 'Automotive Engineering' },
  'battery pack testing': { canonical: 'EV Battery Diagnostics', category: 'Automotive Engineering' },
  'battery state of health': { canonical: 'EV Battery Diagnostics', category: 'Automotive Engineering' },
  'ev battery testing': { canonical: 'EV Battery Diagnostics', category: 'Automotive Engineering' },
  'ev battery diagnostic engineer': { canonical: 'EV Battery Diagnostics', category: 'Automotive Engineering' },

  // BMS variants
  'bms': { canonical: 'Battery Management Systems (BMS)', category: 'Automotive Engineering' },
  'bms calibration': { canonical: 'Battery Management Systems (BMS)', category: 'Automotive Engineering' },
  'bms repair': { canonical: 'Battery Management Systems (BMS)', category: 'Automotive Engineering' },
  'bms repair technician': { canonical: 'Battery Management Systems (BMS)', category: 'Automotive Engineering' },
  'bms diagnostics': { canonical: 'Battery Management Systems (BMS)', category: 'Automotive Engineering' },
  'battery management system': { canonical: 'Battery Management Systems (BMS)', category: 'Automotive Engineering' },

  // CAN Bus variants
  'can bus': { canonical: 'CAN Bus Diagnostics', category: 'Automotive Electronics' },
  'can bus diagnostics': { canonical: 'CAN Bus Diagnostics', category: 'Automotive Electronics' },
  'controller area network': { canonical: 'CAN Bus Diagnostics', category: 'Automotive Electronics' },
  'can bus electronics specialist': { canonical: 'CAN Bus Diagnostics', category: 'Automotive Electronics' },

  // TypeScript variants
  'ts': { canonical: 'TypeScript', category: 'Software Development' },
  'typescript': { canonical: 'TypeScript', category: 'Software Development' },
  'typescript engineer': { canonical: 'TypeScript', category: 'Software Development' },

  // Cloud variants
  'aws': { canonical: 'Cloud Architecture (AWS/Azure)', category: 'Cloud Computing' },
  'azure': { canonical: 'Cloud Architecture (AWS/Azure)', category: 'Cloud Computing' },
  'cloud architecture': { canonical: 'Cloud Architecture (AWS/Azure)', category: 'Cloud Computing' },
  'cloud infrastructure': { canonical: 'Cloud Architecture (AWS/Azure)', category: 'Cloud Computing' },

  // GenAI variants
  'genai': { canonical: 'Generative AI & LLM Integration', category: 'Artificial Intelligence' },
  'llm': { canonical: 'Generative AI & LLM Integration', category: 'Artificial Intelligence' },
  'rag pipeline': { canonical: 'Generative AI & LLM Integration', category: 'Artificial Intelligence' },
  'generative ai': { canonical: 'Generative AI & LLM Integration', category: 'Artificial Intelligence' },

  // Legacy PHP variants
  'legacy php': { canonical: 'Legacy PHP Maintenance', category: 'Legacy Web' },
  'php': { canonical: 'Legacy PHP Maintenance', category: 'Legacy Web' },
  'legacy php maintenance': { canonical: 'Legacy PHP Maintenance', category: 'Legacy Web' },
  'legacy php scripting maintainer': { canonical: 'Legacy PHP Maintenance', category: 'Legacy Web' }
};

export type ResolutionMethod = 'EXACT' | 'ALIAS' | 'RULE' | 'AI_ASSISTED' | 'UNRESOLVED';

export interface NormalizedSkillResult {
  raw_text: string;
  canonical_name: string;
  category: string;
  taxonomy_status: 'official' | 'normalized' | 'emerging' | 'unmapped';
  mapping_method: ResolutionMethod;
  confidence: number;
  alias_matched?: string;
  explainability: string;
}

/**
 * Normalizes raw skill text following the 5-step resolution priority:
 * 1. Exact canonical skill match -> EXACT
 * 2. Approved alias dictionary lookup -> ALIAS
 * 3. Deterministic rule substring match -> RULE
 * 4. AI-assisted semantic extraction (if passed from Gemini upstream) -> AI_ASSISTED
 * 5. Unresolved / emerging term -> UNRESOLVED (preserves raw term, marked emerging)
 */
export function normalizeSkillText(rawSkillText: string, isAiAssisted: boolean = false): NormalizedSkillResult {
  if (!rawSkillText || !rawSkillText.trim()) {
    return {
      raw_text: '',
      canonical_name: 'Unspecified Skill',
      category: 'General',
      taxonomy_status: 'unmapped',
      mapping_method: 'UNRESOLVED',
      confidence: 50,
      explainability: 'Empty input string provided.'
    };
  }

  const cleaned = rawSkillText.trim();
  const lookupKey = cleaned.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ');

  // Priority 1 & 2: Direct Alias Dictionary Lookup
  if (CANONICAL_MAPPINGS[lookupKey]) {
    const match = CANONICAL_MAPPINGS[lookupKey];
    const isExact = match.canonical.toLowerCase() === lookupKey;
    const method: ResolutionMethod = isExact ? 'EXACT' : 'ALIAS';

    return {
      raw_text: cleaned,
      canonical_name: match.canonical,
      category: match.category,
      taxonomy_status: isExact ? 'official' : 'normalized',
      mapping_method: method,
      confidence: isExact ? 98 : 92,
      alias_matched: isExact ? undefined : cleaned,
      explainability: isExact
        ? `Exact match with canonical taxonomy symbol "${match.canonical}" (98% confidence).`
        : `Approved alias "${cleaned}" mapped to canonical skill "${match.canonical}" (92% confidence).`
    };
  }

  // Priority 3: Deterministic Rule Substring Match
  for (const [key, mapping] of Object.entries(CANONICAL_MAPPINGS)) {
    if (lookupKey.includes(key) && key.length >= 3) {
      return {
        raw_text: cleaned,
        canonical_name: mapping.canonical,
        category: mapping.category,
        taxonomy_status: 'normalized',
        mapping_method: isAiAssisted ? 'AI_ASSISTED' : 'RULE',
        confidence: isAiAssisted ? 88 : 82,
        alias_matched: key,
        explainability: isAiAssisted
          ? `Gemini semantic context mapped "${cleaned}" -> "${mapping.canonical}" (88% confidence).`
          : `Deterministic rule matched substring "${key}" in "${cleaned}" -> "${mapping.canonical}" (82% confidence).`
      };
    }
  }

  // Priority 5: Unresolved / Emerging Skill Term
  // Preserve raw term, mark taxonomy_status as emerging, DO NOT invent/auto-add to official taxonomy.
  const titleCased = cleaned.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
  return {
    raw_text: cleaned,
    canonical_name: titleCased,
    category: 'Unmapped / Emerging',
    taxonomy_status: 'emerging',
    mapping_method: 'UNRESOLVED',
    confidence: 60,
    explainability: `Raw term "${cleaned}" not found in canonical taxonomy. Preserved as unresolved/emerging term for governance review.`
  };
}
