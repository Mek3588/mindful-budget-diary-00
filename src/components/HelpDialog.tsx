
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, PieChart, BookText, Pencil, DollarSign, Settings, Lock } from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <BookText className="h-5 w-5" />
            Help & Documentation
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-4 sm:grid-cols-7 mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="diary">Diary</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[60vh] pr-4">
            <TabsContent value="dashboard" className="space-y-4">
              <h3 className="text-lg font-medium">Dashboard Overview</h3>
              <p>The dashboard provides a quick overview of all your important information:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Mood Tracker:</strong> Shows your recent mood entries and overall stats.</li>
                <li><strong>Calendar:</strong> View upcoming events and important dates.</li>
                <li><strong>Notes:</strong> Access your recent notes and add new ones.</li>
                <li><strong>Budget:</strong> See a summary of your financial status.</li>
                <li><strong>Theme Toggle:</strong> Use the sun/moon icon to switch between light, dark, and blue themes.</li>
              </ul>
              <p>Click on any card to navigate to the corresponding section for more details.</p>
            </TabsContent>
            
            <TabsContent value="diary" className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Pencil className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-medium">Diary & Mood Tracker</h3>
              </div>
              <p>The Diary section helps you record your daily thoughts and track your mood:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Daily Entries:</strong> Write and save your thoughts with the current date and time.</li>
                <li><strong>Mood Selection:</strong> Choose your current mood from multiple options.</li>
                <li><strong>Mood Statistics:</strong> View your mood patterns over time with percentages.</li>
                <li><strong>Entry History:</strong> Browse through all your previous diary entries.</li>
                <li><strong>Timestamps:</strong> Each entry shows when it was created or updated.</li>
              </ul>
              <p>Your diary entries are stored locally on your device and are not shared with anyone.</p>
            </TabsContent>
            
            <TabsContent value="budget" className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-medium">Budget Tracker</h3>
              </div>
              <p>The Budget section helps you manage your finances:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Income & Expenses:</strong> Track your money coming in and going out.</li>
                <li><strong>Categories:</strong> Organize transactions by category for better insights.</li>
                <li><strong>Balance:</strong> See your current financial standing at a glance.</li>
                <li><strong>History:</strong> Review past transactions with timestamps.</li>
                <li><strong>Charts:</strong> Visualize your spending patterns.</li>
              </ul>
              <p>All budget data is stored locally for your privacy and can be exported if needed.</p>
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BookText className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-medium">Notes</h3>
              </div>
              <p>The Notes section is your personal information organizer:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Create Notes:</strong> Quickly jot down ideas, lists, or information.</li>
                <li><strong>Categorize:</strong> Organize notes by topic or importance.</li>
                <li><strong>Edit & Delete:</strong> Modify or remove notes as needed.</li>
                <li><strong>Search:</strong> Find specific notes using the search feature.</li>
                <li><strong>Timestamps:</strong> See when notes were created or last updated.</li>
              </ul>
              <p>Notes are saved automatically and accessible from any page through the dashboard.</p>
            </TabsContent>
            
            <TabsContent value="calendar" className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-medium">Calendar</h3>
              </div>
              <p>The Calendar helps you stay organized and never miss important dates:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Monthly View:</strong> See your entire month at a glance with clear day separations.</li>
                <li><strong>Add Events:</strong> Create new events with titles, descriptions, and times.</li>
                <li><strong>Quick Access:</strong> Access the calendar from the dashboard via a popup or the full page.</li>
                <li><strong>Navigation:</strong> Easily move between months and years.</li>
                <li><strong>Event Management:</strong> Edit or delete existing events.</li>
              </ul>
              <p>Your calendar helps you maintain a balanced schedule and prepare for upcoming events.</p>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-medium">Security</h3>
              </div>
              <p>The Security section helps protect your personal information:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>PIN Protection:</strong> Secure app access with a 4-digit PIN (default: 1234).</li>
                <li><strong>Change PIN:</strong> Create a custom PIN that's easy for you to remember.</li>
                <li><strong>Reset PIN:</strong> Return to the default PIN if you forget yours.</li>
                <li><strong>Session Security:</strong> PIN is required once per browser session.</li>
              </ul>
              <p>Your security PIN is stored locally on your device and is never shared with external servers.</p>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-medium">Settings</h3>
              </div>
              <p>The Settings section allows you to customize your experience:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Theme Selection:</strong> Choose between light, dark, and blue themes.</li>
                <li><strong>Notifications:</strong> Configure how and when you receive alerts.</li>
                <li><strong>Display Options:</strong> Adjust how information is presented.</li>
                <li><strong>Data Management:</strong> Options for backing up or clearing your data.</li>
                <li><strong>Account:</strong> Manage your personal information.</li>
              </ul>
              <p>Customize the app to work exactly how you prefer through the settings page.</p>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
