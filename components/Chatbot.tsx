import React, { useState, useRef, useEffect } from 'react';
import { createChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import { ChatIcon } from './icons/ChatIcon';
import Loader from './Loader';
import { Chat } from '@google/genai';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = createChat();
    setMessages([{ role: 'model', text: 'Hello! How can I help you today?' }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: input });
      const modelMessage: ChatMessage = { role: 'model', text: response.text };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-slate-200 dark:border-gray-700">
      <div className="p-4 border-b border-slate-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
            <ChatIcon className="w-7 h-7 mr-3 text-sky-500 dark:text-blue-400" />
            Chatbot
        </h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-sky-600 text-white dark:bg-blue-600' : 'bg-slate-200 text-slate-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="max-w-xl px-4 py-2 rounded-lg bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-gray-200">
                <Loader />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-3 bg-slate-100 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-sky-500 dark:focus:ring-blue-500 focus:outline-none transition text-slate-900 dark:text-white disabled:opacity-50"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 disabled:bg-slate-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;