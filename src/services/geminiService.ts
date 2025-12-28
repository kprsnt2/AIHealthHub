import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DrugInfo, DiagnosisResult, Language } from '../types';
import { validateApiKey, parseJsonResponse } from '../utils/apiUtils';

// Validate API key at initialization
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
validateApiKey(apiKey);

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Helper to get language instruction
const getLangInstruction = (lang: Language): string => {
    return lang === 'te'
        ? 'Respond in Telugu language (తెలుగు). Use Telugu script for all text.'
        : 'Respond in English.';
};

// Pancreatitis Module - Disease Check
export async function checkPancreatitisSymptoms(
    symptoms: string[],
    lang: Language
): Promise<string> {
    const prompt = `
${getLangInstruction(lang)}

You are a medical AI assistant specializing in chronic pancreatitis. A user has reported the following symptoms:

Symptoms: ${symptoms.join(', ')}

Analyze these symptoms in relation to chronic pancreatitis. Provide:
1. Likelihood of pancreatitis (Low/Medium/High)
2. Explanation of how these symptoms relate to pancreatitis
3. Recommended next steps (must include seeing a doctor)
4. Warning signs to watch for

Be empathetic but clear. Always recommend professional medical consultation.
Format the response in a clear, easy-to-read manner.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

// Pancreatitis Module - AI Chat
export async function chatAboutPancreatitis(
    message: string,
    chatHistory: { role: string; content: string }[],
    lang: Language
): Promise<string> {
    const historyText = chatHistory
        .slice(-6)
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

    const prompt = `
${getLangInstruction(lang)}

You are a helpful medical AI assistant specializing in chronic pancreatitis. You provide educational information about:
- What is chronic pancreatitis
- Causes and risk factors
- Symptoms and complications
- Treatment options
- Lifestyle modifications
- Diet recommendations
- When to seek medical help

Previous conversation:
${historyText}

User's new message: ${message}

Provide a helpful, accurate, and empathetic response. Always remind users to consult healthcare professionals for actual medical decisions.
Keep responses concise but informative.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

// Pancreatitis Module - Healthy Food Tips
export async function getPancreatitisDiet(lang: Language): Promise<string> {
    const prompt = `
${getLangInstruction(lang)}

Provide comprehensive dietary guidelines for someone with chronic pancreatitis:

1. FOODS TO EAT (at least 8 items with explanations)
2. FOODS TO AVOID (at least 8 items with explanations)
3. FOODS IN MODERATION (at least 5 items)
4. MEAL PLANNING TIPS (5 tips)
5. HYDRATION GUIDELINES

Format with clear headers and bullet points. Be specific about why each food is recommended or should be avoided.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

// MolecuLearn Module - Drug Analysis
export async function analyzeDrug(
    drugName: string,
    lang: Language
): Promise<DrugInfo> {
    const prompt = `
${getLangInstruction(lang)}

Analyze the drug "${drugName}" and provide detailed information in the following JSON format:

{
  "name": "Brand name",
  "genericName": "Generic/chemical name",
  "category": "Drug category/class",
  "uses": ["Use 1", "Use 2", "Use 3"],
  "sideEffects": ["Side effect 1", "Side effect 2", "Side effect 3", "Side effect 4", "Side effect 5"],
  "safetyScore": 75,
  "alternatives": [
    {
      "name": "Alternative drug name",
      "genericName": "Generic name",
      "effectiveness": 80,
      "safetyScore": 85,
      "reason": "Why this is a good alternative"
    }
  ],
  "naturalAlternatives": [
    {
      "name": "Natural remedy name",
      "description": "Brief description",
      "effectiveness": "High/Medium/Low",
      "evidence": "Scientific evidence level",
      "precautions": ["Precaution 1"]
    }
  ],
  "warnings": ["Important warning 1", "Warning 2"],
  "interactions": ["Drug interaction 1", "Interaction 2"]
}

Safety score should be 0-100 where 100 is safest.
Provide at least 2-3 pharmaceutical alternatives and 2-3 natural alternatives.
Be accurate and evidence-based.
Return ONLY valid JSON, no markdown formatting.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response using utility
    const parsed = parseJsonResponse<DrugInfo>(text, false);

    if (parsed) {
        return parsed;
    }

    // Return default structure if parsing fails
    return {
        name: drugName,
        genericName: 'Unknown',
        category: 'Unknown',
        uses: ['Information not available'],
        sideEffects: ['Consult your doctor'],
        safetyScore: 50,
        alternatives: [],
        naturalAlternatives: [],
        warnings: ['Always consult a healthcare professional'],
        interactions: []
    };
}

// Health Pro Module - Symptom Analysis
export async function analyzeSymptoms(
    symptoms: string,
    severity: string,
    duration: string,
    bodyLocation: string,
    healthProfile: { conditions: string[]; medications: string[]; allergies: string[] } | null,
    lang: Language
): Promise<DiagnosisResult[]> {
    const profileInfo = healthProfile
        ? `
Patient Profile:
- Existing conditions: ${healthProfile.conditions.join(', ') || 'None'}
- Current medications: ${healthProfile.medications.join(', ') || 'None'}
- Allergies: ${healthProfile.allergies.join(', ') || 'None'}
`
        : '';

    const prompt = `
${getLangInstruction(lang)}

You are an AI medical assistant providing symptom analysis. Analyze the following:

Symptoms: ${symptoms}
Severity: ${severity}
Duration: ${duration}
Body Location: ${bodyLocation}
${profileInfo}

Provide analysis in this JSON format (array of 2-4 possible conditions):

[
  {
    "condition": "Condition name",
    "confidence": 75,
    "description": "Brief description of the condition",
    "possibleCauses": ["Cause 1", "Cause 2"],
    "recommendedActions": ["Action 1", "Action 2", "See a doctor"],
    "warningsSigns": ["Warning sign 1", "Warning sign 2"],
    "urgency": "low"
  }
]

Urgency levels: "low", "medium", "high", "emergency"
Confidence: 0-100 percentage
Always include "Consult a healthcare professional" in recommended actions.
Return ONLY valid JSON array, no markdown.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response using utility
    const parsed = parseJsonResponse<DiagnosisResult[]>(text, true);

    if (parsed) {
        return parsed;
    }

    return [{
        condition: 'Unable to analyze',
        confidence: 0,
        description: 'Please try again or consult a healthcare professional',
        possibleCauses: [],
        recommendedActions: ['Consult a healthcare professional'],
        warningsSigns: [],
        urgency: 'medium'
    }];
}

// Health Pro Module - Second Opinion
export async function getSecondOpinion(
    diagnosis: string,
    symptoms: string,
    lang: Language
): Promise<string> {
    const prompt = `
${getLangInstruction(lang)}

You are an AI medical consultant providing a second opinion. 

Original Diagnosis: ${diagnosis}
Patient's Symptoms: ${symptoms}

Provide a thorough second opinion analysis:

1. AGREEMENT ASSESSMENT
   - Do you agree with this diagnosis? (Fully agree / Partially agree / Consider alternatives)
   - Explain your reasoning

2. ALTERNATIVE CONSIDERATIONS
   - List 2-3 other conditions that could cause similar symptoms
   - Explain why each should be considered

3. RECOMMENDED TESTS
   - What tests would help confirm or rule out conditions?

4. QUESTIONS TO ASK DOCTOR
   - What questions should the patient ask their doctor?

5. IMPORTANT NOTES
   - Any concerns or important observations

Always emphasize that this is for informational purposes and real medical decisions should be made with healthcare professionals.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

// Health Pro Module - Diet Plan
export async function generateDietPlan(
    healthProfile: { age: number; gender: string; conditions: string[]; allergies: string[] },
    goal: string,
    lang: Language
): Promise<string> {
    const prompt = `
${getLangInstruction(lang)}

Create a personalized diet plan based on:

Age: ${healthProfile.age}
Gender: ${healthProfile.gender}
Health Conditions: ${healthProfile.conditions.join(', ') || 'None'}
Allergies: ${healthProfile.allergies.join(', ') || 'None'}
Goal: ${goal || 'General health maintenance'}

Provide:

1. DAILY CALORIE TARGET
   - Recommended range based on profile

2. MACRONUTRIENT BREAKDOWN
   - Proteins, Carbs, Fats percentages

3. SAMPLE MEAL PLAN (One day)
   - Breakfast (with options)
   - Mid-morning snack
   - Lunch (with options)
   - Afternoon snack
   - Dinner (with options)

4. FOODS TO PRIORITIZE
   - List with benefits

5. FOODS TO LIMIT/AVOID
   - Based on conditions and allergies

6. HYDRATION GUIDELINES

7. SUPPLEMENT RECOMMENDATIONS
   - If applicable based on conditions

8. TIPS FOR SUCCESS
   - 5 practical tips

Format clearly with headers and bullet points.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

// General Health Chat
export async function healthChat(
    message: string,
    context: string,
    lang: Language
): Promise<string> {
    const prompt = `
${getLangInstruction(lang)}

You are a helpful AI health assistant. Context: ${context}

User message: ${message}

Provide helpful, accurate health information. Always recommend consulting healthcare professionals for medical decisions.
Keep response concise and easy to understand.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}
