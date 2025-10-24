import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import Loader from './Loader';
import { VideoIcon } from './icons/VideoIcon';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // The `aistudio` object may not be available immediately.
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      } else {
        // Retry if aistudio is not yet loaded
        setTimeout(checkKey, 500);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume selection is successful to avoid race conditions.
      setApiKeySelected(true);
      setError(null);
    } catch (e) {
      console.error("Error opening key selector:", e);
      setError("Could not open the API key selector. Please try again.");
    }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    try {
      const url = await generateVideo(prompt, aspectRatio, setLoadingMessage);
      setVideoUrl(url);
    } catch (err: any) {
       if (err.message && err.message.includes("not found")) {
         setError("API Key not valid. Please select a valid key to use this feature.");
         setApiKeySelected(false);
       } else {
         setError('Failed to generate video. Please try again.');
         console.error(err);
       }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const renderContent = () => {
    if (!apiKeySelected) {
      return (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-transparent">
          <h3 className="text-xl font-bold mb-4">API Key Required</h3>
          <p className="text-slate-600 dark:text-gray-400 mb-6">
            Video generation with Veo requires you to select a Google AI Studio API key. 
            Billing is enabled on the underlying Google Cloud project.
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sky-500 dark:text-blue-400 hover:underline ml-1">Learn more</a>.
          </p>
          <button
            onClick={handleSelectKey}
            className="bg-sky-600 hover:bg-sky-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-300"
          >
            Select API Key
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6 border border-slate-200 dark:border-transparent">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A majestic lion roaring on a cliff at sunset, cinematic 8k"
            className="w-full p-3 bg-slate-100 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-sky-500 dark:focus:ring-blue-500 focus:outline-none transition text-slate-900 dark:text-white"
            rows={3}
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <span className="font-medium text-slate-700 dark:text-gray-300">Aspect Ratio:</span>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="aspectRatio" value="16:9" checked={aspectRatio === '16:9'} onChange={() => setAspectRatio('16:9')} className="form-radio text-sky-600 dark:text-blue-500 bg-slate-200 dark:bg-gray-600"/>
                    <span className="text-slate-800 dark:text-gray-200">16:9 (Landscape)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="aspectRatio" value="9:16" checked={aspectRatio === '9:16'} onChange={() => setAspectRatio('9:16')} className="form-radio text-sky-600 dark:text-blue-500 bg-slate-200 dark:bg-gray-600"/>
                    <span className="text-slate-800 dark:text-gray-200">9:16 (Portrait)</span>
                </label>
            </div>
            <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 disabled:bg-slate-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
            >
            {loading ? <Loader /> : 'Generate Video'}
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 dark:border-transparent">
          {loading && (
            <div className="text-center p-4">
              <Loader size="lg" />
              <p className="mt-4 text-slate-500 dark:text-gray-400 font-medium">Generating your video...</p>
              <p className="mt-2 text-slate-400 dark:text-gray-500 text-sm">{loadingMessage}</p>
            </div>
          )}
          {videoUrl && <video src={videoUrl} controls autoPlay muted className="max-h-full max-w-full" />}
          {!loading && !videoUrl && <p className="text-slate-500 dark:text-gray-500">Your generated video will appear here</p>}
        </div>
      </>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white flex items-center">
        <VideoIcon className="w-8 h-8 mr-3 text-sky-500 dark:text-blue-400" />
        Video Generator
      </h2>
      {renderContent()}
    </div>
  );
};

export default VideoGenerator;