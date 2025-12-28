import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DrugInfo, DiagnosisResult, Language } from '../types';
import { parseJsonResponse } from '../utils/apiUtils';

// Get API key - don't throw at initialization, check when needed
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Lazy initialization - only create client when API key exists
let genAI: GoogleGenerativeAI | null = null;
let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

function getModel() {
    if (!apiKey || apiKey.trim() === '') {
        throw new Error(
            'API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.'
        );
    }

    if (!genAI) {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    return model!;
}

// Helper to get language instruction
const getLangInstruction = (lang: Language): string => {
    return lang === 'te'
        ? 'Respond in Telugu language (తెలుగు). Use Telugu script for all text.'
        : 'Respond in English.';
};

// Digestive Health Module - Symptom Check
export async function checkDigestiveSymptoms(
    symptoms: string[],
    lang: Language
): Promise<string> {
    const prompt = `
${getLangInstruction(lang)}

You are a medical AI assistant specializing in digestive health. A user has reported the following symptoms:

Symptoms: ${symptoms.join(', ')}

Analyze these symptoms in relation to common digestive conditions (such as gastritis, IBS, GERD, pancreatitis, liver issues, gallbladder problems, etc.). Provide:
1. Possible digestive conditions these symptoms may indicate
2. Severity assessment (Mild/Moderate/Severe)
3. Explanation of how these symptoms relate to digestive health
4. Recommended next steps (must include seeing a doctor for proper diagnosis)
5. Warning signs that require immediate medical attention

Be empathetic but clear. Always recommend professional medical consultation. Do NOT diagnose - only provide educational information.
Format the response in a clear, easy-to-read manner.
`;

    const result = await getModel().generateContent(prompt);
    return result.response.text();
}

// Legacy alias for backward compatibility
export const checkPancreatitisSymptoms = checkDigestiveSymptoms;

// Digestive Health Module - AI Chat
export async function chatAboutDigestiveHealth(
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

You are a helpful medical AI assistant specializing in digestive health. You provide educational information about:
- Common digestive conditions (IBS, GERD, gastritis, ulcers, pancreatitis, liver health, gallbladder issues)
- Causes and risk factors for digestive problems
- Symptoms and when to be concerned
- General treatment approaches
- Lifestyle modifications for better digestive health
- Diet and nutrition recommendations
- When to seek medical help

Previous conversation:
${historyText}

User's new message: ${message}

Provide a helpful, accurate, and empathetic response. Do NOT diagnose conditions. Always remind users to consult healthcare professionals for actual medical decisions.
Keep responses concise but informative.
`;

    const result = await getModel().generateContent(prompt);
    return result.response.text();
}

// Legacy alias for backward compatibility
export const chatAboutPancreatitis = chatAboutDigestiveHealth;

// Digestive Health Module - Healthy Food Tips (Generic)
export async function getDigestiveHealthDiet(lang: Language): Promise<string> {
    const prompt = `
${getLangInstruction(lang)}

Provide comprehensive dietary guidelines for better digestive health:

1. FOODS THAT SUPPORT DIGESTION (at least 8 items with explanations)
   - Include fiber-rich foods, probiotics, easy-to-digest options

2. FOODS TO LIMIT OR AVOID (at least 8 items with explanations)
   - Include triggers for common digestive issues

3. FOODS IN MODERATION (at least 5 items)
   - Foods that are okay occasionally but not daily

4. MEAL PLANNING TIPS (5-7 tips)
   - Practical advice for digestive comfort

5. HYDRATION GUIDELINES
   - How much water, when to drink, what to avoid

6. EATING HABITS FOR BETTER DIGESTION
   - Meal timing, portion sizes, eating speed

Format with clear headers and bullet points. Be specific about why each food is recommended or should be avoided.
`;

    const result = await getModel().generateContent(prompt);
    return result.response.text();
}

// Digestive Health Module - Personalized Diet Tips
export interface ProfileData {
    age?: number;
    gender?: string;
    weight?: number;
    height?: number;
    conditions?: string[];
    medications?: string[];
    allergies?: string[];
    isSmoker?: boolean;
    drinksAlcohol?: boolean;
    activityLevel?: string;
    weightGoal?: 'lose' | 'maintain' | 'gain';
    targetWeight?: number;
    timeframe?: string;
    mealsPerDay?: number;
    dietaryRestrictions?: string[];
    foodPreferences?: string[];
}

export async function getPersonalizedDiet(profile: ProfileData, lang: Language): Promise<string> {
    // Calculate BMI if weight and height provided
    let bmiInfo = '';
    if (profile.weight && profile.height) {
        const heightM = profile.height / 100;
        const bmi = profile.weight / (heightM * heightM);
        let bmiCategory = '';
        if (bmi < 18.5) bmiCategory = 'underweight';
        else if (bmi < 25) bmiCategory = 'normal weight';
        else if (bmi < 30) bmiCategory = 'overweight';
        else bmiCategory = 'obese';
        bmiInfo = `BMI: ${bmi.toFixed(1)} (${bmiCategory})`;
    }

    const goalText = profile.weightGoal === 'lose'
        ? `Goal: Lose weight${profile.targetWeight ? ` to ${profile.targetWeight}kg` : ''}${profile.timeframe ? ` in ${profile.timeframe.replace('_', ' ')}` : ''}`
        : profile.weightGoal === 'gain'
            ? `Goal: Gain weight${profile.targetWeight ? ` to ${profile.targetWeight}kg` : ''}`
            : 'Goal: Maintain current weight';

    const profileInfo = [
        profile.age ? `Age: ${profile.age} years` : '',
        profile.gender ? `Gender: ${profile.gender}` : '',
        profile.weight ? `Current Weight: ${profile.weight} kg` : '',
        profile.height ? `Height: ${profile.height} cm` : '',
        bmiInfo,
        goalText,
        profile.conditions?.length ? `Health conditions: ${profile.conditions.join(', ')}` : '',
        profile.medications?.length ? `Current medications: ${profile.medications.join(', ')}` : '',
        profile.allergies?.length ? `Allergies: ${profile.allergies.join(', ')}` : '',
        profile.isSmoker ? 'Lifestyle: Smoker' : '',
        profile.drinksAlcohol ? 'Lifestyle: Drinks alcohol' : '',
        profile.activityLevel ? `Activity level: ${profile.activityLevel.replace('_', ' ')}` : '',
        profile.mealsPerDay ? `Prefers ${profile.mealsPerDay} meals per day` : '',
        profile.dietaryRestrictions?.length ? `Dietary restrictions: ${profile.dietaryRestrictions.join(', ')}` : '',
        profile.foodPreferences?.length ? `Food preferences: ${profile.foodPreferences.join(', ')}` : ''
    ].filter(Boolean).join('\n');

    const prompt = `
${getLangInstruction(lang)}

You are an expert nutrition AI. Create a HIGHLY PERSONALIZED dietary plan based on this user's complete profile:

USER PROFILE:
${profileInfo || 'No specific profile provided - give general recommendations'}

Based on this profile, provide a comprehensive personalized diet plan:

1. FOODS THAT SUPPORT DIGESTION (8+ items)
   - MUST respect dietary restrictions (${profile.dietaryRestrictions?.join(', ') || 'none specified'})
   - Include foods from their preferred cuisines (${profile.foodPreferences?.join(', ') || 'varied'})
   - Choose foods that help with their specific conditions
   - Use **bold** for food names

2. FOODS TO LIMIT OR AVOID (8+ items)
   - MUST include allergy triggers if any
   - Include foods that conflict with their medications
   - Consider their conditions when recommending limits
   - Use **bold** for food names

3. FOODS IN MODERATION (5+ items)
   - Based on their weight goal: ${profile.weightGoal || 'maintain'}
   - Use **bold** for food names

4. PERSONALIZED MEAL PLANNING TIPS (5-7 tips)
   - For ${profile.mealsPerDay || 3} meals per day
   - ${profile.weightGoal === 'lose' ? 'Include calorie deficit strategies' : profile.weightGoal === 'gain' ? 'Include calorie surplus strategies' : 'Focus on balanced nutrition'}
   - Consider their activity level: ${profile.activityLevel || 'moderate'}

5. HYDRATION GUIDELINES
   - Calculate water needs based on weight (${profile.weight || 70}kg)
   - Adjust for activity level and lifestyle factors

6. EATING HABITS FOR BETTER DIGESTION
   - Meal timing for ${profile.mealsPerDay || 3} meals
   - Portion guidance

Be specific and practical. Include meal ideas from their preferred cuisines.
Format with clear headers and bullet points.
`;

    const result = await getModel().generateContent(prompt);
    return result.response.text();
}

// Legacy alias for backward compatibility
export const getPancreatitisDiet = getDigestiveHealthDiet;

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

    const result = await getModel().generateContent(prompt);
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

    const result = await getModel().generateContent(prompt);
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

    const result = await getModel().generateContent(prompt);
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

    const result = await getModel().generateContent(prompt);
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

    const result = await getModel().generateContent(prompt);
    return result.response.text();
}
