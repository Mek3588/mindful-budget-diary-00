
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      <DialogContent className="bg-background border-border shadow-lg">
        <DialogHeader>
          <DialogTitle>
            {isChangingPin ? "Change PIN" : "Enter Security PIN"}
          </DialogTitle>
        </DialogHeader>
        {!isChangingPin ? (
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter current PIN"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="bg-background border-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePinSubmit();
                }
              }}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handlePinSubmit}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Submit
              </Button>
              <Button 
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="w-full"
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
              className="bg-background border-input"
            />
            <Input
              type="password"
              placeholder="Confirm PIN"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="bg-background border-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPin && confirmPin) {
                  handlePinChange();
                }
              }}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handlePinChange}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Change PIN
              </Button>
              <Button 
                onClick={() => setIsChangingPin(false)}
                variant="outline"
                className="w-full"
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
