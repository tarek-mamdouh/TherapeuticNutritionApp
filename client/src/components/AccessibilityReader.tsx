import React, { useEffect } from 'react';
import { useSpeech } from '@/hooks/useSpeech';
import { useUser } from '@/contexts/UserContext';

interface AccessibilityReaderProps {
  children: React.ReactNode;
}

/**
 * Component that adds automatic screen reading for users with special needs
 * Wraps the application to provide accessibility features
 */
const AccessibilityReader: React.FC<AccessibilityReaderProps> = ({ children }) => {
  const { hasSpecialNeeds } = useUser();
  
  // Use the speech hook with autoRead enabled if user has special needs
  const { speak } = useSpeech(hasSpecialNeeds);
  
  // Effect to announce the page title when it changes for special needs users
  useEffect(() => {
    if (hasSpecialNeeds) {
      // Small delay to allow screen to render fully
      const timer = setTimeout(() => {
        const title = document.title;
        if (title) {
          speak(title);
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [hasSpecialNeeds, speak, window.location.pathname]);
  
  return <>{children}</>;
};

export default AccessibilityReader;