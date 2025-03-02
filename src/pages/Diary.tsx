
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Book, 
  Search, 
  Plus, 
  X, 
  Calendar as CalendarIcon, 
  Edit, 
  ChevronDown, 
  ChevronUp,
  Camera,
  Image,
  Volume2,
  Smile,
  Filter,
  SortAsc,
  SortDesc,
  Clock,
  Archive,
  ArchiveRestore,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VoiceToText from "@/components/VoiceToText";
import CameraCapture from "@/components/CameraCapture";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageLayout } from "@/components/PageLayout";

interface DiaryEntry {
  id: string;
  date: Date;
  title: string;
  content: string;
  mood: string;
  images?: string[];
  sticker?: string;
  category?: string;
  archived?: boolean;
}

const MOODS = [
  "😀 Happy",
  "😌 Calm",
  "😕 Confused",
  "😢 Sad",
  "😡 Angry",
  "😴 Tired",
  "🤗 Grateful",
  "🤔 Thoughtful",
  "😎 Confident",
  "🥺 Emotional"
];

// Diary categories
const DIARY_CATEGORIES = [
  "Personal",
  "Family",
  "Work",
  "Travel",
  "Dreams",
  "Health",
  "Fitness",
  "Food",
  "Hobbies",
  "Goals"
];

// Sticker categories and emojis
const STICKER_CATEGORIES = [
  { id: "faces", name: "Faces" },
  { id: "animals", name: "Animals" },
  { id: "food", name: "Food" },
  { id: "activities", name: "Activities" },
  { id: "travel", name: "Travel" },
  { id: "objects", name: "Objects" },
  { id: "symbols", name: "Symbols" },
  { id: "flags", name: "Flags" },
];

const STICKERS = {
  faces: [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
    "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
    "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓",
    "🧐", "😕", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣",
  ],
  animals: [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒",
    "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦢", "🦉", "🦚", "🦜", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞",
    "🦗", "🦟", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈",
    "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑",
  ],
  food: [
    "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦",
    "🥬", "🥒", "🌶️", "🌽", "🥕", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇",
    "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🥪", "🥙", "🧆", "🌮", "🌯", "🥗", "🥘", "🥫", "🍝", "🍜", "🍲",
    "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰",
  ],
  activities: [
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🥅", "⛳", "🪁",
    "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "🤽", "🧗",
    "🤺", "🏄", "🚣", "🧘", "🚴", "🚵", "🎬", "🎭", "🎨", "🎪", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷", "🎺", "🎸", "🎮", "🎲",
    "🧩", "🎯", "🎳", "🪄", "🎭", "🎪", "🎨", "🧵", "🧶", "🎻", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏆", "📱", "📲", "💻", "🖥️",
  ],
  travel: [
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🦯", "🦽", "🦼", "🛴", "🚲", "🛵", "🏍️",
    "🛺", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚊", "🚉",
    "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "🚧", "⛽", "🚏",
    "🚦", "🚥", "🗺️", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟️", "🎡", "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️", "🌋", "⛰️", "🏔️",
  ],
  objects: [
    "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥",
    "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋",
    "🔌", "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷", "💰", "💳", "💎", "⚖️", "🧰", "🔧", "🔨", "⚒️",
    "🛠️", "⛏️", "🔩", "⚙️", "🧱", "⛓️", "🧲", "🔫", "💣", "🧨", "🪓", "🔪", "🗡️", "⚔️", "🛡️", "🚬", "⚰️", "⚱️", "🏺", "🔮",
  ],
  symbols: [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️",
    "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐",
    "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴", "📳", "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️",
    "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️", "🅱️", "🆎", "🆑", "🅾️", "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯", "💢", "♨️",
  ],
  flags: [
    "🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇦🇨", "🇦🇩", "🇦🇪", "🇦🇫", "🇦🇬", "🇦🇮", "🇦🇱", "🇦🇲", "🇦🇴", "🇦🇶", "🇦🇷", "🇦🇸",
    "🇦🇹", "🇦🇺", "🇦🇼", "🇦🇽", "🇦🇿", "🇧🇦", "🇧🇧", "🇧🇩", "🇧🇪", "🇧🇫", "🇧🇬", "🇧🇭", "🇧🇮", "🇧🇯", "🇧🇱", "🇧🇲", "🇧🇳", "🇧🇴", "🇧🇶", "🇧🇷",
    "🇧🇸", "🇧🇹", "🇧🇻", "🇧🇼", "🇧🇾", "🇧🇿", "🇨🇦", "🇨🇨", "🇨🇩", "🇨🇫", "🇨🇬", "🇨🇭", "🇨🇮", "🇨🇰", "🇨🇱", "🇨🇲", "🇨🇳", "🇨🇴", "🇨🇵", "🇨🇷",
    "🇨🇺", "🇨🇻", "🇨🇼", "🇨🇽", "🇨🇾", "🇨🇿", "🇩🇪", "🇩🇬", "🇩🇯", "🇩🇰", "🇩🇲", "🇩🇴", "🇩🇿", "🇪🇦", "🇪🇨", "🇪🇪", "🇪🇬", "🇪🇭", "🇪🇷", "🇪🇸",
  ],
};

const Diary = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string>(MOODS[0]);
  const [category, setCategory] = useState<string>("Personal");
  const [images, setImages] = useState<string[]>([]);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState("");
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editCategory, setEditCategory] = useState<string>("Personal");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [activeCaptureFor, setActiveCaptureFor] = useState<'new' | 'edit' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>("faces");
  const [sticker, setSticker] = useState<string>("");
  const [editSticker, setEditSticker] = useState<string>("");
  
  // State for sorting, filtering, and view options
  const [sortOption, setSortOption] = useState<string>("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"active" | "archived" | "all">("active");

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("diary-entries");
    if (savedEntries) {
      // Convert string dates back to Date objects
      setEntries(
        JSON.parse(savedEntries).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
          archived: entry.archived || false
        }))
      );
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("diary-entries", JSON.stringify(entries));
  }, [entries]);

  // Filter entries based on search, category filter, and archive status
  const getFilteredEntries = () => {
    return entries
      .filter((entry) => {
        // First check if it matches search term
        const matchesSearch = !searchTerm || 
          entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.mood.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;
        
        // Then check if it matches archive status
        if (viewMode === "active" && entry.archived) return false;
        if (viewMode === "archived" && !entry.archived) return false;
        
        // Finally check category filter
        return categoryFilter === "all" || entry.category === categoryFilter;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "newest":
            return b.date.getTime() - a.date.getTime();
          case "oldest":
            return a.date.getTime() - b.date.getTime();
          case "titleAsc":
            return a.title.localeCompare(b.title);
          case "titleDesc":
            return b.title.localeCompare(a.title);
          default:
            return b.date.getTime() - a.date.getTime();
        }
      });
  };

  const handleAddEntry = () => {
    if (!title.trim() || !content.trim() || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: date,
      title: title.trim(),
      content: content.trim(),
      mood: mood,
      images: images.length > 0 ? [...images] : undefined,
      sticker: sticker || undefined,
      category: category,
      archived: false
    };

    // Create calendar event for the diary entry
    const calendarEvent = {
      id: `diary-${newEntry.id}`,
      title: newEntry.title,
      description: newEntry.content,
      date: newEntry.date,
      category: 'diary' as const,
      sticker: newEntry.sticker || undefined,
      diaryCategory: newEntry.category
    };

    // Get existing calendar events
    const existingEvents = JSON.parse(localStorage.getItem('calendar-events') || '[]');
    localStorage.setItem('calendar-events', JSON.stringify([...existingEvents, calendarEvent]));

    setEntries([...entries, newEntry]);
    resetForm();
    setIsAddingEntry(false);
    toast.success("Diary entry added successfully");
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setMood(MOODS[0]);
    setCategory("Personal");
    setDate(new Date());
    setImages([]);
    setSticker("");
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
    
    // Remove corresponding calendar event
    const existingEvents = JSON.parse(localStorage.getItem('calendar-events') || '[]');
    const updatedEvents = existingEvents.filter((event: any) => event.id !== `diary-${id}`);
    localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));
    
    toast.success("Entry deleted successfully");
  };

  // Function to toggle archive status
  const toggleArchiveStatus = (id: string) => {
    setEntries(entries.map(entry => 
      entry.id === id 
        ? { ...entry, archived: !entry.archived } 
        : entry
    ));
    
    const entryToToggle = entries.find(entry => entry.id === id);
    if (entryToToggle) {
      const action = entryToToggle.archived ? "unarchived" : "archived";
      toast.success(`Diary entry ${action} successfully!`);
    }
  };

  const toggleEntryExpansion = (id: string) => {
    setExpandedEntries(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleEditEntry = (id: string) => {
    const entryToEdit = entries.find(entry => entry.id === id);
    if (entryToEdit) {
      setEditingEntry(id);
      setEditTitle(entryToEdit.title);
      setEditContent(entryToEdit.content);
      setEditMood(entryToEdit.mood);
      setEditDate(entryToEdit.date);
      setEditCategory(entryToEdit.category || "Personal");
      setEditImages(entryToEdit.images || []);
      setEditSticker(entryToEdit.sticker || "");
    }
  };

  const handleUpdateEntry = (id: string) => {
    if (!editTitle.trim() || !editContent.trim() || !editDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updatedEntries = entries.map(entry => {
      if (entry.id === id) {
        return {
          ...entry,
          title: editTitle.trim(),
          content: editContent.trim(),
          mood: editMood,
          date: editDate,
          images: editImages.length > 0 ? [...editImages] : undefined,
          sticker: editSticker || undefined,
          category: editCategory
        };
      }
      return entry;
    });

    setEntries(updatedEntries);

    // Update corresponding calendar event
    const existingEvents = JSON.parse(localStorage.getItem('calendar-events') || '[]');
    const updatedEvents = existingEvents.map((event: any) => {
      if (event.id === `diary-${id}`) {
        return {
          ...event,
          title: editTitle.trim(),
          description: editContent.trim(),
          date: editDate,
          sticker: editSticker || undefined,
          diaryCategory: editCategory
        };
      }
      return event;
    });
    
    localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));

    setEditingEntry(null);
    toast.success("Entry updated successfully");
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleVoiceTranscriptNew = (text: string) => {
    setContent(prev => prev ? `${prev} ${text}` : text);
  };

  const handleVoiceTranscriptEdit = (text: string) => {
    setEditContent(prev => prev ? `${prev} ${text}` : text);
  };

  const handleImageCapture = (imageDataUrl: string) => {
    if (activeCaptureFor === 'new') {
      setImages([...images, imageDataUrl]);
    } else if (activeCaptureFor === 'edit') {
      setEditImages([...editImages, imageDataUrl]);
    }
    setActiveCaptureFor(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'edit') => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        if (type === 'new') {
          setImages([...images, imageDataUrl]);
        } else {
          setEditImages([...editImages, imageDataUrl]);
        }
      };
      
      reader.readAsDataURL(file);
      
      // Reset file input
      event.target.value = '';
    }
  };

  const removeImage = (index: number, type: 'new' | 'edit') => {
    if (type === 'new') {
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
    } else {
      const newImages = [...editImages];
      newImages.splice(index, 1);
      setEditImages(newImages);
    }
  };

  const handleStickerSelect = (selectedSticker: string, type: 'new' | 'edit') => {
    if (type === 'new') {
      setSticker(selectedSticker);
    } else {
      setEditSticker(selectedSticker);
    }
  };

  const renderStickerPicker = (type: 'new' | 'edit') => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1">
            <Smile className="h-4 w-4" />
            <span>Add Sticker</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <div className="p-2">
            <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid grid-cols-4 mb-2">
                {STICKER_CATEGORIES.slice(0, 4).map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsList className="grid grid-cols-4">
                {STICKER_CATEGORIES.slice(4).map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {STICKER_CATEGORIES.map(category => (
                <TabsContent key={category.id} value={category.id} className="mt-2">
                  <ScrollArea className="h-[200px]">
                    <div className="grid grid-cols-8 gap-1">
                      {STICKERS[category.id as keyof typeof STICKERS].map((sticker, index) => (
                        <button
                          key={index}
                          className="text-xl p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          onClick={() => handleStickerSelect(sticker, type)}
                        >
                          {sticker}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Get filtered and sorted entries
  const filteredEntries = getFilteredEntries();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hidden input elements for file uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => handleFileChange(e, 'new')} 
      />
      <input 
        type="file" 
        ref={editFileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => handleFileChange(e, 'edit')} 
      />

      <CameraCapture 
        open={showCamera} 
        onOpenChange={setShowCamera}
        onCapture={handleImageCapture}
      />

      {/* Navigation header */}
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
                <Book className="h-5 w-5 mr-2" />
                <h1 className="text-xl font-semibold">Personal Diary</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Search and add entry controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search entries..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setIsAddingEntry(true)}
                className="shrink-0"
                disabled={isAddingEntry}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
              
              {/* Sort dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortOption("newest")}>
                    <SortDesc className="h-4 w-4 mr-2" />
                    Newest first
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("oldest")}>
                    <SortAsc className="h-4 w-4 mr-2" />
                    Oldest first
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("titleAsc")}>
                    <SortAsc className="h-4 w-4 mr-2" />
                    Title A-Z
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("titleDesc")}>
                    <SortDesc className="h-4 w-4 mr-2" />
                    Title Z-A
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Category filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {DIARY_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* View mode tabs */}
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "active" | "archived" | "all")}>
                <TabsList className="grid grid-cols-3 w-[240px]">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* New entry form */}
          {isAddingEntry && (
            <Card className="p-6 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
              <h2 className="text-xl font-bold mb-4">New Diary Entry</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="entry-date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                        id="entry-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="entry-title">Title</Label>
                  <Input
                    id="entry-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your entry"
                    className="bg-white dark:bg-gray-950"
                  />
                </div>

                <div>
                  <Label htmlFor="entry-category">Category</Label>
                  <Select 
                    value={category} 
                    onValueChange={setCategory}
                  >
                    <SelectTrigger id="entry-category" className="bg-white dark:bg-gray-950">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIARY_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="entry-mood">Mood</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1">
                    {MOODS.map((moodOption) => (
                      <button
                        key={moodOption}
                        type="button"
                        className={`p-2 rounded-md text-sm text-left ${
                          mood === moodOption
                            ? "bg-primary text-primary-foreground"
                            : "bg-white dark:bg-gray-950 hover:bg-secondary/80"
                        }`}
                        onClick={() => setMood(moodOption)}
                      >
                        {moodOption}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="entry-content">Content</Label>
                    <div className="flex items-center space-x-2">
                      <VoiceToText onTranscript={handleVoiceTranscriptNew} />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveCaptureFor('new');
                          setShowCamera(true);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Take Photo</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1"
                      >
                        <Image className="h-4 w-4" />
                        <span>Add Image</span>
                      </Button>
                      {renderStickerPicker('new')}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-950 rounded-lg border p-4 shadow-sm">
                    <Textarea
                      id="entry-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your diary entry here..."
                      className="min-h-[200px] border-none shadow-none focus-visible:ring-0 p-0 bg-transparent resize-none"
                    />
                    
                    {sticker && (
                      <div className="text-3xl mt-2">
                        {sticker}
                      </div>
                    )}
                    
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={image} 
                              alt={`Entry image ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index, 'new')}
                              className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingEntry(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleAddEntry}>
                    Save Entry
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Diary entries list */}
          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <Card className="p-6 text-center text-gray-500 dark:text-gray-400">
                <p className="mb-2">No diary entries found.</p>
                {searchTerm || categoryFilter !== "all" || viewMode !== "active" ? (
                  <p>Try adjusting your filters.</p>
                ) : (
                  <p>Click the "Add Entry" button to create your first entry.</p>
                )}
              </Card>
            ) : (
              filteredEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className={`overflow-hidden ${editingEntry === entry.id ? 'ring-2 ring-primary' : ''}`}
                >
                  {editingEntry === entry.id ? (
                    <div className="p-6 space-y-4">
                      <h3 className="text-lg font-semibold">Edit Entry</h3>
                      <div>
                        <Label htmlFor={`edit-date-${entry.id}`}>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !editDate && "text-muted-foreground"
                              )}
                              id={`edit-date-${entry.id}`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editDate ? format(editDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={editDate}
                              onSelect={setEditDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label htmlFor={`edit-title-${entry.id}`}>Title</Label>
                        <Input
                          id={`edit-title-${entry.id}`}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-white dark:bg-gray-950"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`edit-category-${entry.id}`}>Category</Label>
                        <Select 
                          value={editCategory} 
                          onValueChange={setEditCategory}
                        >
                          <SelectTrigger id={`edit-category-${entry.id}`} className="bg-white dark:bg-gray-950">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {DIARY_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`edit-mood-${entry.id}`}>Mood</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1">
                          {MOODS.map((moodOption) => (
                            <button
                              key={moodOption}
                              type="button"
                              className={`p-2 rounded-md text-sm text-left ${
                                editMood === moodOption
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-white dark:bg-gray-950 hover:bg-secondary/80"
                              }`}
                              onClick={() => setEditMood(moodOption)}
                            >
                              {moodOption}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor={`edit-content-${entry.id}`}>Content</Label>
                          <div className="flex items-center space-x-2">
                            <VoiceToText onTranscript={handleVoiceTranscriptEdit} />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setActiveCaptureFor('edit');
                                setShowCamera(true);
                              }}
                              className="flex items-center gap-1"
                            >
                              <Camera className="h-4 w-4" />
                              <span>Take Photo</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => editFileInputRef.current?.click()}
                              className="flex items-center gap-1"
                            >
                              <Image className="h-4 w-4" />
                              <span>Add Image</span>
                            </Button>
                            {renderStickerPicker('edit')}
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-950 rounded-lg border p-4 shadow-sm">
                          <Textarea
                            id={`edit-content-${entry.id}`}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[200px] border-none shadow-none focus-visible:ring-0 p-0 bg-transparent resize-none"
                          />
                          
                          {editSticker && (
                            <div className="text-3xl mt-2">
                              {editSticker}
                            </div>
                          )}
                          
                          {editImages.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                              {editImages.map((image, index) => (
                                <div key={index} className="relative group">
                                  <img 
                                    src={image} 
                                    alt={`Entry image ${index + 1}`} 
                                    className="w-full h-32 object-cover rounded-md"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index, 'edit')}
                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="button" 
                          onClick={() => handleUpdateEntry(entry.id)}
                        >
                          Update Entry
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-lg">{entry.title}</span>
                          {entry.sticker && <span className="text-2xl">{entry.sticker}</span>}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {format(entry.date, "PPP")}
                          </span>
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                            {entry.category}
                          </span>
                          <span className="text-sm">{entry.mood}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleEntryExpansion(entry.id)}
                            aria-label={expandedEntries[entry.id] ? "Collapse entry" : "Expand entry"}
                          >
                            {expandedEntries[entry.id] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditEntry(entry.id)}
                            aria-label="Edit entry"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleArchiveStatus(entry.id)}
                            aria-label={entry.archived ? "Unarchive entry" : "Archive entry"}
                          >
                            {entry.archived ? (
                              <ArchiveRestore className="h-4 w-4" />
                            ) : (
                              <Archive className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteEntry(entry.id)}
                            aria-label="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {expandedEntries[entry.id] && (
                        <CardContent className="p-4 space-y-4">
                          <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                            {entry.content}
                          </div>
                          {entry.images && entry.images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                              {entry.images.map((image, index) => (
                                <div key={index} className="relative">
                                  <img 
                                    src={image} 
                                    alt={`Entry image ${index + 1}`} 
                                    className="w-full h-48 object-cover rounded-md"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Diary;
