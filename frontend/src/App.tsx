import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { Results } from './pages/Results';
import { Catalog } from './pages/Catalog';
import { Evaluation } from './pages/Evaluation';
import { SavedRoutines } from './pages/SavedRoutines';
import { TrustSafety } from './pages/TrustSafety';
import { AnalysisModal } from './components/AnalysisModal';
import type { UserProfileRequest, ProblemParseResponse, RecommendationResponse } from './types/skincare';
import { generateRecommendations } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [userProfile, setUserProfile] = useState<UserProfileRequest | null>(null);
  const [parsedInitialData, setParsedInitialData] = useState<Partial<UserProfileRequest> | undefined>(undefined);
  const [recommendationResult, setRecommendationResult] = useState<RecommendationResponse | null>(null);
  const [loadingModalOpen, setLoadingModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Race-condition fix: track both API completion and modal animation separately
  const [apiReady, setApiReady] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState<RecommendationResponse | null>(null);
  const [apiProfile, setApiProfile] = useState<UserProfileRequest | null>(null);
  const [modalDone, setModalDone] = useState<boolean>(false);

  // Transition to results only when BOTH the API has responded AND the modal animation has completed
  useEffect(() => {
    if (apiReady && modalDone && apiResult && apiProfile) {
      setRecommendationResult(apiResult);
      setUserProfile(apiProfile);
      setCurrentView('results');
      // Reset flags
      setApiReady(false);
      setApiResult(null);
      setApiProfile(null);
      setModalDone(false);
      setLoadingModalOpen(false);
      setIsSubmitting(false);
    }
  }, [apiReady, modalDone, apiResult, apiProfile]);

  const handleStartQuiz = () => {
    setParsedInitialData(undefined);
    setError(null);
    setCurrentView('onboarding');
  };

  const handleApplyParsedData = (data: ProblemParseResponse) => {
    const profile: Partial<UserProfileRequest> = {
      skin_type: data.skin_type || 'combination',
      concerns: data.concerns || ['acne'],
      sensitivity: data.sensitivity || 'medium',
      budget: data.budget || 1500,
      fragrance_free: data.fragrance_free,
      vegan: data.vegan,
      cruelty_free: data.cruelty_free,
      excluded_ingredients: data.excluded_ingredients,
    };
    setParsedInitialData(profile);
    setCurrentView('onboarding');
  };

  const handleProfileSubmit = useCallback(async (profile: UserProfileRequest) => {
    if (isSubmitting) return; // Prevent double-submission
    setIsSubmitting(true);
    setUserProfile(profile);
    setError(null);
    setApiReady(false);
    setApiResult(null);
    setApiProfile(null);
    setModalDone(false);

    try {
      setLoadingModalOpen(true);
      const results = await generateRecommendations(profile);
      setApiResult(results);
      setApiProfile(profile);
      setApiReady(true);
    } catch (err: any) {
      setLoadingModalOpen(false);
      setIsSubmitting(false);
      setApiReady(false);
      setModalDone(false);
      setError(err.message || 'An error occurred while generating recommendations.');
    }
  }, [isSubmitting]);

  const handleAnalysisComplete = useCallback(() => {
    setModalDone(true);
    // If API already finished, useEffect will handle the transition
    // If API hasn't finished yet, the modal stays visible and useEffect will fire when API completes
  }, []);

  const handleLoadSavedRoutine = (rec: RecommendationResponse, prof: UserProfileRequest) => {
    setRecommendationResult(rec);
    setUserProfile(prof);
    setCurrentView('results');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onStartQuiz={handleStartQuiz}
      />

      <AnalysisModal
        isOpen={loadingModalOpen}
        onComplete={handleAnalysisComplete}
      />

      <main className="flex-1">
        {error && (
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm">
              <p className="font-bold font-serif mb-2 text-base text-[#1C2826]">Error Connecting to Recommendation Engine</p>
              <p className="text-xs text-[#556864] mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setCurrentView('landing');
                }}
                className="px-5 py-2.5 bg-[#1B3B2B] text-white text-xs font-bold rounded-full hover:bg-[#264E3A] transition-all cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}

        {!error && (
          <>
            {currentView === 'landing' && (
              <Landing
                onStartQuiz={handleStartQuiz}
                onApplyParsedData={handleApplyParsedData}
                onNavigate={(view) => setCurrentView(view)}
              />
            )}

            {currentView === 'onboarding' && (
              <Onboarding
                initialProfile={parsedInitialData}
                onSubmit={handleProfileSubmit}
                onCancel={() => setCurrentView('landing')}
                isSubmitting={isSubmitting}
              />
            )}

            {currentView === 'results' && recommendationResult && userProfile && (
              <Results
                data={recommendationResult}
                userProfile={userProfile}
                onModifyProfile={() => setCurrentView('onboarding')}
              />
            )}

            {currentView === 'catalog' && <Catalog />}

            {currentView === 'evaluation' && <Evaluation />}

            {currentView === 'saved' && (
              <SavedRoutines
                onLoadRoutine={handleLoadSavedRoutine}
                onNavigate={(view) => setCurrentView(view)}
              />
            )}

            {currentView === 'trust' && (
              <TrustSafety
                onStartQuiz={handleStartQuiz}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;

