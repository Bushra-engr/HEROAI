import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <SparklesIcon className="w-24 h-24 text-sky-500 dark:text-blue-500 mb-6" />
      <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Welcome to HEROAI</h1>
      <p className="text-xl text-slate-600 dark:text-gray-400 max-w-2xl">
        Your all-in-one AI toolkit powered by Google Gemini. Select a tool from the sidebar to begin your journey into the future of artificial intelligence.
      </p>
    </div>
  );
};

export default Dashboard;