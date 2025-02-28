
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function AppPinDialog() {
  const [pin, setPin] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const DEFAULT_PIN = "1234";

  useEffect(() => {
    // Check if user has already entered PIN this session
    const hasEnteredPin = sessionStorage.getItem("has-entered-pin");
    
    // Only show the PIN dialog if they haven't entered it yet this session
    if (!hasEnteredPin) {
      setIsOpen(true);
    }
  }, []);

  const handlePinSubmit = () => {
    const storedPin = localStorage.getItem("security-pin") || DEFAULT_PIN;
    
    if (pin === storedPin) {
      // Store in sessionStorage instead of localStorage to make it last only for this session
      sessionStorage.setItem("has-entered-pin", "true");
      setIsOpen(false);
      toast.success("Welcome to your personal dashboard!");
    } else {
      toast.error("Incorrect PIN");
      setPin("");
    }
  };

  // Prevent back navigation if PIN hasn't been entered
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!sessionStorage.getItem("has-entered-pin")) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Don't allow closing the dialog by clicking outside until PIN is entered
      if (!sessionStorage.getItem("has-entered-pin")) return;
      setIsOpen(open);
    }}>
      <DialogContent className="bg-background border-border shadow-lg">
        <DialogHeader>
          <DialogTitle>Enter PIN to Access Your App</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Please enter your security PIN to continue. Default PIN is 1234.
          </p>
          <Input
            type="password"
            placeholder="Enter PIN"
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
          <Button 
            onClick={handlePinSubmit}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
