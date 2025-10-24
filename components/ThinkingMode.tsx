import React, { useState } from 'react';
import { getDeepThought } from '../services/geminiService';
import Loader from './Loader';
import { BrainIcon } from './icons/BrainIcon';

const ThinkingMode: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!prompt) {
      setError('Please enter a complex query or problem.');
      return;
    }
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await getDeepThought(prompt);
      setResponse(res.text);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white flex items-center">
        <BrainIcon className="w-8 h-8 mr-3 text-sky-500 dark:text-blue-400" />
        Thinking Mode
      </h2>
      <p className="text-slate-500 dark:text-gray-400 mb-6">For your most complex queries. This mode uses Gemini 2.5 Pro with a maximum thinking budget to provide deep, analytical responses.</p>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6 border border-slate-200 dark:border-transparent">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a complex problem, a coding challenge, or a deep philosophical question..."
          className="w-full p-3 bg-slate-100 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-sky-500 dark:focus:ring-blue-500 focus:outline-none transition text-slate-900 dark:text-white"
          rows={6}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full bg-sky-600 hover:bg-sky-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-slate-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? <Loader /> : 'Engage Deep Thought'}
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-6 overflow-y-auto border border-slate-200 dark:border-transparent">
        {loading && (
          <div className="text-center">
            <Loader size="lg" />
            <p className="mt-4 text-slate-500 dark:text-gray-400">Analyzing your query... This may take a moment.</p>
          </div>
        )}
        {response && (
            <div className="prose dark:prose-invert max-w-none prose-p:text-slate-600 dark:prose-p:text-gray-300 prose-headings:text-slate-800 dark:prose-headings:text-white prose-strong:text-slate-900 dark:prose-strong:text-white" dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br />') }} />
        )}
        {!loading && !response && <p className="text-slate-500 dark:text-gray-500">The response will appear here.</p>}
      </div>
    </div>
  );
};

export default ThinkingMode;