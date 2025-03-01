
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KeyRound, ShieldCheck } from "lucide-react";

interface PinDialogProps {
  onSuccess: () => void;
}

export function PinDialog({ onSuccess }: PinDialogProps) {
  const [pin, setPin] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const DEFAULT_PIN = "1234";

  useEffect(() => {
    // Check if there's a PIN set in localStorage, if not, use the default
    if (!localStorage.getItem("security-pin")) {
      localStorage.setItem("security-pin", DEFAULT_PIN);
    }
  }, []);

  const handlePinSubmit = () => {
    const storedPin = localStorage.getItem("security-pin") || DEFAULT_PIN;
    if (pin === storedPin) {
      setIsChangingPin(true);
      setPin("");
    } else {
      toast.error("Incorrect PIN");
      setPin("");
    }
  };

  const handlePinChange = () => {
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      toast.error("PIN must be 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    
    localStorage.setItem("security-pin", newPin);
    // Clear session storage so the user has to enter the new PIN on next app start
    sessionStorage.removeItem("has-entered-pin");
    setIsOpen(false);
    onSuccess();
    toast.success("PIN changed successfully!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Don't allow closing the dialog by clicking outside
      if (!open) return;
      setIsOpen(open);
    }}>
      <DialogContent className="bg-gray-900 border-purple-500/30 text-white shadow-xl shadow-purple-500/10 rounded-xl">
        <DialogHeader>
          <div className="flex flex-col items-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full mb-4">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              {isChangingPin ? "Change PIN" : "Enter Security PIN"}
            </DialogTitle>
          </div>
        </DialogHeader>
        {!isChangingPin ? (
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter current PIN"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-center text-xl tracking-widest bg-gray-700 border-purple-500/30 focus:border-purple-500/60 h-14 placeholder:text-gray-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePinSubmit();
                }
              }}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handlePinSubmit}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20 transition-all duration-300"
              >
                <ShieldCheck className="h-5 w-5 mr-2" />
                Submit
              </Button>
              <Button 
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="w-full border-purple-500/30 hover:bg-purple-500/10 text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="New PIN"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="text-center text-xl tracking-widest bg-gray-700 border-purple-500/30 focus:border-purple-500/60 h-14 placeholder:text-gray-500"
            />
            <Input
              type="password"
              placeholder="Confirm PIN"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="text-center text-xl tracking-widest bg-gray-700 border-purple-500/30 focus:border-purple-500/60 h-14 placeholder:text-gray-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPin && confirmPin) {
                  handlePinChange();
                }
              }}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handlePinChange}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20 transition-all duration-300"
              >
                <ShieldCheck className="h-5 w-5 mr-2" />
                Change PIN
              </Button>
              <Button 
                onClick={() => setIsChangingPin(false)}
                variant="outline"
                className="w-full border-purple-500/30 hover:bg-purple-500/10 text-white"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
