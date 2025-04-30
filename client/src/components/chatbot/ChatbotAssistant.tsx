import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Send, HelpCircle, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { useSpeech } from "@/hooks/useSpeech";
import { useLanguage } from "@/hooks/useLanguage";
import { ChatMessage } from "@shared/schema";

const ChatbotAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { speak, cancelSpeech } = useSpeech();
  const { language } = useLanguage();
  
  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 0,
      userId: 0,
      message: t("chatbot.welcome"),
      isUser: false,
      createdAt: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
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
      const response = await apiRequest("POST", "/api/chat", { message: input });
      const data = await response.json();
      
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
      toast({
        title: t("chatbot.error"),
        description: t("chatbot.errorDesc"),
        variant: "destructive"
      });
      
      // Add error message
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
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: t("speech.listening"),
        description: t("speech.listeningDesc")
      });
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const speechResult = event.results[0][0].transcript;
      setInput(speechResult);
      
      // Automatically send the message after a short delay
      setTimeout(() => {
        setIsListening(false);
        handleSendMessage();
      }, 500);
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toast({
        title: t("speech.error"),
        description: t("speech.errorDesc", { error: event.error }),
        variant: "destructive"
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-neutral-medium dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-3">
          <Lightbulb className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-xl font-bold">{t("chatbot.title")}</h3>
      </div>
      
      <div className="border border-neutral-medium dark:border-gray-600 rounded-lg mb-4 h-64 overflow-hidden p-4 bg-neutral-lightest dark:bg-gray-700">
        <ScrollArea className="h-full">
          <div className="flex flex-col space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-lg p-3 max-w-[80%] ${
                  msg.isUser 
                    ? "bg-neutral-medium dark:bg-gray-600 text-neutral-darkest dark:text-white rounded-tl-none" 
                    : "bg-primary text-white rounded-tr-none"
                }`}>
                  <p>{msg.message}</p>
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
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isListening || isLoading}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={startListening}
            disabled={isListening || isLoading}
            className="absolute left-2 rtl:right-2 rtl:left-auto top-1/2 transform -translate-y-1/2 text-primary hover:text-primary-dark transition-colors accessibility-focus"
            aria-label={t("chatbot.useMicrophone")}
          >
            <Mic className={`h-6 w-6 ${isListening ? "text-accent animate-pulse" : ""}`} />
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
      
      <div className="mt-4 text-sm text-neutral-dark flex items-center">
        <HelpCircle className="h-4 w-4 rtl:ml-1 ltr:mr-1" />
        {t("chatbot.suggestion")}
      </div>
    </div>
  );
};

export default ChatbotAssistant;
