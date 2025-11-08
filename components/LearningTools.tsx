
import React from 'react';
import {
  ChatBubbleIcon,
  CheckSquareIcon,
  QuestionMarkCircleIcon,
  ListBulletIcon,
  LightBulbIcon,
} from './icons';

// Add internal modes for generating transitional messages.
// FIX: Added 'diagram' to LearningMode to match its usage and definition elsewhere.
export type LearningMode = 'chat' | 'todo' | 'quiz' | 'summary' | 'explain' | 'explain_term' | 'diagram' | 'start_topic' | 'next_topic' | 'finish_plan';

interface LearningToolsProps {
  activeMode: LearningMode;
  onModeChange: (mode: LearningMode) => void;
}

const tools: { mode: LearningMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'chat', label: 'Chat Tutor', icon: <ChatBubbleIcon className="h-5 w-5" /> },
  { mode: 'todo', label: 'To-Do List', icon: <CheckSquareIcon className="h-5 w-5" /> },
  { mode: 'quiz', label: 'Quiz Me', icon: <QuestionMarkCircleIcon className="h-5 w-5" /> },
  { mode: 'summary', label: 'Key Points', icon: <ListBulletIcon className="h-5 w-5" /> },
  { mode: 'explain', label: 'Explain', icon: <LightBulbIcon className="h-5 w-5" /> },
];

export const LearningTools: React.FC<LearningToolsProps> = ({ activeMode, onModeChange }) => {
  return (
    <div className="flex items-center justify-center flex-wrap gap-2 mb-3">
      {tools.map(({ mode, label, icon }) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 border ${
            activeMode === mode
              ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
          aria-pressed={activeMode === mode}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
};