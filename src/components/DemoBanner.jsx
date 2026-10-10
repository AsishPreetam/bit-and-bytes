import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DemoBanner({ onResetDemo, resetting }) {
  return (
    <aside aria-label="Demo environment notice" className="bg-amber-50/80 border-b border-amber-200/70 px-4 py-2 text-xs font-medium text-amber-900 flex flex-wrap items-center justify-between gap-3">
      <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-full bg-amber-100 text-amber-700">
            <AlertCircle className="w-3.5 h-3.5" />
          </span>
          <span>
            <strong className="font-semibold text-amber-950">Prototype Notice:</strong>{' '}
            All public projects, schedules, and municipal verifications are simulated demonstration records.
          </span>
        </div>

        <button
          onClick={onResetDemo}
          disabled={resetting}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-amber-100/60 text-amber-800 border border-amber-300 shadow-xs transition-colors cursor-pointer text-[11px] font-semibold"
          title="Reset demonstration data to default state"
        >
          <RefreshCw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting Data...' : 'Reset Demo Data'}</span>
        </button>
      </div>
    </aside>
  );
}
