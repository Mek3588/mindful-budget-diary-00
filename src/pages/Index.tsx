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
  BookText,
  Sparkles,
  BookOpen
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
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-2"
          onClick={() => {
            if (onNavigate) onNavigate();
            window.location.href = "/notes";
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
      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-[#FEF7CD] to-white dark:from-[#424874] dark:to-gray-900 overflow-x-hidden">
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
                <SheetContent 
                  side="left" 
                  className="p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                >
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
              <h1 className="ml-2 text-xl font-bold flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                <span>My Personal Journal</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHelpDialog(true)}
                aria-label="Help"
                className="text-gray-600 dark:text-gray-300"
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
        {/* Featured Diary Section */}
        <div className="mb-10">
          <Card className="relative overflow-hidden bg-gradient-to-r from-[#FDE1D3] to-[#FFDEE2] dark:from-[#9b87f5] dark:to-[#D946EF] border-0 shadow-lg transform transition-all hover:scale-[1.01] animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-white/20 dark:bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 bg-white/20 dark:bg-white/10 rounded-full blur-xl"></div>
            
            <div className="p-8 relative">
              <div className="flex items-center mb-4">
                <PenLine className="h-8 w-8 mr-3 text-pink-700 dark:text-pink-300" />
                <h2 className="text-2xl font-bold text-pink-800 dark:text-pink-200 flex items-center">
                  My Diary
                  <Sparkles className="h-5 w-5 ml-2 text-yellow-500" />
                </h2>
              </div>
              
              <p className="text-md text-gray-700 dark:text-gray-200 mb-4 max-w-2xl">
                Capture your thoughts, feelings, and daily moments in your personal diary. 
                Write about your day, track your mood, and create memories you can look back on.
              </p>
              
              <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button 
                  className="bg-pink-600 hover:bg-pink-700 text-white shadow-md dark:bg-pink-700 dark:hover:bg-pink-800 transition-all hover:shadow-lg animate-pulse"
                  onClick={() => navigate("/diary")}
                >
                  <PenLine className="mr-2 h-5 w-5" />
                  Write Today's Entry
                </Button>
                <Button 
                  variant="outline" 
                  className="border-pink-300 text-pink-700 hover:bg-pink-50 dark:border-pink-500 dark:text-pink-300 dark:hover:bg-pink-900/20"
                  onClick={() => navigate("/diary")}
                >
                  View Past Entries
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* App Features in Staggered Layout */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Notes Card */}
          <Card className="bg-gradient-to-br from-[#E5DEFF] to-white dark:from-[#3A3B59] dark:to-gray-800 border-0 shadow-md hover:shadow-lg transition-all p-6 space-y-3 transform hover:scale-[1.02]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <BookText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold">Notes</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Capture quick thoughts, lists, and ideas in your digital notebook.
            </p>
            <Button 
              variant="secondary" 
              className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/50 dark:hover:bg-purple-800 dark:text-purple-300"
              onClick={() => navigate("/notes")}
            >
              Take Notes
            </Button>
          </Card>

          {/* Calendar Card */}
          <Card className="bg-gradient-to-br from-[#D3E4FD] to-white dark:from-[#2E4066] dark:to-gray-800 border-0 shadow-md hover:shadow-lg transition-all p-6 space-y-3 transform hover:scale-[1.02]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold">Calendar</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Stay organized with your schedule and important dates.
            </p>
            <Button 
              variant="secondary" 
              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/50 dark:hover:bg-blue-800 dark:text-blue-300"
              onClick={() => navigate("/calendar")}
            >
              View Calendar
            </Button>
          </Card>

          {/* Budget Card */}
          <Card className="bg-gradient-to-br from-[#F2FCE2] to-white dark:from-[#324b33] dark:to-gray-800 border-0 shadow-md hover:shadow-lg transition-all p-6 space-y-3 transform hover:scale-[1.02]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold">Budget</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Track your expenses and manage your finances effectively.
            </p>
            <Button 
              variant="secondary" 
              className="w-full bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/50 dark:hover:bg-green-800 dark:text-green-300"
              onClick={() => navigate("/budget")}
            >
              Track Budget
            </Button>
          </Card>

          {/* Security Card */}
          <Card className="bg-gradient-to-br from-[#F1F0FB] to-white dark:from-[#2d2d3f] dark:to-gray-800 border-0 shadow-md hover:shadow-lg transition-all p-6 space-y-3 transform hover:scale-[1.02]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Lock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold">Security</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Keep your personal information safe and secure.
            </p>
            <Button 
              variant="secondary" 
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
              onClick={() => navigate("/security")}
            >
              Manage Security
            </Button>
          </Card>

          {/* Settings Card */}
          <Card className="bg-gradient-to-br from-[#FFDEE2] to-white dark:from-[#40334d] dark:to-gray-800 border-0 shadow-md hover:shadow-lg transition-all p-6 space-y-3 transform hover:scale-[1.02]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                <SettingsIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h2 className="text-lg font-semibold">Settings</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Customize your app experience and preferences.
            </p>
            <Button 
              variant="secondary" 
              className="w-full bg-pink-100 hover:bg-pink-200 text-pink-700 dark:bg-pink-900/50 dark:hover:bg-pink-800 dark:text-pink-300"
              onClick={() => navigate("/settings")}
            >
              Adjust Settings
            </Button>
          </Card>
        </div>
      </main>
      
      <HelpDialog open={showHelpDialog} onOpenChange={setShowHelpDialog} />
    </div>
  );
}
