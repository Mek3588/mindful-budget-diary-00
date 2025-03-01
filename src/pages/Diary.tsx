
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, Calendar as CalendarIcon, Save, Trash2, 
  Edit, ChevronLeft, ChevronRight, Mic, Camera, Image as ImageIcon,
  ChevronDown, ChevronUp, Search, Filter, Calendar
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import VoiceToText from "@/components/VoiceToText";
import CameraCapture from "@/components/CameraCapture";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";

// Mood types definition
type MoodType = "happy" | "calm" | "sad" | "angry" | "anxious";
type EnergyType = "high" | "medium" | "low";

// Define interfaces for diary entries
interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  mood: MoodType;
  energy: EnergyType;
  images?: string[];
}

// Emoji mappings for moods and energy levels
const moodEmojis: Record<MoodType, string> = {
  happy: "😊",
  calm: "😌",
  sad: "😔",
  angry: "😠",
  anxious: "😰"
};

const energyEmojis: Record<EnergyType, string> = {
  high: "⚡",
  medium: "🔆",
  low: "🔋"
};

const Diary = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodType>("calm");
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyType>("medium");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [moodStats, setMoodStats] = useState<Record<MoodType, number>>({
    happy: 0,
    calm: 0,
    sad: 0,
    anxious: 0,
    angry: 0
  });
  const [energyStats, setEnergyStats] = useState<Record<EnergyType, number>>({
    high: 0,
    medium: 0,
    low: 0
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showEnergySelector, setShowEnergySelector] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState<Date>(startOfMonth(new Date()));
  const [filterEndDate, setFilterEndDate] = useState<Date>(endOfMonth(new Date()));
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  
  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('diary-entries');
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries);
      setEntries(parsedEntries);
      calculateStats(parsedEntries);
    }
  }, []);

  // Calculate mood and energy statistics
  const calculateStats = (entriesData: DiaryEntry[]) => {
    const moodCounts: Record<MoodType, number> = {
      happy: 0,
      calm: 0,
      sad: 0,
      anxious: 0,
      angry: 0
    };
    
    const energyCounts: Record<EnergyType, number> = {
      high: 0,
      medium: 0,
      low: 0
    };
    
    entriesData.forEach(entry => {
      moodCounts[entry.mood]++;
      energyCounts[entry.energy]++;
    });
    
    setMoodStats(moodCounts);
    setEnergyStats(energyCounts);
  };

  // Handle save entry
  const handleSaveEntry = () => {
    if (!content.trim()) {
      toast.error("Entry content cannot be empty!");
      return;
    }
    
    const entryDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    
    if (editingEntryId) {
      // Update existing entry
      const updatedEntries = entries.map(entry => 
        entry.id === editingEntryId 
          ? { ...entry, content, mood: selectedMood, energy: selectedEnergy, date: entryDate, images }
          : entry
      );
      
      setEntries(updatedEntries);
      localStorage.setItem('diary-entries', JSON.stringify(updatedEntries));
      calculateStats(updatedEntries);
      
      setEditingEntryId(null);
      toast.success("Entry updated successfully!");
    } else {
      // Create new entry
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        date: entryDate,
        content,
        mood: selectedMood,
        energy: selectedEnergy,
        images: images.length > 0 ? images : undefined
      };
      
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem('diary-entries', JSON.stringify(updatedEntries));
      calculateStats(updatedEntries);
      
      toast.success("Entry saved successfully!");
    }
    
    // Reset form
    setContent("");
    setSelectedMood("calm");
    setSelectedEnergy("medium");
    setSelectedDate(new Date());
    setImages([]);
  };

  // Handle entry edit
  const handleEditEntry = (entryId: string) => {
    const entryToEdit = entries.find(entry => entry.id === entryId);
    
    if (entryToEdit) {
      setContent(entryToEdit.content);
      setSelectedMood(entryToEdit.mood);
      setSelectedEnergy(entryToEdit.energy);
      setSelectedDate(parseISO(entryToEdit.date));
      setEditingEntryId(entryId);
      setImages(entryToEdit.images || []);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle entry delete
  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    setEntries(updatedEntries);
    localStorage.setItem('diary-entries', JSON.stringify(updatedEntries));
    calculateStats(updatedEntries);
    
    if (editingEntryId === entryId) {
      setEditingEntryId(null);
      setContent("");
      setSelectedMood("calm");
      setSelectedEnergy("medium");
      setSelectedDate(new Date());
      setImages([]);
    }
    
    toast.success("Entry deleted successfully!");
  };

  // Handle day click on calendar
  const handleDaySelect = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
      setCalendarOpen(false);
    }
  };

  // Calculate percentage for statistics
  const calculatePercentage = (count: number) => {
    const total = entries.length;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setImages([...images, imageDataUrl]);
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Handle camera capture
  const handleCameraCapture = (imageDataUrl: string) => {
    setImages([...images, imageDataUrl]);
  };

  // Handle voice input for diary content
  const handleVoiceTranscript = (text: string) => {
    setContent(prevContent => {
      if (prevContent.trim()) {
        return `${prevContent} ${text}`;
      }
      return text;
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Filter entries based on search and date range
  const filteredEntries = entries.filter(entry => {
    const entryDate = parseISO(entry.date);
    const matchesDateRange = entryDate >= filterStartDate && entryDate <= filterEndDate;
    const matchesSearchTerm = entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.mood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.energy.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDateRange && matchesSearchTerm;
  });

  // Set date filter
  const handleDateFilterChange = (startDate: Date | undefined, endDate: Date | undefined) => {
    if (startDate) setFilterStartDate(startDate);
    if (endDate) setFilterEndDate(endDate);
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
              <h1 className="text-xl font-semibold">Personal Diary</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowStatsDialog(true)}
                className="hidden sm:flex"
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                Mood Stats
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCalendarDialog(true)}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Card className="p-6 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 mb-6">
          <Collapsible>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">
                {editingEntryId ? "Edit Entry" : "New Entry"}
              </h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent>
              <div className="space-y-4 mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        <span>{format(selectedDate, "MMM d, yyyy")}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-900">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDaySelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <VoiceToText onTranscript={handleVoiceTranscript} />
                
                <Textarea
                  placeholder="Write your thoughts, feelings, and experiences for the day..."
                  className="min-h-[200px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                
                <div className="space-y-4">
                  <Collapsible open={showMoodSelector} onOpenChange={setShowMoodSelector}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Current Mood:</span>
                        <span className="flex items-center">
                          <span className="text-xl mr-1">{moodEmojis[selectedMood]}</span>
                          <span className="capitalize">{selectedMood}</span>
                        </span>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {showMoodSelector ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {Object.entries(moodEmojis).map(([mood, emoji]) => (
                          <Button
                            key={mood}
                            variant={selectedMood === mood ? "default" : "outline"}
                            onClick={() => {
                              setSelectedMood(mood as MoodType);
                              setShowMoodSelector(false);
                            }}
                          >
                            <span className="text-xl mr-1">{emoji}</span>
                            <span className="capitalize">{mood}</span>
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <Collapsible open={showEnergySelector} onOpenChange={setShowEnergySelector}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Energy Level:</span>
                        <span className="flex items-center">
                          <span className="text-xl mr-1">{energyEmojis[selectedEnergy]}</span>
                          <span className="capitalize">{selectedEnergy}</span>
                        </span>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {showEnergySelector ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {Object.entries(energyEmojis).map(([energy, emoji]) => (
                          <Button
                            key={energy}
                            variant={selectedEnergy === energy ? "default" : "outline"}
                            onClick={() => {
                              setSelectedEnergy(energy as EnergyType);
                              setShowEnergySelector(false);
                            }}
                          >
                            <span className="text-xl mr-1">{emoji}</span>
                            <span className="capitalize">{energy}</span>
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Add Images (Optional)</label>
                  
                  <div className="flex flex-wrap gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden group">
                        <img src={image} alt={`Entry ${index}`} className="w-full h-full object-cover" />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-1 right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCamera(true)}
                      className="flex items-center gap-1"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Take Photo</span>
                    </Button>
                    
                    <label>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-1"
                        asChild
                      >
                        <span>
                          <ImageIcon className="h-4 w-4" />
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  {editingEntryId && (
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => {
                        setEditingEntryId(null);
                        setContent("");
                        setSelectedMood("calm");
                        setSelectedEnergy("medium");
                        setSelectedDate(new Date());
                        setImages([]);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  
                  <Button onClick={handleSaveEntry}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingEntryId ? "Update Entry" : "Save Entry"}
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
            
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Previous Entries</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilterOptions(!showFilterOptions)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
          
          {showFilterOptions && (
            <Card className="p-4 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Search in entries</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search entries..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">From</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {format(filterStartDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-900" align="start">
                        <Calendar
                          mode="single"
                          selected={filterStartDate}
                          onSelect={(date) => date && handleDateFilterChange(date, undefined)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">To</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {format(filterEndDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-900" align="start">
                        <Calendar
                          mode="single"
                          selected={filterEndDate}
                          onSelect={(date) => date && handleDateFilterChange(undefined, date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          {filteredEntries.length === 0 ? (
            <Card className="p-6 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
              <p className="text-center text-muted-foreground">No entries found. Adjust your filters or create a new entry.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map(entry => (
                <Collapsible key={entry.id}>
                  <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <div className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            <span className="text-xl" title={`Mood: ${entry.mood}`}>
                              {moodEmojis[entry.mood]}
                            </span>
                            <span className="text-xl ml-1" title={`Energy: ${entry.energy}`}>
                              {energyEmojis[entry.energy]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium truncate max-w-[200px] sm:max-w-[300px]">
                              {entry.content.substring(0, 30)}
                              {entry.content.length > 30 ? "..." : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(entry.date), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 transition-transform ui-expanded:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="p-4 pt-0 border-t dark:border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(entry.date), "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditEntry(entry.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="whitespace-pre-wrap my-2">{entry.content}</p>
                        
                        {entry.images && entry.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {entry.images.map((image, index) => (
                              <div key={index} className="w-20 h-20 rounded-md overflow-hidden">
                                <img 
                                  src={image} 
                                  alt={`Entry ${index}`} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="bg-gray-900 text-white border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Mood & Energy Statistics</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Mood Trends</h3>
              <div className="space-y-3">
                {Object.entries(moodStats).map(([mood, count]) => (
                  <div key={mood} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <span className="text-xl mr-2">{moodEmojis[mood as MoodType]}</span>
                        <span className="capitalize">{mood}</span>
                      </span>
                      <span className="text-sm font-medium">{calculatePercentage(count)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                        style={{ width: `${calculatePercentage(count)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Energy Levels</h3>
              <div className="space-y-3">
                {Object.entries(energyStats).map(([energy, count]) => (
                  <div key={energy} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <span className="text-xl mr-2">{energyEmojis[energy as EnergyType]}</span>
                        <span className="capitalize">{energy}</span>
                      </span>
                      <span className="text-sm font-medium">{calculatePercentage(count)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                        style={{ width: `${calculatePercentage(count)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Calendar Dialog */}
      <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
        <DialogContent className="bg-gray-900 text-white border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Calendar Navigation</DialogTitle>
          </DialogHeader>
          
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date);
                setShowCalendarDialog(false);
                // Filter to show entries for this date
                const formattedDate = format(date, "yyyy-MM-dd");
                setFilterStartDate(new Date(formattedDate));
                setFilterEndDate(new Date(formattedDate + "T23:59:59"));
                setShowFilterOptions(true);
              }
            }}
            className="rounded-md border"
          />
        </DialogContent>
      </Dialog>

      <CameraCapture 
        open={showCamera} 
        onOpenChange={setShowCamera}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};

export default Diary;
