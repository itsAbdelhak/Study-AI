
import React, { useMemo, useState } from 'react';
import { LogoIcon, LightBulbIcon, SparklesIcon, BookOpenIcon, ChildIcon, DocumentTextIcon, DiagramIcon } from './icons';
import { MermaidDiagram } from './MermaidDiagram';
import { LearningMode } from './LearningTools';

interface ChatMessageProps {
  message: {
    role: 'user' | 'model';
    content: string;
    mode?: LearningMode;
  };
  onTextSelect: (selectedText: string, position: { top: number; left: number }) => void;
  onActionRequest: (action: 'simplify' | 'example' | 'explain_again' | 'explain_like_12' | 'summarize' | 'diagram', messageContent: string) => void;
}

const renderTextWithBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const InteractiveCheckboxListItem: React.FC<{ text: string }> = ({ text }) => {
    const [isChecked, setIsChecked] = useState(false);
    return (
        <li className="flex items-center gap-3 cursor-pointer" onClick={() => setIsChecked(!isChecked)}>
            <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 flex-shrink-0 transition-colors ${isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
               {isChecked && <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
            </div>
            <span className={`transition-colors ${isChecked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{renderTextWithBold(text)}</span>
        </li>
    );
};

const parseMarkdown = (markdown: string) => {
  const jsxElements: React.ReactNode[] = [];
  const lines = markdown.split('\n');
  
  let inMermaidBlock = false;
  let mermaidContent = '';

  let listType: 'ul' | 'ol' | null = null;
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ul') {
        jsxElements.push(<ul key={`ul-${jsxElements.length}`} className="list-disc space-y-2 pl-5">{currentList}</ul>);
      } else if (listType === 'ol') {
        jsxElements.push(<ol key={`ol-${jsxElements.length}`} className="list-decimal space-y-2 pl-5">{currentList}</ol>);
      }
      currentList = [];
      listType = null;
    }
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```mermaid')) {
      flushList();
      inMermaidBlock = true;
      mermaidContent = '';
      return;
    }
    if (line.trim() === '```' && inMermaidBlock) {
      inMermaidBlock = false;
      jsxElements.push(<MermaidDiagram key={`mermaid-${jsxElements.length}`} chart={mermaidContent} />);
      return;
    }
    if (inMermaidBlock) {
      mermaidContent += line + '\n';
      return;
    }

    if (line.startsWith('# ')) {
      flushList();
      jsxElements.push(<h1 key={index} className="text-2xl font-semibold mt-4 mb-2">{line.substring(2)}</h1>);
      return;
    }

    if (line.match(/^\* \[\s?\] /)) {
        if (listType !== 'ul') flushList();
        listType = 'ul'; // Use UL as a container for custom list items
        currentList.push(
            <InteractiveCheckboxListItem key={index} text={line.substring(5)} />
        );
        return;
    }

    if (line.startsWith('* ')) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      currentList.push(<li key={index}>{renderTextWithBold(line.substring(2))}</li>);
      return;
    }
    
    if (line.match(/^\d+\. /)) {
        if (listType !== 'ol') flushList();
        listType = 'ol';
        currentList.push(<li key={index}>{renderTextWithBold(line.replace(/^\d+\. /, ''))}</li>);
        return;
    }

    if (line.trim() !== '') {
      flushList();
      jsxElements.push(<p key={index}>{renderTextWithBold(line)}</p>);
    } else {
      flushList();
    }
  });
  
  // Special handling for checklists which are ULs
  if (currentList.length > 0 && lines.some(l => l.match(/^\* \[\s?\] /))) {
    jsxElements.push(<ul key={`ul-${jsxElements.length}`} className="space-y-2">{currentList}</ul>);
    currentList = [];
  } else {
    flushList();
  }
  
  return jsxElements;
};

const ActionButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string }> = ({ onClick, icon, label }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-1.5 self-start px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium transition-all hover:bg-gray-200 border border-gray-200/80"
    >
        {icon}
        {label}
    </button>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onTextSelect, onActionRequest }) => {
  const contentElements = useMemo(() => parseMarkdown(message.content), [message.content]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      onTextSelect(selection.toString().trim(), {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  };

  const showActionButtons = message.role === 'model' && contentElements.length > 0 && message.mode !== 'diagram';

  if (message.role === 'user') {
    return (
      <div className="flex justify-end ml-10">
        <div className="bg-blue-500 text-white rounded-xl rounded-br-lg max-w-lg p-3 shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mr-10">
      <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
        <LogoIcon className="h-5 w-5 text-gray-600" />
      </div>
      <div className="flex flex-col items-start gap-2 w-full">
        <div 
          className="bg-white text-gray-800 rounded-xl rounded-bl-lg max-w-2xl p-3.5 border border-gray-200/60 prose prose-slate max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 w-full shadow-sm"
          onMouseUp={handleMouseUp}
          >
          {contentElements}
        </div>
        {showActionButtons && (
            <div className="flex items-center gap-1.5 flex-wrap">
                <ActionButton 
                    onClick={() => onActionRequest('simplify', message.content)} 
                    icon={<SparklesIcon className="h-3.5 w-3.5 text-purple-500" />} 
                    label="Simplify"
                />
                <ActionButton 
                    onClick={() => onActionRequest('example', message.content)} 
                    icon={<BookOpenIcon className="h-3.5 w-3.5 text-yellow-500" />} 
                    label="Example"
                />
                <ActionButton 
                    onClick={() => onActionRequest('explain_like_12', message.content)} 
                    icon={<ChildIcon className="h-3.5 w-3.5 text-green-500" />} 
                    label="Explain Simply"
                />
                <ActionButton 
                    onClick={() => onActionRequest('diagram', message.content)} 
                    icon={<DiagramIcon className="h-3.5 w-3.5 text-orange-500" />} 
                    label="Diagram"
                />
            </div>
        )}
      </div>
    </div>
  );
};