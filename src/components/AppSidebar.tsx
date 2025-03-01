
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Heart
} from "lucide-react";

export const AppSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

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

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex justify-end py-2 px-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                <div 
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                    currentPath === item.path && "bg-gray-100 dark:bg-gray-800 font-medium"
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="ml-3 text-sm">{item.label}</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
