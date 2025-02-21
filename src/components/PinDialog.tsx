
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
  const [isOpen, setIsOpen] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    const hasEnteredPin = localStorage.getItem("has-entered-pin");
    if (!hasEnteredPin) {
      setIsOpen(true);
    }
  }, []);

  const handlePinSubmit = () => {
    const storedPin = localStorage.getItem("security-pin") || "1234";
    if (pin === storedPin) {
      localStorage.setItem("has-entered-pin", "true");
      setIsOpen(false);
      onSuccess();
      toast.success("PIN verified successfully!");
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
    setIsChangingPin(false);
    setNewPin("");
    setConfirmPin("");
    toast.success("PIN changed successfully!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isChangingPin ? "Change PIN" : "Enter Security PIN"}
          </DialogTitle>
        </DialogHeader>
        {!isChangingPin ? (
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handlePinSubmit}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Submit
              </Button>
              <Button 
                onClick={() => setIsChangingPin(true)}
                variant="outline"
                className="w-full border-purple-600 text-purple-600 hover:bg-purple-600/20"
              >
                Change PIN
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
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Input
              type="password"
              placeholder="Confirm PIN"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handlePinChange}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Change PIN
              </Button>
              <Button 
                onClick={() => setIsChangingPin(false)}
                variant="outline"
                className="w-full border-purple-600 text-purple-600 hover:bg-purple-600/20"
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
