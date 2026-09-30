import { Resource, User } from '../types';

export interface MatchResult {
  resource: Resource;
  score: number;
  reasons: string[];
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 
  'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 
  'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 
  'with', 'need', 'needs', 'needed', 'looking', 'someone', 'help', 'can', 
  'i', 'my', 'you', 'your', 'have', 'offer', 'offering', 'want', 'wanted'
]);

function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

export function calculateTextSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  let overlap = 0;
  for (const token of set2) {
    if (set1.has(token)) overlap++;
  }
  
  const minLen = Math.min(set1.size, set2.size);
  if (minLen === 0) return 0;
  return overlap / minLen;
}

export function calculateMatchScore(source: Resource, target: Resource): { score: number, reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Same category
  if (source.category && target.category && source.category.toLowerCase() === target.category.toLowerCase()) {
    score += 30;
    reasons.push('Same category');
  }

  // Exact type match (ignore legacy 'request' type)
  if (source.type === target.type && source.intent !== 'NEED') {
    score += 10;
  }

  // 2. Title similarity
  const titleSimilarity = calculateTextSimilarity(source.title, target.title);
  if (titleSimilarity > 0) {
    score += titleSimilarity * 40;
    if (titleSimilarity > 0.4) {
      reasons.push('Matches what you need');
    }
  }

  // 3. Description similarity
  const descSimilarity = calculateTextSimilarity(source.description, target.description);
  if (descSimilarity > 0) {
    score += descSimilarity * 20;
  }

  // 4. Location compatibility
  if (source.location && target.location) {
    const locSim = calculateTextSimilarity(source.location, target.location);
    if (locSim > 0.5) {
      score += 15;
      reasons.push('Near your preferred area');
    }
  }

  // 5. Availability
  if (source.availability && target.availability) {
    const availSim = calculateTextSimilarity(source.availability, target.availability);
    if (availSim > 0.3) {
      score += 10;
      reasons.push('Timing aligns');
    }
  } else if (target.availability && target.availability.toLowerCase().includes('now')) {
    score += 5;
    reasons.push('Available now');
  }

  // 6. Trust
  if (target.provider.isVerified) {
    score += 5;
    if (reasons.length < 3) {
      reasons.push('Verified student');
    }
  }
  
  if (target.provider.rating && target.provider.rating > 4.5) {
    score += 5;
  }

  // Deduplicate reasons and keep concise
  return { score, reasons: Array.from(new Set(reasons)).slice(0, 3) };
}

export function getMatchesForResource(
  resource: Resource,
  allResources: Resource[]
): MatchResult[] {
  // If the resource is inactive, return nothing
  if (resource.status !== 'available' && resource.status !== 'active') {
    return [];
  }

  const isRequest = resource.intent === 'NEED';

  return allResources
    .filter(target => {
      // Must be active
      if (target.status !== 'available' && target.status !== 'active') return false;
      
      // A resource cannot match with another resource from the same provider
      if (target.provider.id === resource.provider.id) return false;

      // Also ensure we are not returning the same resource we are comparing
      if (target.id === resource.id) return false;
      
      const targetIsRequest = target.intent === 'NEED';
      
      // Request matches Offer, Offer matches Request
      return isRequest !== targetIsRequest;
    })
    .map(target => {
      const { score, reasons } = calculateMatchScore(resource, target);
      return { resource: target, score, reasons };
    })
    .filter(match => match.score > 25) // Threshold for a "meaningful" match
    .sort((a, b) => b.score - a.score);
}
