interface ValidationResult {
  isValid: boolean;
  validityScore: number; 
  pointsDeduction: number; 
  reasoning: string;
}
const VALIDATION_KEYWORDS = {
  poor_quality: {
    positive: [
      'damaged', 'broken', 'crack', 'defect', 'missing parts', 'incomplete', 
      'rust', 'corrosion', 'stain', 'contaminated', 'not as described', 
      'poor condition', 'defective', 'unusable', 'deteriorated', 'worn',
      'bent', 'dented', 'distorted', 'warped'
    ],
    negative: ['beautiful', 'perfect', 'excellent', 'new', 'pristine', 'like new'],
    pointsDeduction: 0.5
  },
  late_pickup: {
    positive: [
      'late', 'delay', 'missed', 'scheduled', 'time', 'deadline', 'hours',
      'days overdue', 'didn\'t arrive', 'no show', 'failed to pickup',
      'postpone', 'cancel without notice', 'reschedule'
    ],
    negative: ['early', 'before time', 'on time', 'punctual'],
    pointsDeduction: 0.3
  },
  damaged_materials: {
    positive: [
      'damage', 'destroy', 'break', 'crack', 'leak', 'spill', 'contaminate',
      'deform', 'crush', 'dented', 'scratched', 'broken', 'shattered',
      'torn', 'ripped', 'punctured', 'damaged during delivery'
    ],
    negative: ['careful', 'handle well', 'professional', 'intact', 'unharmed'],
    pointsDeduction: 0.4
  },
  incomplete_delivery: {
    positive: [
      'missing', 'incomplete', 'not all', 'only got', 'received less',
      'short', 'shortage', 'partial', 'not delivered', 'leftover', 'remaining',
      'promised more', 'promised items'
    ],
    negative: ['complete', 'all', 'entire', 'whole', 'full amount'],
    pointsDeduction: 0.35
  },
  bad_behavior: {
    positive: [
      'rude', 'disrespectful', 'aggressive', 'unprofessional', 'insult', 
      'threat', 'abusive', 'harassment', 'vulgar', 'mean', 'discriminate',
      'unethical', 'immoral', 'dishonest', 'fraud', 'scam'
    ],
    negative: ['polite', 'respectful', 'professional', 'kind', 'helpful'],
    pointsDeduction: 0.45
  }
};

export const validateReportReason = (
  reason: string,
  description: string,
  wasteType?: string
): ValidationResult => {
  const lowerDesc = description.toLowerCase();
  const lowerReason = reason.toLowerCase();

  if (!description || description.length < 10) {
    return {
      isValid: false,
      validityScore: 0.1,
      pointsDeduction: 0,
      reasoning: 'Description too vague or too short'
    };
  }

  if (wasteType && lowerDesc.includes(wasteType.toLowerCase())) {
    const circularPattern = new RegExp(`${wasteType}\\s+(is\\s+)?${wasteType}`, 'gi');
    if (circularPattern.test(description)) {
      return {
        isValid: false,
        validityScore: 0.05,
        pointsDeduction: 0,
        reasoning: 'Report repeats waste type without actual issue'
      };
    }
  }

  const validation = VALIDATION_KEYWORDS[reason as keyof typeof VALIDATION_KEYWORDS];
  
  if (!validation) {
    return {
      isValid: true,
      validityScore: 0.6,
      pointsDeduction: 0.3,
      reasoning: 'Report type recognized but needs manual verification'
    };
  }

  let positiveCount = 0;
  let negativeCount = 0;

  validation.positive.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerDesc.match(regex);
    positiveCount += matches ? matches.length : 0;
  });

  validation.negative.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerDesc.match(regex);
    negativeCount += matches ? matches.length : 0;
  });

  let validityScore = 0;
  let isValid = false;
  let reasoning = '';

  if (positiveCount > 0 && negativeCount === 0) {
    validityScore = Math.min(0.95, 0.5 + (positiveCount * 0.1));
    isValid = true;
    reasoning = `Strong evidence found (${positiveCount} indicators)`;
  } else if (positiveCount > 0 && negativeCount > 0) {
    validityScore = 0.3;
    isValid = false;
    reasoning = `Conflicting indicators: ${positiveCount} positive vs ${negativeCount} negative`;
  } else if (positiveCount === 0 && negativeCount > 0) {
    validityScore = 0.1;
    isValid = false;
    reasoning = 'Description contradicts the reported issue';
  } else {
    if (description.length > 50 && description.includes(' ')) {
      validityScore = 0.5;
      isValid = true;
      reasoning = 'Generic report - requires manual review';
    } else {
      validityScore = 0.2;
      isValid = false;
      reasoning = 'Insufficient detail provided';
    }
  }

  const finalValidity = validityScore >= 0.4;

  return {
    isValid: finalValidity,
    validityScore: validityScore,
    pointsDeduction: finalValidity ? validation.pointsDeduction : 0,
    reasoning
  };
};
export const shouldAutoApprove = (
  reason: string,
  validityScore: number,
  pointsDeduction: number
): boolean => {
  if (reason === 'bad_behavior') {
    return false;
  }

  return validityScore >= 0.8 && pointsDeduction > 0.2;
};
export const getPointDeduction = (
  reason: string,
  validityScore: number,
  basePoints: number
): number => {
  if (validityScore < 0.4) {
    return 0; 
  }
  
  return basePoints * (validityScore / 1.0); 
};
