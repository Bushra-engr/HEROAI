import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import Loader from './Loader';
import { EditIcon } from './icons/EditIcon';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    base64: await base64EncodedDataPromise,
    mimeType: file.type,
  };
};

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setOriginalImage(URL.createObjectURL(file));
      setEditedImage(null);
      setError(null);
    }
  };

  const handleEdit = useCallback(async () => {
    if (!prompt) {
      setError('Please enter an editing instruction.');
      return;
    }
    if (!imageFile) {
        setError('Please upload an image to edit.');
        return;
    }
    setLoading(true);
    setError(null);
    setEditedImage(null);
    try {
      const { base64, mimeType } = await fileToGenerativePart(imageFile);
      const url = await editImage(prompt, base64, mimeType);
      setEditedImage(url);
    } catch (err) {
      setError('Failed to edit image. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [prompt, imageFile]);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white flex items-center">
        <EditIcon className="w-8 h-8 mr-3 text-sky-500 dark:text-blue-400" />
        Image Editor
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col border border-slate-200 dark:border-transparent">
          <label htmlFor="image-upload" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Upload Image</label>
          <input 
            id="image-upload"
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 dark:file:bg-blue-50 dark:file:text-blue-700 dark:hover:file:bg-blue-100"
          />
          <div className="mt-4 flex-1 bg-slate-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
            {originalImage ? <img src={originalImage} alt="Original" className="max-h-full max-w-full object-contain p-2" /> : <p className="text-slate-500 dark:text-gray-500">Image preview</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col border border-slate-200 dark:border-transparent">
          <label htmlFor="prompt-input" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Editing Instructions</label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Add a retro filter, or remove the person in the background"
            className="w-full p-3 bg-slate-100 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-sky-500 dark:focus:ring-blue-500 focus:outline-none transition text-slate-900 dark:text-white mb-4"
            rows={3}
          />
          <button
            onClick={handleEdit}
            disabled={loading || !originalImage}
            className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-slate-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center mb-4"
          >
            {loading ? <Loader /> : 'Apply Edit'}
          </button>
           {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="flex-1 bg-slate-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
            {loading && <div className="text-center"><Loader size="lg" /><p className="mt-4 text-slate-500 dark:text-gray-400">Editing in progress...</p></div>}
            {editedImage && <img src={editedImage} alt="Edited" className="max-h-full max-w-full object-contain p-2" />}
            {!loading && !editedImage && <p className="text-slate-500 dark:text-gray-500">Edited image will appear here</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;