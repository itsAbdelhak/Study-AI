
import React from 'react';
import { StudyPlanItem } from './CourseTutor';
import { CheckCircleIcon, BookOpenIcon, SparklesIcon } from './icons';

interface StudyPlanProps {
    plan: StudyPlanItem[];
    currentStep: number;
    onStepSelect: (stepIndex: number) => void;
}

export const StudyPlan: React.FC<StudyPlanProps> = ({ plan, currentStep, onStepSelect }) => {
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 tracking-tight">
                <SparklesIcon className="h-6 w-6 text-blue-500" />
                Your Study Plan
            </h2>
            {plan.length === 0 ? (
                <p className="text-gray-500">Generating your plan...</p>
            ) : (
                <ol className="space-y-2">
                    {plan.map((item, index) => {
                        const isCompleted = item.completed;
                        const isCurrent = index === currentStep;

                        return (
                            <li key={index} onClick={() => onStepSelect(index)} className="cursor-pointer group">
                                <div className={`flex items-start gap-4 p-3 rounded-lg border-2 transition-all duration-200 ${
                                    isCurrent 
                                    ? 'bg-blue-50 border-blue-500' 
                                    : isCompleted 
                                    ? 'bg-white border-transparent' 
                                    : 'bg-white border-transparent hover:border-blue-400 hover:bg-blue-50/50'
                                }`}>
                                    <div className="flex-shrink-0 mt-0.5">
                                        {isCompleted ? (
                                            <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                        ) : isCurrent ? (
                                            <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm ring-4 ring-blue-100">
                                                {index + 1}
                                            </div>
                                        ) : (
                                            <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold text-sm border-2 border-white group-hover:bg-blue-200">
                                               {index + 1}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold transition-colors ${
                                            isCurrent ? 'text-blue-800' : isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'
                                        }`}>{item.title}</h3>
                                        <p className={`text-sm transition-colors leading-relaxed ${
                                             isCurrent ? 'text-blue-700' : isCompleted ? 'text-gray-400' : 'text-gray-500'
                                        }`}>{item.objective}</p>
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ol>
            )}
        </div>
    );
};