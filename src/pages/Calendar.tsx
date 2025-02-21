import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  ArrowLeft, 
  Plus, 
  Star, 
  Smile, 
  DollarSign,
  Pencil,
  Trash2,
  Tag
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PinDialog } from "@/components/PinDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Event {
  id: string;
  title: string;
  date: Date;
  category: 'diary' | 'budget' | 'todo' | 'note';
  description?: string;
  tags?: string[];
}

interface Sticker {
  id: string;
  type: 'mood' | 'budget' | 'diary';
  value: string;
  date: Date;
}

const Calendar = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    category: "todo",
    tags: []
  });
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  useEffect(() => {
    const loadEvents = () => {
      const savedEvents = localStorage.getItem('calendar-events');
      const savedDiaryEntries = localStorage.getItem('diary-entries');
      const savedNotes = localStorage.getItem('quick-notes');
      
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

  const handleAddEvent = () => {
    if (!newEvent.title) {
      toast.error("Please enter an event title");
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title!,
      description: newEvent.description,
      date: date,
      category: newEvent.category as 'diary' | 'budget' | 'todo' | 'note',
      tags: newEvent.tags
    };

    setEvents(prev => [...prev, event]);
    localStorage.setItem('calendar-events', JSON.stringify([...events, event]));
    setNewEvent({ title: "", description: "", category: "todo", tags: [] });
    setIsAddingEvent(false);
    toast.success("Event added successfully!");
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    localStorage.setItem('calendar-events', JSON.stringify(events.filter(e => e.id !== eventId)));
    toast.success("Event deleted successfully");
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent(event);
    setIsAddingEvent(true);
  };

  const getDayContent = (day: Date) => {
    const dayEvents = events.filter(event => 
      format(new Date(event.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
    
    const dayStickers = stickers.filter(sticker =>
      format(new Date(sticker.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );

    return (
      <div className="relative w-full h-full p-1">
        <div className="absolute top-1 right-1">
          {dayEvents.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {dayEvents.length}
            </Badge>
          )}
        </div>
        
        <div className="absolute bottom-1 right-1 flex flex-col gap-1">
          {dayStickers.map((sticker) => (
            <div key={sticker.id} className="text-xs">
              {sticker.type === 'mood' && (
                <Smile className="h-4 w-4 text-pink-500" />
              )}
              {sticker.type === 'budget' && (
                <DollarSign className="h-4 w-4 text-green-500" />
              )}
              {sticker.type === 'diary' && (
                <Star className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <PinDialog onSuccess={() => console.log("PIN verified")} />
      
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-8 bg-gray-800/50 backdrop-blur-sm border-gray-700 p-6">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border border-gray-700"
              components={{
                DayContent: ({ date }) => getDayContent(date),
              }}
            />
          </Card>

          <Card className="md:col-span-4 bg-gray-800/50 backdrop-blur-sm border-gray-700 p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {format(date, 'MMMM d, yyyy')}
                </h2>
                <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingEvent ? "Edit Event" : "Add New Event"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newEvent.category}
                          onValueChange={(value) => setNewEvent({ ...newEvent, category: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">Todo</SelectItem>
                            <SelectItem value="diary">Diary</SelectItem>
                            <SelectItem value="budget">Budget</SelectItem>
                            <SelectItem value="note">Note</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleAddEvent} 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {editingEvent ? "Update Event" : "Add Event"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {events
                  .filter(event => format(new Date(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                  .map(event => (
                    <Card 
                      key={event.id} 
                      className="p-4 bg-gradient-to-r from-white/30 to-white/10 dark:from-gray-700/30 dark:to-gray-700/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-medium text-lg">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {event.description}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Badge 
                              variant="secondary"
                              className={cn(
                                "bg-gradient-to-r",
                                event.category === 'todo' && "from-blue-500 to-blue-600",
                                event.category === 'diary' && "from-pink-500 to-purple-500",
                                event.category === 'budget' && "from-green-500 to-emerald-600",
                                event.category === 'note' && "from-yellow-500 to-orange-500"
                              )}
                            >
                              {event.category}
                            </Badge>
                            {event.tags?.map(tag => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                              >
                                <path
                                  d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                  fill="currentColor"
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Calendar;
