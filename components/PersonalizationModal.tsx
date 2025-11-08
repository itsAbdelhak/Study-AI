
import React, { useState } from 'react';
import { SparklesIcon } from './icons';
import type { PersonalizationSettings } from '../services/geminiService';

interface PersonalizationModalProps {
    onComplete: (settings: PersonalizationSettings) => void;
}

type Step = 'language' | 'level' | 'tone' | 'goal';

const OptionButton: React.FC<{
    label: string;
    isSelected: boolean;
    onClick: () => void;
}> = ({ label, isSelected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base ${
            isSelected 
            ? 'bg-blue-500 border-blue-500 text-white font-semibold shadow-sm' 
            : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
    >
        {label}
    </button>
);

export const PersonalizationModal: React.FC<PersonalizationModalProps> = ({ onComplete }) => {
    const [settings, setSettings] = useState<PersonalizationSettings>({
        language: 'English',
        level: 'Intermediate',
        tone: 'Friendly',
        goal: 'Deep Understanding',
    });

    const handleSelect = (key: keyof PersonalizationSettings, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(settings);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
                <div className="text-center mb-6">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                        <SparklesIcon className="h-7 w-7 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Personalize Your Session</h1>
                    <p className="text-gray-500 mt-1">Tell me a bit about your learning style.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2">Teaching Language</label>
                        <select
                            value={settings.language}
                            onChange={(e) => handleSelect('language', e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                            <option>Japanese</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2">Your Current Level</label>
                        <div className="grid grid-cols-3 gap-2">
                           {(['Beginner', 'Intermediate', 'Advanced'] as const).map(level => (
                                <OptionButton key={level} label={level} isSelected={settings.level === level} onClick={() => handleSelect('level', level)} />
                           ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2">Preferred Teaching Style</label>
                        <div className="grid grid-cols-2 gap-2">
                             {(['Strict', 'Friendly', 'Fast & Focused', 'Encouraging'] as const).map(tone => (
                                <OptionButton key={tone} label={tone} isSelected={settings.tone === tone} onClick={() => handleSelect('tone', tone)} />
                           ))}
                        </div>
                    </div>

                     <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2">Main Goal for this Session</label>
                        <div className="grid grid-cols-2 gap-2">
                             {(['Exam Prep', 'Deep Understanding', 'Study Notes', 'Quick Revision'] as const).map(goal => (
                                <OptionButton key={goal} label={goal} isSelected={settings.goal === goal} onClick={() => handleSelect('goal', goal)} />
                           ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-4 bg-blue-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Build My Study Plan
                    </button>
                </form>
            </div>
        </div>
    );
};