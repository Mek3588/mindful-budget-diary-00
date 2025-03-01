import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Calendar as CalendarIcon, 
  Target, 
  Stethoscope, 
  Edit, 
  Trash,
  Sticker 
} from "lucide-react";
import { format, addMonths, subMonths, isSameDay, startOfMonth } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

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
  
  const [activeFilters, setActiveFilters] = useState<EventCategory[]>([
    'personal', 'work', 'health', 'birthday', 'note', 'diary', 'goal', 'medical'
  ]);
  
  const commonEmojis = ["😊", "😂", "❤️", "👍", "🎉", "🎂", "🏆", "⭐", "🔥", "💯", "🙏", "✅", "💪"];

  const [isEditMode, setIsEditMode] = useState(false);

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
      
      if (savedDiaryEntries) {
        const diaryEvents = JSON.parse(savedDiaryEntries).map((entry: any) => ({
          id: `diary-${entry.id}`,
          title: "Diary Entry",
          description: entry.content,
          date: new Date(entry.date),
          category: 'diary' as const,
          tags: [`mood-${entry.mood}`, `energy-${entry.energy}`]
        }));
        allEvents = [...allEvents, ...diaryEvents];
      }
      
      if (savedNotes) {
        const noteEvents = JSON.parse(savedNotes).map((note: any) => ({
          id: `note-${note.id}`,
          title: note.title,
          description: note.content,
          date: new Date(note.date),
          category: 'note' as const
        }));
        allEvents = [...allEvents, ...noteEvents];
      }
      
      if (savedGoals) {
        const goalEvents = JSON.parse(savedGoals).map((goal: any) => ({
          id: `goal-${goal.id}`,
          title: goal.title,
          description: goal.description,
          date: new Date(goal.dueDate || goal.createdAt),
          category: 'goal' as const,
          tags: [`priority-${goal.priority}`, `status-${goal.status}`]
        }));
        allEvents = [...allEvents, ...goalEvents];
      }
      
      if (savedMedical) {
        const medicalEvents = JSON.parse(savedMedical).map((record: any) => ({
          id: `medical-${record.id}`,
          title: record.title || "Medical Appointment",
          description: record.notes || record.prescription,
          date: new Date(record.appointmentDate || record.date),
          category: 'medical' as const,
          tags: [record.type || "appointment", record.status || "scheduled"]
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

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (date: Date) => {
    const event = events.find(event => isSameDay(event.date, date));
    if (event) {
      setSelectedEvent(event);
      setShowEventDetailsDialog(true);
    }
  };

  const handleAddEvent = () => {
    setShowAddEventDialog(true);
  };

  const handleEditEvent = (event: Event) => {
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date,
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

  const handleFilterToggle = (category: EventCategory) => {
    if (activeFilters.includes(category)) {
      setActiveFilters(activeFilters.filter(filter => filter !== category));
    } else {
      setActiveFilters([...activeFilters, category]);
    }
  };

  const filteredEvents = events.filter(event => activeFilters.includes(event.category));

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
            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
              <div className="flex items-center justify-between mb-4">
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
              <CalendarComponent
                mode="single"
                month={startOfMonth(currentMonth)}
                onDayClick={handleDayClick}
                className="rounded-md border"
              />
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Events</h2>
                <Button size="sm" onClick={handleAddEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
              <div className="space-y-3">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CategoryColors[event.category] }}></div>
                        <span>
                          {format(event.date, "MMM d")} - {event.title} 
                          {event.sticker && <span className="ml-2">{event.sticker}</span>}
                        </span>
                      </div>
                      <div className="flex gap-2">
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
            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <div className="space-y-2">
                {Object.entries(CategoryColors).map(([category, color]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                      <span className="capitalize">{category}</span>
                    </div>
                    <Toggle
                      aria-label={category}
                      pressed={activeFilters.includes(category as EventCategory)}
                      onPressedChange={() => handleFilterToggle(category as EventCategory)}
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
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
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Event" : "Add Event"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right">
                Title
              </label>
              <Input
                type="text"
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right">
                Description
              </label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right">
                Date
              </label>
              <Input
                type="date"
                id="date"
                value={format(newEvent.date, "yyyy-MM-dd")}
                onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right">
                Category
              </label>
              <select
                id="category"
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as EventCategory })}
                className="col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="health">Health</option>
                <option value="birthday">Birthday</option>
                <option value="note">Note</option>
                <option value="diary">Diary</option>
                <option value="goal">Goal</option>
                <option value="medical">Medical</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEvent}>{isEditMode ? "Update Event" : "Save Event"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEventDetailsDialog} onOpenChange={setShowEventDetailsDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="description" className="text-right">
                Description
              </label>
              <div className="col-span-3 whitespace-pre-line">
                {selectedEvent?.description}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right">
                Date
              </label>
              <div className="col-span-3">
                {selectedEvent ? format(selectedEvent.date, "MMM d, yyyy") : ''}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right">
                Category
              </label>
              <div className="col-span-3 capitalize">
                {selectedEvent?.category}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}>Delete Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStickerDialog} onOpenChange={setShowStickerDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Add Sticker</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="emoji" className="text-right">
                Emoji
              </label>
              <Input
                type="text"
                id="emoji"
                value={stickerEmoji}
                onChange={(e) => setStickerEmoji(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right">
                Date
              </label>
              <Input
                type="date"
                id="date"
                value={format(stickerDate, "yyyy-MM-dd")}
                onChange={(e) => setStickerDate(new Date(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveSticker}>Save Sticker</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
