
import React, { useRef, useCallback, useState } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileUpload: (dataUrl: string, name: string, type: string) => void;
  fileName: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, fileName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onFileUpload(dataUrl, file.name, file.type);
      };
      reader.readAsDataURL(file);
    }
  }, [onFileUpload]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
     if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        onFileUpload(dataUrl, file.name, file.type);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div 
      className={`w-full max-w-2xl bg-white border rounded-2xl shadow-sm transition-all duration-300 ${isDragging ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200/80'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
        <div className="p-8 text-center">
             <div 
                className="flex flex-col items-center justify-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".txt,.md,.pdf,.png,.jpg,.jpeg,.webp"
                />
                <div className="bg-gray-100 text-gray-600 p-3 rounded-full mb-4 ring-8 ring-gray-50">
                    <UploadIcon className="h-8 w-8" />
                </div>
                <p className="font-bold text-xl text-gray-800 tracking-tight">Studying just got smarter.</p>
                <p className="text-md text-gray-500 mt-2">
                    Drag & drop your course material here, or{' '}
                    <button onClick={handleButtonClick} className="font-semibold text-blue-500 hover:text-blue-600">
                        browse files
                    </button>
                    .
                </p>
                {fileName ? (
                  <p className="mt-4 bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                    Selected: {fileName}
                  </p>
                ) : (
                    <p className="text-sm text-gray-400 mt-3">Supports: PDF, PNG, JPG, TXT</p>
                )}
            </div>
        </div>
    </div>
  );
};