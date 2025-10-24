import React, { useState, useEffect } from 'react';
import { Tool } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import Chatbot from './components/Chatbot';
import ThinkingMode from './components/ThinkingMode';
import LiveChat from './components/LiveChat';
import AudioTranscriber from './components/AudioTranscriber';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>(Tool.Dashboard);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const renderContent = () => {
    switch (activeTool) {
      case Tool.ImageGenerator:
        return <ImageGenerator />;
      case Tool.ImageEditor:
        return <ImageEditor />;
      case Tool.AudioTranscriber:
        return <AudioTranscriber />;
      case Tool.Chatbot:
        return <Chatbot />;
      case Tool.ThinkingMode:
        return <ThinkingMode />;
      case Tool.LiveChat:
        return <LiveChat />;
      case Tool.Dashboard:
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 dark:bg-gray-900 dark:text-gray-100 font-sans">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} theme={theme} setTheme={setTheme} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;