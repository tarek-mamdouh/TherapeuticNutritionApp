import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Send, HelpCircle, Lightbulb, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useSpeech } from "@/hooks/useSpeech";
import { useLanguage } from "@/hooks/useLanguage";
import { ChatMessage } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

// Define the SpeechRecognition interfaces for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatbotAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { speak, cancelSpeech } = useSpeech();
  const { language, t } = useLanguage();
  
  // Initialize with welcome message and load chat history
  useEffect(() => {
    // Try to load chat history from localStorage
    try {
      const savedMessages = localStorage.getItem('chatHistory');
      let chatHistory: ChatMessage[] = [];
      
      if (savedMessages) {
        chatHistory = JSON.parse(savedMessages);
        
        // Only use saved history if it's valid
        if (Array.isArray(chatHistory) && chatHistory.length > 0) {
          // Add welcome message to the beginning if it's not there
          const hasWelcome = chatHistory.some(msg => !msg.isUser && msg.message.includes(t("chatbot.welcome")));
          
          if (!hasWelcome) {
            const welcomeMessage: ChatMessage = {
              id: Date.now() - 1000,
              userId: 0,
              message: t("chatbot.welcome"),
              isUser: false,
              createdAt: new Date()
            };
            chatHistory.unshift(welcomeMessage);
          }
          
          setMessages(chatHistory);
          return;
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
    
    // If no history or error, start with welcome message
    const welcomeMessage: ChatMessage = {
      id: 0,
      userId: 0,
      message: t("chatbot.welcome"),
      isUser: false,
      createdAt: new Date()
    };
    setMessages([welcomeMessage]);
  }, [t]);
  
  // Save messages to localStorage and scroll to bottom when messages change
  useEffect(() => {
    // Save to localStorage (limited to last 50 messages to prevent storage issues)
    if (messages.length > 0) {
      const recentMessages = messages.slice(-50);
      localStorage.setItem('chatHistory', JSON.stringify(recentMessages));
    }
    
    // Scroll to bottom of chat
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Cleanup effect for speech recognition
  useEffect(() => {
    return () => {
      // Clean up recording on unmount
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [recordingTimer]);
  
  const handleSendMessage = async () => {
    if (input.trim() === "") return;
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      userId: 0,
      message: input,
      isUser: true,
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/chat", { 
        message: input,
        language: language 
      });
      
      // Since our server always returns a 200 status with an answer property
      // (even for errors), we don't need to check response.ok
      const data = await response.json();
      
      if (!data.answer) {
        throw new Error("Invalid response from server");
      }
      
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        userId: 0,
        message: data.answer,
        isUser: false,
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Auto-read the bot's response
      speak(data.answer);
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Only show toast for unexpected errors (like network issues)
      toast({
        title: t("chatbot.error"),
        description: t("chatbot.errorDesc"),
        variant: "destructive"
      });
      
      // Add fallback error message
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        userId: 0,
        message: t("chatbot.errorMessage"),
        isUser: false,
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start listening when the button is pressed down (WhatsApp-style)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: t("speech.notSupported"),
        description: t("speech.notSupportedDesc"),
        variant: "destructive"
      });
      return;
    }
    
    // Cancel any ongoing speech before listening
    cancelSpeech();
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;
    
    // Store the recognition instance in ref
    recognitionRef.current = recognition;
    
    // Start a timer to show recording duration
    const timer = window.setInterval(() => {
      // This is just to update the UI, actual recording time is handled by the browser
    }, 100);
    setRecordingTimer(timer);
    
    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: t("speech.listening"),
        description: t("speech.listeningDesc")
      });
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Get the latest transcript
      const lastResultIndex = event.results.length - 1;
      const speechResult = event.results[lastResultIndex][0].transcript;
      setInput(speechResult);
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      stopRecording();
      
      if (event.error !== 'aborted') {
        toast({
          title: t("speech.error"),
          description: t("speech.errorDesc", { error: event.error }),
          variant: "destructive"
        });
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };
  
  // Stop listening when button is released but don't send the message automatically
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
    
    // Don't send the message automatically
    // User will need to click the Send button
  };
  
  // Function to clear chat history
  const clearChatHistory = () => {
    // Ask for confirmation before clearing
    if (window.confirm(t("chatbot.clearConfirm"))) {
      // Keep only the welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now(),
        userId: 0,
        message: t("chatbot.welcome"),
        isUser: false,
        createdAt: new Date()
      };
      
      setMessages([welcomeMessage]);
      
      // Clear localStorage
      localStorage.removeItem('chatHistory');
      
      toast({
        title: t("chatbot.historyCleared"),
        description: t("chatbot.historyClearedDesc")
      });
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-neutral-medium dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-3">
            <Lightbulb className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-xl font-bold">{t("chatbot.title")}</h3>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={clearChatHistory}
          className="text-neutral-dark hover:text-error transition-colors"
          title={t("chatbot.clearHistory")}
        >
          {t("chatbot.clearHistory")}
        </Button>
      </div>
      
      <div className="border border-neutral-medium dark:border-gray-600 rounded-lg mb-4 h-64 overflow-hidden p-4 bg-neutral-lightest dark:bg-gray-700">
        <ScrollArea className="h-full">
          <div className="flex flex-col space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.isUser ? "items-end" : "items-start"}`}>
                {/* Message bubble */}
                <div className={`rounded-lg p-3 max-w-[80%] ${
                  msg.isUser 
                    ? "bg-neutral-medium dark:bg-gray-600 text-neutral-darkest dark:text-white rounded-tl-none" 
                    : "bg-primary text-white rounded-tr-none"
                }`}>
                  {msg.isUser ? (
                    <p>{msg.message}</p>
                  ) : (
                    <div className="markdown-content">
                      <ReactMarkdown>
                        {msg.message}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                
                {/* Timestamp */}
                <div className="text-xs text-neutral-dark mt-1 opacity-70">
                  {format(new Date(), 'MMM d, h:mm a')}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-primary text-white rounded-lg rounded-tr-none p-3">
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            type="text"
            className="w-full px-4 py-3 pr-10 rounded-lg border border-neutral-medium dark:border-gray-600 dark:bg-gray-700 accessibility-focus"
            placeholder={t("chatbot.inputPlaceholder")}
            aria-label={t("chatbot.inputPlaceholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
            disabled={isListening || isLoading}
          />
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={startListening}
            onMouseUp={stopRecording}
            onMouseLeave={isListening ? stopRecording : undefined}
            onTouchStart={startListening}
            onTouchEnd={stopRecording}
            disabled={isLoading}
            className="absolute left-2 rtl:right-2 rtl:left-auto top-1/2 transform -translate-y-1/2 text-primary hover:text-primary-dark transition-colors accessibility-focus"
            aria-label={t("chatbot.holdToSpeak")}
          >
            {isListening ? (
              <StopCircle className="h-6 w-6 text-accent animate-pulse" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
        </div>
        
        <Button
          className="sm:w-auto w-full flex items-center justify-center accessibility-focus"
          onClick={handleSendMessage}
          disabled={input.trim() === "" || isLoading}
        >
          <Send className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
          {t("chatbot.send")}
        </Button>
      </div>
      
      <div className="mt-4 text-sm text-neutral-dark">
        <div className="flex items-center mb-2">
          <HelpCircle className="h-4 w-4 rtl:ml-1 ltr:mr-1" />
          {t("chatbot.suggestion")}
        </div>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button 
            onClick={() => {
              const suggestion = language === 'ar' 
                ? 'ما هي الأطعمة المناسبة لمرضى السكري؟' 
                : 'What foods are suitable for diabetics?';
              setInput(suggestion);
            }}
            className="text-left text-primary hover:text-primary-dark px-2 py-1 rounded-md hover:bg-neutral-lightest dark:hover:bg-gray-700 transition-colors"
          >
            {language === 'ar' ? 'ما هي الأطعمة المناسبة لمرضى السكري؟' : 'What foods are suitable for diabetics?'}
          </button>
          <button 
            onClick={() => {
              const suggestion = language === 'ar' 
                ? 'كيف يمكنني خفض نسبة السكر في الدم بعد الوجبات؟' 
                : 'How can I lower my blood sugar after meals?';
              setInput(suggestion);
            }}
            className="text-left text-primary hover:text-primary-dark px-2 py-1 rounded-md hover:bg-neutral-lightest dark:hover:bg-gray-700 transition-colors"
          >
            {language === 'ar' ? 'كيف يمكنني خفض نسبة السكر في الدم بعد الوجبات؟' : 'How can I lower my blood sugar after meals?'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotAssistant;
