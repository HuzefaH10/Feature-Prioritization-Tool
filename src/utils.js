export const SAMPLE_DATA = [
  { id: '1', name: "Onboarding Tutorial", reach: 800, impact: 2, confidence: 90, effort: 2, category: "UX", description: "Interactive step-by-step guide for new users" },
  { id: '2', name: "Bulk CSV Export", reach: 400, impact: 1, confidence: 85, effort: 1, category: "Revenue", description: "Allow users to export all data as CSV" },
  { id: '3', name: "AI Smart Suggestions", reach: 600, impact: 3, confidence: 50, effort: 8, category: "UX", description: "ML-powered feature recommendations" },
  { id: '4', name: "Performance Dashboard", reach: 300, impact: 2, confidence: 80, effort: 3, category: "Performance", description: "Real-time system performance metrics" },
  { id: '5', name: "Mobile Push Notifications", reach: 1000, impact: 1, confidence: 70, effort: 2, category: "Retention", description: "Push alerts for key user actions" },
  { id: '6', name: "SSO Integration", reach: 200, impact: 1, confidence: 95, effort: 4, category: "Infrastructure", description: "Single sign-on for enterprise customers" }
];

export const CATEGORIES = ['UX', 'Performance', 'Revenue', 'Retention', 'Infrastructure', 'Other'];

export const calculateRiceScore = (reach, impact, confidence, effort) => {
  if (!reach || !impact || !confidence || !effort || effort <= 0) return null;
  return Math.round((reach * impact * (confidence / 100)) / effort);
};

export const getScoreColorClass = (score) => {
  if (score === null) return 'score-none';
  if (score > 100) return 'score-high';
  if (score >= 50) return 'score-med';
  return 'score-low';
};

export const getPriorityBadgeInfo = (score) => {
  if (score === null) return { text: 'N/A', class: 'badge-deprioritize' };
  if (score > 150) return { text: 'Must Build', class: 'badge-must' };
  if (score >= 75) return { text: 'Should Build', class: 'badge-should' };
  if (score >= 25) return { text: 'Nice to Have', class: 'badge-nice' };
  return { text: 'Deprioritize', class: 'badge-deprioritize' };
};

export const getCategoryColor = (cat) => {
  const c = cat ? cat.toLowerCase() : 'other';
  switch (c) {
    case 'ux': return 'var(--cat-UX)';
    case 'performance': return 'var(--cat-Performance)';
    case 'revenue': return 'var(--cat-Revenue)';
    case 'retention': return 'var(--cat-Retention)';
    case 'infrastructure': return 'var(--cat-Infrastructure)';
    default: return 'var(--cat-Other)';
  }
};
