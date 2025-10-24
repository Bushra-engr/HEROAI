import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../services/geminiService';
import Loader from './Loader';
import { AudioWaveIcon } from './icons/AudioWaveIcon';
import { MicIcon } from './icons/MicIcon';

const AudioTranscriber: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setIsRecording(true);
      setError(null);
      setTranscript(null);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            const result = await transcribeAudio(base64Audio, audioBlob.type);
            setTranscript(result);
          } catch (err) {
            setError('Failed to transcribe audio. Please try again.');
            console.error(err);
          } finally {
            setLoading(false);
          }
        };
      };

      recorder.start();
    } catch (err) {
      setError('Microphone access was denied. Please enable it in your browser settings.');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white flex items-center">
        <AudioWaveIcon className="w-8 h-8 mr-3 text-sky-500 dark:text-blue-400" />
        Audio Transcriber
      </h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6 border border-slate-200 dark:border-transparent text-center">
        <p className="text-slate-600 dark:text-gray-400 mb-4">
          {isRecording ? 'Recording in progress... Click stop when you are finished.' : 'Click the button to start recording your audio.'}
        </p>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
          className={`px-8 py-4 font-bold rounded-full transition-colors duration-300 flex items-center text-white mx-auto ${
            isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-sky-600 hover:bg-sky-700 dark:bg-blue-600 dark:hover:bg-blue-700'
          }`}
        >
          <MicIcon className="w-6 h-6 mr-3" />
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-6 overflow-y-auto border border-slate-200 dark:border-transparent">
        {loading && (
          <div className="text-center">
            <Loader size="lg" />
            <p className="mt-4 text-slate-500 dark:text-gray-400">Transcribing audio...</p>
          </div>
        )}
        {transcript && (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Transcription Result:</h3>
                <p className="text-slate-600 dark:text-gray-300 whitespace-pre-wrap">{transcript}</p>
            </div>
        )}
        {!loading && !transcript && <p className="text-slate-500 dark:text-gray-500 text-center">Your transcript will appear here.</p>}
      </div>
    </div>
  );
};

export default AudioTranscriber;