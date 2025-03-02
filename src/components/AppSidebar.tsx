
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Book, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  FileText, 
  Home, 
  Lock, 
  Settings, 
  Target,
  Heart,
  Menu,
  HelpCircle
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import HelpDialog from "@/components/HelpDialog";

export const AppSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isMobile = useMobile();
  const [showHelp, setShowHelp] = useState(false);

  const menuItems = [
    { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/diary", label: "Diary", icon: <Book className="h-5 w-5" /> },
    { path: "/budget", label: "Budget", icon: <CreditCard className="h-5 w-5" /> },
    { path: "/notes", label: "Notes", icon: <FileText className="h-5 w-5" /> },
    { path: "/calendar", label: "Calendar", icon: <Calendar className="h-5 w-5" /> },
    { path: "/goals", label: "Goals", icon: <Target className="h-5 w-5" /> },
    { path: "/medical", label: "Medical Records", icon: <Heart className="h-5 w-5" /> },
    { path: "/security", label: "Security", icon: <Lock className="h-5 w-5" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Auto-collapse sidebar when route changes or on mobile after selection
  useEffect(() => {
    if (!isCollapsed) {
      setIsCollapsed(true);
    }
  }, [currentPath]);

  // Handle menu item click - navigate and close menu on mobile
  const handleMenuItemClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <>
      {/* Fixed hamburger button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 h-8 w-8 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Sidebar overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300",
          isCollapsed ? "-translate-x-full" : "translate-x-0",
          "w-64"
        )}
      >
        <div className="flex justify-end py-4 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <div 
                  onClick={() => handleMenuItemClick(item.path)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer",
                    currentPath === item.path && "bg-gray-100 dark:bg-gray-800 font-medium"
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="ml-3 text-sm">{item.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Help button at the bottom of sidebar */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div 
            onClick={() => setShowHelp(true)}
            className="flex items-center px-3 py-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <span className="flex-shrink-0">
              <HelpCircle className="h-5 w-5" />
            </span>
            <span className="ml-3 text-sm">Help & Info</span>
          </div>
        </div>
      </div>
      
      {/* Help Dialog with custom state control */}
      {showHelp && <HelpDialog open={showHelp} onOpenChange={setShowHelp} />}
    </>
  );
};
