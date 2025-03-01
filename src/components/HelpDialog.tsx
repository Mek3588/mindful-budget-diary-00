
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
  "goals",
  "medical",
  "security", 
  "settings",
  "themes",
  "export",
  "print"
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
            <Target className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-medium">Goal Planner</h3>
          </div>
        );
      case "medical":
        return (
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-blue-500" />
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
            <p>The dashboard serves as your personal command center, providing quick access to all essential features:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Quick Navigation:</strong> Access all major sections through intuitive cards with distinctive colors.</li>
              <li><strong>Mood Tracker Summary:</strong> View your recent emotional patterns at a glance with percentage breakdowns.</li>
              <li><strong>Recent Notes:</strong> Access your latest notes directly from the dashboard without navigating to the Notes section.</li>
              <li><strong>Calendar Preview:</strong> See upcoming events for the next few days without opening the full Calendar.</li>
              <li><strong>Budget Overview:</strong> Monitor your financial status with quick expense and income summaries.</li>
              <li><strong>Goals Preview:</strong> Track your progress toward personal objectives with visual indicators.</li>
              <li><strong>Medical Reminders:</strong> Get alerts about upcoming appointments and medication schedules.</li>
              <li><strong>Theme Toggle:</strong> Easily switch between light, dark, and custom themes via the icon in the top bar.</li>
              <li><strong>Help Access:</strong> Open this documentation through the question mark icon whenever you need guidance.</li>
            </ul>
            <p>The dashboard is fully responsive and adapts to all screen sizes, making it perfect for both desktop and mobile use.</p>
          </div>
        );
      case "diary":
        return (
          <div className="space-y-4">
            <p>The Diary section is your personal journal and emotional wellness tracker:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Daily Entries:</strong> Record your thoughts, experiences, and reflections with rich text formatting.</li>
              <li><strong>Mood Tracking:</strong> Select from multiple mood options to monitor your emotional well-being over time.</li>
              <li><strong>Voice Input:</strong> Record entries by speaking instead of typing using the microphone button.</li>
              <li><strong>Photo Attachment:</strong> Add images to your entries using the camera or file upload features.</li>
              <li><strong>Advanced Analytics:</strong> View detailed mood statistics with interactive charts showing patterns and trends.</li>
              <li><strong>Calendar Integration:</strong> Navigate to specific dates to view or add entries from those days.</li>
              <li><strong>Entry Management:</strong> Edit, delete, or categorize previous entries for better organization.</li>
              <li><strong>Search Functionality:</strong> Find specific entries using keywords or date ranges.</li>
              <li><strong>Privacy Protection:</strong> Optionally secure your diary with PIN protection for sensitive entries.</li>
              <li><strong>Export Options:</strong> Save your diary entries as PDF or JSON files for backup or printing.</li>
            </ul>
            <p>All diary entries are stored securely on your device and can be protected with a PIN for additional privacy.</p>
          </div>
        );
      case "budget":
        return (
          <div className="space-y-4">
            <p>The Budget section provides powerful tools for managing your personal finances:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Transaction Recording:</strong> Add income and expenses with detailed categories, dates, and descriptions.</li>
              <li><strong>Financial Overview:</strong> See your current balance, recent transactions, and financial health at a glance.</li>
              <li><strong>Category Management:</strong> Organize spending into customizable categories for better tracking.</li>
              <li><strong>Interactive Charts:</strong> Visualize your financial patterns with pie charts, bar graphs, and trend lines.</li>
              <li><strong>Budget Planning:</strong> Set monthly or category-specific budgets and track your progress.</li>
              <li><strong>Recurring Transactions:</strong> Set up automatic entries for regular income or expenses.</li>
              <li><strong>Expense Analysis:</strong> Identify spending patterns and opportunities for savings.</li>
              <li><strong>Date Range Filtering:</strong> View transactions from specific time periods for better analysis.</li>
              <li><strong>Export Functionality:</strong> Generate financial reports as PDF or spreadsheet files.</li>
              <li><strong>Currency Support:</strong> Track finances in your preferred currency format.</li>
            </ul>
            <p>Your financial data is stored locally for privacy and can be exported or printed for record-keeping purposes.</p>
          </div>
        );
      case "notes":
        return (
          <div className="space-y-4">
            <p>The Notes section is your versatile information management system:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Quick Capture:</strong> Instantly record ideas, lists, or important information in a clean interface.</li>
              <li><strong>Rich Text Editor:</strong> Format your notes with headings, bullet points, numbered lists, and emphasis.</li>
              <li><strong>Voice Input:</strong> Create notes hands-free by using the voice-to-text functionality.</li>
              <li><strong>Image Integration:</strong> Add photos or images to your notes for visual reference.</li>
              <li><strong>Categorization:</strong> Organize notes with tags, folders, or color-coding for easy retrieval.</li>
              <li><strong>Pinned Notes:</strong> Keep important information readily accessible by pinning notes to the top.</li>
              <li><strong>Search Capabilities:</strong> Find specific notes quickly with full-text search functionality.</li>
              <li><strong>Checklist Support:</strong> Create interactive to-do lists with checkable items within notes.</li>
              <li><strong>Sharing Options:</strong> Export notes as text, PDF, or images for sharing with others.</li>
              <li><strong>Archiving:</strong> Keep your workspace clean by archiving notes you don't need regularly.</li>
            </ul>
            <p>Notes sync across your sessions and are accessible from any device where you use this application.</p>
          </div>
        );
      case "calendar":
        return (
          <div className="space-y-4">
            <p>The Calendar provides comprehensive scheduling and event management:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Monthly View:</strong> See your entire month at a glance with clear day separations and event indicators.</li>
              <li><strong>Event Creation:</strong> Add detailed events with titles, descriptions, times, and categories.</li>
              <li><strong>Multi-Day Events:</strong> Schedule activities that span multiple days with proper visual representation.</li>
              <li><strong>Category System:</strong> Organize events by type with color-coding for visual differentiation.</li>
              <li><strong>Reminder Settings:</strong> Set notifications for upcoming events to ensure you never miss important dates.</li>
              <li><strong>Recurring Events:</strong> Create patterns for regular activities (daily, weekly, monthly, yearly).</li>
              <li><strong>Month Navigation:</strong> Easily move between months with intuitive controls and direct month selection.</li>
              <li><strong>Event List View:</strong> See all upcoming events in a chronological list for quick reference.</li>
              <li><strong>Filter Options:</strong> Focus on specific event types or date ranges to reduce visual clutter.</li>
              <li><strong>Integration:</strong> Calendar events connect with other app sections like Goals and Medical Records.</li>
              <li><strong>Mobile-Friendly:</strong> The calendar adapts perfectly to smaller screens for on-the-go access.</li>
            </ul>
            <p>Your calendar helps you maintain balance by visualizing your commitments and important dates in one organized system.</p>
          </div>
        );
      case "security":
        return (
          <div className="space-y-4">
            <p>The Security section provides robust privacy protection for your personal information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>PIN Protection:</strong> Secure access to the app with a customizable 4-digit PIN (default: 1234).</li>
              <li><strong>Feature-Specific Security:</strong> Choose which sections of the app require PIN verification:</li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li><strong>Diary:</strong> Protect personal journal entries</li>
                <li><strong>Budget:</strong> Secure financial information</li>
                <li><strong>Notes:</strong> Safeguard sensitive notes</li>
                <li><strong>Calendar:</strong> Control access to your schedule</li>
                <li><strong>Goals:</strong> Keep personal objectives private</li>
                <li><strong>Medical Records:</strong> Ensure health information confidentiality</li>
              </ul>
              <li><strong>PIN Management:</strong> Easily change your security PIN or reset to the default if forgotten.</li>
              <li><strong>Session Security:</strong> PIN verification is required once per browser session for protected features.</li>
              <li><strong>Local Storage:</strong> Security information is stored only on your device, not on external servers.</li>
              <li><strong>Clear Indicators:</strong> Protected sections are clearly marked so you know when security is active.</li>
            </ul>
            <p>All security features are designed to protect your privacy while maintaining a smooth user experience. The PIN is stored securely on your device and is never transmitted over the internet.</p>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-4">
            <p>The Settings section lets you personalize your experience and manage your data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Theme Selection:</strong> Choose from multiple visual themes to match your personal style:</li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>Standard light and dark modes</li>
                <li>Specialized masculine and feminine aesthetic options</li>
                <li>Custom color schemes for personalization</li>
              </ul>
              <li><strong>Data Management:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li><strong>Export:</strong> Save your data in JSON format for backup or transfer</li>
                <li><strong>Print:</strong> Create physical copies of sections like diary entries, budgets, or medical records</li>
                <li><strong>Clear Data:</strong> Option to reset specific sections or the entire application</li>
              </ul>
              <li><strong>Notification Preferences:</strong> Control when and how you receive reminders and alerts.</li>
              <li><strong>Language Settings:</strong> Choose your preferred language for the application interface.</li>
              <li><strong>Accessibility Options:</strong> Adjust text size, contrast, and interaction methods for better usability.</li>
              <li><strong>Default Views:</strong> Set your preferred initial views for calendar, budget, and other sections.</li>
              <li><strong>Import Functionality:</strong> Bring in data from external sources or previous exports.</li>
            </ul>
            <p>All settings are automatically saved and apply immediately across the application. Your preferences are stored locally for privacy.</p>
          </div>
        );
      case "themes":
        return (
          <div className="space-y-4">
            <p>The Theme Selection feature offers extensive visual customization options:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Light & Dark Modes:</strong> Standard light and dark themes that follow your device preferences.</li>
              <li><strong>Aesthetic Themes:</strong> Specialized designs catering to different style preferences:</li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li><strong>Dark Theme:</strong> Clean, modern interface with deep blues and grays.</li>
                <li><strong>Rose Garden:</strong> Soft, warm palette with gentle pinks and rose tones.</li>
              </ul>
              <li><strong>Color Customization:</strong> Each theme includes carefully selected:</li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>Background colors and gradients</li>
                <li>Text and accent colors for optimal readability</li>
                <li>Button and interactive element styling</li>
                <li>Card and container visual treatments</li>
              </ul>
              <li><strong>Section-Specific Colors:</strong> Distinctive color coding for different app sections:</li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>Diary: Soft purple tones</li>
                <li>Budget: Fresh green palette</li>
                <li>Notes: Calm blue hues</li>
                <li>Calendar: Bright blue accents</li>
                <li>Goals: Energetic orange tones</li>
                <li>Medical: Gentle pink shades</li>
                <li>Security: Trustworthy blue colors</li>
                <li>Settings: Rich purple scheme</li>
              </ul>
              <li><strong>Accessibility Considerations:</strong> All themes maintain strong contrast ratios for readability.</li>
              <li><strong>Quick Switching:</strong> Change themes instantly via the toggle in the top navigation bar.</li>
              <li><strong>Persistent Selection:</strong> Your theme choice is remembered between sessions.</li>
            </ul>
            <p>Theme settings apply globally throughout the application and persist until you change them again. The theme engine is designed to ensure consistent styling across all components.</p>
          </div>
        );
      case "export":
        return (
          <div className="space-y-4">
            <p>The Data Export feature provides flexible options for saving and backing up your information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Comprehensive Selection:</strong> Choose exactly what data you want to export:</li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li><strong>Complete Export:</strong> All application data in one file</li>
                <li><strong>Section-Specific:</strong> Export only diary, budget, notes, calendar, goals, or medical records</li>
                <li><strong>Date Range:</strong> Export data from specific time periods only</li>
              </ul>
              <li><strong>Format Options:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li><strong>JSON:</strong> Standard format for data portability and backup</li>
                <li><strong>CSV:</strong> Compatible with spreadsheet applications (for budget and structured data)</li>
                <li><strong>Plain Text:</strong> Simple option for diary entries and notes</li>
              </ul>
              <li><strong>Export Process:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>Select data type and parameters from the export menu</li>
                <li>Preview what will be included in your export</li>
                <li>Generate and download the export file directly to your device</li>
                <li>Clear confirmation when the export is complete</li>
              </ul>
              <li><strong>Privacy & Security:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>All exports happen locally - no data is sent to external servers</li>
                <li>Option to password-protect sensitive exports</li>
                <li>Clear indication of what data is included in each export</li>
              </ul>
              <li><strong>Recommended Use:</strong> Regular exports (monthly or quarterly) are suggested for data backup.</li>
            </ul>
            <p>Exported files are downloaded directly to your device and can be used for backup purposes or transferring data to other systems. Regular exports help ensure you never lose important information.</p>
          </div>
        );
      case "print":
        return (
          <div className="space-y-4">
            <p>The Print functionality allows you to create physical copies of your digital information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Content Selection:</strong> Choose specific sections to print:</li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li><strong>Diary Entries:</strong> Print journal entries with dates, moods, and full content</li>
                <li><strong>Budget Reports:</strong> Print financial summaries, transactions, and analysis</li>
                <li><strong>Notes Collection:</strong> Print individual notes or categorized collections</li>
                <li><strong>Calendar:</strong> Print monthly views or event lists for planning</li>
                <li><strong>Goals:</strong> Print goal plans with progress tracking and deadlines</li>
                <li><strong>Medical Records:</strong> Print health information, appointments, and medication schedules</li>
              </ul>
              <li><strong>Print Options:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li><strong>Date Range Selection:</strong> Print information from specific time periods</li>
                <li><strong>Content Filtering:</strong> Include only the information you need</li>
                <li><strong>Format Optimization:</strong> Layouts designed specifically for printed output</li>
                <li><strong>Header & Footer:</strong> Include dates, page numbers, and section identifiers</li>
              </ul>
              <li><strong>Print Process:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>Select content type and customize print options</li>
                <li>Preview the formatted output before printing</li>
                <li>Send directly to printer or save as PDF</li>
                <li>Access system print dialog for advanced printer settings</li>
              </ul>
              <li><strong>Print Quality:</strong> Content is formatted with:</li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>Clear, readable fonts and appropriate text sizing</li>
                <li>Proper spacing and margins for legibility</li>
                <li>Optimized image quality when photos are included</li>
                <li>Printer-friendly color schemes that work well in black and white</li>
              </ul>
            </ul>
            <p>The print function creates clean, well-formatted documents that include both field headings and your actual data. All printed content is formatted to be highly readable and well-organized on physical paper.</p>
          </div>
        );
      case "goals":
        return (
          <div className="space-y-4">
            <p>The Goal Planner helps you set, track, and achieve your personal objectives:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Goal Creation:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>Set specific, measurable objectives with clear success criteria</li>
                <li>Assign target completion dates and track deadlines</li>
                <li>Categorize goals by life area (health, career, personal, etc.)</li>
                <li>Set priority levels to focus your efforts effectively</li>
              </ul>
              <li><strong>Action Planning:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>Break down goals into manageable action steps</li>
                <li>Set milestones to mark progress points</li>
                <li>Schedule specific tasks in the integrated calendar</li>
                <li>Create checklists for complex multi-step goals</li>
              </ul>
              <li><strong>Progress Tracking:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>Update completion percentage as you work toward goals</li>
                <li>Visual progress bars show advancement at a glance</li>
                <li>Track time spent on different objectives</li>
                <li>Record notes and observations about your progress</li>
              </ul>
              <li><strong>Enhanced Features:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li><strong>Voice Input:</strong> Add goals and updates using speech-to-text</li>
                <li><strong>Photo Attachments:</strong> Visualize goals with images</li>
                <li><strong>Reminder System:</strong> Get notifications about upcoming deadlines</li>
                <li><strong>Achievement Celebration:</strong> Record and recognize completed goals</li>
              </ul>
              <li><strong>Goal Management:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>Filter and sort goals by category, priority, or completion status</li>
                <li>Archive completed goals while maintaining your record of achievement</li>
                <li>Adjust deadlines and parameters as circumstances change</li>
                <li>Analyze patterns in goal completion for better future planning</li>
              </ul>
            </ul>
            <p>The Goal Planner is designed to turn aspirations into concrete achievements through structured planning, regular tracking, and clear visibility of your progress.</p>
          </div>
        );
      case "medical":
        return (
          <div className="space-y-4">
            <p>The Medical Records & Reminders section helps you manage your health information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Comprehensive Health Tracking:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li><strong>Appointment Management:</strong> Record past and upcoming medical visits</li>
                <li><strong>Medication Tracking:</strong> Log prescriptions with dosages and schedules</li>
                <li><strong>Vital Signs:</strong> Monitor important health metrics over time</li>
                <li><strong>Symptoms Journal:</strong> Document health concerns and observations</li>
                <li><strong>Medical History:</strong> Maintain records of conditions and procedures</li>
              </ul>
              <li><strong>Record Creation:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>Add detailed records with date/time, type, and descriptions</li>
                <li>Categorize by medical specialties or record types</li>
                <li>Include provider information and location details</li>
                <li>Set reminders for follow-ups and medication times</li>
                <li>Attach relevant images like prescription labels or documents</li>
              </ul>
              <li><strong>Organization & Navigation:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>View records by date, type, or status (upcoming, completed)</li>
                <li>Filter options for focused review of specific information</li>
                <li>Calendar integration shows medical events in your schedule</li>
                <li>Chronological timeline of your medical history</li>
              </ul>
              <li><strong>Advanced Features:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li><strong>Voice Input:</strong> Record medical information hands-free</li>
                <li><strong>Camera Integration:</strong> Capture images of medical documents</li>
                <li><strong>Reminder System:</strong> Get alerts for appointments and medications</li>
                <li><strong>Privacy Protection:</strong> Optional PIN security for sensitive information</li>
              </ul>
              <li><strong>Management Tools:</strong></li>
              <ul className="list-disc pl-5 mt-1 mb-2">
                <li>Edit or update existing records as information changes</li>
                <li>Quick duplication of recurring appointments or medications</li>
                <li>Search functionality to find specific health information</li>
                <li>Export and print options for sharing with healthcare providers</li>
              </ul>
            </ul>
            <p>The Medical section provides a secure, organized way to maintain your health records in one place, helping you stay on top of appointments, medications, and important health information.</p>
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-gray-900 text-white border border-gray-700 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 text-white">
            <BookText className="h-5 w-5" />
            Help & Documentation
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Navigate through sections using the arrows below
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {getSectionTitle(currentSection)}
        </div>
        
        <div className="max-h-[50vh] overflow-y-auto pr-4 text-gray-100">
          {getSectionContent(currentSection)}
        </div>
        
        <DialogFooter className="flex items-center justify-between border-t border-gray-700 pt-4 mt-4">
          <span className="text-sm text-gray-400">
            {sections.indexOf(currentSection) + 1} of {sections.length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevSection} className="border-gray-600 text-white hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextSection} className="border-gray-600 text-white hover:bg-gray-800">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
