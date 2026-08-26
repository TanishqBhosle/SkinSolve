import type { UserProfileRequest, ProblemParseResponse, RecommendationResponse } from '../types/skincare';

const getNormalizedBaseUrl = (): string => {
  let envUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').trim();
  envUrl = envUrl.replace(/\/+$/, '');
  if (!envUrl.endsWith('/api/v1')) {
    envUrl = `${envUrl}/api/v1`;
  }
  return envUrl;
};

const API_BASE_URL = getNormalizedBaseUrl();

export async function parseNaturalLanguageProblem(query: string): Promise<ProblemParseResponse> {
  const response = await fetch(`${API_BASE_URL}/parse-problem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData.error?.message || errorData.detail || 'Failed to parse natural language problem.';
    throw new Error(msg);
  }

  return response.json();
}

export async function generateRecommendations(profile: UserProfileRequest): Promise<RecommendationResponse> {
  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData.error?.message || errorData.detail || 'Failed to generate recommendations.';
    throw new Error(msg);
  }

  return response.json();
}

export async function getProductCatalog(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch product catalog.');
  }
  return response.json();
}

export async function getEvidenceBase(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/evidence`);
  if (!response.ok) {
    throw new Error('Failed to fetch evidence data.');
  }
  return response.json();
}

export async function getEvaluationMetrics(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/evaluation`);
  if (!response.ok) {
    throw new Error('Failed to fetch evaluation metrics.');
  }
  return response.json();
}
