import React from 'react';
import { ArrowRight, Compass, HardHat, Check, Sparkles } from 'lucide-react';
import ThreeInfrastructureCanvas from './ThreeInfrastructureCanvas';

export default function HeroSection({ onExploreProjects, onOpenContractorPortal }) {
  const supportingPhrases = [
    'Dig once. Build smarter.',
    'Every project visible. Every delay accountable.',
    'Your street. Your city. Your right to know.',
    'Less disruption. More transparency.'
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-white border-b border-slate-100">
      {/* Soft background aura */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-50/50 rounded-full blur-3xl pointer-events-none -mt-20" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-sky-50/50 rounded-full blur-3xl pointer-events-none -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Lucid Copy */}
          <div className="lg:col-span-6 space-y-8 animate-fadeIn">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Civic Infrastructure Coordination</span>
            </div>

            {/* Primary Headline (Exact match to spec) */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.14]">
                One city. One plan.{' '}
                <span className="text-emerald-600">
                  No unnecessary digging.
                </span>
              </h1>
              
              {/* Description (Exact match to spec, clean and lucid) */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                CivicSync brings citizens, contractors and municipal authorities together to coordinate public works, detect scheduling conflicts and keep communities informed.
              </p>
            </div>

            {/* Supporting Phrases (Clean & uncluttered 2x2 grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {supportingPhrases.map((phrase, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 rounded-xl">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{phrase}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onExploreProjects}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Projects</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                onClick={onOpenContractorPortal}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs hover:shadow-xs transform hover:-translate-y-0.5"
              >
                <HardHat className="w-4 h-4 text-amber-600" />
                <span>Contractor Portal</span>
              </button>
            </div>

          </div>

          {/* Right Column: Clean 3D Canvas */}
          <div className="lg:col-span-6 animate-fadeIn">
            <ThreeInfrastructureCanvas />
          </div>

        </div>
      </div>
    </section>
  );
}
