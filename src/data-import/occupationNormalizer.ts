// MahaSkill Intelligence - Occupation Normalization Engine (NCO-2015 Alignment)

export interface NormalizedOccupationResult {
  raw_title: string;
  occupation_id?: string;
  title: string;
  nco_code?: string;
  nco_family?: string;
  confidence: number;
  mapping_status: 'MAPPED' | 'UNMAPPED_PENDING_REVIEW';
}

interface OccupationMappingRule {
  occupation_id: string;
  title: string;
  nco_code: string;
  nco_family: string;
  keywords: string[];
}

// Canonical Occupation Reference Rules aligned with NCO-2015 taxonomy
const OCCUPATION_RULES: OccupationMappingRule[] = [
  {
    occupation_id: 'b1111111-1111-4111-8111-111111111111',
    title: 'EV Battery Specialist',
    nco_code: '2152.0100',
    nco_family: 'Electrical Engineers',
    keywords: ['ev battery', 'battery diagnostic', 'bms calibration', 'battery pack', 'lithium ion']
  },
  {
    occupation_id: 'b2222222-2222-4222-8222-222222222222',
    title: 'Automotive Electronics Diagnostics Technician',
    nco_code: '3113.0200',
    nco_family: 'Electrical Engineering Technicians',
    keywords: ['can bus', 'automotive electronics', 'auto technician', 'vehicle diagnostics', 'auto electrical']
  },
  {
    occupation_id: 'b3333333-3333-4333-8333-333333333333',
    title: 'Frontend Software Developer',
    nco_code: '2512.0100',
    nco_family: 'Software Developers',
    keywords: ['frontend', 'react', 'typescript', 'web developer', 'ui developer', 'full stack', 'javascript']
  },
  {
    occupation_id: 'b4444444-4444-4444-8444-444444444444',
    title: 'Cloud Infrastructure Engineer',
    nco_code: '2522.0100',
    nco_family: 'System Administrators',
    keywords: ['cloud', 'aws', 'azure', 'devops', 'infrastructure', 'systems architect']
  },
  {
    occupation_id: 'b5555555-5555-4555-8555-555555555555',
    title: 'AI & Machine Learning Engineer',
    nco_code: '2511.0200',
    nco_family: 'Systems Analysts',
    keywords: ['genai', 'llm', 'rag pipeline', 'machine learning', 'ai engineer', 'data scientist']
  }
];

/**
 * Normalizes raw job posting title into canonical occupation and NCO-2015 classification.
 */
export function normalizeOccupationTitle(rawTitle: string): NormalizedOccupationResult {
  if (!rawTitle || !rawTitle.trim()) {
    return {
      raw_title: rawTitle || '',
      title: 'Unmapped Job Title',
      confidence: 0,
      mapping_status: 'UNMAPPED_PENDING_REVIEW'
    };
  }

  const titleLower = rawTitle.toLowerCase().trim();

  // Search keyword rules
  for (const rule of OCCUPATION_RULES) {
    for (const kw of rule.keywords) {
      if (titleLower.includes(kw)) {
        const isExact = rule.title.toLowerCase() === titleLower;
        return {
          raw_title: rawTitle,
          occupation_id: rule.occupation_id,
          title: rule.title,
          nco_code: rule.nco_code,
          nco_family: rule.nco_family,
          confidence: isExact ? 98 : 90,
          mapping_status: 'MAPPED'
        };
      }
    }
  }

  // Fallback: Return unmapped pending review without inventing NCO codes
  return {
    raw_title: rawTitle,
    title: rawTitle,
    confidence: 45,
    mapping_status: 'UNMAPPED_PENDING_REVIEW'
  };
}
