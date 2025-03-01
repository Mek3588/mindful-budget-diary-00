
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, Calendar as CalendarIcon, Save, Trash2, 
  Edit, ChevronLeft, ChevronRight, Mic, Camera, Image as ImageIcon
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import VoiceToText from "@/components/VoiceToText";
import CameraCapture from "@/components/CameraCapture";

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
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 lg:col-span-2 space-y-6">
            <Card className="p-6 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-medium">
                    {editingEntryId ? "Edit Entry" : "New Entry"}
                  </h2>
                  
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
                    <PopoverContent className="w-auto p-0">
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Mood</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(moodEmojis).map(([mood, emoji]) => (
                        <Button
                          key={mood}
                          variant={selectedMood === mood ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setSelectedMood(mood as MoodType)}
                        >
                          <span className="text-xl mr-1">{emoji}</span>
                          <span className="capitalize">{mood}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Energy Level</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(energyEmojis).map(([energy, emoji]) => (
                        <Button
                          key={energy}
                          variant={selectedEnergy === energy ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setSelectedEnergy(energy as EnergyType)}
                        >
                          <span className="text-xl mr-1">{emoji}</span>
                          <span className="capitalize">{energy}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
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
            </Card>
            
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Previous Entries</h2>
              
              {entries.length === 0 ? (
                <Card className="p-6 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
                  <p className="text-center text-muted-foreground">No entries yet. Create your first diary entry above.</p>
                </Card>
              ) : (
                entries.map(entry => (
                  <Card key={entry.id} className="p-6 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(entry.date), "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xl" title={`Mood: ${entry.mood}`}>
                              {moodEmojis[entry.mood]}
                            </span>
                            <span className="text-xl" title={`Energy: ${entry.energy}`}>
                              {energyEmojis[entry.energy]}
                            </span>
                          </div>
                        </div>
                        
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
                      
                      <p className="whitespace-pre-wrap">{entry.content}</p>
                      
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
                  </Card>
                ))
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <Card className="p-6 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
              <h2 className="text-lg font-medium mb-4">Mood Trends</h2>
              
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
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${calculatePercentage(count)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <h2 className="text-lg font-medium mt-6 mb-4">Energy Levels</h2>
              
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
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${calculatePercentage(count)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="p-6 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
              <h2 className="text-lg font-medium mb-4">Calendar Navigation</h2>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDaySelect}
                className="rounded-md border"
              />
            </Card>
          </div>
        </div>
      </main>

      <CameraCapture 
        open={showCamera} 
        onOpenChange={setShowCamera}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};

export default Diary;
