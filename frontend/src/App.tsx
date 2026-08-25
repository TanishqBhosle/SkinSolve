import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { Results } from './pages/Results';
import { Catalog } from './pages/Catalog';
import { Evaluation } from './pages/Evaluation';
import type { UserProfileRequest, ProblemParseResponse, RecommendationResponse } from './types/skincare';
import { generateRecommendations } from './services/api';
import { Sparkles } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [userProfile, setUserProfile] = useState<UserProfileRequest | null>(null);
  const [parsedInitialData, setParsedInitialData] = useState<Partial<UserProfileRequest> | undefined>(undefined);
  const [recommendationResult, setRecommendationResult] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartQuiz = () => {
    setParsedInitialData(undefined);
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

  const handleProfileSubmit = async (profile: UserProfileRequest) => {
    setUserProfile(profile);
    setLoading(true);
    setError(null);
    try {
      const results = await generateRecommendations(profile);
      setRecommendationResult(results);
      setCurrentView('results');
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onStartQuiz={handleStartQuiz}
      />

      <main className="flex-1">
        {loading && (
          <div className="max-w-md mx-auto px-4 py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold font-serif text-charcoal-900 mb-2">Analyzing Skincare Constraints...</h2>
            <p className="text-xs text-charcoal-600">
              Evaluating candidate formulas, testing active compatibility, and optimizing your minimal routine.
            </p>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <p className="font-semibold mb-2">Error Connecting to Engine</p>
              <p className="text-xs mb-4">{error}</p>
              <button
                onClick={() => setCurrentView('landing')}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {currentView === 'landing' && (
              <Landing
                onStartQuiz={handleStartQuiz}
                onApplyParsedData={handleApplyParsedData}
              />
            )}

            {currentView === 'onboarding' && (
              <Onboarding
                initialProfile={parsedInitialData}
                onSubmit={handleProfileSubmit}
                onCancel={() => setCurrentView('landing')}
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
          </>
        )}
      </main>
    </div>
  );
}

export default App;
