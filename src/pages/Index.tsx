
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  BookOpen,
  DollarSign,
  FileText,
  Lock,
  Settings,
  PlusCircle,
  Sun,
  Menu,
} from "lucide-react";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: BookOpen, label: "Diary", route: "/diary" },
    { icon: DollarSign, label: "Budget", route: "/budget" },
    { icon: FileText, label: "Notes", route: "/notes" },
    { icon: Calendar, label: "Calendar", route: "/calendar" },
    { icon: Lock, label: "Security", route: "/security" },
    { icon: Settings, label: "Settings", route: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="mr-4"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Life Journal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Sun className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Menu */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/90 backdrop-blur-lg dark:bg-gray-900/90 transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700`}
        initial={false}
      >
        <div className="p-6 space-y-8">
          <div className="space-y-6">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => navigate(item.route)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="col-span-full bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  variant="outline"
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                  onClick={() => navigate(item.route)}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="col-span-full md:col-span-1 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Added new diary entry</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>Updated budget</span>
              </div>
            </div>
          </Card>

          {/* Mood Tracker */}
          <Card className="col-span-full md:col-span-1 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Mood Tracker</h2>
            <div className="flex items-center justify-center h-32">
              <span className="text-gray-500 dark:text-gray-400">
                Start tracking your mood
              </span>
            </div>
          </Card>

          {/* Calendar Preview */}
          <Card className="col-span-full md:col-span-1 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="h-4 w-4 mr-2" />
                <span>No upcoming events</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
