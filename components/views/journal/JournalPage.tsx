'use client';

import React from 'react';
import { useStore } from '@/hooks/useStore';
import { JOURNAL_ARTICLES } from '@/lib/data/mockData';
import { Clock, User, ArrowRight, BookOpen } from 'lucide-react';

export const JournalPage: React.FC = () => {
  const { navigate } = useStore();

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B] bg-[#F5E6D3] px-3.5 py-1 rounded-full inline-block">
            Architectural Publication
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#211E1B]">
            The Veloura Journal
          </h1>
          <p className="text-sm text-[#746B61] leading-relaxed">
            Essays on spatial harmony, continuous timber grains, circadian lighting, and the art of unhurried living.
          </p>
        </div>

        {/* Featured Large Article */}
        <div
          onClick={() => alert(`Opening ${JOURNAL_ARTICLES[0].title}`)}
          className="bg-white rounded-3xl overflow-hidden border border-[#4A2C1A]/10 shadow-soft-lg grid grid-cols-1 lg:grid-cols-12 cursor-pointer group interactive-card hover:border-[#8B5A2B]/30"
        >
          <div className="lg:col-span-7 aspect-[16/10] bg-[#F7F4EF] overflow-hidden">
            <img
              src={JOURNAL_ARTICLES[0].image}
              alt={JOURNAL_ARTICLES[0].title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          </div>
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-[#8B5A2B] font-bold uppercase tracking-wider">
                <span>{JOURNAL_ARTICLES[0].category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {JOURNAL_ARTICLES[0].readTime}
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#211E1B] group-hover:text-[#8B5A2B] transition-colors leading-tight">
                {JOURNAL_ARTICLES[0].title}
              </h2>
              <p className="text-xs sm:text-sm text-[#746B61] leading-relaxed">
                {JOURNAL_ARTICLES[0].excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#EEE9E1]">
              <div className="flex items-center gap-3">
                <img
                  src={JOURNAL_ARTICLES[0].author.avatar}
                  alt={JOURNAL_ARTICLES[0].author.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#EEE9E1] shadow-sm"
                />
                <div>
                  <div className="text-xs font-bold text-[#211E1B]">{JOURNAL_ARTICLES[0].author.name}</div>
                  <div className="text-[10px] text-[#9C9287]">{JOURNAL_ARTICLES[0].author.role}</div>
                </div>
              </div>

              <span className="text-xs font-bold text-[#8B5A2B] flex items-center gap-1.5 group-hover:text-[#4A2C1A] transition-colors">
                <span>Read Essay</span>
                <ArrowRight className="w-3.5 h-3.5 interactive-arrow" />
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {JOURNAL_ARTICLES.slice(1).map((art) => (
            <div
              key={art.id}
              onClick={() => alert(`Opening ${art.title}`)}
              className="bg-white rounded-3xl overflow-hidden border border-[#4A2C1A]/10 shadow-soft-sm hover:shadow-soft-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between interactive-card hover:border-[#8B5A2B]/30"
            >
              <div className="aspect-[16/10] bg-[#F7F4EF] overflow-hidden">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>

              <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#8B5A2B] font-bold uppercase tracking-wider mb-2">
                    <span>{art.category}</span>
                    <span>•</span>
                    <span>{art.readTime}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-[#211E1B] group-hover:text-[#8B5A2B] transition-colors leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-[#746B61] leading-relaxed mt-2 line-clamp-3">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EEE9E1] flex items-center justify-between text-xs text-[#9C9287]">
                  <span>By {art.author.name}</span>
                  <span className="font-semibold text-[#8B5A2B] flex items-center gap-1 group-hover:text-[#4A2C1A] transition-colors">
                    <span>Read Article</span>
                    <span className="interactive-arrow">→</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
