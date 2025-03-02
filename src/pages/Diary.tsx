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
import { useMobile } from "@/hooks/use-mobile";

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
  const isMobile = useMobile();
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
  const [sortOption, setSortOption] = useState<string>("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"active" | "archived" | "all">("active");

  useEffect(() => {
    const savedEntries = localStorage.getItem("diary-entries");
    if (savedEntries) {
      setEntries(
        JSON.parse(savedEntries).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
          archived: entry.archived || false
        }))
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("diary-entries", JSON.stringify(entries));
  }, [entries]);

  const getFilteredEntries = () => {
    return entries
      .filter((entry) => {
        const matchesSearch = !searchTerm || 
          entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.mood.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;
        
        if (viewMode === "active" && entry.archived) return false;
        if (viewMode === "archived" && !entry.archived) return false;
        
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

    const calendarEvent = {
      id: `diary-${newEntry.id}`,
      title: newEntry.title,
      description: newEntry.content,
      date: newEntry.date,
      category: 'diary' as const,
      sticker: newEntry.sticker || undefined,
      diaryCategory: newEntry.category
    };

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
    
    const existingEvents = JSON.parse(localStorage.getItem('calendar-events') || '[]');
    const updatedEvents = existingEvents.filter((event: any) => event.id !== `diary-${id}`);
    localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));
    
    toast.success("Entry deleted successfully");
  };

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

  const filteredEntries = getFilteredEntries();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
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

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-
