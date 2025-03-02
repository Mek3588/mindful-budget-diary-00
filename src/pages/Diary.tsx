
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, parse, isSameDay } from "date-fns";
import {
  Calendar as CalendarIcon,
  Plus,
  MoreVertical,
  Trash2,
  Edit,
  Archive,
  Smile,
  SunMedium,
  Moon,
  Clock,
  Image,
  Filter,
  Mic,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMobile } from "@/hooks/use-mobile";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import VoiceToText from "@/components/VoiceToText";
import CameraCapture from "@/components/CameraCapture";

// Define types
interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string; // ISO date string
  mood: Mood;
  archived?: boolean; // New archived property
  stickers?: string[]; // Array of sticker URLs or emoji
}

type ArchiveFilter = "active" | "archived" | "all";
type SortOption = "newest" | "oldest" | "title" | "mood";

type Mood = "happy" | "neutral" | "sad";

const moodItems = [
  { value: "happy", label: "Happy", icon: "😊", iconComponent: <Smile className="h-4 w-4" /> },
  { value: "neutral", label: "Neutral", icon: "😐", iconComponent: <SunMedium className="h-4 w-4" /> },
  { value: "sad", label: "Sad", icon: "😔", iconComponent: <Moon className="h-4 w-4" /> },
];

// Sticker options
const stickerOptions = ["💖", "⭐", "🌈", "🎉", "🎂", "🎁", "🌺", "🦋", "✨", "🏆"];

const Diary = () => {
  const isMobile = useMobile();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>("active");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntryTitle, setNewEntryTitle] = useState("");
  const [newEntryContent, setNewEntryContent] = useState("");
  const [newEntryMood, setNewEntryMood] = useState<Mood>("neutral");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [openCalendar, setOpenCalendar] = useState(false);

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("diary-entries");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("diary-entries", JSON.stringify(entries));
  }, [entries]);

  // Filter entries based on archive filter
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      return archiveFilter === "all" ||
             (archiveFilter === "active" && !entry.archived) ||
             (archiveFilter === "archived" && entry.archived);
    });
  }, [entries, archiveFilter]);

  // Sort entries based on sort option
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "mood":
          // Sort by mood: happy, neutral, sad
          const moodOrder: Record<Mood, number> = { happy: 0, neutral: 1, sad: 2 };
          return moodOrder[a.mood] - moodOrder[b.mood];
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }, [filteredEntries, sortOption]);

  // Add new entry
  const handleAddEntry = () => {
    setIsAddingEntry(true);
    setEditingEntry(null);
    setNewEntryTitle("");
    setNewEntryContent("");
    setNewEntryMood("neutral");
    setSelectedStickers([]);
    setCapturedImage(null);
  };

  // Save entry
  const handleSaveEntry = () => {
    if (!newEntryTitle.trim()) {
      toast.error("Entry title is required");
      return;
    }

    // Format date for storage
    const entryDate = format(selectedDate, "yyyy-MM-dd");

    // Add image to content if there is one
    let finalContent = newEntryContent;
    if (capturedImage) {
      finalContent = `${finalContent}\n\n![Captured Image](${capturedImage})`;
    }

    if (editingEntry) {
      // Update existing entry
      const updatedEntries = entries.map((entry) =>
        entry.id === editingEntry.id
          ? {
              ...entry,
              title: newEntryTitle,
              content: finalContent,
              date: entryDate,
              mood: newEntryMood,
              stickers: selectedStickers,
            }
          : entry
      );
      setEntries(updatedEntries);
      toast.success("Entry updated successfully");
    } else {
      // Create new entry
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        title: newEntryTitle,
        content: finalContent,
        date: entryDate,
        mood: newEntryMood,
        archived: false,
        stickers: selectedStickers,
      };
      setEntries([...entries, newEntry]);
      toast.success("Entry created successfully");
    }

    setIsAddingEntry(false);
    setEditingEntry(null);
    setNewEntryTitle("");
    setNewEntryContent("");
    setNewEntryMood("neutral");
    setSelectedStickers([]);
    setCapturedImage(null);
    setShowStickers(false);
  };

  // Delete entry
  const handleDeleteEntry = () => {
    if (editingEntry) {
      const updatedEntries = entries.filter(
        (entry) => entry.id !== editingEntry.id
      );
      setEntries(updatedEntries);
      toast.success("Entry deleted successfully");
      setIsAddingEntry(false);
      setEditingEntry(null);
      setNewEntryTitle("");
      setNewEntryContent("");
      setNewEntryMood("neutral");
      setSelectedStickers([]);
      setShowDeleteConfirm(false);
    }
  };

  // Archive/unarchive entry
  const toggleArchiveEntry = (entryId: string) => {
    const updatedEntries = entries.map((entry) =>
      entry.id === entryId
        ? { ...entry, archived: !entry.archived }
        : entry
    );
    setEntries(updatedEntries);

    // Determine if we're archiving or unarchiving
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      if (!entry.archived) {
        toast.success("Entry archived successfully");
      } else {
        toast.success("Entry unarchived successfully");
      }
    }
  };

  // Edit entry
  const handleEditEntry = (entry: DiaryEntry) => {
    setIsAddingEntry(true);
    setEditingEntry(entry);
    setNewEntryTitle(entry.title);
    setNewEntryContent(entry.content.replace(/\n\n!\[Captured Image\]\(.*\)/, '')); // Remove image from content for editing
    setNewEntryMood(entry.mood);
    setSelectedDate(new Date(entry.date));
    setSelectedStickers(entry.stickers || []);
    
    // Check if the entry has a captured image
    const imageMatch = entry.content.match(/\n\n!\[Captured Image\]\((.*)\)/);
    if (imageMatch && imageMatch[1]) {
      setCapturedImage(imageMatch[1]);
    } else {
      setCapturedImage(null);
    }
  };

  // Cancel adding/editing entry
  const handleCancelEntry = () => {
    setIsAddingEntry(false);
    setEditingEntry(null);
    setNewEntryTitle("");
    setNewEntryContent("");
    setNewEntryMood("neutral");
    setSelectedStickers([]);
    setCapturedImage(null);
    setShowDeleteConfirm(false);
    setShowStickers(false);
  };

  // Toggle sticker selection
  const toggleSticker = (sticker: string) => {
    if (selectedStickers.includes(sticker)) {
      setSelectedStickers(selectedStickers.filter(s => s !== sticker));
    } else {
      setSelectedStickers([...selectedStickers, sticker]);
    }
  };

  // Handle voice input
  const handleVoiceInput = (text: string) => {
    if (text.trim()) {
      if (newEntryContent) {
        setNewEntryContent(currentContent => `${currentContent} ${text}`);
      } else {
        setNewEntryContent(text);
      }
      toast.success("Voice input added");
    }
  };

  // Handle camera capture
  const handleImageCapture = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setShowCamera(false);
    toast.success("Image captured successfully");
  };

  // Get entries for selected date
  const entriesForSelectedDate = useMemo(() => {
    return sortedEntries.filter((entry) =>
      isSameDay(selectedDate, new Date(entry.date))
    );
  }, [sortedEntries, selectedDate]);

  return (
    <div className="container px-4 mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Diary entries column */}
        <div className="md:col-span-7 lg:col-span-8 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">Diary</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleAddEntry}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium mr-2">View:</span>
                  <Button
                    variant={archiveFilter === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setArchiveFilter("active")}
                    className="h-8"
                  >
                    Active
                  </Button>
                  <Button
                    variant={archiveFilter === "archived" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setArchiveFilter("archived")}
                    className="h-8"
                  >
                    Archived
                  </Button>
                  <Button
                    variant={archiveFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setArchiveFilter("all")}
                    className="h-8"
                  >
                    All
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sort:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-3 w-3 mr-2" />
                        {sortOption === "newest" && "Newest"}
                        {sortOption === "oldest" && "Oldest"}
                        {sortOption === "title" && "Title"}
                        {sortOption === "mood" && "Mood"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortOption("newest")}>
                        <Clock className="h-4 w-4 mr-2" />
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("oldest")}>
                        <Clock className="h-4 w-4 mr-2" />
                        Oldest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("title")}>
                        <Edit className="h-4 w-4 mr-2" />
                        Title
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("mood")}>
                        <Smile className="h-4 w-4 mr-2" />
                        Mood
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

          {isAddingEntry && (
            <div className="w-full lg:w-3/4 mx-auto">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                  <Input
                    placeholder="Entry title..."
                    value={newEntryTitle}
                    onChange={(e) => setNewEntryTitle(e.target.value)}
                    className="flex-1 w-full"
                  />
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        onClick={() => setOpenCalendar(true)}
                        variant="outline"
                        className="w-full md:w-auto flex items-center gap-2"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {format(selectedDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDate(date);
                            setOpenCalendar(false);
                          }
                        }}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <RadioGroup
                  defaultValue={newEntryMood}
                  className="flex items-center space-x-2"
                  onValueChange={(value) => setNewEntryMood(value as Mood)}
                >
                  {moodItems.map((mood) => (
                    <div key={mood.value} className="flex items-center space-x-1">
                      <RadioGroupItem value={mood.value} id={mood.value} className="peer h-4 w-4 shrink-0 rounded-full border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                      <Label htmlFor={mood.value} className="cursor-pointer peer-checked:text-primary flex items-center gap-1">
                        {mood.icon} {mood.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <Textarea
                  placeholder="Write your thoughts here..."
                  value={newEntryContent}
                  onChange={(e) => setNewEntryContent(e.target.value)}
                  className="w-full"
                />

                {capturedImage && (
                  <div className="mt-2">
                    <div className="relative">
                      <img 
                        src={capturedImage} 
                        alt="Captured" 
                        className="max-h-64 rounded-md object-contain mx-auto border border-muted" 
                      />
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 h-6 w-6 rounded-full"
                        onClick={() => setCapturedImage(null)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    type="button" 
                    size="sm"
                    onClick={() => setShowStickers(!showStickers)}
                  >
                    {showStickers ? 'Hide Stickers' : 'Add Stickers'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    type="button" 
                    size="sm"
                    onClick={() => setShowCamera(true)}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                  
                  <VoiceToText 
                    onTranscript={handleVoiceInput}
                    placeholder="Speak now..."
                  />
                </div>

                {showStickers && (
                  <div className="flex flex-wrap gap-3 p-3 bg-muted rounded-md">
                    {stickerOptions.map(sticker => (
                      <Button
                        key={sticker}
                        variant={selectedStickers.includes(sticker) ? "default" : "outline"}
                        className="h-9 w-9 p-0 text-lg"
                        onClick={() => toggleSticker(sticker)}
                      >
                        {sticker}
                      </Button>
                    ))}
                  </div>
                )}

                {selectedStickers.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-background border rounded-md">
                    <span className="text-sm text-muted-foreground mr-1">Selected:</span>
                    {selectedStickers.map(sticker => (
                      <span key={sticker} className="text-xl">{sticker}</span>
                    ))}
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCancelEntry}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEntry}>
                    {editingEntry ? "Update Entry" : "Save Entry"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {format(selectedDate, "MMMM d, yyyy")}
                  </CardTitle>
                  <CardDescription>
                    {format(selectedDate, "EEEE")}
                  </CardDescription>
                </div>
                <Button
                  onClick={handleAddEntry}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {entriesForSelectedDate.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No entries for this day.
                </p>
              ) : (
                <div className="space-y-4">
                  {entriesForSelectedDate.map((entry) => (
                    <Card key={entry.id} className={`shadow-sm ${entry.archived ? "opacity-70" : ""}`}>
                      <CardHeader className="pb-2 pt-4 px-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {entry.archived && (
                                <Badge variant="outline" className="text-gray-500 border-gray-400">
                                  <Archive className="h-3 w-3 mr-1" />
                                  Archived
                                </Badge>
                              )}
                              {entry.stickers && entry.stickers.length > 0 && (
                                <div className="flex gap-1">
                                  {entry.stickers.map((sticker, idx) => (
                                    <span key={idx} className="text-lg">{sticker}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {entry.title}
                              <span className="text-sm">
                                {entry.mood === "happy" && "😊"}
                                {entry.mood === "neutral" && "😐"}
                                {entry.mood === "sad" && "😔"}
                              </span>
                            </CardTitle>
                            <div className="flex items-center text-xs text-muted-foreground">
                              {format(new Date(entry.date), "MMM d, yyyy")}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditEntry(entry)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleArchiveEntry(entry.id)}>
                                <Archive className="h-4 w-4 mr-2" />
                                {entry.archived ? "Unarchive" : "Archive"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  handleEditEntry(entry);
                                  setShowDeleteConfirm(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      {entry.content && (
                        <CardContent className="pb-4 pt-0 px-4">
                          <div dangerouslySetInnerHTML={{ 
                            __html: entry.content
                              .replace(/!\[Captured Image\]\((.*?)\)/g, '<img src="$1" alt="Entry Image" class="max-h-64 w-auto rounded-md object-contain mt-2" />')
                              .split('\n').join('<br/>') 
                          }} />
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming entries column */}
        <div className="md:col-span-5 lg:col-span-4 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>All Entries</CardTitle>
              <CardDescription>
                {archiveFilter === "active" && "Active entries"}
                {archiveFilter === "archived" && "Archived entries"}
                {archiveFilter === "all" && "All diary entries"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-15rem)]">
                <div className="space-y-4">
                  {sortedEntries.map((entry) => (
                    <Card 
                      key={entry.id} 
                      className={`shadow-sm ${entry.archived ? "opacity-70" : ""} cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={() => setSelectedDate(new Date(entry.date))}
                    >
                      <CardHeader className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 flex-wrap gap-2">
                              {entry.archived && (
                                <Badge variant="outline" className="text-gray-500 border-gray-400">
                                  <Archive className="h-3 w-3 mr-1" />
                                  Archived
                                </Badge>
                              )}
                              {entry.stickers && entry.stickers.length > 0 && (
                                <div className="flex gap-1">
                                  {entry.stickers.map((sticker, idx) => (
                                    <span key={idx} className="text-base">{sticker}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <CardTitle className="text-sm flex items-center gap-2">
                              {entry.title}
                              <span className="text-xs">
                                {entry.mood === "happy" && "😊"}
                                {entry.mood === "neutral" && "😐"}
                                {entry.mood === "sad" && "😔"}
                              </span>
                            </CardTitle>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {format(new Date(entry.date), "MMM d, yyyy")}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleEditEntry(entry);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                toggleArchiveEntry(entry.id);
                              }}>
                                <Archive className="h-4 w-4 mr-2" />
                                {entry.archived ? "Unarchive" : "Archive"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEntry(entry);
                                  setShowDeleteConfirm(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}

                  {sortedEntries.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">No entries</p>
                      <Button
                        className="mt-4"
                        variant="outline"
                        onClick={handleAddEntry}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Entry
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {editingEntry && showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md w-full p-6">
            <CardHeader>
              <CardTitle>Confirm Deletion</CardTitle>
              <CardDescription>
                Are you sure you want to delete this entry? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteEntry}>
                Delete Entry
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Camera Capture Dialog */}
      <CameraCapture
        open={showCamera}
        onOpenChange={setShowCamera}
        onCapture={handleImageCapture}
      />
    </div>
  );
};

export default Diary;
