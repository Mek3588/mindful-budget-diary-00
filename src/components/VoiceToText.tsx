
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Add TypeScript declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceToTextProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
}

const VoiceToText = ({ onTranscript, placeholder = "Speak now..." }: VoiceToTextProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");

  // Initialize the speech recognition on component mount
  useEffect(() => {
    // Check if browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure recognition settings
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    // Set up recognition event handlers
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
      
      // Update the transcript state with the current recognition results
      const currentTranscript = finalTranscript || interimTranscript;
      console.log("Transcript updated:", currentTranscript);
      setTranscript(currentTranscript);
      
      // If we have a final result, pass it to the parent component
      // Only pass new transcripts to avoid duplicates
      if (finalTranscript && finalTranscript !== finalTranscriptRef.current) {
        console.log("Final transcript:", finalTranscript);
        finalTranscriptRef.current = finalTranscript;
        onTranscript(finalTranscript);
      }
    };
    
    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setPermissionError(true);
        toast.error("Microphone access denied. Please allow microphone access to use voice input.");
      } else if (event.error === 'audio-capture') {
        toast.error("No microphone detected. Please connect a microphone and try again.");
      } else if (event.error === 'network') {
        toast.error("Network error occurred. Please check your internet connection.");
      } else if (event.error === 'aborted') {
        // This is expected when stopping, don't show error
        console.log("Recognition aborted");
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
      }
      
      setIsListening(false);
    };
    
    recognitionRef.current.onend = () => {
      console.log("Recognition ended, isListening:", isListening);
      
      // Only try to restart if we're still supposed to be listening
      if (isListening) {
        try {
          recognitionRef.current.start();
          console.log("Restarted recognition");
        } catch (e) {
          console.error('Error restarting speech recognition', e);
          setIsListening(false);
          toast.error("Failed to restart speech recognition");
        }
      }
    };
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition', e);
        }
      }
    };
  }, [isListening, onTranscript]);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      setIsInitializing(true);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionError(false);
      setIsInitializing(false);
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setPermissionError(true);
      setIsInitializing(false);
      toast.error("Microphone access is required for voice input.");
      return false;
    }
  };

  const toggleListening = async () => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }
    
    if (isListening) {
      // Stop listening
      try {
        console.log("Stopping recognition...");
        recognitionRef.current.stop();
        setIsListening(false);
        
        // Reset finalTranscriptRef when stopping
        finalTranscriptRef.current = "";
        
        if (transcript) {
          onTranscript(transcript);
        }
      } catch (error) {
        console.error('Error stopping speech recognition', error);
      }
    } else {
      // Start listening - first check/request microphone permission
      setTranscript("");
      
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        return;
      }
      
      try {
        console.log("Starting recognition...");
        recognitionRef.current.start();
        setIsListening(true);
        toast.success("Voice input started. Speak now...");
      } catch (error) {
        console.error('Error starting speech recognition', error);
        toast.error("Could not start speech recognition. Please try again.");
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
          disabled={!isSupported || isInitializing}
        >
          {isInitializing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Initializing...
            </>
          ) : isListening ? (
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
      
      {permissionError && (
        <div className="w-full p-3 mb-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>
            Microphone access is required. Please check your browser settings and allow microphone access.
          </span>
        </div>
      )}
      
      {!isSupported && (
        <p className="text-sm text-destructive flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          Speech recognition is not supported in your browser.
        </p>
      )}
    </div>
  );
};

export default VoiceToText;
