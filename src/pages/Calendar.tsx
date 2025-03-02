
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
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Define types
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string; // HH:MM
  category: Category;
  sticker?: string; // Optional sticker
}

type Category = "personal" | "work" | "social" | "health" | "other";

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTime, setEventTime] = useState("12:00");
  const [eventCategory, setEventCategory] = useState<Category>("personal");
  const [eventSticker, setEventSticker] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [availableStickers, setAvailableStickers] = useState(["😊", "📝", "🎮", "🏋️", "🍕", "🛌", "📚", "💼", "🎯", "🎵", "✈️", "🎂", "🏠", "💻", "🏃", "🎬", "🍔", "☕", "🚗", "🛒", "📱", "🧹", "💭", "🎨"]);
  const [showStickerList, setShowStickerList] = useState(false);

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem("calendar-events");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("calendar-events", JSON.stringify(events));
  }, [events]);

  // Filter events based on selected category
  const filteredEvents = useMemo(() => {
    if (selectedCategory === "all") {
      return events;
    }
    return events.filter(event => event.category === selectedCategory);
  }, [events, selectedCategory]);

  // Check if a specific date has events
  const hasEventsOnDate = (date: Date) => {
    return filteredEvents.some((event) =>
      isSameDay(date, new Date(event.date))
    );
  };

  // Get sticker for a specific date (only show one sticker per day - the last sticker added)
  const getStickerForDate = (date: Date): string | null => {
    // Get all events for this date
    const dateEvents = filteredEvents.filter((event) =>
      isSameDay(date, new Date(event.date))
    );
    
    // If there are events with stickers, return the last one's sticker
    const eventsWithStickers = dateEvents.filter(event => event.sticker && event.sticker.trim());
    if (eventsWithStickers.length > 0) {
      return eventsWithStickers[eventsWithStickers.length - 1].sticker || null;
    }
    
    return null;
  };

  // Handle day click in calendar
  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
      
      // Get events for the selected day
      const dateEvents = filteredEvents.filter((event) =>
        isSameDay(day, new Date(event.date))
      );
      
      if (dateEvents.length === 0) {
        // If no events, open dialog to create new event
        resetEventForm();
        setShowEventDialog(true);
      }
    }
  };

  // Reset event form
  const resetEventForm = () => {
    setEventTitle("");
    setEventDescription("");
    setEventTime("12:00");
    setEventCategory("personal");
    setEventSticker("");
    setEditingEvent(null);
    setShowDeleteConfirm(false);
  };

  // Add or update event
  const handleSaveEvent = () => {
    if (!eventTitle.trim()) {
      toast.error("Event title is required");
      return;
    }

    // Format date for storage
    const eventDate = format(selectedDate, "yyyy-MM-dd");

    if (editingEvent) {
      // Update existing event
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
      // Create new event
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        description: eventDescription,
        date: eventDate,
        time: eventTime,
        category: eventCategory,
        sticker: eventSticker,
      };
      setEvents([...events, newEvent]);
      toast.success("Event created successfully");
    }

    setShowEventDialog(false);
    resetEventForm();
  };

  // Delete event
  const handleDeleteEvent = () => {
    if (editingEvent) {
      const updatedEvents = events.filter(
        (event) => event.id !== editingEvent.id
      );
      setEvents(updatedEvents);
      toast.success("Event deleted successfully");
      setShowEventDialog(false);
      resetEventForm();
    }
  };

  // Edit event
  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description);
    setEventTime(event.time);
    setEventCategory(event.category);
    setEventSticker(event.sticker || "");
    setSelectedDate(new Date(event.date));
    setShowEventDialog(true);
  };

  // Get events for selected date
  const eventsForSelectedDate = useMemo(() => {
    return filteredEvents.filter((event) =>
      isSameDay(selectedDate, new Date(event.date))
    );
  }, [filteredEvents, selectedDate]);

  return (
    <div className="container px-4 mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Calendar column */}
        <div className="md:col-span-7 lg:col-span-8 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">Calendar</CardTitle>
              <div className="flex items-center space-x-2">
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => 
                    setSelectedCategory(value as Category | "all")
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by Category" />
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
                <Button 
                  onClick={() => {
                    resetEventForm();
                    setShowEventDialog(true);
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
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
            </CardContent>
          </Card>
          
          {/* Today's Events */}
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
                  {eventsForSelectedDate
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((event) => (
                      <Card key={event.id} className={`${categoryBackgroundColors[event.category]} border-none shadow-sm`}>
                        <CardHeader className="pb-2 pt-4 px-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge className={`${categoryColors[event.category]}`}>
                                  {categoryDisplayNames[event.category]}
                                </Badge>
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

        {/* Upcoming events column */}
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
                      // Ignore hours, minutes and seconds when comparing
                      today.setHours(0, 0, 0, 0);
                      
                      // Event is in the future or today
                      return eventDate >= today;
                    })
                    .sort((a, b) => {
                      // Sort by date, then by time
                      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
                      if (dateCompare !== 0) return dateCompare;
                      return a.time.localeCompare(b.time);
                    })
                    .slice(0, 15) // Show only next 15 events
                    .map((event) => (
                      <Card key={event.id} className="shadow-sm">
                        <CardHeader className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Badge className={`${categoryColors[event.category]}`}>
                                  {categoryDisplayNames[event.category]}
                                </Badge>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditEvent(event)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
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

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
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
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
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
              <Label htmlFor="event-time" className="text-right">
                Time
              </Label>
              <Input
                id="event-time"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-title" className="text-right">
                Title
              </Label>
              <Input
                id="event-title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Category</Label>
              <Select
                value={eventCategory}
                onValueChange={(value) => setEventCategory(value as Category)}
              >
                <SelectTrigger className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Sticker</Label>
              <div className="col-span-3 flex items-center gap-2">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-1"></div>
                <div className="col-span-3 border rounded-md p-2">
                  <div className="grid grid-cols-8 gap-1">
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
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="event-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="event-description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          
          {showDeleteConfirm ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Confirm Deletion</h4>
              <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteEvent}
                >
                  Delete Event
                </Button>
              </div>
            </div>
          ) : (
            <DialogFooter>
              {editingEvent && (
                <Button 
                  variant="outline" 
                  className="mr-auto"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEvent}>
                {editingEvent ? "Update Event" : "Create Event"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
