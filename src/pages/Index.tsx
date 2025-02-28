
import { useState, useEffect } from "react";
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
  Moon,
  Menu,
  Smile,
  Meh,
  Frown,
  Heart,
  HeartCrack,
  Angry,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface MoodCount {
  happy: number;
  neutral: number;
  sad: number;
  angry: number;
  love: number;
  heartbreak: number;
}

const moodOptions = [
  { value: "happy", icon: Smile, label: "Happy", color: "text-green-500" },
  { value: "neutral", icon: Meh, label: "Neutral", color: "text-gray-500" },
  { value: "sad", icon: Frown, label: "Sad", color: "text-blue-500" },
  { value: "angry", icon: Angry, label: "Angry", color: "text-red-500" },
  { value: "love", icon: Heart, label: "Love", color: "text-pink-500" },
  { value: "heartbreak", icon: HeartCrack, label: "Heartbreak", color: "text-purple-500" },
];

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [moodCounts, setMoodCounts] = useState<MoodCount>({
    happy: 0,
    neutral: 0,
    sad: 0,
    angry: 0,
    love: 0,
    heartbreak: 0,
  });
  const [latestMood, setLatestMood] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const navigate = useNavigate();
  const { currentTheme, setTheme, themes } = useTheme();

  const menuItems = [
    { icon: BookOpen, label: "Diary", route: "/diary" },
    { icon: DollarSign, label: "Budget", route: "/budget" },
    { icon: FileText, label: "Notes", route: "/notes" },
    { icon: Calendar, label: "Calendar", route: "/calendar" },
    { icon: Lock, label: "Security", route: "/security" },
    { icon: Settings, label: "Settings", route: "/settings" },
  ];

  const toggleTheme = () => {
    // Cycle through themes: dark -> blue -> light (rose garden) -> dark
    if (currentTheme.id === 'dark') {
      setTheme('blue');
    } else if (currentTheme.id === 'blue') {
      setTheme('f1');
    } else {
      setTheme('dark');
    }
  };

  useEffect(() => {
    // Load diary entries and count moods
    const diaryEntries = JSON.parse(localStorage.getItem('diary-entries') || '[]');
    const counts: MoodCount = {
      happy: 0,
      neutral: 0,
      sad: 0,
      angry: 0,
      love: 0,
      heartbreak: 0,
    };

    // Sort entries by date (newest first)
    const sortedEntries = diaryEntries.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Set the latest mood
    if (sortedEntries.length > 0) {
      setLatestMood(sortedEntries[0].mood);
    }

    // Count moods
    sortedEntries.forEach((entry: { mood: keyof MoodCount }) => {
      if (entry.mood in counts) {
        counts[entry.mood]++;
      }
    });

    setMoodCounts(counts);
  }, []);

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy':
        return Smile;
      case 'neutral':
        return Meh;
      case 'sad':
        return Frown;
      case 'angry':
        return Angry;
      case 'love':
        return Heart;
      case 'heartbreak':
        return HeartCrack;
      default:
        return Meh;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy':
        return 'text-green-500';
      case 'neutral':
        return 'text-gray-500';
      case 'sad':
        return 'text-blue-500';
      case 'angry':
        return 'text-red-500';
      case 'love':
        return 'text-pink-500';
      case 'heartbreak':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getMoodLabel = (mood: string) => {
    return moodOptions.find(option => option.value === mood)?.label || 'Neutral';
  };

  // Load calendar events
  const [events, setEvents] = useState<any[]>([]);
  
  useEffect(() => {
    const loadEvents = () => {
      const savedEvents = localStorage.getItem('calendar-events');
      const savedDiaryEntries = localStorage.getItem('diary-entries');
      const savedNotes = localStorage.getItem('quick-notes');
      
      let allEvents: any[] = [];
      
      if (savedEvents) {
        allEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
      }
      
      if (savedDiaryEntries) {
        const diaryEvents = JSON.parse(savedDiaryEntries).map((entry: any) => ({
          id: `diary-${entry.id}`,
          title: "Diary Entry",
          description: entry.content,
          date: new Date(entry.date),
          category: 'diary',
          tags: [`mood-${entry.mood}`, `energy-${entry.energy}`]
        }));
        allEvents = [...allEvents, ...diaryEvents];
      }
      
      if (savedNotes) {
        const noteEvents = JSON.parse(savedNotes).map((note: any) => ({
          id: `note-${note.id}`,
          title: note.title,
          description: note.content,
          date: new Date(note.date),
          category: 'note'
        }));
        allEvents = [...allEvents, ...noteEvents];
      }
      
      setEvents(allEvents);
    };

    loadEvents();
  }, []);

  const getDayContent = (day: Date) => {
    const dayEvents = events.filter(event => 
      format(new Date(event.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );

    return (
      <div className="relative w-full h-full p-1">
        {dayEvents.length > 0 && (
          <div className="absolute bottom-1 right-1">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
          </div>
        )}
      </div>
    );
  };

  const navigateToCalendarWithDate = () => {
    setIsCalendarOpen(false);
    navigate('/calendar');
  };

  const totalMoodEntries = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);

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
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {currentTheme.type === 'masculine' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
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
              {events.length > 0 ? (
                events
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 3)
                  .map(event => (
                    <div key={event.id} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      {event.category === 'diary' ? (
                        <BookOpen className="h-4 w-4 mr-2" />
                      ) : event.category === 'budget' ? (
                        <DollarSign className="h-4 w-4 mr-2" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      <div>
                        <span className="font-medium">{event.title}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          {format(new Date(event.date), "MMM dd 'at' h:mm a")}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>No recent activity</span>
                </div>
              )}
            </div>
          </Card>

          {/* Mood Tracker */}
          <Card className="col-span-full md:col-span-1 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Mood Tracker</h2>
            
            {latestMood && (
              <div className="mb-4 p-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Your latest mood:</span>
                  <div className="flex items-center">
                    {(() => {
                      const MoodIcon = getMoodIcon(latestMood);
                      return <MoodIcon className={`h-5 w-5 mr-1 ${getMoodColor(latestMood)}`} />;
                    })()}
                    <span className={`text-sm ${getMoodColor(latestMood)}`}>
                      {getMoodLabel(latestMood)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {totalMoodEntries > 0 ? (
                Object.entries(moodCounts).map(([mood, count]) => {
                  if (count === 0) return null;
                  
                  const Icon = getMoodIcon(mood);
                  const percentage = Math.round((count / totalMoodEntries) * 100);
                  
                  return (
                    <div key={mood} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-5 w-5 ${getMoodColor(mood)}`} />
                        <span className="capitalize">{mood}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="bg-gray-200 dark:bg-gray-700 h-2 w-24 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${percentage}%` 
                            }}
                            transition={{ duration: 0.5 }}
                            className={`h-full ${getMoodColor(mood).replace('text-', 'bg-')} opacity-75`}
                          />
                        </div>
                        <span className="text-sm text-gray-500">
                          {percentage}% ({count})
                        </span>
                      </div>
                    </div>
                  );
                }).filter(Boolean)
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500">No mood data available yet</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/diary')}
                    className="mt-2"
                  >
                    Add your first diary entry
                  </Button>
                </div>
              )}
              
              {totalMoodEntries > 0 && (
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/diary')}
                  >
                    View full mood tracker
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Calendar Preview */}
          <Card className="col-span-full md:col-span-1 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Calendar</h2>
              <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Open Calendar</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800">
                  <DialogHeader>
                    <DialogTitle>Calendar</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      components={{
                        DayContent: ({ date }) => getDayContent(date),
                      }}
                      className="mx-auto"
                    />
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={navigateToCalendarWithDate}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Go to Calendar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {events.length > 0 ? (
                events
                  .filter(event => {
                    const today = new Date();
                    const eventDate = new Date(event.date);
                    return eventDate >= today;
                  })
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 3)
                  .map(event => (
                    <div key={event.id} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4 mr-2" />
                      <div>
                        <span className="font-medium">{event.title}</span>
                        <span className="ml-2 text-xs text-gray-500">{format(new Date(event.date), 'MMM dd')}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>No upcoming events</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
