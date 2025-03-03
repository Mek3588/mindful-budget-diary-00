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
  ChevronDown,
  ChevronUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const STICKER_CATEGORIES = [
  { id: "emotions", name: "Emotions" },
  { id: "nature", name: "Nature" },
  { id: "food", name: "Food" },
  { id: "activities", name: "Activities" },
  { id: "travel", name: "Travel" },
  { id: "objects", name: "Objects" },
  { id: "symbols", name: "Symbols" },
  { id: "animals", name: "Animals" },
];

const STICKERS = {
  emotions: [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", 
    "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", 
    "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", 
    "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", 
    "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁", "☹️", 
    "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱"
  ],
  nature: [
    "🌱", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🍄",
    "🌰", "🦠", "🌹", "🥀", "🌺", "🌻", "🌼", "🌷", "💐", "🌸", "💮", "🏵️", "🌞", 
    "🌝", "🌛", "🌜", "🌚", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", 
    "🌎", "🌍", "🌏", "🪐", "💫", "⭐", "🌟", "✨", "⚡", "☄️", "💥", "🔥", "✨", 
    "🌈", "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️", "❄️", "☃️", 
    "⛄", "🌬️", "💨", "💧", "💦", "☔", "☂️", "🌊", "🌫️"
  ],
  food: [
    "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", 
    "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕", "🧄", 
    "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", 
    "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🥪", "🥙", "🧆", 
    "🌮", "🌯", "🥗", "🥘", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", 
    "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍧", "🍨", "🍦", "🥧", "🧁", 
    "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", 
    "🍼", "🫖", "☕", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", 
    "🍸", "🍹", "🧉", "🍾", "🧊"
  ],
  activities: [
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", 
    "🏒", "🏑", "🥍", "🏏", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", 
    "🛹", "🛼", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "🤺", 
    "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗", "🚴", "🚵", "🎖️", "🏆", 
    "🥇", "🥈", "🥉", "🏅", "🎪", "🎫", "🎟️", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", 
    "🎹", "🥁", "🎷", "🎺", "🎸", "🪕", "🎻", "🎲", "♟️", "🎯", "🎳", "🎮", "🎰", 
    "🧩", "👾", "🎭", "🎪", "🎨", "🧵", "🧶", "🎻"
  ],
  travel: [
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", 
    "🦯", "🦽", "🦼", "🛴", "🚲", "🛵", "🏍️", "🛺", "🚔", "🚍", "🚘", "🚖", "🚡", 
    "🚠", "🚟", "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚊", 
    "🚉", "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", 
    "🛥️", "🛳️", "⛴️", "🚢", "⚓", "🚧", "⛽", "🚏", "🚦", "🚥", "🗿", "🗽", "🗼", 
    "🏰", "🏯", "🏟️", "🏖️", "🏝️", "🏜️", "🌋", "⛰️", "🏔️", "🏕️", "⛺", "🏠", "🏡", 
    "🏘️", "🏚️", "🏗️", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "🏩", 
    "💒", "🏛️", "⛪", "🕌", "🕍", "🛕", "🕋", "⛩️", "🛤️", "🛣️", "🗾", "🎑", "🏞️"
  ],
  objects: [
    "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💽", "💾", 
    "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", 
    "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", 
    "🔋", "🔌", "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷", 
    "💰", "💳", "💎", "⚖️", "🧰", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🔩", "⚙️", "🧱", 
    "⛓️", "🧲", "🔫", "💣", "🧨", "🪓", "🔪", "🗡️", "⚔️", "🛡️", "🚬", "⚰️", "⚱️", 
    "🏺", "🔮", "📿", "🧿", "💈", "⚗️", "🔭", "🔬", "🕳️", "💊", "💉", "🩸", "🩹", 
    "🩺", "🌡️", "🧬", "🦠", "🧫", "🧪", "🧹", "🧺", "🧻", "🚽", "🚰", "🚿", "🛁", 
    "🛀", "🧼", "🪒", "🧽", "🧴", "🛎️", "🔑", "🗝️", "🚪", "🪑", "🛋️", "🛏️", "🛌", 
    "🧸", "🖼️", "🛍️", "🛒", "🎁", "🎈", "🎏", "🎀", "🎊", "🎉", "🎎", "🏮", "🎐"
  ],
  symbols: [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", 
    "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", 
    "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", 
    "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴", "📳", "🈶", "🈚", "🈸", "🈺", 
    "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️", "🅱️", 
    "🆎", "🆑", "🅾️", "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯", "💢", "♨️", 
    "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭", "❗", "❕", "❓", "❔", "‼️", "⁉️", "🔅", 
    "🔆", "〽️", "⚠️", "🚸", "🔱", "⚜️", "🔰", "♻️", "✅", "🈯", "💹", "❇️", "✳️", 
    "❎", "🌐", "💠", "Ⓜ️", "🌀", "💤", "🏧", "🚾", "♿", "🅿️", "🈳", "🈂️", "🛂", 
    "🛃", "🛄", "🛅", "🚹", "🚺", "🚼", "⚧", "🚻", "🚮", "🎦", "📶", "🈁", "🔣", 
    "ℹ️", "🔤", "🔡", "🔠", "🆖", "🆗", "🆙", "🆒", "🆕", "🆓", "0️⃣", "1️⃣", "2️⃣", 
    "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "#️⃣", "*️⃣", "⏏️", 
    "▶️", "⏸️", "⏯️", "⏹️", "⏺️", "⏭️", "⏮️", "⏩", "⏪", "⏫", "⏬", "◀️", "🔼", 
    "🔽", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️", "↙️", "↖️", "↕️", "↔️", "↪️", "↩️", 
    "⤴️", "⤵️", "🔀", "🔁", "🔂", "🔄", "🔃", "🎵", "🎶", "➕", "➖", "➗", "✖️", "♾️", 
    "💲", "💱", "™️", "©️", "®️", "👁️‍🗨️", "🔚", "🔙", "🔛", "🔝", "🔜"
  ],
  animals: [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", 
    "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", 
    "🦆", "🦢", "🦉", "🦚", "🦜", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", 
    "🐞", "🐜", "🦗", "🕷️", "🕸️", "🦂", "🦟", "🦠", "🐢", "🐍", "🦎", "🦖", "🦕", 
    "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", 
    "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", 
    "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", 
    "🐈", "🐈‍⬛", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡", 
    "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔", "🐾", "🐉", "🐲", "🌵", "🦔"
  ]
};

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
  const [activeStickerCategory, setActiveStickerCategory] = useState("emotions");
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [showAllDateEntries, setShowAllDateEntries] = useState(false);

  useEffect(() => {
    const savedEntries = localStorage.getItem("diary-entries");
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (error) {
        console.error("Error parsing diary entries:", error);
        setEntries([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("diary-entries", JSON.stringify(entries));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      return archiveFilter === "all" ||
             (archiveFilter === "active" && !entry.archived) ||
             (archiveFilter === "archived" && entry.archived);
    });
  }, [entries, archiveFilter]);

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
          const moodOrder: Record<Mood, number> = { happy: 0, neutral: 1, sad: 2 };
          return moodOrder[a.mood] - moodOrder[b.mood];
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }, [filteredEntries, sortOption]);

  const handleAddEntry = () => {
    setIsAddingEntry(true);
    setEditingEntry(null);
    setNewEntryTitle("");
    setNewEntryContent("");
    setNewEntryMood("neutral");
    setSelectedStickers([]);
    setCapturedImage(null);
  };

  const handleSaveEntry = () => {
    if (!newEntryTitle.trim()) {
      toast.error("Entry title is required");
      return;
    }

    const entryDate = format(selectedDate, "yyyy-MM-dd");

    let finalContent = newEntryContent;
    if (capturedImage) {
      finalContent = `${finalContent}\n\n![Captured Image](${capturedImage})`;
    }

    const updatedEntries = [...entries];

    if (editingEntry) {
      const index = updatedEntries.findIndex(entry => entry.id === editingEntry.id);
      
      if (index !== -1) {
        updatedEntries[index] = {
          ...editingEntry,
          title: newEntryTitle,
          content: finalContent,
          date: entryDate,
          mood: newEntryMood,
          stickers: selectedStickers,
        };
        
        setEntries(updatedEntries);
        toast.success("Entry updated successfully");
      }
    } else {
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        title: newEntryTitle,
        content: finalContent,
        date: entryDate,
        mood: newEntryMood,
        archived: false,
        stickers: selectedStickers,
      };
      
      setEntries([newEntry, ...updatedEntries]);
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

  const toggleArchiveEntry = (entryId: string) => {
    const updatedEntries = entries.map((entry) =>
      entry.id === entryId
        ? { ...entry, archived: !entry.archived }
        : entry
    );
    setEntries(updatedEntries);

    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      if (!entry.archived) {
        toast.success("Entry archived successfully");
      } else {
        toast.success("Entry unarchived successfully");
      }
    }
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setIsAddingEntry(true);
    setEditingEntry(entry);
    
    setNewEntryTitle(entry.title);
    setNewEntryContent(entry.content.replace(/\n\n!\[Captured Image\]\(.*\)/, ''));
    setNewEntryMood(entry.mood);
    setSelectedDate(new Date(entry.date));
    setSelectedStickers(entry.stickers || []);
    
    const imageMatch = entry.content.match(/\n\n!\[Captured Image\]\((.*)\)/);
    if (imageMatch && imageMatch[1]) {
      setCapturedImage(imageMatch[1]);
    } else {
      setCapturedImage(null);
    }
  };

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

  const toggleSticker = (sticker: string) => {
    if (selectedStickers.includes(sticker)) {
      setSelectedStickers(selectedStickers.filter(s => s !== sticker));
    } else {
      setSelectedStickers([...selectedStickers, sticker]);
    }
  };

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

  const handleImageCapture = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setShowCamera(false);
    toast.success("Image captured successfully");
  };

  const entriesForSelectedDate = useMemo(() => {
    return sortedEntries.filter((entry) =>
      isSameDay(selectedDate, new Date(entry.date))
    );
  }, [sortedEntries, selectedDate]);

  const renderStickerPicker = () => (
    <Tabs defaultValue={activeStickerCategory} onValueChange={setActiveStickerCategory}>
      <TabsList className="grid grid-cols-4 mb-2">
        {STICKER_CATEGORIES.slice(0, 4).map(category => (
          <TabsTrigger key={category.id} value={category.id}>
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsList className="grid grid-cols-4 mb-2">
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
                  className={cn(
                    "text-xl p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded",
                    selectedStickers.includes(sticker) && "bg-primary/20"
                  )}
                  onClick={() => toggleSticker(sticker)}
                >
                  {sticker}
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );

  const renderEditForm = () => {
    return (
      <div className="w-full lg:w-3/4 mx-auto">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <Input
              key={`title-${editingEntry?.id || 'new'}`}
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
            key={`mood-${editingEntry?.id || 'new'}`}
            defaultValue={newEntryMood}
            className="flex items-center space-x-2"
            onValueChange={(value) => setNewEntryMood(value as Mood)}
            value={newEntryMood}
          >
            {moodItems.map((mood) => (
              <div key={mood.value} className="flex items-center space-x-1">
                <RadioGroupItem value={mood.value} id={`${mood.value}-${editingEntry?.id || 'new'}`} className="peer h-4 w-4 shrink-0 rounded-full border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                <Label htmlFor={`${mood.value}-${editingEntry?.id || 'new'}`} className="cursor-pointer peer-checked:text-primary flex items-center gap-1">
                  {mood.icon} {mood.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Textarea
            key={`content-${editingEntry?.id || 'new'}`}
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
              <Smile className="h-4 w-4 mr-2" />
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
            <div className="p-3 bg-muted rounded-md">
              {renderStickerPicker()}
            </div>
          )}

          {selectedStickers.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-background border rounded-md">
              <span className="text-sm text-muted-foreground mr-1">Selected:</span>
              {selectedStickers.map((sticker, index) => (
                <span key={index} className="text-xl">{sticker}</span>
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
    );
  };

  const displayedEntries = useMemo(() => {
    return showAllEntries ? sortedEntries : sortedEntries.slice(0, 3);
  }, [sortedEntries, showAllEntries]);

  const displayedDateEntries = useMemo(() => {
    return showAllDateEntries ? entriesForSelectedDate : entriesForSelectedDate.slice(0, 3);
  }, [entriesForSelectedDate, showAllDateEntries]);

  return (
    <div className="container px-4 mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
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
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Archive Status</h4>
                        <div className="flex flex-col space-y-1.5">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={archiveFilter === "active"}
                              onChange={() => setArchiveFilter("active")}
                              className="form-radio h-4 w-4"
                            />
                            <span>Active</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={archiveFilter === "archived"}
                              onChange={() => setArchiveFilter("archived")}
                              className="form-radio h-4 w-4"
                            />
                            <span>Archived</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={archiveFilter === "all"}
                              onChange={() => setArchiveFilter("all")}
                              className="form-radio h-4 w-4"
                            />
                            <span>All</span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Sort By</h4>
                        <div className="flex flex-col space-y-1.5">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={sortOption === "newest"}
                              onChange={() => setSortOption("newest")}
                              className="form-radio h-4 w-4"
                            />
                            <span>Newest First</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={sortOption === "oldest"}
                              onChange={() => setSortOption("oldest")}
                              className="form-radio h-4 w-4"
                            />
                            <span>Oldest First</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={sortOption === "title"}
                              onChange={() => setSortOption("title")}
                              className="form-radio h-4 w-4"
                            />
                            <span>Title</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={sortOption === "mood"}
                              onChange={() => setSortOption("mood")}
                              className="form-radio h-4 w-4"
                            />
                            <span>Mood</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="text-sm text-muted-foreground">
                  Total entries: {sortedEntries.length}
                </div>
              </div>

              {isAddingEntry ? (
                renderEditForm()
              ) : (
                <>
                  <div className="space-y-4">
                    {displayedEntries.length > 0 ? (
                      displayedEntries.map((entry) => (
                        <Card key={entry.id} className="overflow-hidden">
                          <CardHeader className="flex flex-row items-start justify-between p-4">
                            <div className="flex-1 pr-4">
                              <div className="flex items-center gap-2">
                                <CardTitle className="flex-1 truncate text-base font-semibold">
                                  {entry.title}
                                </CardTitle>
                                <div className="h-5 w-5 flex items-center justify-center">
                                  {entry.mood === "happy" && (
                                    <Smile className="h-4 w-4 text-green-500" />
                                  )}
                                  {entry.mood === "neutral" && (
                                    <SunMedium className="h-4 w-4 text-yellow-500" />
                                  )}
                                  {entry.mood === "sad" && (
                                    <Moon className="h-4 w-4 text-blue-500" />
                                  )}
                                </div>
                              </div>
                              <CardDescription className="mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{format(new Date(entry.date), "PPP")}</span>
                                {entry.archived && <Badge variant="outline">Archived</Badge>}
                              </CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditEntry(entry)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleArchiveEntry(entry.id)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  {entry.archived ? "Unarchive" : "Archive"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingEntry(entry);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </CardHeader>
                          <CardContent className="px-4 pb-4 pt-0">
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <div className="line-clamp-3 mb-2">{entry.content}</div>
                              {entry.stickers && entry.stickers.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {entry.stickers.map((sticker, idx) => (
                                    <span key={idx} className="text-lg">
                                      {sticker}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <div className="text-3xl">📔</div>
                        <h3 className="mt-2 text-xl font-semibold">No entries found</h3>
                        <p className="mt-1 text-muted-foreground">
                          {archiveFilter === "active"
                            ? "You don't have any active entries."
                            : archiveFilter === "archived"
                            ? "You don't have any archived entries."
                            : "You don't have any entries yet."}
                        </p>
                        <Button onClick={handleAddEntry} className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Add your first entry
                        </Button>
                      </div>
                    )}
                    
                    {sortedEntries.length > 3 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowAllEntries(!showAllEntries)}
                      >
                        {showAllEntries ? (
                          <>
                            <ChevronUp className="mr-2 h-4 w-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-2 h-4 w-4" />
                            Show All ({sortedEntries.length - 3} more)
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <Card className="max-w-md w-full m-4">
                        <CardHeader>
                          <CardTitle>Delete Entry</CardTitle>
                          <CardDescription>
                            Are you sure you want to delete this entry? This action cannot be
                            undone.
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleDeleteEntry}>
                            Delete
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-5 lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row">
              <div>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to view entries</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Entries for {format(selectedDate, "MMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entriesForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {displayedDateEntries.map((entry) => (
                    <Card key={entry.id} className="overflow-hidden">
                      <CardHeader className="flex flex-row items-start justify-between p-4">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2">
                            <CardTitle className="flex-1 truncate text-base font-semibold">
                              {entry.title}
                            </CardTitle>
                            <div className="h-5 w-5 flex items-center justify-center">
                              {entry.mood === "happy" && (
                                <Smile className="h-4 w-4 text-green-500" />
                              )}
                              {entry.mood === "neutral" && (
                                <SunMedium className="h-4 w-4 text-yellow-500" />
                              )}
                              {entry.mood === "sad" && (
                                <Moon className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditEntry(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 pt-0">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <div className="line-clamp-2">{entry.content}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {entriesForSelectedDate.length > 3 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowAllDateEntries(!showAllDateEntries)}
                    >
                      {showAllDateEntries ? (
                        <>
                          <ChevronUp className="mr-2 h-4 w-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-2 h-4 w-4" />
                          Show All ({entriesForSelectedDate.length - 3} more)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-3xl">📆</div>
                  <h3 className="mt-2 text-lg font-semibold">No entries for this date</h3>
                  <Button onClick={handleAddEntry} className="mt-3" size="sm">
                    <Plus className="mr-2 h-3 w-3" />
                    Add entry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showCamera && (
        <CameraCapture 
          onCapture={handleImageCapture} 
          open={showCamera} 
          onOpenChange={setShowCamera} 
          onCancel={() => setShowCamera(false)} 
        />
      )}
    </div>
  );
};

export default Diary;
