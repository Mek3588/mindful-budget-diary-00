
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PinDialog } from "@/components/PinDialog";
import { toast } from "sonner";

const Security = () => {
  const navigate = useNavigate();
  const [showPinDialog, setShowPinDialog] = useState(false);

  const handleSetPin = () => {
    setShowPinDialog(true);
  };

  const handlePinSuccess = () => {
    setShowPinDialog(false);
    // Clear session storage so the user has to enter the new PIN on next app start
    sessionStorage.removeItem("has-entered-pin");
    toast.success("PIN updated successfully. You'll need to enter it next time you open the app.");
  };

  const handleResetPin = () => {
    localStorage.removeItem("security-pin");
    sessionStorage.removeItem("has-entered-pin");
    toast.success("PIN has been reset to default (1234). You'll need to enter it next time you open the app.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                <h1 className="text-xl font-semibold">Security</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button onClick={handleSetPin}>Change PIN</Button>
              <Button 
                variant="outline" 
                onClick={handleResetPin}
                className="border-red-600 text-red-600 hover:bg-red-600/20"
              >
                Reset to Default PIN
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Default PIN: 1234
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mt-6 text-left">
              <h3 className="font-medium mb-2">About PIN Security</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your PIN protects access to the app and is required once per session. 
                The PIN is stored securely on your device and is not transmitted to any servers.
                If you forget your PIN, you can always reset it to the default (1234).
              </p>
            </div>
          </div>
        </Card>
      </main>

      {showPinDialog && <PinDialog onSuccess={handlePinSuccess} />}
    </div>
  );
};

export default Security;
