import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';

// Function to strip markdown from text for speech
const stripMarkdown = (text: string): string => {
  // Remove headers (#, ##, etc.)
  let cleanText = text.replace(/#{1,6}\s+/g, '');
  
  // Remove bold/italic markers
  cleanText = cleanText.replace(/(\*\*|__)(.*?)\1/g, '$2'); // Bold
  cleanText = cleanText.replace(/(\*|_)(.*?)\1/g, '$2');    // Italic
  
  // Remove code blocks and inline code
  cleanText = cleanText.replace(/```[\s\S]*?```/g, '');
  cleanText = cleanText.replace(/`([^`]+)`/g, '$1');
  
  // Remove links but keep text
  cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove bullet points and numbered lists
  cleanText = cleanText.replace(/^\s*[-+*]\s+/gm, '');
  cleanText = cleanText.replace(/^\s*\d+\.\s+/gm, '');
  
  // Remove blockquotes
  cleanText = cleanText.replace(/^\s*>\s+/gm, '');
  
  // Remove horizontal rules
  cleanText = cleanText.replace(/^\s*[-*_]{3,}\s*$/gm, '');
  
  // Remove HTML tags
  cleanText = cleanText.replace(/<[^>]*>/g, '');
  
  // Replace multiple spaces and newlines with single ones
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  return cleanText;
};

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
    
    // Set specific language codes for better matching
    const langCode = language === 'ar' ? 'ar-SA' : 'en-US';
    
    // Try to find voices that exactly match the language code
    let matchingVoices = voices.filter(voice => voice.lang === langCode);
    
    // If no exact matches, try partial matches
    if (matchingVoices.length === 0) {
      matchingVoices = voices.filter(voice => voice.lang.startsWith(language));
    }
    
    // Preferred voices by name (these are common high-quality voices)
    const preferredVoiceNames = language === 'ar' 
      ? ['Laila', 'Tarik', 'Maged', 'Amira'] // Arabic preferred voices
      : ['Google UK English Female', 'Google US English', 'Samantha', 'Alex']; // English preferred voices
    
    // Try to find a preferred voice
    for (const name of preferredVoiceNames) {
      const preferredVoice = matchingVoices.find(voice => voice.name.includes(name));
      if (preferredVoice) {
        return preferredVoice;
      }
    }
    
    // Prefer native voice if available
    const nativeVoice = matchingVoices.find(voice => voice.localService);
    if (nativeVoice) {
      return nativeVoice;
    }
    
    // Otherwise, use any matching voice
    if (matchingVoices.length > 0) {
      return matchingVoices[0];
    }
    
    // If no matching voice, use any available voice that partially matches the language
    const fallbackVoices = voices.filter(voice => 
      language === 'ar' ? voice.lang.includes('ar') : voice.lang.includes('en')
    );
    
    if (fallbackVoices.length > 0) {
      return fallbackVoices[0];
    }
    
    // Absolute last resort - use default
    return voices[0];
  }, [voices, language]);

  const speak = useCallback((text: string) => {
    if (!speechSynthesis) {
      return;
    }
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Strip markdown from text before speaking
    const cleanText = stripMarkdown(text);
    
    // Create new utterance with clean text
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set language and voice
    utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    const voice = getVoice();
    if (voice) {
      utterance.voice = voice;
    }
    
    // Set voice parameters with language-specific adjustments
    utterance.volume = 1;
    
    if (language === 'ar') {
      // Arabic speech parameters
      utterance.pitch = 1.05;  // Slightly higher pitch for Arabic
      utterance.rate = 0.95;   // Slightly slower rate for Arabic
    } else {
      // English speech parameters
      utterance.pitch = 1.0;   // Natural pitch for English
      utterance.rate = 0.9;    // Slightly slower rate for clarity
    }
    
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
