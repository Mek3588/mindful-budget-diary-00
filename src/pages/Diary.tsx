
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Smile
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

interface DiaryEntry {
  id: string;
  date: Date;
  title: string;
  content: string;
  mood: string;
  images?: string[];
  sticker?: string;
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
  const [images, setImages] = useState<string[]>([]);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState("");
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [activeCaptureFor, setActiveCaptureFor] = useState<'new' | 'edit' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>("faces");
  const [sticker, setSticker] = useState<string>("");
  const [editSticker, setEditSticker] = useState<string>("");

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("diary-entries");
    if (savedEntries) {
      // Convert string dates back to Date objects
      setEntries(
        JSON.parse(savedEntries).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }))
      );
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("diary-entries", JSON.stringify(entries));
  }, [entries]);

  const filteredEntries = entries
    .filter((entry) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        entry.title.toLowerCase().includes(searchLower) ||
        entry.content.toLowerCase().includes(searchLower) ||
        entry.mood.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

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
      sticker: sticker || undefined
    };

    // Create calendar event for the diary entry
    const calendarEvent = {
      id: `diary-${newEntry.id}`,
      title: newEntry.title,
      description: newEntry.content,
      date: newEntry.date,
      category: 'diary' as const,
      sticker: newEntry.sticker || undefined
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
          sticker: editSticker || undefined
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
          sticker: editSticker || undefined
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
            <Button
              onClick={() => setIsAddingEntry(true)}
              className="shrink-0"
              disabled={isAddingEntry}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
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
                  />
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
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                        onClick={() => setMood(moodOption)}
                      >
                        {moodOption}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label htmlFor="entry-content">Content</Label>
                    <VoiceToText onTranscript={handleVoiceTranscriptNew} />
                  </div>
                  <Textarea
                    id="entry-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write about your day..."
                    className="min-h-[150px]"
                  />
                </div>

                {sticker && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Selected sticker:</span>
                    <span className="text-2xl">{sticker}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSticker("")}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {images.length > 0 && (
                  <div>
                    <Label>Images</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden group">
                          <img 
                            src={image} 
                            alt={`Entry ${index}`} 
                            className="w-full h-full object-cover" 
                          />
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index, 'new')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveCaptureFor('new');
                      setShowCamera(true);
                    }}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  
                  {renderStickerPicker('new')}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsAddingEntry(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntry}>Save Entry</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Entries list */}
          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-10">
                <Book className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium">No diary entries found</h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm
                    ? "Try a different search term"
                    : "Start by adding your first entry"}
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className="bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-colors"
                >
                  {editingEntry === entry.id ? (
                    <div className="p-6 space-y-4">
                      <h3 className="text-lg font-bold">Edit Entry</h3>
                      
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
                        />
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
                                  : "bg-secondary hover:bg-secondary/80"
                              }`}
                              onClick={() => setEditMood(moodOption)}
                            >
                              {moodOption}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Label htmlFor={`edit-content-${entry.id}`}>Content</Label>
                          <VoiceToText onTranscript={handleVoiceTranscriptEdit} />
                        </div>
                        <Textarea
                          id={`edit-content-${entry.id}`}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[150px]"
                        />
                      </div>

                      {editSticker && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Selected sticker:</span>
                          <span className="text-2xl">{editSticker}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setEditSticker("")}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {editImages.length > 0 && (
                        <div>
                          <Label>Images</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {editImages.map((image, index) => (
                              <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden group">
                                <img 
                                  src={image} 
                                  alt={`Entry ${index}`} 
                                  className="w-full h-full object-cover" 
                                />
                                <Button 
                                  variant="destructive" 
                                  size="icon" 
                                  className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeImage(index, 'edit')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setActiveCaptureFor('edit');
                            setShowCamera(true);
                          }}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          onClick={() => editFileInputRef.current?.click()}
                        >
                          <Image className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                        
                        {renderStickerPicker('edit')}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                        <Button onClick={() => handleUpdateEntry(entry.id)}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div>
                            <h3 className="text-lg font-semibold">{entry.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span>{format(entry.date, "PPP")}</span>
                              <span className="text-xs">•</span>
                              <span>{entry.mood}</span>
                              {entry.sticker && <span className="text-2xl ml-1">{entry.sticker}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 space-x-1">
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
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleEntryExpansion(entry.id)}
                          >
                            {expandedEntries[entry.id] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {expandedEntries[entry.id] && (
                        <div className="mt-4">
                          <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                          
                          {entry.images && entry.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {entry.images.map((image, index) => (
                                <div key={index} className="rounded-md overflow-hidden h-32">
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
