import React, { useEffect, useState } from 'react';
import { Bookmark, Trash2, ArrowRight, Sparkles, Calendar } from 'lucide-react';
import type { RecommendationResponse, UserProfileRequest, ProductRecommendation } from '../types/skincare';

interface SavedRoutineItem {
  id: string;
  timestamp: string;
  profile: UserProfileRequest;
  recommendation: RecommendationResponse;
}

interface SavedRoutinesProps {
  onLoadRoutine: (recommendation: RecommendationResponse, profile: UserProfileRequest) => void;
  onNavigate: (view: string) => void;
}

export const SavedRoutines: React.FC<SavedRoutinesProps> = ({ onLoadRoutine, onNavigate }) => {
  const [savedItems, setSavedItems] = useState<SavedRoutineItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('skinsolve_saved_routines');
      if (stored) {
        setSavedItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse saved routines", e);
    }
  }, []);

  const handleRemove = (id: string) => {
    const updated = savedItems.filter((item) => item.id !== id);
    setSavedItems(updated);
    localStorage.setItem('skinsolve_saved_routines', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#E5E0D7]">
          <div>
            <div className="flex items-center space-x-2">
              <Bookmark className="w-6 h-6 text-[#1B3B2B]" />
              <h1 className="text-3xl font-bold text-[#1C2826] font-serif">Saved Routines</h1>
            </div>
            <p className="text-sm text-[#556864] mt-1">Review your saved skincare recommendations and history.</p>
          </div>
          <button
            onClick={() => onNavigate('onboarding')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#1B3B2B] hover:bg-[#264E3A] text-white text-sm font-medium transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#E89D75]" />
            <span>Create New Routine</span>
          </button>
        </div>

        {savedItems.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E5E0D7] rounded-3xl p-8 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#E6EFE9] text-[#1B3B2B] flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-[#4A7C59]" />
            </div>
            <h3 className="text-xl font-bold text-[#1C2826] font-serif">No Saved Routines Yet</h3>
            <p className="text-sm text-[#556864] max-w-md mx-auto mt-2">
              When you generate a skincare recommendation routine, click "Save Routine" to bookmark it for future reference.
            </p>
            <button
              onClick={() => onNavigate('onboarding')}
              className="mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#1B3B2B] text-white text-sm font-semibold hover:bg-[#264E3A] transition-all"
            >
              <span>Solve My Skin</span>
              <ArrowRight className="w-4 h-4 text-[#E89D75]" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E5E0D7] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#556864] bg-[#F3EFEA] px-3 py-1 rounded-full">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </span>
                    <span className="text-xs font-bold bg-[#E6EFE9] text-[#1B3B2B] px-3 py-1 rounded-full border border-[#93BCA0]/30">
                      {item.recommendation.overall_match_percentage}% Match
                    </span>
                  </div>

                  <h4 className="font-bold text-lg text-[#1C2826] font-serif">
                    {item.profile.skin_type.toUpperCase()} Skin • ₹{intFormat(item.recommendation.total_routine_price)}
                  </h4>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.profile.concerns.map((c: string, i: number) => (
                      <span key={i} className="text-xs bg-[#FDF3ED] text-[#E89D75] px-2.5 py-0.5 rounded-md font-medium border border-[#E89D75]/20">
                        {c}
                      </span>
                    ))}
                    {item.profile.fragrance_free && (
                      <span className="text-xs bg-[#E6EFE9] text-[#1B3B2B] px-2.5 py-0.5 rounded-md font-medium">
                        Fragrance-Free
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#E5E0D7]/60 space-y-2">
                    <p className="text-xs text-[#556864] font-semibold">Recommended Cart:</p>
                    {item.recommendation.all_recommended_products.map((prod: ProductRecommendation, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-[#2C3C39]">
                        <span className="font-medium truncate max-w-[240px]">{prod.brand} {prod.name}</span>
                        <span className="font-semibold text-[#1B3B2B]">₹{intFormat(prod.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>


                <div className="mt-6 pt-4 border-t border-[#E5E0D7] flex items-center justify-between">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="inline-flex items-center space-x-1 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => {
                      onLoadRoutine(item.recommendation, item.profile);
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1B3B2B] hover:bg-[#264E3A] text-white text-xs font-semibold transition-all"
                  >
                    <span>View Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#E89D75]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function intFormat(val: number): number {
  return Math.round(val);
}
