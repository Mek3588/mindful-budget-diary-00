
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";

interface AppPinDialogProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function AppPinDialog({ onClose, onSuccess }: AppPinDialogProps) {
  const [pin, setPin] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const DEFAULT_PIN = "1234";

  useEffect(() => {
    // Check if user has already entered PIN this session
    const hasEnteredPin = sessionStorage.getItem("has-entered-pin");
    
    // Only show the PIN dialog if they haven't entered it yet this session
    if (hasEnteredPin) {
      setIsOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [onSuccess]);

  const handlePinSubmit = () => {
    const storedPin = localStorage.getItem("security-pin") || DEFAULT_PIN;
    
    if (pin === storedPin) {
      // Store in sessionStorage instead of localStorage to make it last only for this session
      sessionStorage.setItem("has-entered-pin", "true");
      setIsOpen(false);
      toast.success("Welcome to your personal dashboard!");
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } else {
      toast.error("Incorrect PIN");
      setPin("");
    }
  };

  const handleDialogClose = (open: boolean) => {
    // Don't allow closing the dialog by clicking outside until PIN is entered
    if (!sessionStorage.getItem("has-entered-pin")) return;
    
    setIsOpen(open);
    
    // Call the onClose callback if provided and the dialog is closing
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30 text-white shadow-xl shadow-purple-500/10 rounded-xl">
        <DialogHeader>
          <div className="flex flex-col items-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full mb-4">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Security Check
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-gray-300 text-center">
            Please enter your security PIN to access your app.
          </p>
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <Input
                type="password"
                placeholder="Enter PIN"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="text-center text-xl tracking-widest bg-gray-700/70 border-purple-500/30 focus:border-purple-500/60 h-14 placeholder:text-gray-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePinSubmit();
                  }
                }}
              />
              <p className="text-center text-xs text-gray-400 mt-2">
                Default PIN: 1234
              </p>
            </div>
          </div>
          <Button 
            onClick={handlePinSubmit}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20 transition-all duration-300 transform hover:scale-[1.02]"
          >
            <ShieldCheck className="h-5 w-5 mr-2" />
            Unlock App
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
