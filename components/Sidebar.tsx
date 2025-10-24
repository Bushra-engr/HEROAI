import React from 'react';
import { Tool } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ImageIcon } from './icons/ImageIcon';
import { EditIcon } from './icons/EditIcon';
import { ChatIcon } from './icons/ChatIcon';
import { BrainIcon } from './icons/BrainIcon';
import { MicIcon } from './icons/MicIcon';
import ThemeToggle from './ThemeToggle';
import { AudioWaveIcon } from './icons/AudioWaveIcon';

interface SidebarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const NavItem: React.FC<{
  tool: Tool;
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  icon: React.ReactNode;
  label: string;
}> = ({ tool, activeTool, setActiveTool, icon, label }) => {
  const isActive = activeTool === tool;
  return (
    <button
      onClick={() => setActiveTool(tool)}
      className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-sky-100 text-sky-700 dark:bg-blue-600 dark:text-white'
          : 'text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool, theme, setTheme }) => {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 p-4 flex flex-col border-r border-slate-200 dark:border-gray-700">
      <div className="flex items-center mb-8">
        <SparklesIcon className="w-8 h-8 text-sky-500 dark:text-blue-400" />
        <h1 className="text-2xl font-bold ml-2 text-slate-900 dark:text-white">HEROAI</h1>
      </div>
      <nav className="flex flex-col space-y-2">
        <NavItem
            tool={Tool.ImageGenerator}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            icon={<ImageIcon className="w-6 h-6" />}
            label="Image Generator"
        />
        <NavItem
            tool={Tool.ImageEditor}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            icon={<EditIcon className="w-6 h-6" />}
            label="Image Editor"
        />
        <NavItem
            tool={Tool.AudioTranscriber}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            icon={<AudioWaveIcon className="w-6 h-6" />}
            label="Audio Transcriber"
        />
        <NavItem
            tool={Tool.Chatbot}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            icon={<ChatIcon className="w-6 h-6" />}
            label="Chatbot"
        />
        <NavItem
            tool={Tool.ThinkingMode}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            icon={<BrainIcon className="w-6 h-6" />}
            label="Thinking Mode"
        />
        <NavItem
            tool={Tool.LiveChat}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            icon={<MicIcon className="w-6 h-6" />}
            label="Live Chat"
        />
      </nav>
      <div className="mt-auto flex justify-between items-center">
        <div className="text-center text-slate-500 dark:text-gray-500 text-sm">
          <p>Powered by Google Gemini</p>
        </div>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
    </aside>
  );
};

export default Sidebar;