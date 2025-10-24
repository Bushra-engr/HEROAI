import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import Loader from './Loader';
import { ImageIcon } from './icons/ImageIcon';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const url = await generateImage(prompt);
      setImageUrl(url);
    } catch (err) {
      setError('Failed to generate image. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white flex items-center">
        <ImageIcon className="w-8 h-8 mr-3 text-sky-500 dark:text-blue-400" />
        Image Generator
      </h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6 border border-slate-200 dark:border-transparent">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A cinematic shot of a raccoon in a library, 4k, hyperrealistic"
          className="w-full p-3 bg-slate-100 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-sky-500 dark:focus:ring-blue-500 focus:outline-none transition text-slate-900 dark:text-white"
          rows={3}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 w-full bg-sky-600 hover:bg-sky-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-slate-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? <Loader /> : 'Generate Image'}
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 dark:border-transparent">
        {loading && (
          <div className="text-center">
            <Loader size="lg" />
            <p className="mt-4 text-slate-500 dark:text-gray-400">Generating your masterpiece...</p>
          </div>
        )}
        {imageUrl && <img src={imageUrl} alt="Generated" className="max-h-full max-w-full object-contain" />}
        {!loading && !imageUrl && <p className="text-slate-500 dark:text-gray-500">Your generated image will appear here</p>}
      </div>
    </div>
  );
};

export default ImageGenerator;