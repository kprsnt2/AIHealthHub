import type { Language } from '../types';

// Translations for the entire app
export const translations: Record<string, Record<Language, string>> = {
    // App-wide
    appName: {
        en: 'AI Health Hub',
        te: 'AI ఆరోగ్య కేంద్రం'
    },
    appTagline: {
        en: 'Your Complete AI-Powered Health Companion',
        te: 'మీ సంపూర్ణ AI-ఆధారిత ఆరోగ్య సహచరుడు'
    },

    // Navigation
    home: {
        en: 'Home',
        te: 'హోమ్'
    },
    pancreatitis: {
        en: 'Pancreatitis Care',
        te: 'పాంక్రియాటైటిస్ సంరక్షణ'
    },
    moleculearn: {
        en: 'Drug Safety',
        te: 'మందుల భద్రత'
    },
    healthpro: {
        en: 'Health Pro',
        te: 'హెల్త్ ప్రో'
    },

    // Common actions
    send: {
        en: 'Send',
        te: 'పంపు'
    },
    search: {
        en: 'Search',
        te: 'వెతుకు'
    },
    submit: {
        en: 'Submit',
        te: 'సమర్పించు'
    },
    cancel: {
        en: 'Cancel',
        te: 'రద్దు'
    },
    save: {
        en: 'Save',
        te: 'సేవ్'
    },
    loading: {
        en: 'Loading...',
        te: 'లోడ్ అవుతోంది...'
    },
    analyze: {
        en: 'Analyze',
        te: 'విశ్లేషించు'
    },

    // Home page
    exploreModules: {
        en: 'Explore Our Health Modules',
        te: 'మా ఆరోగ్య మాడ్యూల్స్ అన్వేషించండి'
    },

    // Pancreatitis Module
    pancreatitisTitle: {
        en: 'Chronic Pancreatitis Care',
        te: 'దీర్ఘకాలిక పాంక్రియాటైటిస్ సంరక్షణ'
    },
    pancreatitisDesc: {
        en: 'Learn about chronic pancreatitis, check symptoms, chat with AI, and get healthy diet tips',
        te: 'దీర్ఘకాలిక పాంక్రియాటైటిస్ గురించి తెలుసుకోండి, లక్షణాలను తనిఖీ చేయండి, AI తో చాట్ చేయండి మరియు ఆరోగ్యకరమైన ఆహార చిట్కాలు పొందండి'
    },
    diseaseCheck: {
        en: 'Disease Check',
        te: 'వ్యాధి తనిఖీ'
    },
    chatWithAI: {
        en: 'Chat with AI',
        te: 'AI తో చాట్'
    },
    healthyFood: {
        en: 'Healthy Food Tips',
        te: 'ఆరోగ్యకరమైన ఆహార చిట్కాలు'
    },
    askAboutPancreatitis: {
        en: 'Ask anything about chronic pancreatitis...',
        te: 'దీర్ఘకాలిక పాంక్రియాటైటిస్ గురించి ఏదైనా అడగండి...'
    },
    symptomsCheck: {
        en: 'Check Your Symptoms',
        te: 'మీ లక్షణాలను తనిఖీ చేయండి'
    },
    symptomsDesc: {
        en: 'Select symptoms you are experiencing',
        te: 'మీరు అనుభవిస్తున్న లక్షణాలను ఎంచుకోండి'
    },

    // MolecuLearn Module
    moleculearnTitle: {
        en: 'MolecuLearn - Drug Safety',
        te: 'MolecuLearn - మందుల భద్రత'
    },
    moleculearnDesc: {
        en: 'Analyze drug safety, find alternatives, discover natural remedies',
        te: 'మందుల భద్రతను విశ్లేషించండి, ప్రత్యామ్నాయాలను కనుగొనండి, సహజ నివారణలను కనుగొనండి'
    },
    searchDrug: {
        en: 'Search for a drug...',
        te: 'మందు కోసం వెతకండి...'
    },
    drugInfo: {
        en: 'Drug Information',
        te: 'మందు సమాచారం'
    },
    alternatives: {
        en: 'Alternatives',
        te: 'ప్రత్యామ్నాయాలు'
    },
    naturalRemedies: {
        en: 'Natural Remedies',
        te: 'సహజ నివారణలు'
    },
    safetyScore: {
        en: 'Safety Score',
        te: 'భద్రత స్కోరు'
    },
    sideEffects: {
        en: 'Side Effects',
        te: 'దుష్ప్రభావాలు'
    },
    uses: {
        en: 'Uses',
        te: 'ఉపయోగాలు'
    },
    warnings: {
        en: 'Warnings',
        te: 'హెచ్చరికలు'
    },

    // Health Pro Module
    healthproTitle: {
        en: 'AI Health Pro',
        te: 'AI హెల్త్ ప్రో'
    },
    healthproDesc: {
        en: 'AI-powered symptom analysis, second opinion, health profile & diet planning',
        te: 'AI-ఆధారిత లక్షణ విశ్లేషణ, రెండవ అభిప్రాయం, ఆరోగ్య ప్రొఫైల్ & ఆహార ప్రణాళిక'
    },
    symptomAnalysis: {
        en: 'Symptom Analysis',
        te: 'లక్షణ విశ్లేషణ'
    },
    secondOpinion: {
        en: 'Second Opinion',
        te: 'రెండవ అభిప్రాయం'
    },
    healthProfile: {
        en: 'Health Profile',
        te: 'ఆరోగ్య ప్రొఫైల్'
    },
    dietPlan: {
        en: 'Diet Plan',
        te: 'ఆహార ప్రణాళిక'
    },
    describeSymptoms: {
        en: 'Describe your symptoms in detail...',
        te: 'మీ లక్షణాలను వివరంగా వివరించండి...'
    },
    existingDiagnosis: {
        en: 'Enter your existing diagnosis...',
        te: 'మీ ఇప్పటికే ఉన్న రోగ నిర్ధారణను నమోదు చేయండి...'
    },
    severity: {
        en: 'Severity',
        te: 'తీవ్రత'
    },
    mild: {
        en: 'Mild',
        te: 'తేలికపాటి'
    },
    moderate: {
        en: 'Moderate',
        te: 'మధ్యస్థం'
    },
    severe: {
        en: 'Severe',
        te: 'తీవ్రమైన'
    },
    duration: {
        en: 'Duration',
        te: 'వ్యవధి'
    },
    bodyLocation: {
        en: 'Body Location',
        te: 'శరీర స్థానం'
    },

    // Risk levels
    lowRisk: {
        en: 'Low Risk',
        te: 'తక్కువ ప్రమాదం'
    },
    mediumRisk: {
        en: 'Medium Risk',
        te: 'మధ్యస్థ ప్రమాదం'
    },
    highRisk: {
        en: 'High Risk',
        te: 'అధిక ప్రమాదం'
    },
    emergency: {
        en: 'Emergency',
        te: 'అత్యవసర పరిస్థితి'
    },

    // Health Profile
    age: {
        en: 'Age',
        te: 'వయస్సు'
    },
    gender: {
        en: 'Gender',
        te: 'లింగం'
    },
    male: {
        en: 'Male',
        te: 'పురుషుడు'
    },
    female: {
        en: 'Female',
        te: 'స్త్రీ'
    },
    other: {
        en: 'Other',
        te: 'ఇతర'
    },
    conditions: {
        en: 'Existing Conditions',
        te: 'ప్రస్తుత వ్యాధులు'
    },
    medications: {
        en: 'Current Medications',
        te: 'ప్రస్తుత మందులు'
    },
    allergies: {
        en: 'Allergies',
        te: 'అలర్జీలు'
    },

    // Diet categories
    recommended: {
        en: 'Recommended',
        te: 'సిఫార్సు చేయబడింది'
    },
    avoid: {
        en: 'Avoid',
        te: 'నివారించండి'
    },
    moderation: {
        en: 'In Moderation',
        te: 'మితంగా'
    },

    // Disclaimer
    disclaimer: {
        en: 'This information is for educational purposes only and does not replace professional medical advice. Always consult a healthcare provider.',
        te: 'ఈ సమాచారం విద్యా ప్రయోజనాల కోసం మాత్రమే మరియు వృత్తిపరమైన వైద్య సలహాను భర్తీ చేయదు. ఎల్లప్పుడూ ఆరోగ్య సంరక్షణ ప్రదాతను సంప్రదించండి.'
    },

    // Empty states
    noResults: {
        en: 'No results found',
        te: 'ఫలితాలు కనుగొనబడలేదు'
    },
    startSearch: {
        en: 'Start by searching for a drug',
        te: 'మందు కోసం వెతకడం ప్రారంభించండి'
    },
    startChat: {
        en: 'Start a conversation',
        te: 'సంభాషణ ప్రారంభించండి'
    },

    // Feature tags
    aiPowered: {
        en: 'AI Powered',
        te: 'AI ఆధారిత'
    },
    teluguSupport: {
        en: 'Telugu Support',
        te: 'తెలుగు మద్దతు'
    },
    instant: {
        en: 'Instant',
        te: 'తక్షణ'
    },
    personalized: {
        en: 'Personalized',
        te: 'వ్యక్తిగతీకరించిన'
    },

    // Error messages
    errorGeneric: {
        en: 'An error occurred. Please try again.',
        te: 'దయచేసి మళ్ళీ ప్రయత్నించండి.'
    },
    errorApiKey: {
        en: 'API key is not configured.',
        te: 'API కీ కాన్ఫిగర్ చేయబడలేదు.'
    },
    errorRateLimit: {
        en: 'Please wait a few seconds and try again.',
        te: 'దయచేసి కొన్ని సెకన్లు వేచి ఉండి మళ్ళీ ప్రయత్నించండి.'
    },
    tryAgain: {
        en: 'Try Again',
        te: 'మళ్ళీ ప్రయత్నించండి'
    },

    // Symptom Analysis
    confidence: {
        en: 'Confidence',
        te: 'నమ్మకం'
    },
    recommendedActions: {
        en: 'Recommended Actions',
        te: 'సిఫార్సు చర్యలు'
    },
    warningSigns: {
        en: 'Warning Signs',
        te: 'హెచ్చరిక సంకేతాలు'
    },

    // Second Opinion
    currentDiagnosis: {
        en: 'Current Diagnosis',
        te: 'ప్రస్తుత రోగ నిర్ధారణ'
    },
    yourSymptoms: {
        en: 'Your Symptoms',
        te: 'మీ లక్షణాలు'
    },
    getSecondOpinion: {
        en: 'Get Second Opinion',
        te: 'రెండవ అభిప్రాయం పొందండి'
    },

    // Diet Plan
    dietGoal: {
        en: 'Diet Goal',
        te: 'ఆహార లక్ష్యం'
    },
    selectGoal: {
        en: 'Select a goal',
        te: 'లక్ష్యం ఎంచుకోండి'
    },
    generateDietPlan: {
        en: 'Generate Diet Plan',
        te: 'ఆహార ప్రణాళిక రూపొందించు'
    },
    profileRequired: {
        en: 'Please fill in your health profile first',
        te: 'దయచేసి మీ ఆరోగ్య ప్రొఫైల్‌ను నింపండి'
    },

    // Diet Goals
    weightLoss: {
        en: 'Weight Loss',
        te: 'బరువు తగ్గడం'
    },
    weightGain: {
        en: 'Weight Gain',
        te: 'బరువు పెంచడం'
    },
    muscleBuilding: {
        en: 'Muscle Building',
        te: 'కండరాల నిర్మాణం'
    },
    heartHealth: {
        en: 'Heart Health',
        te: 'గుండె ఆరోగ్యం'
    },
    diabetesManagement: {
        en: 'Diabetes Management',
        te: 'డయాబెటిస్ నిర్వహణ'
    },
    generalHealth: {
        en: 'General Health',
        te: 'సాధారణ ఆరోగ్యం'
    },

    // Health Profile
    profileSaved: {
        en: 'Profile saved successfully!',
        te: 'ప్రొఫైల్ సేవ్ చేయబడింది!'
    },
    addCondition: {
        en: 'Add condition',
        te: 'వ్యాధి జోడించండి'
    },
    addMedication: {
        en: 'Add medication',
        te: 'మందు జోడించండి'
    },
    addAllergy: {
        en: 'Add allergy',
        te: 'అలర్జీ జోడించండి'
    },
    select: {
        en: 'Select',
        te: 'ఎంచుకోండి'
    },

    // Duration/Placeholders
    durationPlaceholder: {
        en: 'e.g., 3 days',
        te: 'ఉదా: 3 రోజులు'
    },
    locationPlaceholder: {
        en: 'e.g., head, abdomen',
        te: 'ఉదా: తల, పొట్ట'
    },

    // Drug Search
    recentSearches: {
        en: 'Recent searches:',
        te: 'ఇటీవలి వెతకడాలు:'
    },
    evidence: {
        en: 'Evidence:',
        te: 'సాక్ష్యం:'
    },
    drugAnalysisError: {
        en: 'Error fetching drug information. Please try again.',
        te: 'మందు సమాచారం పొందడంలో లోపం. దయచేసి మళ్ళీ ప్రయత్నించండి.'
    },

    // Accessibility
    toggleNavigation: {
        en: 'Toggle navigation',
        te: 'నావిగేషన్ మార్చు'
    },
    changeLanguage: {
        en: 'Change language',
        te: 'భాష మార్చండి'
    },
    goToHome: {
        en: 'Go to home page',
        te: 'హోమ్ పేజీకి వెళ్ళండి'
    },
    sendMessage: {
        en: 'Send message',
        te: 'సందేశం పంపు'
    },

    // Footer
    privacyPolicy: {
        en: 'Privacy Policy',
        te: 'గోప్యతా విధానం'
    },
    termsOfService: {
        en: 'Terms of Service',
        te: 'సేవా నిబంధనలు'
    }
};

export const getTranslation = (key: string, lang: Language): string => {
    return translations[key]?.[lang] || translations[key]?.['en'] || key;
};

export const t = getTranslation;

