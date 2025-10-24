export enum Tool {
  Dashboard = 'DASHBOARD',
  ImageGenerator = 'IMAGE_GENERATOR',
  ImageEditor = 'IMAGE_EDITOR',
  Chatbot = 'CHATBOT',
  ThinkingMode = 'THINKING_MODE',
  LiveChat = 'LIVE_CHAT',
  AudioTranscriber = 'AUDIO_TRANSCRIBER',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Transcription {
  speaker: 'user' | 'model';
  text: string;
}