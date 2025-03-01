import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Plus, Save, Smile, Meh, Frown, HeartCrack, Heart, Angry, Stars, Sun, Cloud, CloudRain, CloudLightning, Zap, Edit, Trash2, Calendar as CalendarIcon, Eye, ArrowUp, Search, Download, FileText, Filter, Upload, Camera, BarChart, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, isSameDay, isBefore, isAfter, subDays } from "date-fns";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DiaryEntry {
  id: string;
  content: string;
  date: Date;
  updatedAt?: Date;
  mood: string;
  energy: string;
  tags?: string[];
  images?: string[];
  location?: string;
  weather?: string;
  isPrivate?: boolean;
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

const weatherOptions = [
  { value: "sunny", label: "Sunny", icon: Sun },
  { value: "cloudy", label: "Cloudy", icon: Cloud },
  { value: "rainy", label: "Rainy", icon: CloudRain },
  { value: "stormy", label: "Stormy", icon: CloudLightning },
];

const Diary = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [energyFilter, setEnergyFilter] = useState<string | null>(null);
  const [dateRangeFilter, setDateRangeFilter] = useState<"all" | "week" | "month" | "year">("all");
  const [showStatistics, setShowStatistics] = useState(false);
  const [entryImages, setEntryImages] = useState<string[]>([]);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const savedEntries = localStorage.getItem('diary-entries');
    if (savedEntries) {
      const loadedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
        updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : undefined,
        tags: entry.tags || [],
        images: entry.images || [],
      }));
      setEntries(loadedEntries);
      
      updateStats(loadedEntries);
    }
  }, []);
  
  useEffect(() => {
    let filtered;
    
    if (isSearching && searchQuery.trim() !== "") {
      filtered = entries.filter(entry => 
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    } else if (viewingPastEntries) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = entries.filter(entry => 
        isBefore(new Date(entry.date), today)
      );
    } else {
      filtered = entries.filter(entry => 
        isSameDay(new Date(entry.date), selectedDate)
      );
    }
    
    if (moodFilter) {
      filtered = filtered.filter(entry => entry.mood === moodFilter);
    }
    
    if (energyFilter) {
      filtered = filtered.filter(entry => entry.energy === energyFilter);
    }
    
    if (dateRangeFilter !== "all") {
      const today = new Date();
      let startDate;
      
      switch(dateRangeFilter) {
        case "week":
          startDate = subDays(today, 7);
          break;
        case "month":
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          break;
        case "year":
          startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
          break;
      }
      
      filtered = filtered.filter(entry => isAfter(new Date(entry.date), startDate));
    }
    
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredEntries(filtered);
  }, [entries, selectedDate, viewingPastEntries, searchQuery, isSearching, moodFilter, energyFilter, dateRangeFilter]);

  const updateStats = (entriesData: DiaryEntry[]) => {
    const moodCounts: Record<string, number> = {};
    moodOptions.forEach(mood => { moodCounts[mood.value] = 0 });
    
    const energyCounts: Record<string, number> = {};
    energyOptions.forEach(energy => { energyCounts[energy.value] = 0 });
    
    entriesData.forEach(entry => {
      if (entry.mood) moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      if (entry.energy) energyCounts[entry.energy] = (energyCounts[entry.energy] || 0) + 1;
    });
    
    setMoodStats(moodCounts);
    setEnergyStats(energyCounts);
  };

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
      updatedEntries = entries.map(entry => {
        if (entry.id === editingEntry.id) {
          return {
            ...entry,
            content: newEntry,
            mood: selectedMood,
            energy: selectedEnergy,
            updatedAt: now,
            tags: selectedTags,
            images: entryImages,
            location: location,
            weather: selectedWeather,
            isPrivate: isPrivate
          };
        }
        return entry;
      });
      
      toast.success("Entry updated successfully!");
    } else {
      const entry: DiaryEntry = {
        id: Date.now().toString(),
        content: newEntry,
        date: selectedDate,
        updatedAt: now,
        mood: selectedMood,
        energy: selectedEnergy,
        tags: selectedTags,
        images: entryImages,
        location: location,
        weather: selectedWeather,
        isPrivate: isPrivate
      };

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

      const existingStickers = JSON.parse(localStorage.getItem('calendar-stickers') || '[]');
      
      const updatedStickers = [...existingStickers, moodSticker, energySticker];
      
      localStorage.setItem('calendar-stickers', JSON.stringify(updatedStickers));

      updatedEntries = [entry, ...entries];
      toast.success("Entry saved successfully!");
    }
    
    setEntries(updatedEntries);
    updateStats(updatedEntries);
    
    resetForm();
  };
  
  const resetForm = () => {
    setNewEntry("");
    setSelectedMood("neutral");
    setSelectedEnergy("calm");
    setIsWriting(false);
    setIsEditing(false);
    setEditingEntry(null);
    setSelectedTags([]);
    setEntryImages([]);
    setLocation("");
    setSelectedWeather(null);
    setIsPrivate(false);
  };
  
  const handleEditEntry = (entry: DiaryEntry) => {
    setIsEditing(true);
    setEditingEntry(entry);
    setNewEntry(entry.content);
    setSelectedMood(entry.mood);
    setSelectedEnergy(entry.energy);
    setSelectedTags(entry.tags || []);
    setEntryImages(entry.images || []);
    setLocation(entry.location || "");
    setSelectedWeather(entry.weather || null);
    setIsPrivate(entry.isPrivate || false);
    setIsWriting(true);
    
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
    
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    setEntries(updatedEntries);
    updateStats(updatedEntries);
    
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
      
      if (viewingPastEntries) {
        setViewingPastEntries(false);
      }
    }
  };

  const toggleViewPastEntries = () => {
    setViewingPastEntries(!viewingPastEntries);
    
    if (isSearching) {
      setIsSearching(false);
      setSearchQuery("");
    }
  };
  
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    if (viewingPastEntries) {
      setViewingPastEntries(false);
    }
    
    toast.success(`Searching for: ${searchQuery}`);
  };
  
  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };
  
  const handleAddTag = () => {
    if (newTag.trim() === "") return;
    
    if (!selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
    }
    
    setNewTag("");
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEntryImages(prev => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const removeImage = (indexToRemove: number) => {
    setEntryImages(entryImages.filter((_, index) => index !== indexToRemove));
  };
  
  const viewImage = (image: string) => {
    setViewingImage(image);
    setShowImageDialog(true);
  };
  
  const exportAsPDF = () => {
    toast.success("PDF export feature coming soon!");
  };
  
  const exportAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "diary-entries.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast.success("Entries exported as JSON");
  };
  
  const clearFilters = () => {
    setMoodFilter(null);
    setEnergyFilter(null);
    setDateRangeFilter("all");
    setIsFilterMenuOpen(false);
    toast.success("Filters cleared");
  };

  const getMoodIcon = (moodValue: string) => {
    const mood = moodOptions.find(m => m.value === moodValue);
    return mood ? mood.icon : Meh;
  };
  
  const getEnergyIcon = (energyValue: string) => {
    const energy = energyOptions.find(e => e.value === energyValue);
    return energy ? energy.icon : Stars;
  };
  
  const getWeatherIcon = (weatherValue: string | null) => {
    if (!weatherValue) return null;
    const weather = weatherOptions.find(w => w.value === weatherValue);
    return weather ? weather.icon : null;
  };

  const MoodIcon = moodOptions.find(mood => mood.value === selectedMood)?.icon || Meh;
  const EnergyIcon = energyOptions.find(energy => energy.value === selectedEnergy)?.icon || Stars;
  const WeatherIcon = selectedWeather ? (weatherOptions.find(weather => weather.value === selectedWeather)?.icon || null) : null;

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
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                <h1 className="text-xl font-semibold">Diary</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative max-w-xs hidden md:block">
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pr-10"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                {searchQuery && (
                  <button 
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={clearSearch}
                  >
                    &times;
                  </button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full"
                  onClick={handleSearch}
                >
                  <Search className="h-3 w-3" />
                </Button>
              </div>
              
              <DropdownMenu open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`${(moodFilter || energyFilter || dateRangeFilter !== "all") ? "bg-purple-100 dark:bg-purple-900/30" : ""}`}
                  >
                    <Filter className="h-3 w-3 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="p-2">
                    <h3 className="font-medium mb-2">Mood</h3>
                    <Select value={moodFilter || ""} onValueChange={(val) => setMoodFilter(val || null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any mood</SelectItem>
                        {moodOptions.map(mood => (
                          <SelectItem key={mood.value} value={mood.value}>
                            {mood.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2">
                    <h3 className="font-medium mb-2">Energy</h3>
                    <Select value={energyFilter || ""} onValueChange={(val) => setEnergyFilter(val || null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select energy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any energy</SelectItem>
                        {energyOptions.map(energy => (
                          <SelectItem key={energy.value} value={energy.value}>
                            {energy.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2">
                    <h3 className="font-medium mb-2">Date range</h3>
                    <Select value={dateRangeFilter} onValueChange={(val) => setDateRangeFilter(val as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All dates</SelectItem>
                        <SelectItem value="week">Last 7 days</SelectItem>
                        <SelectItem value="month">Last 30 days</SelectItem>
                        <SelectItem value="year">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2 flex justify-end">
                    <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant={viewingPastEntries ? "default" : "outline"} 
                onClick={toggleViewPastEntries}
                className={`flex items-center gap-2 ${viewingPastEntries ? "bg-purple-600 hover:bg-purple-700" : ""}`}
              >
                <Eye className="h-3 w-3" />
                {viewingPastEntries ? "Current Day" : "View Past"}
              </Button>
              
              <Button 
                variant={showStatistics ? "default" : "outline"}
                onClick={() => setShowStatistics(!showStatistics)}
                className={`hidden md:flex items-center gap-2 ${showStatistics ? "bg-purple-600 hover:bg-purple-700" : ""}`}
              >
                <BarChart className="h-3 w-3" />
                Stats
              </Button>
              
              {!viewingPastEntries && !isSearching && (
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="h-3 w-3" />
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="md:flex items-center gap-2 hidden">
                    <Download className="h-3 w-3" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportAsPDF}>
                    <FileText className="h-3 w-3 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {!viewingPastEntries && !isSearching && showStatistics && (
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Mood & Energy Tracker</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-md font-medium">Mood Distribution</h3>
                <div className="space-y-3">
                  {moodOptions.map(mood => {
                    const MoodIcon = mood.icon;
                    const percentage = calculatePercentage(mood.value, moodStats, moodOptions);
                    return (
                      <div key={mood.value} className="flex items-center">
                        <MoodIcon className={`h-4 w-4 mr-2 ${mood.color}`} />
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
                        <EnergyIcon className={`h-4 w-4 mr-2 ${energy.color}`} />
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

        {isSearching && (
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 mb-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-4">
                Search Results: "{searchQuery}" ({filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'})
              </h2>
              <Button variant="outline" onClick={clearSearch}>
                Clear Search
              </Button>
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

        {!isWriting && !viewingPastEntries && !isSearching ? (
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 mb-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-4">
                {filteredEntries.length > 0 
                  ? `Entries for ${format(selectedDate, 'MMMM d, yyyy')} (${filteredEntries.length})`
                  : `Start Your Daily Entry for ${format(selectedDate, 'MMMM d, yyyy')}`
                }
              </h2>
              <Button onClick={() => setIsWriting(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="mr-2 h-3 w-3" /> New Entry
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
                                <Icon className={`h-6 w-6 ${
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
                                <Icon className={`h-6 w-6 ${
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Weather & Location</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Weather</h3>
                      <div className="flex flex-wrap gap-2">
                        {weatherOptions.map(weather => {
                          const WeatherIcon = weather.icon;
                          return (
                            <Button
                              key={weather.value}
                              type="button"
                              variant={selectedWeather === weather.value ? "default" : "outline"}
                              className={selectedWeather === weather.value ? "bg-purple-600 hover:bg-purple-700" : ""}
                              onClick={() => setSelectedWeather(weather.value)}
                            >
                              <WeatherIcon className="h-3 w-3 mr-2" />
                              {weather.label}
                            </Button>
                          );
                        })}
                        {selectedWeather && (
                          <Button
                            type="button"
                            variant="outline"
                            className="border-red-500/30 hover:bg-red-500/10 text-red-500"
                            onClick={() => setSelectedWeather(null)}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Location</h3>
                      <Input 
                        placeholder="Add location (optional)"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="private-entry"
                        checked={isPrivate}
                        onChange={e => setIsPrivate(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="private-entry" className="text-sm font-medium">
                        Private Entry
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Tags & Images</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Tags</h3>
                      <div className="flex">
                        <Input
                          placeholder="Add a tag"
                          value={newTag}
                          onChange={e => setNewTag(e.target.value)}
                          className="rounded-r-none"
                          onKeyDown={e => {
                            if (e.key === 'Enter' && newTag.trim() !== "") {
                              handleAddTag();
                            }
                          }}
                        />
                        <Button 
                          onClick={handleAddTag}
                          className="rounded-l-none"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTags.map(tag => (
                          <div key={tag} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full text-sm flex items-center">
                            {tag}
                            <button 
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Images</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {entryImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={image} 
                              alt={`Entry image ${index + 1}`} 
                              className="w-16 h-16 object-cover rounded cursor-pointer"
                              onClick={() => viewImage(image)}
                            />
                            <button
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Camera className="h-3 w-3 mr-2" />
                        Add Image
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                      />
                    </div>
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
                  <Button variant="outline" onClick={() => resetForm()}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveEntry}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Save className="mr-2 h-3 w-3" /> 
                    {isEditing ? "Update Entry" : "Save Entry"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {(viewingPastEntries || isSearching) && filteredEntries.length > 0 && (
          <div className="flex justify-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="rounded-full"
            >
              <ArrowUp className="h-3 w-3 mr-2" />
              Back to Top
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {filteredEntries.length === 0 && !isWriting ? (
            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {isSearching 
                  ? `No entries found for "${searchQuery}"` 
                  : viewingPastEntries 
                    ? "No past entries found" 
                    : `No entries for ${format(selectedDate, 'MMMM d, yyyy')}`
                }
              </p>
            </Card>
          ) : (
            filteredEntries.map((entry) => {
              const mood = moodOptions.find(m => m.value === entry.mood);
              const energy = energyOptions.find(e => e.value === entry.energy);
              const MoodIconComponent = getMoodIcon(entry.mood);
              const EnergyIconComponent = getEnergyIcon(entry.energy);
              const WeatherIconComponent = entry.weather ? getWeatherIcon(entry.weather) : null;
              
              return (
                <Card
                  key={entry.id}
                  className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                          {format(new Date(entry.date), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        {entry.isPrivate && (
                          <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full text-xs">
                            Private
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <MoodIconComponent className={`h-4 w-4 ${mood?.color || ''}`} />
                          <EnergyIconComponent className={`h-4 w-4 ${energy?.color || ''}`} />
                          {WeatherIconComponent && <WeatherIconComponent className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {entry.location && (
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Location:</span> {entry.location}
                      </div>
                    )}
                    {entry.images && entry.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 my-4">
                        {entry.images.map((image, index) => (
                          <img 
                            key={index}
                            src={image}
                            alt={`Entry image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => viewImage(image)}
                          />
                        ))}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{entry.content}</p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.tags.map(tag => (
                          <div key={tag} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full text-xs">
                            #{tag}
                          </div>
                        ))}
                      </div>
                    )}
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
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-purple-500/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              This action cannot be undone. This will permanently delete the diary entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEntry} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="bg-gray-800 border-purple-500/30 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image View</DialogTitle>
          </DialogHeader>
          {viewingImage && (
            <div className="flex justify-center">
              <img 
                src={viewingImage} 
                alt="Enlarged" 
                className="max-h-[70vh] max-w-full object-contain rounded"
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowImageDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Diary;
