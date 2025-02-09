
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, ArrowLeft, Plus, Star, Smile, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  date: Date;
  category: 'diary' | 'budget' | 'todo';
  description?: string;
}

interface Sticker {
  id: string;
  type: 'mood' | 'budget' | 'diary';
  icon: string;
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
    category: "todo"
  });
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Load events and stickers from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        date: new Date(event.date)
      })));
    }

    const savedStickers = localStorage.getItem('calendar-stickers');
    if (savedStickers) {
      setStickers(JSON.parse(savedStickers).map((sticker: any) => ({
        ...sticker,
        date: new Date(sticker.date)
      })));
    }
  }, []);

  // Save events and stickers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('calendar-stickers', JSON.stringify(stickers));
  }, [stickers]);

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
      category: newEvent.category as 'diary' | 'budget' | 'todo',
    };

    setEvents([...events, event]);
    setNewEvent({ title: "", description: "", category: "todo" });
    setIsAddingEvent(false);
    toast.success("Event added successfully!");
  };

  const getDayContent = (day: Date) => {
    const dayEvents = events.filter(event => 
      format(new Date(event.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
    
    const dayStickers = stickers.filter(sticker =>
      format(new Date(sticker.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );

    return (
      <div className="relative w-full h-full">
        {dayEvents.length > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2"
          >
            {dayEvents.length}
          </Badge>
        )}
        {dayStickers.map((sticker, index) => (
          <span key={sticker.id} className="absolute bottom-0 right-0 text-xs">
            {sticker.type === 'mood' && <Smile className="h-3 w-3" />}
            {sticker.type === 'budget' && <DollarSign className="h-3 w-3" />}
            {sticker.type === 'diary' && <Star className="h-3 w-3" />}
          </span>
        ))}
      </div>
    );
  };

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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-8 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
              components={{
                DayContent: ({ date }) => getDayContent(date),
              }}
            />
          </Card>

          <Card className="md:col-span-4 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {format(date, 'MMMM d, yyyy')}
                </h2>
                <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Event</DialogTitle>
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
                      <Button onClick={handleAddEvent} className="w-full">
                        Add Event
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {events
                  .filter(event => format(new Date(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                  .map(event => (
                    <Card key={event.id} className="p-3 bg-white/30 dark:bg-gray-700/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <Badge>{event.category}</Badge>
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
