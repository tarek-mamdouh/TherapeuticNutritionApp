import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSynthesis(window.speechSynthesis);
      
      // Load voices when they're available
      const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      
      // Some browsers load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Try to load voices synchronously (for Firefox)
      loadVoices();
      
      // Cleanup
      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const getVoice = useCallback(() => {
    if (!voices.length) {
      return null;
    }
    
    const langCode = language === 'ar' ? 'ar' : 'en';
    
    // Try to find a voice that matches the current language
    const matchingVoices = voices.filter(voice => voice.lang.startsWith(langCode));
    
    // Prefer native voice if available
    const nativeVoice = matchingVoices.find(voice => voice.localService);
    if (nativeVoice) {
      return nativeVoice;
    }
    
    // Otherwise, use any matching voice
    if (matchingVoices.length > 0) {
      return matchingVoices[0];
    }
    
    // If no matching voice, use default
    return voices[0];
  }, [voices, language]);

  const speak = useCallback((text: string) => {
    if (!speechSynthesis) {
      return;
    }
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language and voice
    utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    const voice = getVoice();
    if (voice) {
      utterance.voice = voice;
    }
    
    // Set voice parameters
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
    
    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      toast({
        title: 'Speech Error',
        description: 'There was an error while trying to speak the text',
        variant: 'destructive'
      });
    };
    
    // Speak the text
    speechSynthesis.speak(utterance);
  }, [speechSynthesis, language, getVoice, toast]);

  const cancelSpeech = useCallback(() => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [speechSynthesis]);

  return {
    speak,
    cancelSpeech,
    isSpeaking,
    voices,
  };
}
