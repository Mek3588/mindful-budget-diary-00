
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  Menu,
  PenLine,
  DollarSign,
  Moon,
  Sun,
  Lock,
  HelpCircle,
  BookText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "@/contexts/ThemeContext";
import { useMobile } from "@/hooks/use-mobile";
import { HelpDialog } from "@/components/HelpDialog";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-2"
          onClick={() => {
            if (onNavigate) onNavigate();
          }}
        >
          <BookText className="mr-2 h-5 w-5" />
          <span>Notes</span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-2"
          onClick={() => {
            if (onNavigate) onNavigate();
            window.location.href = "/diary";
          }}
        >
          <PenLine className="mr-2 h-5 w-5" />
          <span>Diary</span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-2"
          onClick={() => {
            if (onNavigate) onNavigate();
            window.location.href = "/budget";
          }}
        >
          <DollarSign className="mr-2 h-5 w-5" />
          <span>Budget</span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-2"
          onClick={() => {
            if (onNavigate) onNavigate();
            window.location.href = "/calendar";
          }}
        >
          <CalendarIcon className="mr-2 h-5 w-5" />
          <span>Calendar</span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-2"
          onClick={() => {
            if (onNavigate) onNavigate();
            window.location.href = "/security";
          }}
        >
          <Lock className="mr-2 h-5 w-5" />
          <span>Security</span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-2"
          onClick={() => {
            if (onNavigate) onNavigate();
            window.location.href = "/settings";
          }}
        >
          <SettingsIcon className="mr-2 h-5 w-5" />
          <span>Settings</span>
        </Button>
        <hr className="border-t border-gray-200 dark:border-gray-700" />
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-2"
          onClick={() => {
            setShowHelpDialog(true);
            if (onNavigate) onNavigate();
          }}
        >
          <HelpCircle className="mr-2 h-5 w-5" />
          <span>Help & Documentation</span>
        </Button>
      </div>
      
      <HelpDialog open={showHelpDialog} onOpenChange={setShowHelpDialog} />
    </ScrollArea>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { currentTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 bg-background border border-border">
                  <SheetHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <SidebarContent
                    onNavigate={() => {
                      setIsOpen(false);
                    }}
                  />
                </SheetContent>
              </Sheet>
              <h1 className="ml-2 text-xl font-bold">Personal Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHelpDialog(true)}
                className="text-gray-600 dark:text-gray-300 hidden sm:flex"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-gray-600 dark:text-gray-300"
              >
                {currentTheme.type === "masculine" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <div className="p-6 space-y-2">
              <h2 className="text-lg font-semibold">Mood Tracker</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                How are you feeling today?
              </p>
              <Button variant="secondary" onClick={() => navigate("/diary")}>
                Check In
              </Button>
            </div>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <div className="p-6 space-y-2">
              <h2 className="text-lg font-semibold">Calendar</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Stay organized with your schedule.
              </p>
              <Button variant="secondary" onClick={() => navigate("/calendar")}>
                View Calendar
              </Button>
            </div>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <div className="p-6 space-y-2">
              <h2 className="text-lg font-semibold">Notes</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Jot down your thoughts and ideas.
              </p>
              <Button variant="secondary" onClick={() => navigate("/notes")}>
                Take Note
              </Button>
            </div>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <div className="p-6 space-y-2">
              <h2 className="text-lg font-semibold">Budget</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your finances effectively.
              </p>
              <Button variant="secondary" onClick={() => navigate("/budget")}>
                Track Budget
              </Button>
            </div>
          </Card>
        </div>
      </main>
      
      <HelpDialog open={showHelpDialog} onOpenChange={setShowHelpDialog} />
    </div>
  );
}
