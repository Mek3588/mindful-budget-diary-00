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
import {
  Calendar as CalendarComponent,
  CalendarProps,
} from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { format, parse, isSameDay } from "date-fns";
import {
  Calendar,
  Clock,
  Plus,
  MoreVertical,
  Trash2,
  Edit,
  X,
  Archive,
  Clock10,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useMobile } from "@/hooks/use-mobile";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import HelpDialog from "@/components/HelpDialog";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string; // HH:MM
  category: Category;
  sticker?: string; // Optional sticker
  archived?: boolean; // New archived property
}

type ArchiveFilter = "active" | "archived" | "all";

type Category = "personal" | "work" | "social" | "health" | "other";

type StickerCategory = "emotions" | "activities" | "food" | "travel" | "nature" | "weather" | "animals" | "objects";

interface StickerData {
  category: StickerCategory;
  stickers: string[];
  label: string;
}

const stickerData: StickerData[] = [
  {
    category: "emotions",
    label: "Emotions",
    stickers: ["😊", "😃", "😄", "🥰", "😍", "🤗", "😌", "😎", "🥳", "😢", "😭", "😤", "😠", "😡", "😱", "😨", "😰", "😥", "😓", "😩", "😫", "😖", "🥺", "😐", "😑", "😬", "🙄", "😴", "🤔", "🤫"]
  },
  {
    category: "activities",
    label: "Activities",
    stickers: ["🏃", "🚶", "🧗", "🏋️", "🏊", "🚴", "⛹️", "🤸", "🏄", "🎯", "🎮", "🎨", "🎭", "🎬", "📚", "💼", "👨‍💻", "🧑‍🍳", "🧹", "🛌", "💇", "💆", "🛀", "🧘", "🎵", "🎸", "🎹", "🎤", "🎧", "📝"]
  },
  {
    category: "food",
    label: "Food & Drink",
    stickers: ["🍕", "🍔", "🌭", "🍟", "🥪", "🌮", "🌯", "🥙", "🍗", "🍖", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥗", "🍚", "🍘", "🍙", "🍰", "🎂", "🧁", "🍮", "🍫", "🍬", "🍭", "🍦", "☕", "🍵"]
  },
  {
    category: "travel",
    label: "Travel",
    stickers: ["✈️", "🚗", "🚕", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚚", "🚛", "🚜", "🚲", "🛵", "🏍️", "🛺", "🚂", "🚆", "🚊", "🚉", "🚁", "⛵", "🛥️", "🛳️", "🚢", "🗺️", "🧭", "🏕️", "🏖️", "🏞️"]
  },
  {
    category: "nature",
    label: "Nature",
    stickers: ["🌱", "🌲", "🌳", "🌴", "🌵", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🌺", "🌸", "🌼", "🌻", "🌞", "🌝", "🌛", "🌜", "🌚", "⭐", "🌟", "💫", "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌨️", "⛈️"]
  },
  {
    category: "weather",
    label: "Weather",
    stickers: ["☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️", "❄️", "☃️", "⛄", "🌬️", "💨", "🌊", "💧", "💦", "☔", "⚡", "🌈", "☂️", "⛱️", "🌡️", "🔥", "💥", "✨", "⚡", "☄️", "💫"]
  },
  {
    category: "animals",
    label: "Animals",
    stickers: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌"]
  },
  {
    category: "objects",
    label: "Objects",
    stickers: ["💻", "📱", "⌚", "📷", "📹", "🔋", "🔌", "💡", "🔦", "🕯️", "🧰", "🧲", "🛠️", "🧪", "🧫", "🧬", "🔭", "🔬", "🧠", "👓", "🕶️", "👜", "👛", "👝", "🛍️", "🎒", "👑", "💎", "🔑", "🗝️"]
  }
];

const allStickers = stickerData.flatMap(category => category.stickers);

const categoryColors: Record<Category, string> = {
  personal: "bg-blue-500",
  work: "bg-red-500",
  social: "bg-green-500",
  health: "bg-purple-500",
  other: "bg-gray-500",
};

const categoryBackgroundColors: Record<Category, string> = {
  personal: "bg-blue-100",
  work: "bg-red-100",
  social: "bg-green-100",
  health: "bg-purple-100",
  other: "bg-gray-100",
};

const categoryTextColors: Record<Category, string> = {
  personal: "text-blue-800",
  work: "text-red-800",
  social: "text-green-800",
  health: "text-purple-800",
  other: "text-gray-800",
};

const categoryDisplayNames: Record<Category, string> = {
  personal: "Personal",
  work: "Work",
  social: "Social",
  health: "Health",
  other: "Other",
};

const CalendarPage = () => {
  const isMobile = useMobile();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>("active");
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTime, setEventTime] = useState("12:00");
  const [eventCategory, setEventCategory] = useState<Category>("personal");
  const [eventSticker, setEventSticker] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [availableStickers, setAvailableStickers] = useState(allStickers);
  const [showStickerList, setShowStickerList] = useState(false);
  const [selectedStickerCategory, setSelectedStickerCategory] = useState<StickerCategory | "all">("all");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const savedEvents = localStorage.getItem("calendar-events");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("calendar-events", JSON.stringify(events));
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesArchiveStatus = 
        archiveFilter === "all" ||
        (archiveFilter === "active" && !event.archived) ||
        (archiveFilter === "archived" && event.archived);
      
      const matchesCategory = 
        selectedCategory === "all" || 
        event.category === selectedCategory;
        
      return matchesArchiveStatus && matchesCategory;
    });
  }, [events, selectedCategory, archiveFilter]);

  useEffect(() => {
    if (selectedStickerCategory === "all") {
      setAvailableStickers(allStickers);
    } else {
      const categoryStickers = stickerData.find(
        category => category.category === selectedStickerCategory
      )?.stickers || [];
      setAvailableStickers(categoryStickers);
    }
  }, [selectedStickerCategory]);

  const hasEventsOnDate = (date: Date) => {
    return filteredEvents.some((event) =>
      isSameDay(date, new Date(event.date))
    );
  };

  const getStickerForDate = (date: Date): string | null => {
    const dateEvents = filteredEvents.filter((event) =>
      isSameDay(date, new Date(event.date))
    );
    
    const eventsWithStickers = dateEvents.filter(event => event.sticker && event.sticker.trim());
    if (eventsWithStickers.length > 0) {
      return eventsWithStickers[eventsWithStickers.length - 1].sticker || null;
    }
    
    return null;
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
      
      const dateEvents = filteredEvents.filter((event) =>
        isSameDay(day, new Date(event.date))
      );
      
      if (dateEvents.length === 0) {
        resetEventForm();
        setShowEventDialog(true);
      }
    }
  };

  const resetEventForm = () => {
    setEventTitle("");
    setEventDescription("");
    setEventTime("12:00");
    setEventCategory("personal");
    setEventSticker("");
    setEditingEvent(null);
    setShowDeleteConfirm(false);
    setSelectedStickerCategory("all");
  };

  const handleSaveEvent = () => {
    if (!eventTitle.trim()) {
      toast.error("Event title is required");
      return;
    }

    const eventDate = format(selectedDate, "yyyy-MM-dd");

    if (editingEvent) {
      const updatedEvents = events.map((event) =>
        event.id === editingEvent.id
          ? {
              ...event,
              title: eventTitle,
              description: eventDescription,
              time: eventTime,
              category: eventCategory,
              sticker: eventSticker,
            }
          : event
      );
      setEvents(updatedEvents);
      toast.success("Event updated successfully");
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        description: eventDescription,
        date: eventDate,
        time: eventTime,
        category: eventCategory,
        sticker: eventSticker,
        archived: false,
      };
      setEvents([...events, newEvent]);
      toast.success("Event created successfully");
    }

    setShowEventDialog(false);
    setShowEditDialog(false);
    resetEventForm();
  };

  const handleDeleteEvent = () => {
    if (editingEvent) {
      const updatedEvents = events.filter(
        (event) => event.id !== editingEvent.id
      );
      setEvents(updatedEvents);
      toast.success("Event deleted successfully");
      setShowEventDialog(false);
      setShowEditDialog(false);
      resetEventForm();
    }
  };

  const toggleArchiveEvent = (eventId: string) => {
    const updatedEvents = events.map((event) =>
      event.id === eventId
        ? { ...event, archived: !event.archived }
        : event
    );
    setEvents(updatedEvents);
    
    const event = events.find(e => e.id === eventId);
    if (event) {
      if (!event.archived) {
        toast.success("Event archived successfully");
      } else {
        toast.success("Event unarchived successfully");
      }
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description);
    setEventTime(event.time);
    setEventCategory(event.category);
    setEventSticker(event.sticker || "");
    setSelectedDate(new Date(event.date));
    setEditEventId(event.id);
    setShowEditDialog(true);
  };

  const eventsForSelectedDate = useMemo(() => {
    return filteredEvents.filter((event) =>
      isSameDay(selectedDate, new Date(event.date))
    );
  }, [filteredEvents, selectedDate]);

  const sortedEventsForSelectedDate = useMemo(() => {
    return [...eventsForSelectedDate].sort((a, b) => {
      if (!a.time) return -1;
      if (!b.time) return 1;
      return a.time.localeCompare(b.time);
    });
  }, [eventsForSelectedDate]);

  return (
    <div className="container px-4 mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 lg:col-span-8 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">Calendar</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                >
                  Today
                </Button>
                <Button 
                  onClick={() => {
                    resetEventForm();
                    setShowEventDialog(true);
                  }}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHelp(true)}
                >
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Help
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDayClick}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border"
                modifiers={{
                  has_event: hasEventsOnDate,
                }}
                modifiersClassNames={{
                  has_event: "font-bold text-primary",
                }}
                displaySticker={getStickerForDate}
              />
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4 items-start sm:items-center">
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
                
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Category:</span>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => 
                      setSelectedCategory(value as Category | "all")
                    }
                  >
                    <SelectTrigger className="w-[150px] h-8">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
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
                  onClick={() => {
                    resetEventForm();
                    setShowEventDialog(true);
                  }}
                  variant="outline" 
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No events scheduled for this day.
                </p>
              ) : (
                <div className="space-y-4">
                  {sortedEventsForSelectedDate.map((event) => (
                    <Card key={event.id} className={`${categoryBackgroundColors[event.category]} border-none shadow-sm ${event.archived ? "opacity-70" : ""}`}>
                      <CardHeader className="pb-2 pt-4 px-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`${categoryColors[event.category]}`}>
                                {categoryDisplayNames[event.category]}
                              </Badge>
                              {event.archived && (
                                <Badge variant="outline" className="text-gray-500 border-gray-400">
                                  <Archive className="h-3 w-3 mr-1" />
                                  Archived
                                </Badge>
                              )}
                              {event.sticker && (
                                <span className="text-xl">{event.sticker}</span>
                              )}
                            </div>
                            <CardTitle className={`text-base ${categoryTextColors[event.category]}`}>
                              {event.title}
                            </CardTitle>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {event.time}
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
                              <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleArchiveEvent(event.id)}>
                                <Archive className="h-4 w-4 mr-2" />
                                {event.archived ? "Unarchive" : "Archive"}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  handleEditEvent(event);
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
                      {event.description && (
                        <CardContent className="pb-4 pt-0 px-4">
                          <p className={`text-sm ${categoryTextColors[event.category]}`}>
                            {event.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-5 lg:col-span-4 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Events scheduled for the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-15rem)]">
                <div className="space-y-4">
                  {filteredEvents
                    .filter((event) => {
                      const eventDate = new Date(event.date);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      return eventDate >= today;
                    })
                    .sort((a, b) => {
                      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
                      if (dateCompare !== 0) return dateCompare;
                      
                      if (!a.time) return -1;
                      if (!b.time) return 1;
                      return a.time.localeCompare(b.time);
                    })
                    .slice(0, 15)
                    .map((event) => (
                      <Card key={event.id} className={`shadow-sm ${event.archived ? "opacity-70" : ""}`}>
                        <CardHeader className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <Badge className={`${categoryColors[event.category]}`}>
                                  {categoryDisplayNames[event.category]}
                                </Badge>
                                {event.archived && (
                                  <Badge variant="outline" className="text-gray-500 border-gray-400">
                                    <Archive className="h-3 w-3 mr-1" />
                                    Archived
                                  </Badge>
                                )}
                                {event.sticker && (
                                  <span className="text-xl">{event.sticker}</span>
                                )}
                              </div>
                              <CardTitle className="text-sm">{event.title}</CardTitle>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                {format(new Date(event.date), "MMM d")}
                                <Clock className="h-3 w-3 ml-2 mr-1" />
                                {event.time}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleArchiveEvent(event.id)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  {event.archived ? "Unarchive" : "Archive"}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    handleEditEvent(event);
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
                  
                  {filteredEvents.filter(event => new Date(event.date) >= new Date()).length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">No upcoming events</p>
                      <Button 
                        className="mt-4" 
                        variant="outline" 
                        onClick={() => {
                          resetEventForm();
                          setShowEventDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Event
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Regular event dialog for adding new events */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-md max-w-[95vw] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "Add New Event"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent
                ? "Make changes to your event here."
                : "Create a new event for your calendar."}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            <div className="grid gap-4 py-4 px-1">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-date" className={isMobile ? "col-span-4" : "text-right"}>
                  Date
                </Label>
                <div className={isMobile ? "col-span-4" : "col-span-3"}>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(selectedDate, "MMMM d, yyyy")}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-time" className={isMobile ? "col-span-4" : "text-right"}>
                  Time
                </Label>
                <Input
                  id="event-time"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className={isMobile ? "col-span-4" : "col-span-3"}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-title" className={isMobile ? "col-span-4" : "text-right"}>
                  Title
                </Label>
                <Input
                  id="event-title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className={isMobile ? "col-span-4" : "col-span-3"}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className={isMobile ? "col-span-4" : "text-right"}>Category</Label>
                <div className={isMobile ? "col-span-4" : "col-span-3"}>
                  <Select
                    value={eventCategory}
                    onValueChange={(value) => setEventCategory(value as Category)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className={isMobile ? "col-span-4" : "text-right"}>Sticker</Label>
                <div className={`flex items-center gap-2 ${isMobile ? "col-span-4" : "col-span-3"}`}>
                  <Input
                    value={eventSticker}
                    onChange={(e) => setEventSticker(e.target.value)}
                    placeholder="Select or type an emoji"
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setShowStickerList(!showStickerList)}
                    className="px-3"
                  >
                    {eventSticker || "😊"}
                  </Button>
                </div>
              </div>
              
              {showStickerList && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <div className={isMobile ? "col-span-4" : "col-span-1 text-right pt-2"}>
                    <Label>Categories</Label>
                  </div>
                  <div className={isMobile ? "col-span-4" : "col-span-3"}>
                    <Select
                      value={selectedStickerCategory}
                      onValueChange={(value) => setSelectedStickerCategory(value as StickerCategory | "all")}
                    >
                      <SelectTrigger className="mb-3">
                        <SelectValue placeholder="Sticker category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stickers</SelectItem>
                        {stickerData.map((category) => (
                          <SelectItem key={category.category} value={category.category}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="border rounded-md p-2">
                      <ScrollArea className="h-[150px]">
                        <div className="grid grid-cols-8 gap-1 p-1">
                          {availableStickers.map(sticker => (
                            <Button
                              key={sticker}
                              variant="ghost"
                              className="h-8 w-8 p-0 text-xl hover:bg-muted"
                              onClick={() => {
                                setEventSticker(sticker);
                                setShowStickerList(false);
                              }}
                            >
                              {sticker}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="event-description" className={isMobile ? "col-span-4" : "text-right pt-2"}>
                  Description
                </Label>
                <Textarea
                  id="event-description"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className={isMobile ? "col-span-4" : "col-span-3"}
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>
          
          {showDeleteConfirm ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
              <h4 className="font-medium text-red-800 dark:
