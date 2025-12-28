// Types for AI Health Hub

// Language support
export type Language = 'en' | 'te';

export interface LanguageStrings {
  [key: string]: {
    en: string;
    te: string;
  };
}

// Common types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Module types
export type ModuleType = 'home' | 'pancreatitis' | 'moleculearn' | 'healthpro';

// Pancreatitis Module
export interface DietItem {
  name: string;
  nameTE: string;
  category: 'recommended' | 'avoid' | 'moderate';
  description: string;
  descriptionTE: string;
  icon: string;
}

// MolecuLearn Module
export interface DrugInfo {
  name: string;
  genericName: string;
  category: string;
  uses: string[];
  sideEffects: string[];
  safetyScore: number;
  alternatives: DrugAlternative[];
  naturalAlternatives: NaturalAlternative[];
  warnings: string[];
  interactions: string[];
}

export interface DrugAlternative {
  name: string;
  genericName: string;
  effectiveness: number;
  safetyScore: number;
  reason: string;
}

export interface NaturalAlternative {
  name: string;
  description: string;
  effectiveness: string;
  evidence: string;
  precautions: string[];
}

// Health Pro Module
export interface Symptom {
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  bodyLocation: string;
  additionalNotes?: string;
}

export interface HealthProfile {
  id: string;
  age: number;
  gender: string;
  conditions: string[];
  medications: string[];
  allergies: string[];
  lastUpdated: Date;
}

export interface DiagnosisResult {
  condition: string;
  confidence: number;
  description: string;
  possibleCauses: string[];
  recommendedActions: string[];
  warningsSigns: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
}

export interface Consultation {
  id: string;
  symptoms: Symptom;
  results: DiagnosisResult[];
  timestamp: Date;
  secondOpinion?: SecondOpinion;
}

export interface SecondOpinion {
  originalDiagnosis: string;
  aiAnalysis: string;
  alternativeConditions: string[];
  recommendations: string[];
  agreementLevel: 'agrees' | 'partially-agrees' | 'disagrees';
}

// API Response types
export interface GeminiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}
