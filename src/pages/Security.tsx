
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Lock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PinDialog } from "@/components/PinDialog";
import { toast } from "sonner";

const Security = () => {
  const navigate = useNavigate();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [protectedRoutes, setProtectedRoutes] = useState<string[]>([]);

  // Available routes that can be protected
  const routes = [
    { id: "diary", label: "Diary" },
    { id: "budget", label: "Budget" },
    { id: "notes", label: "Notes" },
    { id: "calendar", label: "Calendar" },
  ];

  useEffect(() => {
    // Load protected routes from localStorage
    const savedRoutes = localStorage.getItem("protected-routes");
    if (savedRoutes) {
      setProtectedRoutes(JSON.parse(savedRoutes));
    }
  }, []);

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

  const handleRouteProtectionChange = (routeId: string, checked: boolean) => {
    let newProtectedRoutes: string[];
    
    if (checked) {
      newProtectedRoutes = [...protectedRoutes, routeId];
    } else {
      newProtectedRoutes = protectedRoutes.filter(route => route !== routeId);
    }
    
    setProtectedRoutes(newProtectedRoutes);
    localStorage.setItem("protected-routes", JSON.stringify(newProtectedRoutes));
    
    toast.success(`PIN protection ${checked ? 'enabled' : 'disabled'} for ${routeId.charAt(0).toUpperCase() + routeId.slice(1)}`);
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
        <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 mb-6">
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold mb-4">PIN Management</h2>
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
          </div>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Protected Features</h2>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Choose which features require PIN verification:
            </p>
            
            <div className="space-y-4">
              {routes.map((route) => (
                <div key={route.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`protect-${route.id}`} 
                    checked={protectedRoutes.includes(route.id)}
                    onCheckedChange={(checked) => 
                      handleRouteProtectionChange(route.id, checked === true)
                    }
                  />
                  <label
                    htmlFor={`protect-${route.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {route.label}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mt-6 text-left">
              <h3 className="font-medium mb-2">About PIN Protection</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your PIN protects access to the app and selected features. When a feature is protected, 
                you'll need to enter your PIN each time you access it during a session.
                The PIN is stored securely on your device and is not transmitted to any servers.
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
