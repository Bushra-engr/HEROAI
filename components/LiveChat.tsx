import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Session } from '@google/genai';
import { MicIcon } from './icons/MicIcon';
import { Transcription } from '../types';
import { encode, decode, decodeAudioData } from '../utils/audio';

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

const LiveChat: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
    const [status, setStatus] = useState('Idle. Press Start to talk.');

    const sessionPromiseRef = useRef<Promise<Session> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

    const currentInputTranscription = useRef('');
    const currentOutputTranscription = useRef('');
    
    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();

    const startConversation = async () => {
        setIsListening(true);
        setStatus('Connecting to Gemini...');
        setTranscriptions([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('Connected. You can start talking now.');
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        handleMessage(message);
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live chat error:', e);
                        setStatus('Error occurred. Please try again.');
                        stopConversation();
                    },
                    onclose: (e: CloseEvent) => {
                        setStatus('Connection closed.');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                },
            });
        } catch (error) {
            console.error('Failed to start conversation:', error);
            setStatus('Could not access microphone.');
            setIsListening(false);
        }
    };
    
    const handleMessage = async (message: LiveServerMessage) => {
        if (message.serverContent?.outputTranscription) {
            currentOutputTranscription.current += message.serverContent.outputTranscription.text;
        }
        if (message.serverContent?.inputTranscription) {
            currentInputTranscription.current += message.serverContent.inputTranscription.text;
        }

        if (message.serverContent?.turnComplete) {
            const userText = currentInputTranscription.current.trim();
            const modelText = currentOutputTranscription.current.trim();
            setTranscriptions(prev => [
                ...prev, 
                ...(userText ? [{ speaker: 'user' as const, text: userText }] : []),
                ...(modelText ? [{ speaker: 'model' as const, text: modelText }] : [])
            ]);
            currentInputTranscription.current = '';
            currentOutputTranscription.current = '';
        }

        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio && outputAudioContextRef.current) {
            nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
            const source = outputAudioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContextRef.current.destination);
            source.addEventListener('ended', () => sources.delete(source));
            source.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
            sources.add(source);
        }

        if (message.serverContent?.interrupted) {
            for (const source of sources.values()) {
                source.stop();
                sources.delete(source);
            }
            nextStartTime = 0;
        }
    };

    const stopConversation = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (inputAudioContextRef.current) {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        setIsListening(false);
        setStatus('Idle. Press Start to talk.');
    };

    useEffect(() => {
        return () => {
            stopConversation();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white flex items-center">
                <MicIcon className="w-8 h-8 mr-3 text-sky-500 dark:text-blue-400" />
                Live Chat
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex-1 flex flex-col border border-slate-200 dark:border-transparent">
                <div className="mb-4 flex justify-between items-center">
                    <button
                        onClick={isListening ? stopConversation : startConversation}
                        className={`px-6 py-3 font-bold rounded-lg transition-colors duration-300 flex items-center text-white ${
                            isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
                        }`}
                    >
                        <MicIcon className="w-6 h-6 mr-2" />
                        {isListening ? 'Stop Conversation' : 'Start Conversation'}
                    </button>
                    <p className="text-slate-500 dark:text-gray-400">{status}</p>
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-gray-700 rounded-lg p-4 overflow-y-auto">
                    {transcriptions.map((t, i) => (
                        <p key={i} className={`mb-2 ${t.speaker === 'user' ? 'text-sky-700 dark:text-blue-300' : 'text-slate-800 dark:text-gray-200'}`}>
                            <span className="font-bold capitalize">{t.speaker}: </span>{t.text}
                        </p>
                    ))}
                    {!transcriptions.length && !isListening && (
                        <div className="flex items-center justify-center h-full text-slate-500 dark:text-gray-500">
                           <p>Conversation transcript will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveChat;