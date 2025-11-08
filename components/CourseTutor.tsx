import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { ChatMessage } from './ChatMessage';
import { LearningTools, LearningMode } from './LearningTools';
import { ExplainPopup } from './ExplainPopup';
import { StudyPlan } from './StudyPlan';
import { generateResponse, generateStudyPlan, PersonalizationSettings } from '../services/geminiService';
import { PersonalizationModal } from './PersonalizationModal';
import { ConfidenceRater } from './ConfidenceRater';
import { SendIcon, PaperclipIcon, SparklesIcon, AcademicCapIcon, DocumentTextIcon, ArrowRightIcon, MenuIcon } from './icons';

interface FileInfo {
  dataUrl: string;
  name: string;
  type: string;
}

export interface StudyPlanItem {
  title: string;
  objective: string;
  completed: boolean;
  confidence: number | null;
}

interface Message {
    role: 'user' | 'model';
    content: string;
    mode?: LearningMode;
}

interface SelectedTerm {
    text: string;
    position: { top: number; left: number };
}

type TutorState = 'upload' | 'personalization' | 'generating_plan' | 'studying' | 'completed';

interface CourseTutorProps {
    onMenuClick: () => void;
}

const MODE_PLACEHOLDERS: Record<LearningMode, string> = {
    chat: 'Ask a follow-up question...',
    todo: 'What do you need a to-do list for?',
    quiz: 'What should the quiz for this topic cover?',
    summary: 'Ask me to summarize this topic...',
    explain: 'Ask me to explain a concept from this topic...',
    explain_term: '',
    diagram: 'Describe the diagram you want to create...',
    start_topic: '',
    next_topic: '',
    finish_plan: ''
};

const CourseTutor: React.FC<CourseTutorProps> = ({ onMenuClick }) => {
    const [tutorState, setTutorState] = useState<TutorState>('upload');
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [personalization, setPersonalization] = useState<PersonalizationSettings | null>(null);
    const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeMode, setActiveMode] = useState<LearningMode>('chat');
    const [selectedTerm, setSelectedTerm] = useState<SelectedTerm | null>(null);
    const [showConfidenceModal, setShowConfidenceModal] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = () => setSelectedTerm(null);
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const startTopic = useCallback(async (
        stepIndex: number,
        plan: StudyPlanItem[],
        pSettings: PersonalizationSettings,
        mode: 'start_topic' | 'next_topic'
    ) => {
        if (!fileInfo) {
            setError("File info not found, cannot start topic.");
            return;
        }
        setMessages([]);
        setIsLoading(true);
        setError(null);
    
        const topic = plan[stepIndex];
        try {
            const responseContent = await generateResponse(fileInfo, [], '', mode, pSettings, topic);
            setMessages([{ role: 'model', content: responseContent, mode: 'chat' }]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Sorry, I ran into a problem starting the topic: ${errorMessage}`);
            const fallbackMessage = mode === 'start_topic'
                ? `Great! Let's start with our first topic: **${topic.title}**. The goal here is to ${topic.objective}. Ready to dive in? 😊`
                : `Awesome work! You've completed that topic. 🚀\n\nNow, let's move on to **${topic.title}**.`;
            setMessages([{ role: 'model', content: fallbackMessage, mode: 'chat' }]);
        } finally {
            setIsLoading(false);
        }
    }, [fileInfo]);
    
    const handleFileUpload = useCallback(async (dataUrl: string, name:string, type: string) => {
        setFileInfo({ dataUrl, name, type });
        setTutorState('personalization');
        setError(null);
        setStudyPlan([]);
        setMessages([]);
    }, []);

    const handlePersonalizationComplete = useCallback(async (settings: PersonalizationSettings) => {
        setPersonalization(settings);
        setTutorState('generating_plan');

        if (!fileInfo) {
            setError("File information is missing.");
            setTutorState('upload');
            return;
        }

        try {
            const plan = await generateStudyPlan(fileInfo, settings);
            const newStudyPlan = plan.map(item => ({ ...item, completed: false, confidence: null }));
            setStudyPlan(newStudyPlan);
            setCurrentStep(0);
            await startTopic(0, newStudyPlan, settings, 'start_topic');
            setTutorState('studying');
        } catch (err)
 {
            setError("Sorry, I couldn't create a study plan from this document. Please try another file.");
            setTutorState('upload');
        }
    }, [fileInfo, startTopic]);

    const sendMessage = useCallback(async (messageText: string, mode: LearningMode, context?: { topic: StudyPlanItem }) => {
        if (!messageText.trim() || !fileInfo || !personalization) return;
        
        const currentTopic = context?.topic ?? studyPlan[currentStep];

        const newMessages: Message[] = [...messages, { role: 'user', content: messageText }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);
        setError(null);
        setSelectedTerm(null);

        try {
            const chatHistory = newMessages.slice(0, -1);
            const responseContent = await generateResponse(fileInfo, chatHistory, messageText, mode, personalization, currentTopic);
            setMessages([...newMessages, { role: 'model', content: responseContent, mode: mode }]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Sorry, I ran into a problem: ${errorMessage}`);
            setMessages(newMessages); 
        } finally {
            setIsLoading(false);
        }
    }, [messages, fileInfo, personalization, studyPlan, currentStep]);
    
    const handleCompleteStep = useCallback(() => {
        setShowConfidenceModal(true);
    }, []);

    const handleConfidenceSubmit = (rating: number) => {
        setShowConfidenceModal(false);
        const newStudyPlan = [...studyPlan];
        newStudyPlan[currentStep].completed = true;
        newStudyPlan[currentStep].confidence = rating;
        setStudyPlan(newStudyPlan);

        const nextStep = currentStep + 1;
        if (nextStep < studyPlan.length) {
            setCurrentStep(nextStep);
            if(personalization) {
                startTopic(nextStep, newStudyPlan, personalization, 'next_topic');
            }
        } else {
            setTutorState('completed');
            const generateCompletionMessage = async () => {
                if (!fileInfo || !personalization) return;
                setIsLoading(true);
                try {
                    const responseContent = await generateResponse(fileInfo, messages, '', 'finish_plan', personalization);
                    setMessages(prev => [...prev, {role: 'model', content: responseContent}]);
                } catch (err) {
                    setMessages(prev => [...prev, {role: 'model', content: "🎉 You've completed the entire study plan! Amazing job. What would you like to do next?"}]);
                } finally {
                    setIsLoading(false);
                }
            };
            generateCompletionMessage();
        }
    };

    const handleTextSelect = (text: string, position: { top: number; left: number }) => {
        setSelectedTerm({ text, position });
    };

    const handleExplainTerm = () => {
        if (selectedTerm) {
            sendMessage(selectedTerm.text, 'explain_term');
        }
    };
    
    const handleActionRequest = useCallback((action: 'simplify' | 'example' | 'explain_again' | 'explain_like_12' | 'summarize' | 'diagram', messageContent: string) => {
        let requestText = '';
        let mode: LearningMode = 'chat';

        switch(action) {
            case 'simplify':
                requestText = "Can you simplify that for me, please?";
                break;
            case 'example':
                requestText = "Could you give me an example of that?";
                break;
            case 'explain_like_12':
                requestText = "Explain this to me simply, please.";
                break;
            case 'diagram': 
                requestText = "Can you create a diagram for this?";
                mode = 'diagram';
                break;
            case 'summarize':
                requestText = "Can you summarize that in 3 sentences?";
                break;
             case 'explain_again':
                requestText = "Can you explain that again in a different way?";
                break;
            default:
                // Fallback for any other actions that might be added
                // The switch is exhaustive, so `action` is of type `never`.
                // Casting to string to satisfy the compiler and keep the fallback logic.
                requestText = `Please ${(action as string).replace('_', ' ')} your last response.`;
        }
        sendMessage(requestText, mode);
    }, [sendMessage]);

    const resetSession = () => {
        setTutorState('upload');
        setFileInfo(null);
        setMessages([]);
        setStudyPlan([]);
        setError(null);
        setUserInput('');
        setActiveMode('chat');
        setSelectedTerm(null);
        setPersonalization(null);
    };

    if (tutorState === 'upload') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <FileUpload onFileUpload={handleFileUpload} fileName={fileInfo?.name || null} />
                 {error && (
                    <div className="mt-4 bg-red-100 border border-red-200 text-red-800 text-sm rounded-lg p-3 text-center max-w-xl">
                        {error}
                    </div>
                 )}
            </div>
        );
    }

    if (tutorState === 'personalization') {
        return <PersonalizationModal onComplete={handlePersonalizationComplete} />;
    }
    
    const progress = studyPlan.length > 0 ? (studyPlan.filter(s => s.completed).length / studyPlan.length) * 100 : 0;

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {selectedTerm && ( <ExplainPopup position={selectedTerm.position} onExplain={handleExplainTerm} /> )}
            <header className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onMenuClick} className="lg:hidden text-gray-500">
                        <MenuIcon className="h-6 w-6"/>
                    </button>
                    <div className="flex items-center gap-2">
                        <PaperclipIcon className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-gray-800 truncate max-w-[150px] sm:max-w-xs text-sm">{fileInfo?.name}</span>
                    </div>
                </div>
                <div className="w-1/3 mx-4 hidden sm:block">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <button onClick={resetSession} className="text-sm font-medium text-blue-500 hover:text-blue-600">
                    New Session
                </button>
            </header>
            
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                <aside className="w-full lg:max-w-sm xl:max-w-md bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-4 overflow-y-auto">
                    <StudyPlan plan={studyPlan} currentStep={currentStep} onStepSelect={setCurrentStep} />
                </aside>

                <main className="flex-1 flex flex-col bg-gray-100/50">
                    {tutorState === 'generating_plan' ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6">
                            <SparklesIcon className="h-12 w-12 text-blue-400 animate-pulse mb-4" />
                            <h2 className="text-xl font-semibold text-gray-700">Analyzing Document...</h2>
                            <p>Building your personalized study plan!</p>
                        </div>
                    ) : (
                    <>
                        {showConfidenceModal && <ConfidenceRater onSubmit={handleConfidenceSubmit} />}

                        <div ref={chatContainerRef} className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
                            {messages.map((msg, index) => (
                                <ChatMessage 
                                    key={index} 
                                    message={msg} 
                                    onTextSelect={handleTextSelect}
                                    onActionRequest={handleActionRequest}
                                />
                            ))}
                            {isLoading && (
                                 <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center animate-pulse"></div>
                                    <div className="bg-white rounded-xl rounded-bl-lg max-w-lg p-3.5 border border-gray-200">
                                       <div className="h-2 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            )}
                             {error && (
                                <div className="p-4 flex-shrink-0">
                                    <div className="bg-red-100 border border-red-200 text-red-800 text-sm rounded-lg p-3 text-center">
                                    {error}
                                    </div>
                                </div>
                             )}
                        </div>
                        
                        <div className="p-3 border-t border-gray-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
                            {tutorState === 'studying' && (
                                <>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && sendMessage(userInput, activeMode)}
                                            placeholder={MODE_PLACEHOLDERS[activeMode]}
                                            className="w-full pl-4 pr-12 py-2.5 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors"
                                            disabled={isLoading}
                                        />
                                        <button
                                            onClick={() => sendMessage(userInput, activeMode)}
                                            disabled={isLoading || !userInput.trim()}
                                            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 bg-blue-500 text-white rounded-lg flex items-center justify-center transition-opacity disabled:opacity-50 hover:bg-blue-600"
                                            aria-label="Send message"
                                        >
                                            <SendIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleCompleteStep}
                                        className="px-4 py-2.5 bg-green-500 text-white font-semibold rounded-xl flex items-center gap-2 hover:bg-green-600 transition-colors"
                                    >
                                        <span className="hidden sm:inline">Complete Topic</span>
                                        <ArrowRightIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                </>
                            )}
                            {tutorState === 'completed' && (
                                <div className="flex items-center justify-center gap-4">
                                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-100 transition-colors">
                                        <DocumentTextIcon className="h-5 w-5 text-blue-500"/>
                                        Review Notes
                                    </button>
                                    <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                                        <AcademicCapIcon className="h-5 w-5"/>
                                        Take Quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CourseTutor;
