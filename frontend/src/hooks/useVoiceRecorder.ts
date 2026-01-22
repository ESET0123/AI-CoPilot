import { useState, useRef, useCallback, useEffect } from 'react';
import { transcribeApi } from '../services/api';

// Define types for Web Speech API since they might not be in the default TS types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognition;
    };
  }
}

export const useVoiceRecorder = (
  onTranscriptionComplete: (text: string) => void,
  onInterimTranscription?: (text: string) => void,
  method: string = 'google-webkit'
) => {
  console.log(`[VoiceRecorder] 🎤 Initialized with method: ${method}`);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    console.log(`[VoiceRecorder] 🎙️ Starting recording with method: ${method}`);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log(`[VoiceRecorder] ✅ Microphone access granted`);

      if (method === 'google-webkit') {
        console.log(`[VoiceRecorder] 🌐 Using Google Webkit (browser API)`);
        // 1. Setup Web Speech API for real-time results
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          finalTranscriptRef.current = '';

          recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscriptRef.current += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }

            if (onInterimTranscription) {
              onInterimTranscription(finalTranscriptRef.current + interimTranscript);
            }
          };

          recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('[VoiceRecorder] ❌ Speech recognition error:', event.error);
          };

          recognition.onend = () => {
            console.log(`[VoiceRecorder] 🏁 Speech recognition ended`);
          };

          recognition.start();
          recognitionRef.current = recognition;
          console.log(`[VoiceRecorder] 🎯 Speech recognition started`);
        }
      } else {
        console.log(`[VoiceRecorder] 📡 Using backend method: ${method}`);
      }

      // 2. Setup MediaRecorder for all methods (fallback/persistence)
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log(`[VoiceRecorder] ⏹️ MediaRecorder stopped, processing audio...`);
        // cleanup stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (method === 'google-webkit' && recognitionRef.current && finalTranscriptRef.current.trim()) {
          console.log(`[VoiceRecorder] 📝 Using browser transcription result`);
          onTranscriptionComplete(finalTranscriptRef.current);
        } else if (chunksRef.current.length > 0) {
          console.log(`[VoiceRecorder] 📤 Sending audio to backend for processing`);
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
          await handleTranscription(audioBlob, method);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log(`[VoiceRecorder] 🎬 Recording started`);
    } catch (err) {
      console.error('[VoiceRecorder] ❌ Error accessing microphone:', err);
      alert('Could not access microphone. Please ensure you have granted permission.');
    }
  }, [onInterimTranscription, onTranscriptionComplete, method]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleTranscription = async (blob: Blob, method: string) => {
    console.log(`[VoiceRecorder] 🔄 Starting backend transcription with method: ${method}`);
    console.log(`[VoiceRecorder] 📊 Audio blob size: ${blob.size} bytes`);
    
    setIsLoading(true);
    try {
      console.log(`[VoiceRecorder] 📡 Sending to backend: ${import.meta.env.VITE_API_URL}/api/transcribe`);
      
      const response = await transcribeApi.transcribeAudio(blob, method);
      
      console.log(`[VoiceRecorder] ✅ Backend transcription completed`);

      if (response.data.text) {
        console.log(`[VoiceRecorder] 📝 Transcription result: ${response.data.text.length} characters`);
        onTranscriptionComplete(response.data.text);
      }
    } catch (err) {
      console.error('[VoiceRecorder] ❌ Failed to transcribe audio:', err);
    } finally {
      setIsLoading(false);
      console.log(`[VoiceRecorder] 🏁 Transcription process finished`);
    }
  };

  return {
    isRecording,
    isLoading,
    startRecording,
    stopRecording,
  };
};
