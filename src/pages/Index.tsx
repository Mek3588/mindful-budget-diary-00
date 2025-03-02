
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import HelpDialog from "@/components/HelpDialog";
import { ModeToggle } from "@/components/ModeToggle";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  BarChart,
  BookmarkCheck,
  Calendar,
  CalendarDays,
  ShieldCheck,
  Settings,
  Cog,
  FileText,
  DollarSign,
  Pencil,
  Lock,
  HelpCircle,
  Target,
  Stethoscope
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:via-purple-950 dark:to-gray-950">
      <main className="container mx-auto py-6 px-4 space-y-8">
        <div className="relative flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight sm:text-center sm:text-4xl">
            My Personal Journal
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setShowHelpDialog(true)}>
              <HelpCircle className="h-5 w-5" />
            </Button>
            <ModeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                Diary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Record your thoughts and feelings in your personal diary.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/diary")} className="w-full">
                <Pencil className="h-4 w-4 mr-2" />
                Open Diary
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-green-500" />
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Track your income and expenses to manage your finances.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/budget")} className="w-full">
                <DollarSign className="h-4 w-4 mr-2" />
                Open Budget
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <BookmarkCheck className="h-5 w-5 mr-2 text-purple-500" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Keep track of important information in organized notes.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/notes")} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Open Notes
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-red-500" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Plan and organize your schedule with a personal calendar.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/calendar")} className="w-full">
                <CalendarDays className="h-4 w-4 mr-2" />
                Open Calendar
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-500" />
                Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Set and track your personal goals and achievements.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/goals")} className="w-full">
                <Target className="h-4 w-4 mr-2" />
                Open Goals
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-blue-500" />
                Medical Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Track appointments, medications, and health information.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/medical")} className="w-full">
                <Stethoscope className="h-4 w-4 mr-2" />
                Open Medical Records
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-violet-500" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Protect your journal with PIN security settings.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/security")} className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Open Security
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-500" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Customize your journal appearance and preferences.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/settings")} className="w-full">
                <Cog className="h-4 w-4 mr-2" />
                Open Settings
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <HelpDialog open={showHelpDialog} onOpenChange={setShowHelpDialog} />
    </div>
  );
};

export default Index;
