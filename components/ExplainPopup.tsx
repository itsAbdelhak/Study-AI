
import React from 'react';
import { SparklesIcon } from './icons';

interface ExplainPopupProps {
  position: { top: number; left: number };
  onExplain: () => void;
}

export const ExplainPopup: React.FC<ExplainPopupProps> = ({ position, onExplain }) => {
  return (
    <div
      className="absolute z-10"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(e) => e.stopPropagation()} // Prevent click from closing the popup
    >
      <button
        onClick={onExplain}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded-full shadow-lg text-sm font-semibold transition-transform hover:scale-105"
      >
        <SparklesIcon className="h-4 w-4 text-cyan-300" />
        Explain this
      </button>
    </div>
  );
};