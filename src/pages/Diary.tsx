
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Plus, Save, Smile, Meh, Frown, HeartCrack, Heart, Angry, Stars, Sun, Cloud, CloudRain, CloudLightning, Zap, Edit, Trash2, Calendar as CalendarIcon, Eye, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, isSameDay, isBefore } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DiaryEntry {
  id: string;
  content: string;
  date: Date;
  updatedAt?: Date;
  mood: string;
  energy: string;
}

interface Sticker {
  id: string;
  type: 'mood' | 'energy';
  value: string;
  date: Date;
}

const moodOptions = [
  { value: "happy", icon: Smile, label: "Happy", color: "text-green-500" },
  { value: "neutral", icon: Meh, label: "Neutral", color: "text-gray-500" },
  { value: "sad", icon: Frown, label: "Sad", color: "text-blue-500" },
  { value: "angry", icon: Angry, label: "Angry", color: "text-red-500" },
  { value: "love", icon: Heart, label: "Love", color: "text-pink-500" },
  { value: "heartbreak", icon: HeartCrack, label: "Heartbreak", color: "text-purple-500" },
];

const energyOptions = [
  { value: "energetic", icon: Zap, label: "Energetic", color: "text-yellow-500" },
  { value: "calm", icon: Stars, label: "Calm", color: "text-indigo-500" },
  { value: "productive", icon: Sun, label: "Productive", color: "text-orange-500" },
  { value: "tired", icon: Cloud, label: "Tired", color: "text-gray-400" },
  { value: "stressed", icon: CloudLightning, label: "Stressed", color: "text-purple-400" },
  { value: "down", icon: CloudRain, label: "Down", color: "text-blue-400" },
];

const Diary = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [selectedMood, setSelectedMood] = useState("neutral");
  const [selectedEnergy, setSelectedEnergy] = useState("calm");
  const [moodStats, setMoodStats] = useState<Record<string, number>>({});
  const [energyStats, setEnergyStats] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [viewingPastEntries, setViewingPastEntries] = useState(false);

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('diary-entries');
    if (savedEntries) {
      const loadedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
        updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : undefined
      }));
      setEntries(loadedEntries);
      
      // Calculate mood and energy stats
      updateStats(loadedEntries);
    }
  }, []);
  
  // Filter entries by selected date or show past entries
  useEffect(() => {
    let filtered;
    
    if (viewingPastEntries) {
      // When viewing past entries, show all entries before today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = entries.filter(entry => 
        isBefore(new Date(entry.date), today)
      );
      
      // Sort by date (newest first)
      filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    } else {
      // When viewing by date, filter entries for the selected date
      filtered = entries.filter(entry => 
        isSameDay(new Date(entry.date), selectedDate)
      );
    }
    
    setFilteredEntries(filtered);
  }, [entries, selectedDate, viewingPastEntries]);

  const updateStats = (entriesData: DiaryEntry[]) => {
    // Initialize all possible values to 0
    const moodCounts: Record<string, number> = {};
    moodOptions.forEach(mood => { moodCounts[mood.value] = 0 });
    
    const energyCounts: Record<string, number> = {};
    energyOptions.forEach(energy => { energyCounts[energy.value] = 0 });
    
    // Count occurrences
    entriesData.forEach(entry => {
      if (entry.mood) moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      if (entry.energy) energyCounts[entry.energy] = (energyCounts[entry.energy] || 0) + 1;
    });
    
    setMoodStats(moodCounts);
    setEnergyStats(energyCounts);
  };

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('diary-entries', JSON.stringify(entries));
  }, [entries]);

  const handleSaveEntry = () => {
    if (!newEntry.trim()) {
      toast.error("Please write something in your entry");
      return;
    }

    let updatedEntries;
    const now = new Date();
    
    if (isEditing && editingEntry) {
      // Update existing entry
      updatedEntries = entries.map(entry => {
        if (entry.id === editingEntry.id) {
          return {
            ...entry,
            content: newEntry,
            mood: selectedMood,
            energy: selectedEnergy,
            updatedAt: now
          };
        }
        return entry;
      });
      
      toast.success("Entry updated successfully!");
    } else {
      // Create new entry
      const entry: DiaryEntry = {
        id: Date.now().toString(),
        content: newEntry,
        date: selectedDate,
        updatedAt: now,
        mood: selectedMood,
        energy: selectedEnergy,
      };

      // Create stickers for the calendar
      const moodSticker: Sticker = {
        id: `mood-${entry.id}`,
        type: 'mood',
        value: selectedMood,
        date: entry.date
      };

      const energySticker: Sticker = {
        id: `energy-${entry.id}`,
        type: 'energy',
        value: selectedEnergy,
        date: entry.date
      };

      // Get existing stickers from localStorage
      const existingStickers = JSON.parse(localStorage.getItem('calendar-stickers') || '[]');
      
      // Add new stickers
      const updatedStickers = [...existingStickers, moodSticker, energySticker];
      
      // Save stickers to localStorage
      localStorage.setItem('calendar-stickers', JSON.stringify(updatedStickers));

      updatedEntries = [entry, ...entries];
      toast.success("Entry saved successfully!");
    }
    
    setEntries(updatedEntries);
    updateStats(updatedEntries);
    
    setNewEntry("");
    setSelectedMood("neutral");
    setSelectedEnergy("calm");
    setIsWriting(false);
    setIsEditing(false);
    setEditingEntry(null);
  };
  
  const handleEditEntry = (entry: DiaryEntry) => {
    setIsEditing(true);
    setEditingEntry(entry);
    setNewEntry(entry.content);
    setSelectedMood(entry.mood);
    setSelectedEnergy(entry.energy);
    setIsWriting(true);
    
    // Exit past entries viewing mode when editing
    if (viewingPastEntries) {
      setViewingPastEntries(false);
      setSelectedDate(new Date(entry.date));
    }
  };
  
  const handleDeleteEntry = (entryId: string) => {
    setEntryToDelete(entryId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteEntry = () => {
    if (!entryToDelete) return;
    
    const entryId = entryToDelete;
    
    // Remove entry
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    setEntries(updatedEntries);
    updateStats(updatedEntries);
    
    // Remove associated stickers
    const existingStickers = JSON.parse(localStorage.getItem('calendar-stickers') || '[]');
    const updatedStickers = existingStickers.filter((sticker: Sticker) => 
      !sticker.id.includes(entryId)
    );
    localStorage.setItem('calendar-stickers', JSON.stringify(updatedStickers));
    
    setIsDeleteDialogOpen(false);
    setEntryToDelete(null);
    toast.success("Entry deleted successfully!");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setDatePickerOpen(false);
      
      // Exit past entries viewing mode when selecting a specific date
      if (viewingPastEntries) {
        setViewingPastEntries(false);
      }
    }
  };

  const toggleViewPastEntries = () => {
    setViewingPastEntries(!viewingPastEntries);
  };

  const MoodIcon = moodOptions.find(mood => mood.value === selectedMood)?.icon || Meh;
  const EnergyIcon = energyOptions.find(energy => energy.value === selectedEnergy)?.icon || Stars;

  // Calculate mood percentages for visualization
  const calculatePercentage = (value: string, stats: Record<string, number>, options: { value: string }[]) => {
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;
    
    const count = stats[value] || 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                <h1 className="text-xl font-semibold">Diary</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={viewingPastEntries ? "default" : "outline"} 
                onClick={toggleViewPastEntries}
                className={`flex items-center gap-2 ${viewingPastEntries ? "bg-purple-600 hover:bg-purple-700" : ""}`}
              >
                <Eye className="h-4 w-4" />
                {viewingPastEntries ? "Current Day" : "View Past Entries"}
              </Button>
              
              {!viewingPastEntries && (
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {format(selectedDate, 'MMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Don't show mood stats when viewing past entries */}
        {!viewingPastEntries && (
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Mood Tracker</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-md font-medium">Mood Distribution</h3>
                <div className="space-y-3">
                  {moodOptions.map(mood => {
                    const MoodIcon = mood.icon;
                    const percentage = calculatePercentage(mood.value, moodStats, moodOptions);
                    return (
                      <div key={mood.value} className="flex items-center">
                        <MoodIcon className={`h-5 w-5 mr-2 ${mood.color}`} />
                        <div className="flex-1 mx-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${mood.color.replace('text-', 'bg-')}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                          {percentage}% ({moodStats[mood.value] || 0})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-md font-medium">Energy Distribution</h3>
                <div className="space-y-3">
                  {energyOptions.map(energy => {
                    const EnergyIcon = energy.icon;
                    const percentage = calculatePercentage(energy.value, energyStats, energyOptions);
                    return (
                      <div key={energy.value} className="flex items-center">
                        <EnergyIcon className={`h-5 w-5 mr-2 ${energy.color}`} />
                        <div className="flex-1 mx-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${energy.color.replace('text-', 'bg-')}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                          {percentage}% ({energyStats[energy.value] || 0})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        )}

        {viewingPastEntries && (
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 mb-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-4">
                Past Entries ({filteredEntries.length})
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Viewing all entries from previous days
              </p>
            </div>
          </Card>
        )}

        {!isWriting && !viewingPastEntries ? (
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 mb-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-4">
                {filteredEntries.length > 0 
                  ? `Entries for ${format(selectedDate, 'MMMM d, yyyy')} (${filteredEntries.length})`
                  : `Start Your Daily Entry for ${format(selectedDate, 'MMMM d, yyyy')}`
                }
              </h2>
              <Button onClick={() => setIsWriting(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Entry
              </Button>
            </div>
          </Card>
        ) : null}

        {isWriting && (
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 mb-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">How are you feeling?</h2>
                    <RadioGroup
                      value={selectedMood}
                      onValueChange={setSelectedMood}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                    >
                      {moodOptions.map((mood) => {
                        const Icon = mood.icon;
                        return (
                          <div key={mood.value} className="text-center space-y-2">
                            <RadioGroupItem
                              value={mood.value}
                              id={`mood-${mood.value}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`mood-${mood.value}`}
                              className="flex flex-col items-center space-y-2 cursor-pointer peer-aria-checked:text-primary"
                            >
                              <div className={`p-2 rounded-full transition-colors ${
                                selectedMood === mood.value 
                                  ? 'bg-primary/10 ' + mood.color
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}>
                                <Icon className={`h-8 w-8 ${
                                  selectedMood === mood.value ? mood.color : ''
                                }`} />
                              </div>
                              <span className="text-sm">{mood.label}</span>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Energy Level</h2>
                    <RadioGroup
                      value={selectedEnergy}
                      onValueChange={setSelectedEnergy}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                    >
                      {energyOptions.map((energy) => {
                        const Icon = energy.icon;
                        return (
                          <div key={energy.value} className="text-center space-y-2">
                            <RadioGroupItem
                              value={energy.value}
                              id={`energy-${energy.value}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`energy-${energy.value}`}
                              className="flex flex-col items-center space-y-2 cursor-pointer peer-aria-checked:text-primary"
                            >
                              <div className={`p-2 rounded-full transition-colors ${
                                selectedEnergy === energy.value 
                                  ? 'bg-primary/10 ' + energy.color
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}>
                                <Icon className={`h-8 w-8 ${
                                  selectedEnergy === energy.value ? energy.color : ''
                                }`} />
                              </div>
                              <span className="text-sm">{energy.label}</span>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                  {isEditing ? "Edit Your Entry" : "Write Your Entry"}
                </h2>
                <Textarea
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  placeholder="What's on your mind today?"
                  className="min-h-[200px]"
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setIsWriting(false);
                    setIsEditing(false);
                    setEditingEntry(null);
                    setNewEntry("");
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEntry}>
                    <Save className="mr-2 h-4 w-4" /> 
                    {isEditing ? "Update Entry" : "Save Entry"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {viewingPastEntries && filteredEntries.length > 0 && (
          <div className="flex justify-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="rounded-full"
            >
              <ArrowUp className="h-4 w-4 mr-2" />
              Back to Top
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {filteredEntries.length === 0 && !isWriting ? (
            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {viewingPastEntries 
                  ? "No past entries found" 
                  : `No entries for ${format(selectedDate, 'MMMM d, yyyy')}`
                }
              </p>
            </Card>
          ) : (
            filteredEntries.map((entry) => {
              const mood = moodOptions.find(m => m.value === entry.mood);
              const energy = energyOptions.find(e => e.value === entry.energy);
              const EntryMoodIcon = mood?.icon || Meh;
              const EntryEnergyIcon = energy?.icon || Stars;
              
              return (
                <Card
                  key={entry.id}
                  className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {format(entry.date, "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Mood:</span>
                          <EntryMoodIcon className={`h-5 w-5 ${mood?.color || ''}`} />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Energy:</span>
                          <EntryEnergyIcon className={`h-5 w-5 ${energy?.color || ''}`} />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap">{entry.content}</p>
                    {entry.updatedAt && entry.updatedAt.getTime() !== entry.date.getTime() && (
                      <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Updated: {format(entry.updatedAt, "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the diary entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEntry} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Diary;
