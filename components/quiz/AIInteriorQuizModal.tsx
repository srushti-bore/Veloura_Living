'use client';

import React, { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Sparkles, X, Compass, ArrowRight, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerLuxuryToast } from '@/components/common/LuxuryToast';

interface QuizState {
  room: string;
  aesthetic: string;
  lighting: string;
}

export const AIInteriorQuizModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { allProducts, addToCart, setIsCartOpen, navigate } = useStore();
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<QuizState>({
    room: 'living-room',
    aesthetic: 'warm-minimal',
    lighting: 'golden'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultReady, setResultReady] = useState(false);

  if (!isOpen) return null;

  const handleSelectOption = (key: keyof QuizState, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setResultReady(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#8B5A2B', '#C49A6C', '#F5E6D3']
        });
      }, 900);
    }
  };

  const resetQuiz = () => {
    setStep(1);
    setResultReady(false);
    setIsGenerating(false);
  };

  const getRecommendedProducts = () => {
    return allProducts
      .filter((p) => p.room === answers.room)
      .slice(0, 3);
  };

  const recommendedPieces = getRecommendedProducts().length > 0
    ? getRecommendedProducts()
    : allProducts.slice(0, 3);

  const suiteSubtotal = recommendedPieces.reduce((sum, p) => sum + p.price, 0);
  const suiteDiscounted = Math.round(suiteSubtotal * 0.85);

  const handleAddSuiteToCart = () => {
    recommendedPieces.forEach((p) => addToCart(p));
    setIsCartOpen(true);
    triggerLuxuryToast({
      type: 'cart',
      title: 'Architectural Suite Added',
      subtitle: `${recommendedPieces.length} curated pieces with 15% quiz privilege discount`,
      imageUrl: recommendedPieces[0]?.images[0],
      price: suiteDiscounted
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#FCFAF7] border border-[#4A2C1A]/15 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EEE9E1] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B5A2B]" />
            <span className="font-display font-semibold text-sm text-[#4A2C1A]">
              Veloura AI Interior Personality Quiz
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#9C9287] hover:text-[#211E1B] hover:bg-[#F7F4EF] hover:rotate-90 transition-transform duration-300 active:scale-90 cursor-pointer"
            aria-label="Close Quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {isGenerating ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#8B5A2B]/20 border-t-[#8B5A2B] animate-spin mx-auto" />
              <h3 className="font-display text-xl font-semibold text-[#4A2C1A]">
                Analyzing Proportions & Wood Grain Harmony...
              </h3>
              <p className="text-xs text-[#746B61] max-w-sm mx-auto">
                Synthesizing architectural lighting, ceiling height balance, and tactile material compatibility for your space.
              </p>
            </div>
          ) : !resultReady ? (
            <div className="space-y-6">
              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs text-[#9C9287]">
                <span>Question {step} of 3</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        step >= i ? 'w-6 bg-[#8B5A2B]' : 'w-2 bg-[#EEE9E1]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-[#211E1B]">
                      Which room are you curating today?
                    </h2>
                    <p className="text-xs text-[#746B61] mt-1">
                      We calibrate dimensions and spatial clearance according to the room archetype.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'living-room', name: 'Living Room', desc: 'Sectionals, coffee tables, lounge' },
                      { id: 'bedroom', name: 'Master Bedroom', desc: 'Heirloom bed, nightstands, dressers' },
                      { id: 'dining', name: 'Dining Salon', desc: 'Solid hardwood tables & sculpted chairs' },
                      { id: 'office', name: 'Executive Study', desc: 'Ergonomic leather seating & walnut desk' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption('room', opt.id)}
                        className={`interactive-card p-4 rounded-2xl border text-left cursor-pointer active:scale-[0.98] ${
                          answers.room === opt.id
                            ? 'bg-[#4A2C1A] text-white border-[#4A2C1A] shadow-md'
                            : 'bg-white border-[#EEE9E1] hover:border-[#8B5A2B]/40 hover:bg-[#F7F4EF]'
                        }`}
                      >
                        <span className="font-display font-semibold text-base block">{opt.name}</span>
                        <span className={`text-[11px] block mt-1 ${answers.room === opt.id ? 'text-[#EADBC8]' : 'text-[#746B61]'}`}>
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-[#211E1B]">
                      What tactile emotion calls to you?
                    </h2>
                    <p className="text-xs text-[#746B61] mt-1">
                      Determines timber grain density and upholstery yarn structure.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'warm-minimal', name: 'Warm Minimalist', desc: 'Soft Belgian wool bouclé & blonde oak' },
                      { id: 'organic-walnut', name: 'Organic Appalachian Walnut', desc: 'Rich chocolate timber & botanical oils' },
                      { id: 'tuscan-leather', name: 'Tuscan Saddle Leather', desc: 'Vegetable-tanned caramel & patinated brass' },
                      { id: 'japandi', name: 'Japandi Rest', desc: 'Low-profile joinery & Roman travertine stone' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption('aesthetic', opt.id)}
                        className={`interactive-card p-4 rounded-2xl border text-left cursor-pointer active:scale-[0.98] ${
                          answers.aesthetic === opt.id
                            ? 'bg-[#4A2C1A] text-white border-[#4A2C1A] shadow-md'
                            : 'bg-white border-[#EEE9E1] hover:border-[#8B5A2B]/40 hover:bg-[#F7F4EF]'
                        }`}
                      >
                        <span className="font-display font-semibold text-base block">{opt.name}</span>
                        <span className={`text-[11px] block mt-1 ${answers.aesthetic === opt.id ? 'text-[#EADBC8]' : 'text-[#746B61]'}`}>
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-[#211E1B]">
                      What is your room's natural daylight character?
                    </h2>
                    <p className="text-xs text-[#746B61] mt-1">
                      Matches fabric reflectance and timber undertones with diurnal sun exposure.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'dawn', name: 'Morning Light', desc: 'Soft East cool rays (5500K)' },
                      { id: 'daylight', name: 'Bright Sunlit', desc: 'Direct architectural wash (6500K)' },
                      { id: 'golden', name: 'Golden / Ambient', desc: 'Intimate evening sunset & warm brass (3000K)' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption('lighting', opt.id)}
                        className={`interactive-card p-4 rounded-2xl border text-left cursor-pointer active:scale-[0.98] ${
                          answers.lighting === opt.id
                            ? 'bg-[#4A2C1A] text-white border-[#4A2C1A] shadow-md'
                            : 'bg-white border-[#EEE9E1] hover:border-[#8B5A2B]/40 hover:bg-[#F7F4EF]'
                        }`}
                      >
                        <span className="font-display font-semibold text-sm block">{opt.name}</span>
                        <span className={`text-[10px] block mt-1 ${answers.lighting === opt.id ? 'text-[#EADBC8]' : 'text-[#746B61]'}`}>
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Result Screen */
            <div className="space-y-6 animate-fadeIn">
              {/* Persona Headline */}
              <div className="bg-gradient-to-r from-[#211E1B] to-[#3B2618] text-white p-6 rounded-3xl border border-white/10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5A2B]/40 text-[#EADBC8] text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#C49A6C]" />
                  Your Space Persona: The Sensory Purist
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-normal text-white">
                  Curated for <span className="italic text-[#C49A6C]">{answers.room.replace('-', ' ')}</span> with {answers.aesthetic.replace('-', ' ')} harmony
                </h3>
                <p className="text-xs text-[#DED7CD] leading-relaxed">
                  Your space profile favors deep grain contrast, generous 38"+ circulation pathways, and light-responsive tactile fabrics.
                </p>
              </div>

              {/* Recommended 3-piece suite */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8B5A2B]">
                    Recommended 3-Piece Suite
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    15% Suite Savings Applied
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {recommendedPieces.map((p) => (
                    <div key={p.id} className="interactive-card bg-white p-2.5 rounded-2xl border border-[#EEE9E1] flex flex-col justify-between group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-[#F7F4EF] mb-2">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]" />
                      </div>
                      <div>
                        <h4 className="font-display font-medium text-xs text-[#211E1B] line-clamp-1">{p.name}</h4>
                        <span className="text-xs font-bold text-[#4A2C1A] block mt-0.5">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Suite Actions */}
              <div className="pt-4 border-t border-[#EEE9E1] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-[#4A2C1A]">
                      ₹{suiteDiscounted.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-[#9C9287] line-through">
                      ₹{suiteSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#557A5A] font-medium">Includes White-Glove In-Home Assembly</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/studio');
                    }}
                    className="px-4 py-2.5 rounded-full border border-[#4A2C1A]/20 hover:bg-[#F7F4EF] text-xs font-semibold text-[#4A2C1A] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Stage in 2D Studio
                  </button>

                  <button
                    onClick={handleAddSuiteToCart}
                    className="btn-primary-shimmer flex-1 sm:flex-initial px-5 py-2.5 rounded-full text-xs font-semibold text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Add Suite to Bag
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AIInteriorQuizModal;
