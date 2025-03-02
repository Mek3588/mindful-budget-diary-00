
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, CreditCard, FileText, Calendar, Target, Heart, Lock, Settings, Info, HelpCircle } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import HelpDialog from "@/components/HelpDialog";

const DashboardCard = ({ title, description, icon, path, color }: { 
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}) => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme.type === 'masculine';
  
  return (
    <Card className="overflow-hidden">
      <div className={`h-2 ${color}`}></div>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center">
          <span className={`inline-flex p-1.5 mr-2 rounded-full ${color} bg-opacity-20`}>
            {icon}
          </span>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to={path}>Open {title}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const Index = () => {
  const [showHelp, setShowHelp] = useState(false);
  
  const dashboardItems = [
    {
      title: "Diary",
      description: "Record your daily thoughts and experiences",
      icon: <BookOpen className="h-4 w-4" />,
      path: "/diary",
      color: "bg-purple-500",
    },
    {
      title: "Budget",
      description: "Track your finances and spending",
      icon: <CreditCard className="h-4 w-4" />,
      path: "/budget",
      color: "bg-emerald-500",
    },
    {
      title: "Notes",
      description: "Keep track of important information",
      icon: <FileText className="h-4 w-4" />,
      path: "/notes",
      color: "bg-blue-500",
    },
    {
      title: "Calendar",
      description: "Manage your schedule and appointments",
      icon: <Calendar className="h-4 w-4" />,
      path: "/calendar",
      color: "bg-orange-500",
    },
    {
      title: "Goals",
      description: "Set and track your personal goals",
      icon: <Target className="h-4 w-4" />,
      path: "/goals",
      color: "bg-pink-500",
    },
    {
      title: "Medical",
      description: "Track health metrics and medications",
      icon: <Heart className="h-4 w-4" />,
      path: "/medical",
      color: "bg-red-500",
    },
    {
      title: "Security",
      description: "Manage your privacy and security settings",
      icon: <Lock className="h-4 w-4" />,
      path: "/security",
      color: "bg-indigo-500",
    },
    {
      title: "Settings",
      description: "Customize your LifeOS experience",
      icon: <Settings className="h-4 w-4" />,
      path: "/settings",
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="container px-4 mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Your Life Journal</h1>
          <p className="text-muted-foreground max-w-xl">
            Your personal dashboard for managing all aspects of your daily life
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowHelp(true)}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          <ModeToggle />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {dashboardItems.map((item) => (
          <DashboardCard
            key={item.title}
            title={item.title}
            description={item.description}
            icon={item.icon}
            path={item.path}
            color={item.color}
          />
        ))}
      </div>
      
      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
};

export default Index;
