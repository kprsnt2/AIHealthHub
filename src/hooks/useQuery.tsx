/**
 * React Query hooks for AI Health Hub
 * Provides caching, retries, and loading states for AI queries
 */

import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Language, DrugInfo, DiagnosisResult } from '../types';
import { analyzeDrug, analyzeSymptoms, getPancreatitisDiet, getSecondOpinion, generateDietPlan } from '../services/geminiService';
import { checkRateLimit, RateLimitError } from '../utils/rateLimiter';

// Create a query client with default options
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 30 * 60 * 1000, // 30 minutes (previously cacheTime)
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

// Query Provider component
interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

// Hook for drug analysis with caching
export function useDrugAnalysis(drugName: string, language: Language) {
    return useQuery<DrugInfo, Error>({
        queryKey: ['drug', drugName.toLowerCase(), language],
        queryFn: async () => {
            checkRateLimit('drug-analysis');
            return analyzeDrug(drugName, language);
        },
        enabled: drugName.length > 0,
    });
}

// Hook for symptom analysis
export function useSymptomAnalysis() {
    const qc = useQueryClient();

    return useMutation<DiagnosisResult[], Error, {
        symptoms: string;
        severity: string;
        duration: string;
        bodyLocation: string;
        healthProfile: { conditions: string[]; medications: string[]; allergies: string[] } | null;
        language: Language;
    }>({
        mutationFn: async ({ symptoms, severity, duration, bodyLocation, healthProfile, language }) => {
            checkRateLimit('symptom-analysis');
            return analyzeSymptoms(symptoms, severity, duration, bodyLocation, healthProfile, language);
        },
        onSuccess: (data, variables) => {
            // Cache the result
            qc.setQueryData(
                ['symptoms', variables.symptoms.substring(0, 50), variables.language],
                data
            );
        },
    });
}

// Hook for pancreatitis diet information
export function usePancreatitisDiet(language: Language, enabled: boolean = true) {
    return useQuery<string, Error>({
        queryKey: ['pancreatitis-diet', language],
        queryFn: async () => {
            checkRateLimit('diet');
            return getPancreatitisDiet(language);
        },
        enabled,
        staleTime: 60 * 60 * 1000, // 1 hour - diet info doesn't change often
    });
}

// Hook for second opinion
export function useSecondOpinion() {
    return useMutation<string, Error, {
        diagnosis: string;
        symptoms: string;
        language: Language;
    }>({
        mutationFn: async ({ diagnosis, symptoms, language }) => {
            checkRateLimit('second-opinion');
            return getSecondOpinion(diagnosis, symptoms, language);
        },
    });
}

// Hook for diet plan generation
export function useDietPlan() {
    return useMutation<string, Error, {
        healthProfile: { age: number; gender: string; conditions: string[]; allergies: string[] };
        goal: string;
        language: Language;
    }>({
        mutationFn: async ({ healthProfile, goal, language }) => {
            checkRateLimit('diet-plan');
            return generateDietPlan(healthProfile, goal, language);
        },
    });
}

// Helper hook to check if a query is cached
export function useIsCached(queryKey: unknown[]) {
    const qc = useQueryClient();
    return qc.getQueryData(queryKey) !== undefined;
}

// Helper to check for rate limit errors
export function isRateLimitError(error: unknown): error is RateLimitError {
    return error instanceof RateLimitError;
}

// Prefetch hook for commonly accessed data
export function usePrefetchDiet(language: Language) {
    const qc = useQueryClient();

    return () => {
        qc.prefetchQuery({
            queryKey: ['pancreatitis-diet', language],
            queryFn: () => getPancreatitisDiet(language),
        });
    };
}
