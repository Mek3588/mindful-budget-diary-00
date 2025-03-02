
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  Tv, 
  BookOpen, 
  CalendarDays, 
  FileText, 
  PiggyBank, 
  Shield, 
  Settings, 
  Target, 
  Heart, 
  ArchiveIcon,
  ChevronDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HelpDialog = ({ open, onOpenChange }: HelpDialogProps) => {
  const [selectedSection, setSelectedSection] = useState("dashboard");
  
  const helpSections = [
    { id: "dashboard", label: "Dashboard", icon: <Tv className="h-4 w-4 mr-2" /> },
    { id: "diary", label: "Diary", icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { id: "budget", label: "Budget", icon: <PiggyBank className="h-4 w-4 mr-2" /> },
    { id: "notes", label: "Notes", icon: <FileText className="h-4 w-4 mr-2" /> },
    { id: "calendar", label: "Calendar", icon: <CalendarDays className="h-4 w-4 mr-2" /> },
    { id: "medical", label: "Medical", icon: <Heart className="h-4 w-4 mr-2" /> },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4 mr-2" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4 mr-2" /> },
  ];
  
  const handlePrevSection = () => {
    const currentIndex = helpSections.findIndex(section => section.id === selectedSection);
    if (currentIndex > 0) {
      setSelectedSection(helpSections[currentIndex - 1].id);
    } else {
      setSelectedSection(helpSections[helpSections.length - 1].id);
    }
  };
  
  const handleNextSection = () => {
    const currentIndex = helpSections.findIndex(section => section.id === selectedSection);
    if (currentIndex < helpSections.length - 1) {
      setSelectedSection(helpSections[currentIndex + 1].id);
    } else {
      setSelectedSection(helpSections[0].id);
    }
  };

  const renderHelpContent = () => {
    switch (selectedSection) {
      case "dashboard":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Dashboard Overview</h3>
              <p>
                The dashboard provides a quick overview of your LifeOS. From
                here, you can access all main features and see a summary of
                your recent activities.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Quick Access</h4>
              <p>
                The dashboard contains cards for quick access to your most
                frequently used features like Diary, Budget, Notes, and
                Calendar.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Recent Activities</h4>
              <p>
                See your most recent diary entries, upcoming calendar events,
                and financial summaries at a glance.
              </p>
            </div>
          </div>
        );
      case "diary":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Diary & Mood Tracking</h3>
              <p>
                Keep track of your daily thoughts, experiences, and emotional
                well-being with the diary feature.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Creating Entries</h4>
              <p>
                Click the "New Entry" button to start a new diary entry. You
                can add a title, content, and select your mood for the day.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Media Attachments</h4>
              <p>
                Enhance your diary entries by adding photos. You can upload
                existing images or take new ones directly within the app.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Voice Recording</h4>
              <p>
                Too tired to type? Use the voice recording feature to
                dictate your diary entries directly.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Mood Tracking</h4>
              <p>
                Select from a range of emoji to track your mood with each
                entry. This helps you monitor your emotional well-being over
                time.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Filtering & Sorting</h4>
              <p>
                Use the filter tools to find specific entries by date, mood,
                or content. Sort your entries chronologically or by other
                criteria to keep your journal organized exactly how you prefer.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Archiving Entries</h4>
              <p>
                Keep your diary clean while preserving important memories by using
                the archive feature. Archived entries are stored separately but remain
                easily accessible. Use the view mode tabs at the top of your diary to
                switch between active entries, archived entries, or view all entries at once.
                Simply click the archive icon on any entry to move it to the archive.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Stickers & Emojis</h4>
              <p>
                Personalize your diary entries with stickers and emojis to visually
                represent your feelings or add fun elements to your entries. Access the
                sticker selector when creating or editing an entry to browse through
                various categories of emojis.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Privacy</h4>
              <p>
                Your diary entries are stored locally on your device for
                privacy. They are not uploaded to any server.
              </p>
            </div>
          </div>
        );
      case "budget":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Budget Management</h3>
              <p>
                Track your income and expenses to maintain control over your
                financial well-being.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Adding Transactions</h4>
              <p>
                Record your financial transactions by clicking "Add
                Transaction". Specify the amount, category, and whether it's
                an income or expense.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Budget Categories</h4>
              <p>
                Organize your finances with customizable categories like
                Groceries, Transportation, Entertainment, etc.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Financial Insights</h4>
              <p>
                View charts and graphs that help you understand your spending
                patterns and financial health.
              </p>
            </div>
          </div>
        );
      case "notes":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Quick Notes</h3>
              <p>
                Keep track of ideas, to-dos, and important information with
                the notes feature.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Creating Notes</h4>
              <p>
                Click "New Note" to create a note. Add a title and content,
                then save it for future reference.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Media & Stickers</h4>
              <p>
                Enhance your notes with images and fun stickers to make them
                more visual and enjoyable.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Voice-to-Text</h4>
              <p>
                Save time by using the voice-to-text feature to dictate your
                notes instead of typing.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Organization</h4>
              <p>
                Categorize your notes and use the filtering and sorting tools
                to find what you need quickly. Sort your notes by date, title, or category
                to maintain an organized workspace that suits your preferences.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Archiving Notes</h4>
              <p>
                Manage your workspace efficiently by archiving notes you don't need
                regular access to but want to keep for reference. Use the view mode tabs
                at the top of the notes page to switch between active notes, archived notes,
                or all notes. To archive a note, simply click the archive icon on any note card.
                You can also unarchive notes at any time to bring them back to your active collection.
              </p>
            </div>
          </div>
        );
      case "calendar":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Calendar & Events</h3>
              <p>
                Stay organized with a personal calendar that helps you track
                important dates and events.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Adding Events</h4>
              <p>
                Create new events by clicking on a date or the "Add Event"
                button. Specify the title, date, time, and other details.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Calendar Views</h4>
              <p>
                Switch between month, week, and day views to see your schedule
                at different levels of detail.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Event Editing</h4>
              <p>
                Edit your events by clicking on them in the calendar view or from the
                upcoming events list. You can modify all details including title, 
                description, date, time, category, and add stickers to your events.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Stickers & Visual Indicators</h4>
              <p>
                Add stickers to your events to make them visually distinctive on your
                calendar. Event categories are color-coded to help you quickly identify
                different types of events.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Archiving Events</h4>
              <p>
                Keep your calendar clean by archiving past events you want to keep
                for reference but don't need to see regularly. Use the view filters
                to toggle between active, archived, or all events.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Reminders</h4>
              <p>
                Set reminders for important events to ensure you never miss a
                deadline or appointment.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Integration</h4>
              <p>
                Events from other features like Diary entries and Notes can be
                automatically added to your calendar for a comprehensive view.
              </p>
            </div>
          </div>
        );
      case "medical":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Medical Tracking</h3>
              <p>
                Monitor your health metrics and medical appointments in one
                place.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Health Metrics</h4>
              <p>
                Track vital health statistics like weight, blood pressure,
                heart rate, and more.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Medication Management</h4>
              <p>
                Keep track of your medications, dosages, and schedules to
                ensure you never miss a dose.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Doctor Appointments</h4>
              <p>
                Record upcoming medical appointments and set reminders to
                ensure you're prepared.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Health Reports</h4>
              <p>
                Generate simple reports that show trends in your health
                metrics over time.
              </p>
            </div>
          </div>
        );
      case "security":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Security & Privacy</h3>
              <p>
                Protect your personal information with security features like
                PIN protection and data management.
              </p>
            </div>
            <div>
              <h4 className="font-medium">PIN Protection</h4>
              <p>
                Set up a PIN code to protect access to your LifeOS and keep
                your personal information secure.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Data Privacy</h4>
              <p>
                Your data is stored locally on your device and is not uploaded
                to any servers without your explicit consent.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Backup & Restore</h4>
              <p>
                Create backups of your data and restore them when needed to
                prevent data loss.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Data Management</h4>
              <p>
                Control which data is stored and for how long. Delete data you
                no longer want to keep.
              </p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">App Settings</h3>
              <p>
                Customize your LifeOS experience with various settings and
                preferences.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Theme Options</h4>
              <p>
                Choose between light and dark themes, or set the app to follow
                your system preferences.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Notification Settings</h4>
              <p>
                Control which notifications you receive and how they are
                displayed.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Language & Regional</h4>
              <p>
                Set your preferred language and regional formats for dates,
                times, and currencies.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Data Management</h4>
              <p>
                Manage your data, create backups, and control storage usage.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Accessibility</h4>
              <p>
                Adjust font sizes, contrast, and other settings to make the
                app more accessible.
              </p>
            </div>
          </div>
        );
      default:
        return <div>Select a section to view help content.</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Help & Information</DialogTitle>
          <DialogDescription>
            Learn how to use the LifeOS application
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 pt-4">
          {/* Dropdown for selecting help topics */}
          <div className="flex items-center gap-4">
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a section">
                  <div className="flex items-center">
                    {helpSections.find(section => section.id === selectedSection)?.icon}
                    {helpSections.find(section => section.id === selectedSection)?.label}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {helpSections.map(section => (
                  <SelectItem key={section.id} value={section.id}>
                    <div className="flex items-center">
                      {section.icon}
                      {section.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={handlePrevSection}>
              Previous Section
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextSection}>
              Next Section
            </Button>
          </div>
          
          {/* Content area */}
          <ScrollArea className="border rounded-md p-4 h-[60vh]">
            {renderHelpContent()}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
