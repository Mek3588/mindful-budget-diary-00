
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon, PieChart, BookText, Pencil, DollarSign, 
  Settings, Lock, ArrowLeft, ArrowRight, Download, Printer,
  Target, Stethoscope
} from "lucide-react";
import { useState } from "react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SectionType = 
  | "dashboard" 
  | "diary" 
  | "budget" 
  | "notes" 
  | "calendar" 
  | "security" 
  | "settings"
  | "themes"
  | "export"
  | "print"
  | "goals"
  | "medical";

const sections: SectionType[] = [
  "dashboard", 
  "diary", 
  "budget", 
  "notes", 
  "calendar", 
  "security", 
  "settings",
  "themes",
  "export",
  "print",
  "goals",
  "medical"
];

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const [currentSection, setCurrentSection] = useState<SectionType>("dashboard");
  
  const nextSection = () => {
    const currentIndex = sections.indexOf(currentSection);
    const nextIndex = (currentIndex + 1) % sections.length;
    setCurrentSection(sections[nextIndex]);
  };
  
  const prevSection = () => {
    const currentIndex = sections.indexOf(currentSection);
    const prevIndex = (currentIndex - 1 + sections.length) % sections.length;
    setCurrentSection(sections[prevIndex]);
  };

  const getSectionTitle = (section: SectionType): JSX.Element => {
    switch(section) {
      case "dashboard":
        return (
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium">Dashboard Overview</h3>
          </div>
        );
      case "diary":
        return (
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-medium">Diary & Mood Tracker</h3>
          </div>
        );
      case "budget":
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-medium">Budget Tracker</h3>
          </div>
        );
      case "notes":
        return (
          <div className="flex items-center gap-2">
            <BookText className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium">Notes</h3>
          </div>
        );
      case "calendar":
        return (
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-medium">Calendar</h3>
          </div>
        );
      case "security":
        return (
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-medium">Security</h3>
          </div>
        );
      case "settings":
        return (
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium">Settings</h3>
          </div>
        );
      case "themes":
        return (
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-violet-500" />
            <h3 className="text-lg font-medium">Theme Selection</h3>
          </div>
        );
      case "export":
        return (
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-medium">Data Export</h3>
          </div>
        );
      case "print":
        return (
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-medium">Print Options</h3>
          </div>
        );
      case "goals":
        return (
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-medium">Goal Planner</h3>
          </div>
        );
      case "medical":
        return (
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-rose-500" />
            <h3 className="text-lg font-medium">Medical Records & Reminders</h3>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <BookText className="h-5 w-5" />
            <h3 className="text-lg font-medium">Help Documentation</h3>
          </div>
        );
    }
  };

  const getSectionContent = (section: SectionType): JSX.Element => {
    switch(section) {
      case "dashboard":
        return (
          <div className="space-y-4">
            <p>The dashboard provides a quick overview of all your important information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Mood Tracker:</strong> Shows your recent mood entries and overall stats.</li>
              <li><strong>Calendar:</strong> View upcoming events and important dates.</li>
              <li><strong>Notes:</strong> Access your recent notes and add new ones.</li>
              <li><strong>Budget:</strong> See a summary of your financial status.</li>
              <li><strong>Theme Toggle:</strong> Use the icon to switch between light, dark, and blue themes.</li>
            </ul>
            <p>Click on any card to navigate to the corresponding section for more details.</p>
          </div>
        );
      case "diary":
        return (
          <div className="space-y-4">
            <p>The Diary section helps you record your daily thoughts and track your mood:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Daily Entries:</strong> Write and save your thoughts with the current date and time.</li>
              <li><strong>Mood Selection:</strong> Choose your current mood from multiple options.</li>
              <li><strong>Mood Statistics:</strong> View your mood patterns over time with percentages.</li>
              <li><strong>Entry History:</strong> Browse through all your previous diary entries.</li>
              <li><strong>Timestamps:</strong> Each entry shows when it was created or updated.</li>
              <li><strong>Edit & Delete:</strong> Modify or remove your existing entries.</li>
              <li><strong>Calendar View:</strong> Select different dates to view entries from those days.</li>
              <li><strong>Photo Capture:</strong> Take photos directly using your device camera.</li>
              <li><strong>Voice to Text:</strong> Dictate your entries instead of typing them.</li>
            </ul>
            <p>Your diary entries are stored locally on your device and are not shared with anyone.</p>
          </div>
        );
      case "budget":
        return (
          <div className="space-y-4">
            <p>The Budget section helps you manage your finances:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Income & Expenses:</strong> Track your money coming in and going out.</li>
              <li><strong>Categories:</strong> Organize transactions by category for better insights.</li>
              <li><strong>Balance:</strong> See your current financial standing at a glance.</li>
              <li><strong>History:</strong> Review past transactions with timestamps.</li>
              <li><strong>Charts:</strong> Visualize your spending patterns.</li>
              <li><strong>Edit & Delete:</strong> Modify or remove transactions as needed.</li>
              <li><strong>Voice Input:</strong> Add transactions using voice commands.</li>
            </ul>
            <p>All budget data is stored locally for your privacy and can be exported if needed.</p>
          </div>
        );
      case "notes":
        return (
          <div className="space-y-4">
            <p>The Notes section is your personal information organizer:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Create Notes:</strong> Quickly jot down ideas, lists, or information.</li>
              <li><strong>Categorize:</strong> Organize notes by topic or importance.</li>
              <li><strong>Edit & Delete:</strong> Modify or remove notes as needed.</li>
              <li><strong>Search:</strong> Find specific notes using the search feature.</li>
              <li><strong>Timestamps:</strong> See when notes were created or last updated.</li>
              <li><strong>Voice to Text:</strong> Dictate your notes instead of typing them.</li>
            </ul>
            <p>Notes are saved automatically and accessible from any page through the dashboard.</p>
          </div>
        );
      case "calendar":
        return (
          <div className="space-y-4">
            <p>The Calendar helps you stay organized and never miss important dates:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Monthly View:</strong> See your entire month at a glance with clear day separations.</li>
              <li><strong>Add Events:</strong> Create new events with titles, descriptions, and times.</li>
              <li><strong>Navigation:</strong> Easily move between months with the ← and → buttons.</li>
              <li><strong>Month Selection:</strong> Jump to any month using the dropdown selector.</li>
              <li><strong>Today Button:</strong> Quickly return to the current date.</li>
              <li><strong>Event Filtering:</strong> Filter events by category to focus on specific types.</li>
              <li><strong>Events List:</strong> View and manage all events in a separate section.</li>
              <li><strong>Edit & Delete:</strong> Modify or remove existing events.</li>
              <li><strong>Integrated Events:</strong> View goals, medical appointments, and other events together.</li>
            </ul>
            <p>Your calendar helps you maintain a balanced schedule and prepare for upcoming events.</p>
          </div>
        );
      case "security":
        return (
          <div className="space-y-4">
            <p>The Security section helps protect your personal information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>PIN Protection:</strong> Secure app access with a 4-digit PIN (default: 1234).</li>
              <li><strong>Change PIN:</strong> Create a custom PIN that's easy for you to remember.</li>
              <li><strong>Reset PIN:</strong> Return to the default PIN if you forget yours.</li>
              <li><strong>Session Security:</strong> PIN is required once per browser session.</li>
            </ul>
            <p>Your security PIN is stored locally on your device and is never shared with external servers.</p>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-4">
            <p>The Settings section allows you to customize your experience:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Theme Selection:</strong> Choose between various themes including masculine and feminine styles.</li>
              <li><strong>Data Management:</strong> Export your data and print sections of the app.</li>
              <li><strong>Personalization:</strong> Adjust how information is displayed.</li>
            </ul>
            <p>Customize the app to work exactly how you prefer through the settings page.</p>
          </div>
        );
      case "themes":
        return (
          <div className="space-y-4">
            <p>The Theme Selection feature allows you to personalize your journal experience:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Dark Theme:</strong> A darker color scheme designed with masculine aesthetics.</li>
              <li><strong>Rose Garden:</strong> A light color scheme designed with feminine aesthetics.</li>
              <li><strong>Quick Toggle:</strong> Switch between themes using the icon in the header.</li>
              <li><strong>Custom Colors:</strong> Each theme has unique primary, secondary, and accent colors.</li>
            </ul>
            <p>Your theme preference is saved and will be remembered the next time you use the app.</p>
          </div>
        );
      case "export":
        return (
          <div className="space-y-4">
            <p>The Data Export feature helps you back up your important information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Section Selection:</strong> Choose which part of the app you want to export (or all sections).</li>
              <li><strong>JSON Format:</strong> Data is exported in JSON format, which is widely compatible.</li>
              <li><strong>Local Download:</strong> Exported files are downloaded to your device, not sent to any server.</li>
              <li><strong>Date Stamped:</strong> Files include the date of export for easy organization.</li>
              <li><strong>Available Sections:</strong>
                <ul className="list-disc pl-5 mt-1">
                  <li>Diary entries and mood data</li>
                  <li>Budget and financial records</li>
                  <li>Notes and their categories</li>
                  <li>Calendar events and schedules</li>
                  <li>Goals and their progress</li>
                  <li>Medical records and appointments</li>
                </ul>
              </li>
            </ul>
            <p>Regular exports are recommended to ensure you don't lose important information.</p>
          </div>
        );
      case "print":
        return (
          <div className="space-y-4">
            <p>The Print feature allows you to create physical copies of your digital information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Section Selection:</strong> Choose which part of the app you want to print (or the entire app).</li>
              <li><strong>Print Preview:</strong> View how your content will look before printing.</li>
              <li><strong>Printer Options:</strong> Access your system's printer dialog for additional settings.</li>
              <li><strong>Available Sections:</strong>
                <ul className="list-disc pl-5 mt-1">
                  <li>Diary entries for journaling records</li>
                  <li>Budget reports for financial tracking</li>
                  <li>Notes for important information</li>
                  <li>Calendar for schedule planning</li>
                  <li>Goals for tracking your progress</li>
                  <li>Medical records for health management</li>
                </ul>
              </li>
            </ul>
            <p>Create physical backups or share your information with people who prefer paper documents.</p>
          </div>
        );
      case "goals":
        return (
          <div className="space-y-4">
            <p>The Goal Planner helps you set, track, and achieve your personal and professional objectives:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Goal Categories:</strong> Organize goals by Personal, Career, Health, Finance, Relationships, and Education.</li>
              <li><strong>Goal Setting:</strong> Create new goals with titles, target dates, and progress tracking.</li>
              <li><strong>Progress Tracking:</strong> Update your progress as you work toward each goal.</li>
              <li><strong>Completion Status:</strong> Mark goals as complete when you achieve them.</li>
              <li><strong>Rewards System:</strong> Receive category-specific congratulatory messages upon completing goals.</li>
              <li><strong>Calendar Integration:</strong> View goal deadlines in your main calendar.</li>
              <li><strong>Voice Input:</strong> Use voice recognition to add and update goals.</li>
              <li><strong>Priority Levels:</strong> Assign importance to goals to focus on what matters most.</li>
              <li><strong>Notes & Milestones:</strong> Add additional details and milestone achievements to your goals.</li>
            </ul>
            <p>The Goal Planner helps you stay motivated and focused on achieving your aspirations.</p>
          </div>
        );
      case "medical":
        return (
          <div className="space-y-4">
            <p>The Medical Records & Reminders section helps you manage your health information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Appointment Tracking:</strong> Log medical appointments with doctors, specialists, and healthcare providers.</li>
              <li><strong>Prescription Management:</strong> Keep track of medications, dosages, and refill dates.</li>
              <li><strong>Reminders:</strong> Set alerts for appointments, medication refills, and dosage times.</li>
              <li><strong>Health Records:</strong> Store information about conditions, treatments, and test results.</li>
              <li><strong>Provider Directory:</strong> Maintain contact information for your healthcare providers.</li>
              <li><strong>Calendar Integration:</strong> View medical events in your main calendar.</li>
              <li><strong>Voice Input:</strong> Add records and appointments using voice commands.</li>
              <li><strong>Prescription History:</strong> Review past medications and treatments.</li>
              <li><strong>Privacy Protection:</strong> Keep sensitive health information secure with app PIN protection.</li>
            </ul>
            <p>The Medical Records section helps you stay on top of your healthcare needs and maintain a comprehensive health history.</p>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <p>Please select a section from the navigation to view help content.</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <BookText className="h-5 w-5" />
            Help & Documentation
          </DialogTitle>
          <DialogDescription>
            Navigate through sections using the arrows below
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {getSectionTitle(currentSection)}
        </div>
        
        <div className="max-h-[50vh] overflow-y-auto pr-4">
          {getSectionContent(currentSection)}
        </div>
        
        <DialogFooter className="flex items-center justify-between border-t pt-4 mt-4">
          <span className="text-sm text-muted-foreground">
            {sections.indexOf(currentSection) + 1} of {sections.length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevSection}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextSection}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
