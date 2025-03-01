
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceToTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isTextarea?: boolean;
}

const VoiceToTextInput = ({
  value,
  onChange,
  placeholder = "Type or use voice input...",
  className = "",
  isTextarea = false
}: VoiceToTextInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure recognition
    if (recognitionRef.current) {
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setIsLoading(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsLoading(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setIsLoading(false);
        toast.error("Voice recognition failed. Please try again.");
      };
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        
        onChange(value + ' ' + transcript);
      };
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        
        if (isListening) {
          recognitionRef.current.stop();
        }
      }
    };
  }, [value, onChange]);

  const toggleListening = () => {
    if (!isSupported) {
      toast.error("Voice recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsLoading(true);
      recognitionRef.current?.start();
      toast.info("Listening... Speak now");
    }
  };

  const InputComponent = isTextarea ? Textarea : Input;

  return (
    <div className="relative">
      <InputComponent
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`pr-10 ${className}`}
      />
      {isSupported && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleListening}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-4 w-4 text-red-500" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};

export default VoiceToTextInput;
