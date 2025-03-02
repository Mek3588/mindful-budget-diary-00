
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Plus, Save, X, Edit, Check, Mic, Camera, Image, Smile, Filter, Clock, SortAsc, SortDesc, Archive, ArchiveRestore } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import VoiceToText from "@/components/VoiceToText";
import CameraCapture from "@/components/CameraCapture";
import { PopoverContent, Popover, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Note {
  id: string;
  title: string;
  content: string;
  date: Date;
  updatedAt?: Date;
  images?: string[];
  sticker?: string;
  category?: string;
  archived?: boolean;
}

const NOTE_CATEGORIES = [
  "Personal",
  "Work",
  "Study",
  "Ideas",
  "To-Do",
  "Meeting",
  "Travel",
  "Health",
  "Finance",
  "Other"
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

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: "", content: "", sticker: "", category: "Personal" });
  const [isWriting, setIsWriting] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editedNote, setEditedNote] = useState({ title: "", content: "", sticker: "", category: "Personal" });
  const [images, setImages] = useState<string[]>([]);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [activeForCamera, setActiveForCamera] = useState<'new' | 'edit' | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("faces");
  
  // New state for sorting, filtering, and view options
  const [sortOption, setSortOption] = useState<string>("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"active" | "archived" | "all">("active");

  useEffect(() => {
    const savedNotes = localStorage.getItem('quick-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        date: new Date(note.date),
        updatedAt: note.updatedAt ? new Date(note.updatedAt) : undefined,
        archived: note.archived || false
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quick-notes', JSON.stringify(notes));
  }, [notes]);

  const handleSaveNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast.error("Please provide both title and content for your note");
      return;
    }

    const now = new Date();
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      date: now,
      updatedAt: now,
      images: images.length > 0 ? [...images] : undefined,
      sticker: newNote.sticker || undefined,
      category: newNote.category,
      archived: false
    };

    const calendarEvent = {
      id: `note-${note.id}`,
      title: note.title,
      description: note.content,
      date: note.date,
      category: 'notes' as const,
      sticker: note.sticker || undefined,
      noteCategory: note.category
    };

    const existingEvents = JSON.parse(localStorage.getItem('calendar-events') || '[]');
    localStorage.setItem('calendar-events', JSON.stringify([...existingEvents, calendarEvent]));

    setNotes([note, ...notes]);
    setNewNote({ title: "", content: "", sticker: "", category: "Personal" });
    setIsWriting(false);
    setImages([]);
    toast.success("Note saved successfully!");
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    
    const existingEvents = JSON.parse(localStorage.getItem('calendar-events') || '[]');
    const updatedEvents = existingEvents.filter((event: any) => event.id !== `note-${id}`);
    localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));
    
    toast.success("Note deleted successfully!");
  };

  const handleEditNote = (id: string) => {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
      setEditingNote(id);
      setEditedNote({
        title: noteToEdit.title,
        content: noteToEdit.content,
        sticker: noteToEdit.sticker || "",
        category: noteToEdit.category || "Personal"
      });
      setEditImages(noteToEdit.images || []);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (!editedNote.title.trim() || !editedNote.content.trim()) {
      toast.error("Please provide both title and content for your note");
      return;
    }

    const now = new Date();
    
    const updatedNotes = notes.map(note => 
      note.id === id 
        ? { 
            ...note, 
            title: editedNote.title, 
            content: editedNote.content, 
            updatedAt: now,
            images: editImages.length > 0 ? [...editImages] : undefined,
            sticker: editedNote.sticker || undefined,
            category: editedNote.category
          }
        : note
    );
    
    setNotes(updatedNotes);

    const existingEvents = JSON.parse(localStorage.getItem('calendar-events') || '[]');
    const updatedEvents = existingEvents.map((event: any) => 
      event.id === `note-${id}`
        ? { 
            ...event, 
            title: editedNote.title, 
            description: editedNote.content,
            sticker: editedNote.sticker || undefined,
            noteCategory: editedNote.category
          }
        : event
    );
    
    localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));
    
    setEditingNote(null);
    setEditImages([]);
    toast.success("Note updated successfully!");
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditImages([]);
  };

  const handleVoiceTranscriptNew = (text: string) => {
    setNewNote(prev => ({
      ...prev,
      content: prev.content ? `${prev.content} ${text}` : text
    }));
  };

  const handleVoiceTranscriptEdit = (text: string) => {
    setEditedNote(prev => ({
      ...prev,
      content: prev.content ? `${prev.content} ${text}` : text
    }));
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    if (activeForCamera === 'new') {
      setImages([...images, imageDataUrl]);
    } else if (activeForCamera === 'edit') {
      setEditImages([...editImages, imageDataUrl]);
    }
    setActiveForCamera(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'edit') => {
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

  const handleStickerSelect = (sticker: string, type: 'new' | 'edit') => {
    if (type === 'new') {
      setNewNote({...newNote, sticker});
    } else {
      setEditedNote({...editedNote, sticker});
    }
  };

  // New function to toggle archive status
  const toggleArchiveStatus = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, archived: !note.archived } 
        : note
    ));
    
    const noteToToggle = notes.find(note => note.id === id);
    if (noteToToggle) {
      const action = noteToToggle.archived ? "unarchived" : "archived";
      toast.success(`Note ${action} successfully!`);
    }
  };

  // Function to filter and sort notes
  const getFilteredAndSortedNotes = () => {
    return notes
      .filter(note => {
        // First filter by archive status
        if (viewMode === "active" && note.archived) return false;
        if (viewMode === "archived" && !note.archived) return false;
        
        // Then filter by category if needed
        return categoryFilter === "all" || note.category === categoryFilter;
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

  const filteredAndSortedNotes = getFilteredAndSortedNotes();

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
                <FileText className="h-5 w-5 mr-2" />
                <h1 className="text-xl font-semibold">Quick Notes</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
            {isWriting ? (
              <div className="space-y-4">
                <Input
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
                
                <div>
                  <Label htmlFor="note-category">Category</Label>
                  <Select 
                    value={newNote.category} 
                    onValueChange={(value) => setNewNote({ ...newNote, category: value })}
                  >
                    <SelectTrigger id="note-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <VoiceToText onTranscript={handleVoiceTranscriptNew} />
                
                <Textarea
                  placeholder="Write your note here..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="min-h-[100px]"
                />
                
                {newNote.sticker && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Selected sticker:</span>
                    <span className="text-2xl">{newNote.sticker}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setNewNote({...newNote, sticker: ""})}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden group">
                        <img 
                          src={image} 
                          alt={`Note ${index}`} 
                          className="w-full h-full object-cover" 
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-1 right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index, 'new')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveForCamera('new');
                      setShowCamera(true);
                    }}
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
                        <Image className="h-4 w-4" />
                        <span>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'new')}
                        />
                      </span>
                    </Button>
                  </label>
                  
                  {renderStickerPicker('new')}
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsWriting(false);
                    setNewNote({ title: "", content: "", sticker: "", category: "Personal" });
                    setImages([]);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNote}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Note
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start">
                <Button onClick={() => setIsWriting(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Button>
                
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
                      {NOTE_CATEGORIES.map(category => (
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
            )}
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedNotes.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium">No notes found</h3>
                <p className="text-gray-500 mt-2">
                  {viewMode === "active" ? 
                    "Start by adding your first note or change your filters" : 
                    "No archived notes found. Try changing your filters."}
                </p>
              </div>
            ) : (
              filteredAndSortedNotes.map((note) => (
                <Card key={note.id} className={`bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 ${note.archived ? 'border-dashed border-gray-300 dark:border-gray-600' : ''}`}>
                  {editingNote === note.id ? (
                    <div className="space-y-4">
                      <Input
                        placeholder="Note title"
                        value={editedNote.title}
                        onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
                      />
                      
                      <div>
                        <Label htmlFor={`edit-category-${note.id}`}>Category</Label>
                        <Select 
                          value={editedNote.category} 
                          onValueChange={(value) => setEditedNote({ ...editedNote, category: value })}
                        >
                          <SelectTrigger id={`edit-category-${note.id}`}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {NOTE_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <VoiceToText onTranscript={handleVoiceTranscriptEdit} />
                      
                      <Textarea
                        placeholder="Edit your note..."
                        value={editedNote.content}
                        onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
                        className="min-h-[100px]"
                      />
                      
                      {editedNote.sticker && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Selected sticker:</span>
                          <span className="text-2xl">{editedNote.sticker}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setEditedNote({...editedNote, sticker: ""})}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      
                      {editImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editImages.map((image, index) => (
                            <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden group">
                              <img 
                                src={image} 
                                alt={`Note ${index}`} 
                                className="w-full h-full object-cover" 
                              />
                              <Button 
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-1 right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index, 'edit')}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setActiveForCamera('edit');
                            setShowCamera(true);
                          }}
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
                              <Image className="h-4 w-4" />
                              <span>Upload Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, 'edit')}
                              />
                            </span>
                          </Button>
                        </label>
                        
                        {renderStickerPicker('edit')}
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                        <Button onClick={() => handleSaveEdit(note.id)}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {note.sticker && (
                            <span className="text-2xl">{note.sticker}</span>
                          )}
                          <h3 className="font-semibold text-lg">{note.title}</h3>
                          {note.archived && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              Archived
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleArchiveStatus(note.id)}
                            title={note.archived ? "Unarchive Note" : "Archive Note"}
                          >
                            {note.archived ? (
                              <ArchiveRestore className="h-4 w-4" />
                            ) : (
                              <Archive className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditNote(note.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {note.category && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                              {note.category}
                            </span>
                          )}
                          <time className="text-xs text-gray-500">
                            {format(note.date, "MMM d, yyyy 'at' h:mm a")}
                          </time>
                          {note.updatedAt && note.updatedAt.getTime() !== note.date.getTime() && (
                            <time className="text-xs text-gray-500">
                              (Updated: {format(note.updatedAt, "MMM d, yyyy")})
                            </time>
                          )}
                        </div>
                        
                        <p className="whitespace-pre-wrap">{note.content}</p>
                        
                        {note.images && note.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {note.images.map((image, index) => (
                              <div key={index} className="w-20 h-20 rounded-md overflow-hidden">
                                <img 
                                  src={image} 
                                  alt={`Note ${index}`} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          open={showCamera}
          onOpenChange={setShowCamera}
        />
      )}
    </div>
  );
};

export default Notes;
