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

// Format numbers for proper speech pronunciation
const formatNumberForSpeech = (value: number, language: string): string => {
  // Handle percentages
  if (value >= 0 && value <= 100) {
    if (language === 'ar') {
      // Format for Arabic speech
      // Convert 35% to "خمسة وثلاثون في المئة"
      return `${value} في المئة`;
    } else {
      // Format for English speech
      // Convert 35% to "thirty five percent"
      return `${value} percent`;
    }
  }
  
  // Handle decimal numbers for more natural-sounding speech
  if (value % 1 !== 0) {
    const decimalPart = value.toString().split('.')[1];
    if (decimalPart && decimalPart.length > 0) {
      if (language === 'ar') {
        // Arabic decimal format
        return value.toString().replace('.', ' فاصلة ');
      } else {
        // English decimal format
        return value.toString().replace('.', ' point ');
      }
    }
  }
  
  // Return regular numbers as-is
  return value.toString();
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
      // Arabic speech parameters - improved for better pronunciation
      utterance.pitch = 1.1;   // Higher pitch for clearer Arabic pronunciation
      utterance.rate = 0.85;   // Slower rate for better articulation of Arabic words
    } else {
      // English speech parameters
      utterance.pitch = 1.0;   // Natural pitch for English
      utterance.rate = 0.9;    // Slightly slower rate for clarity
    }
    
    // Pause briefly between phrases for better comprehension
    const utteranceText = utterance.text;
    if (utteranceText.includes(',') || utteranceText.includes('،') || utteranceText.includes('.') || utteranceText.includes('؟')) {
      utterance.text = utteranceText
        .replace(/,/g, ', ')
        .replace(/،/g, '، ')
        .replace(/\./g, '. ')
        .replace(/؟/g, '؟ ');
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

  const formatText = useCallback((text: string): string => {
    // Format any numbers in the text for better speech pronunciation
    // Look for number patterns followed by unit symbols or percentage
    return text.replace(/(\d+(\.\d+)?)(%|g|كجم|mg|kg)/g, (match, number, decimal, unit) => {
      const numValue = parseFloat(number);
      
      if (unit === '%' || unit === 'في المئة') {
        return formatNumberForSpeech(numValue, language) + (language === 'ar' ? ' في المئة' : ' percent');
      } else if (unit === 'g') {
        return formatNumberForSpeech(numValue, language) + (language === 'ar' ? ' جرام' : ' grams');
      } else if (unit === 'kg' || unit === 'كجم') {
        return formatNumberForSpeech(numValue, language) + (language === 'ar' ? ' كيلوجرام' : ' kilograms');
      } else if (unit === 'mg') {
        return formatNumberForSpeech(numValue, language) + (language === 'ar' ? ' ملليجرام' : ' milligrams');
      }
      
      return match;
    });
  }, [language]);

  // Enhanced speak function that formats text properly for speech
  const speakEnhanced = useCallback((text: string) => {
    const cleanText = stripMarkdown(text);
    const formattedText = formatText(cleanText);
    speak(formattedText);
  }, [speak, formatText]);

  return {
    speak: speakEnhanced,
    cancelSpeech,
    isSpeaking,
    voices,
    formatNumberForSpeech: (value: number) => formatNumberForSpeech(value, language)
  };
}
