
import React from 'react';
import { BookOpenIcon, UploadIcon, MenuIcon } from './icons';

interface CourseLibraryProps {
    onMenuClick: () => void;
}

const CourseCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-lg hover:-translate-y-1 transition-all">
    <div className="flex items-center gap-4 mb-3">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            <BookOpenIcon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
    </div>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </div>
);

const CourseLibrary: React.FC<CourseLibraryProps> = ({ onMenuClick }) => {
  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-8">
       <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="flex items-center gap-4">
             <button onClick={onMenuClick} className="lg:hidden text-slate-500">
                <MenuIcon className="h-6 w-6"/>
            </button>
            <div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Course Library</h1>
                <p className="text-lg text-slate-600 mt-1">
                    Browse our curated collection of courses or upload your own.
                </p>
            </div>
        </div>
        <button
            className="mt-4 sm:mt-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-white bg-blue-500 rounded-xl shadow-sm hover:bg-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
            <UploadIcon className="h-5 w-5" />
            Upload Course
        </button>
      </header>
      
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <CourseCard title="Introduction to Python" description="Learn the fundamentals of Python programming, from variables to functions." />
            <CourseCard title="History of Ancient Rome" description="Explore the rise and fall of the Roman Empire, its culture, and its leaders." />
            <CourseCard title="Calculus 101" description="A beginner-friendly introduction to limits, derivatives, and integrals." />
            <CourseCard title="Digital Marketing Basics" description="Understand the core concepts of SEO, SEM, and social media marketing." />
            <CourseCard title="Graphic Design Principles" description="Learn about color theory, typography, and layout to create stunning visuals." />
            <CourseCard title="Introduction to AI" description="Get a high-level overview of Artificial Intelligence and its applications." />
        </div>
      </main>
    </div>
  );
};

export default CourseLibrary;