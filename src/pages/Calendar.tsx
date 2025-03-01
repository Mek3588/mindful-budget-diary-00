
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Calendar as CalendarIcon, 
  Edit, 
  Trash,
  Sticker,
  CalendarDays,
  Filter
} from "lucide-react";
import { format, addMonths, subMonths, isSameDay, startOfMonth, isWithinInterval, endOfMonth, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";

type EventCategory = 'personal' | 'work' | 'health' | 'birthday' | 'note' | 'diary' | 'goal' | 'medical';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: EventCategory;
  tags?: string[];
  sticker?: string;
}

interface Sticker {
  id: string;
  emoji: string;
  date: Date;
  position: { x: number; y: number };
}

const CategoryColors: Record<EventCategory, string> = {
  personal: "bg-blue-500",
  work: "bg-yellow-500",
  health: "bg-green-500",
  birthday: "bg-purple-500",
  note: "bg-slate-500",
  diary: "bg-pink-500",
  goal: "bg-orange-500",
  medical: "bg-red-500"
};

const Calendar = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date(),
    category: "personal" as EventCategory
  });
  
  const [showEventDetailsDialog, setShowEventDetailsDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const [showStickerDialog, setShowStickerDialog] = useState(false);
  const [stickerEmoji, setStickerEmoji] = useState("😊");
  const [stickerDate, setStickerDate] = useState<Date>(new Date());
  
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  
  const commonEmojis = ["😊", "😂", "❤️", "👍", "🎉", "🎂", "🏆", "⭐", "🔥", "💯", "🙏", "✅", "💪"];

  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fix the DateRange type issue by making 'to' optional in our state
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to?: Date;
  }>({
    from: startOfMonth(currentMonth),
    to: endOfMonth(currentMonth)
  });

  // Function to handle DateRange changes safely
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (!range) {
      // If range is undefined, reset to current month
      setDateRange({
        from: startOfMonth(currentMonth),
        to: endOfMonth(currentMonth)
      });
    } else if (range.from) {
      // If range.from exists, update the state
      setDateRange({
        from: range.from,
        to: range.to
      });
    }
  };

  useEffect(() => {
    const loadEvents = () => {
      const savedEvents = localStorage.getItem('calendar-events');
      const savedDiaryEntries = localStorage.getItem('diary-entries');
      const savedNotes = localStorage.getItem('quick-notes');
      const savedGoals = localStorage.getItem('user-goals');
      const savedMedical = localStorage.getItem('medical-records');
      
      let allEvents: Event[] = [];
      
      if (savedEvents) {
        allEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
      }
      
      // Add events from other sources, ensuring no duplicate IDs
      const processSources = (source: any[], category: EventCategory, prefix: string) => {
        if (!source || !Array.isArray(source)) return [];
        return source.map((item: any) => {
          const id = `${prefix}-${item.id}`;
          // Check if this event already exists in allEvents
          if (allEvents.some(e => e.id === id)) return null;
          
          return {
            id,
            title: category === 'diary' ? "Diary Entry" : (item.title || (category === 'medical' ? "Medical Appointment" : "")),
            description: item.content || item.description || item.notes || item.prescription || "",
            date: new Date(item.date || item.appointmentDate || item.dueDate || item.createdAt),
            category,
            tags: category === 'diary' ? [`mood-${item.mood}`, `energy-${item.energy}`] :
                 category === 'goal' ? [`priority-${item.priority}`, `status-${item.status}`] :
                 category === 'medical' ? [item.type || "appointment", item.status || "scheduled"] : []
          };
        }).filter(Boolean); // Remove null items
      };
      
      if (savedDiaryEntries) {
        const diaryEntries = JSON.parse(savedDiaryEntries);
        const diaryEvents = processSources(diaryEntries, 'diary', 'diary');
        allEvents = [...allEvents, ...diaryEvents];
      }
      
      if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        const noteEvents = processSources(notes, 'note', 'note');
        allEvents = [...allEvents, ...noteEvents];
      }
      
      if (savedGoals) {
        const goals = JSON.parse(savedGoals);
        const goalEvents = processSources(goals, 'goal', 'goal');
        allEvents = [...allEvents, ...goalEvents];
      }
      
      if (savedMedical) {
        const medical = JSON.parse(savedMedical);
        // Generate unique keys for medical events to avoid duplicates
        const medicalEvents = processSources(medical, 'medical', 'medical').map((event, index) => ({
          ...event,
          id: `medical-${index}-${Date.now()}`
        }));
        allEvents = [...allEvents, ...medicalEvents];
      }
      
      setEvents(allEvents);
    };

    loadEvents();
    
    const savedStickers = localStorage.getItem('calendar-stickers');
    if (savedStickers) {
      setStickers(JSON.parse(savedStickers).map((sticker: any) => ({
        ...sticker,
        date: new Date(sticker.date)
      })));
    }
  }, []);

  // Update dateRange when currentMonth changes
  useEffect(() => {
    setDateRange({
      from: startOfMonth(currentMonth),
      to: endOfMonth(currentMonth)
    });
  }, [currentMonth]);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const hasEventsOnDate = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const modifiers = {
    has_event: (date: Date) => hasEventsOnDate(date)
  };

  const handleDayClick = (date: Date) => {
    const eventsOnDate = getEventsForDate(date);
    if (eventsOnDate.length > 0) {
      setSelectedEvent(eventsOnDate[0]);
      setShowEventDetailsDialog(true);
    } else {
      setNewEvent({
        ...newEvent,
        date: date
      });
      setShowAddEventDialog(true);
    }
  };

  const handleAddEvent = () => {
    setShowAddEventDialog(true);
  };

  const handleEditEvent = (event: Event) => {
    setNewEvent({
      title: event.title,
      description: event.description,
      date: new Date(event.date),
      category: event.category
    });
    setIsEditMode(true);
    setSelectedEvent(event);
    setShowAddEventDialog(true);
  };

  const handleSaveEvent = () => {
    if (!newEvent.title.trim() || !newEvent.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (isEditMode && selectedEvent) {
      const updatedEvents = events.map(event => 
        event.id === selectedEvent.id ? {
          ...event,
          title: newEvent.title,
          description: newEvent.description,
          date: newEvent.date,
          category: newEvent.category
        } : event
      );
      
      setEvents(updatedEvents);
      localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));
      toast.success("Event updated successfully!");
    } else {
      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        category: newEvent.category
      };

      setEvents([...events, event]);
      localStorage.setItem('calendar-events', JSON.stringify([...events, event]));
      toast.success("Event saved successfully!");
    }
    
    setShowAddEventDialog(false);
    setNewEvent({ title: "", description: "", date: new Date(), category: "personal" });
    setIsEditMode(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));
    setShowEventDetailsDialog(false);
    toast.success("Event deleted successfully!");
  };

  const handleAddSticker = (date: Date) => {
    setStickerDate(date);
    setShowStickerDialog(true);
  };

  const handleAddStickerToEvent = (eventId: string) => {
    setStickerDate(new Date());
    setShowStickerDialog(true);
    setSelectedEvent(events.find(event => event.id === eventId) || null);
  };

  const handleSaveSticker = () => {
    const sticker: Sticker = {
      id: Date.now().toString(),
      emoji: stickerEmoji,
      date: stickerDate,
      position: { x: 50, y: 50 }
    };

    if (selectedEvent) {
      const updatedEvents = events.map(event => 
        event.id === selectedEvent.id ? {
          ...event,
          sticker: stickerEmoji
        } : event
      );
      
      setEvents(updatedEvents);
      localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));
      toast.success(`Sticker added to "${selectedEvent.title}"`);
    } else {
      setStickers([...stickers, sticker]);
      localStorage.setItem('calendar-stickers', JSON.stringify([...stickers, sticker]));
      toast.success("Sticker added to calendar!");
    }
    
    setShowStickerDialog(false);
    setStickerEmoji("😊");
    setSelectedEvent(null);
  };

  // Reset date range to current month
  const handleResetDateRange = () => {
    const newFrom = startOfMonth(currentMonth);
    const newTo = endOfMonth(currentMonth);
    
    setDateRange({
      from: newFrom,
      to: newTo
    });
    
    toast.success(`Date range reset to ${format(newFrom, "MMMM yyyy")}`);
  };

  // Filter events based on selected category and date range
  const filteredEvents = events.filter(event => {
    // Category filter
    const categoryMatches = selectedCategory === "all" || event.category === selectedCategory;
    
    // Date range filter
    let dateMatches = true;
    if (dateRange.from) {
      const eventDate = new Date(event.date);
      if (dateRange.to) {
        dateMatches = isWithinInterval(eventDate, {
          start: dateRange.from,
          end: dateRange.to
        });
      } else {
        // If only 'from' is set, just check if date is after 'from'
        dateMatches = eventDate >= dateRange.from;
      }
    }
    
    return categoryMatches && dateMatches;
  });

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
                <CalendarIcon className="h-5 w-5 mr-2" />
                <h1 className="text-xl font-semibold">Calendar</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <div>
                  <h2 className="text-lg font-semibold">
                    {format(currentMonth, "MMMM yyyy")}
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                </div>
              </div>
              
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-sm">
                    {dateRange.from ? format(dateRange.from, "MMM d, yyyy") : "Select start date"} 
                    {dateRange.to ? ` - ${format(dateRange.to, "MMM d, yyyy")}` : ""}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetDateRange}
                >
                  Reset Range
                </Button>
              </div>
              
              <div className="overflow-x-auto calendar-container">
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  month={currentMonth}
                  onDayClick={handleDayClick}
                  className="rounded-md border w-full"
                  modifiers={modifiers}
                />
              </div>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
                <h2 className="text-lg font-semibold">Events</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value as EventCategory | "all")}
                  >
                    <SelectTrigger className="w-[140px] sm:w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.keys(CategoryColors).map((category) => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center">
                            <div 
                              className={`w-3 h-3 rounded-full mr-2 ${CategoryColors[category as EventCategory]}`}
                            />
                            <span className="capitalize">{category}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleAddEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${CategoryColors[event.category]}`}></div>
                        <span className="truncate">
                          {format(new Date(event.date), "MMM d")} - {event.title} 
                          {event.sticker && <span className="ml-2">{event.sticker}</span>}
                        </span>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => handleEditEvent(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAddStickerToEvent(event.id)}>
                          <Sticker className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No events for the selected filters.</p>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {Object.entries(CategoryColors).map(([category, color]) => (
                  <div 
                    key={category} 
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedCategory === category ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    onClick={() => setSelectedCategory(selectedCategory === category ? "all" : category as EventCategory)}
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${color}`}></div>
                      <span className="capitalize">{category}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {events.filter(e => e.category === category).length}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Stickers</h2>
              <div className="grid grid-cols-4 gap-2">
                {commonEmojis.map((emoji) => (
                  <Button key={emoji} variant="outline" onClick={() => {
                    setStickerEmoji(emoji);
                    handleAddSticker(new Date()); // Default to today
                  }}>
                    {emoji}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showAddEventDialog} onOpenChange={(open) => {
        setShowAddEventDialog(open);
        if (!open) {
          setIsEditMode(false);
          setNewEvent({ title: "", description: "", date: new Date(), category: "personal" });
        }
      }}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border border-gray-700 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-white">{isEditMode ? "Edit Event" : "Add Event"}</DialogTitle>
            <DialogDescription className="text-gray-300">
              {isEditMode ? "Update your calendar event details." : "Fill in the details for your new event."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right text-white">
                Title
              </label>
              <Input
                type="text"
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-white">
                Description
              </label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right text-white">
                Date
              </label>
              <Input
                type="date"
                id="date"
                value={format(newEvent.date, "yyyy-MM-dd")}
                onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right text-white">
                Category
              </label>
              <Select
                value={newEvent.category}
                onValueChange={(value) => setNewEvent({ ...newEvent, category: value as EventCategory })}
              >
                <SelectTrigger className="col-span-3 bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  {Object.keys(CategoryColors).map((category) => (
                    <SelectItem key={category} value={category} className="text-white">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${CategoryColors[category as EventCategory]}`}></div>
                        <span className="capitalize">{category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEvent}>{isEditMode ? "Update Event" : "Save Event"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEventDetailsDialog} onOpenChange={setShowEventDetailsDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border border-gray-700 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedEvent?.title}</DialogTitle>
            <DialogDescription className="text-gray-300">Event details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="description" className="text-right text-white">
                Description
              </label>
              <div className="col-span-3 whitespace-pre-line text-white">
                {selectedEvent?.description}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right text-white">
                Date
              </label>
              <div className="col-span-3 text-white">
                {selectedEvent ? format(new Date(selectedEvent.date), "MMM d, yyyy") : ''}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right text-white">
                Category
              </label>
              <div className="flex items-center col-span-3">
                <div className={`w-3 h-3 rounded-full mr-2 ${selectedEvent ? CategoryColors[selectedEvent.category] : ''}`}></div>
                <span className="capitalize text-white">
                  {selectedEvent?.category}
                </span>
              </div>
            </div>
            {selectedEvent?.sticker && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-white">
                  Sticker
                </label>
                <div className="col-span-3 text-2xl">
                  {selectedEvent.sticker}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="flex flex-wrap space-x-2 w-full justify-between">
              <Button onClick={() => {
                if (selectedEvent) {
                  handleEditEvent(selectedEvent);
                  setShowEventDetailsDialog(false);
                }
              }}>
                Edit Event
              </Button>
              <Button variant="destructive" onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}>
                Delete Event
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStickerDialog} onOpenChange={setShowStickerDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border border-gray-700 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-white">Add Sticker</DialogTitle>
            <DialogDescription className="text-gray-300">Choose an emoji to use as a sticker</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="emoji" className="text-right text-white">
                Emoji
              </label>
              <Input
                type="text"
                id="emoji"
                value={stickerEmoji}
                onChange={(e) => setStickerEmoji(e.target.value)}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right text-white">
                Date
              </label>
              <Input
                type="date"
                id="date"
                value={format(stickerDate, "yyyy-MM-dd")}
                onChange={(e) => setStickerDate(new Date(e.target.value))}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-1">
              <div className="flex flex-wrap gap-2 justify-center">
                {commonEmojis.map((emoji) => (
                  <Button 
                    key={emoji} 
                    variant={stickerEmoji === emoji ? "default" : "outline"} 
                    onClick={() => setStickerEmoji(emoji)}
                    className="text-xl h-10 w-10 p-0"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveSticker}>
              {selectedEvent ? "Add Sticker to Event" : "Add Sticker to Calendar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
