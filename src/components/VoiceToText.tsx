
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceToTextProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
}

const VoiceToText = ({ onTranscript, placeholder = "Speak now..." }: VoiceToTextProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    // Create and configure speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript(finalTranscript || interimTranscript);
    };
    
    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      toast.error(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
    
    recognitionRef.current.onend = () => {
      if (isListening) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Error restarting speech recognition', e);
        }
      }
    };
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      if (transcript) {
        onTranscript(transcript);
      }
    } else {
      setTranscript("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition', error);
        toast.error("Could not start speech recognition");
      }
    }
  };

  return (
    <div className="flex flex-col items-start w-full">
      <div className="flex w-full items-center gap-2 mb-2">
        <Button 
          type="button" 
          variant={isListening ? "destructive" : "secondary"}
          size="sm" 
          onClick={toggleListening}
          disabled={!isSupported}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Start Voice Input
            </>
          )}
        </Button>
        
        {isListening && (
          <span className="text-sm text-muted-foreground flex items-center">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Listening...
          </span>
        )}
      </div>
      
      {isListening && transcript && (
        <div className="w-full p-3 mb-2 bg-muted rounded-md text-sm">
          {transcript || placeholder}
        </div>
      )}
      
      {!isSupported && (
        <p className="text-sm text-destructive">
          Speech recognition is not supported in your browser.
        </p>
      )}
    </div>
  );
};

export default VoiceToText;
