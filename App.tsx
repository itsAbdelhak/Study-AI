
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import CourseTutor from './components/CourseTutor';
import CourseLibrary from './components/CourseLibrary';
import { BookOpenIcon } from './components/icons';
import { useAuth } from './lib/AuthContext';
import { AuthPage } from './components/auth/AuthPage';

export type View = 'tutor' | 'library' | 'schedules' | 'messages' | 'inbox' | 'analytics' | 'news' | 'settings';

const Placeholder: React.FC<{ view: string }> = ({ view }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
        <BookOpenIcon className="h-16 w-16 mb-4 text-slate-300"/>
        <h1 className="text-2xl font-bold text-slate-700">'{view.charAt(0).toUpperCase() + view.slice(1)}' Page</h1>
        <p>This is a placeholder page for demonstration.</p>
    </div>
);

const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('tutor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    const commonProps = { onMenuClick: () => setIsSidebarOpen(true) };
    switch(activeView) {
      case 'tutor':
        return <CourseTutor {...commonProps} />;
      case 'library':
        return <CourseLibrary {...commonProps} />;
      default:
        return <Placeholder view={activeView} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 lg:flex">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};


const App: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return <MainApp />;
};

export default App;