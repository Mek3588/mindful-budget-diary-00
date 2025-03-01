
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CalendarIcon, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Import our new components
import VoiceToTextInput from "@/components/VoiceToTextInput";
import { FileUploadButton } from "@/components/FileUploadButton";

interface DiaryEntry {
  id: string;
  date: Date;
  content: string;
  mood: string;
  image?: string | null;
}

const moods = [
  { value: 'happy', label: 'Happy', icon: '😊' },
  { value: 'sad', label: 'Sad', icon: '😢' },
  { value: 'excited', label: 'Excited', icon: '🤩' },
  { value: 'angry', label: 'Angry', icon: '😠' },
  { value: 'anxious', label: 'Anxious', icon: '😟' },
  { value: 'calm', label: 'Calm', icon: '😌' },
  { value: 'grateful', label: 'Grateful', icon: '🙏' },
  { value: 'loved', label: 'Loved', icon: '❤️' },
  { value: 'hopeful', label: 'Hopeful', icon: '✨' },
  { value: 'tired', label: 'Tired', icon: '😴' },
  { value: 'neutral', label: 'Neutral', icon: '😐' },
  { value: 'motivated', label: 'Motivated', icon: '🚀' },
  { value: 'inspired', label: 'Inspired', icon: '💡' },
  { value: 'stressed', label: 'Stressed', icon: '😫' },
  { value: 'bored', label: 'Bored', icon: '😒' },
];

const Diary = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [entryContent, setEntryContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const savedEntries = localStorage.getItem('diary-entries');
    if (savedEntries) {
      setDiaryEntries(JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diary-entries', JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const entry = diaryEntries.find(entry => isSameDay(entry.date, date));
    if (entry) {
      setEntryContent(entry.content);
      setSelectedMood(entry.mood);
      setImagePreview(entry.image || null);
    } else {
      setEntryContent('');
      setSelectedMood('');
      setImagePreview(null);
    }
  };

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };

  const handleOpenNewEntryModal = () => {
    setIsNewEntryModalOpen(true);
    setEntryContent('');
    setSelectedMood('');
    setImagePreview(null);
    setSelectedDate(new Date());
  };

  const handleCloseNewEntryModal = () => {
    setIsNewEntryModalOpen(false);
    setEditingEntryId(null);
    setEntryContent('');
    setSelectedMood('');
    setImagePreview(null);
  };

  const handleSaveEntry = () => {
    if (!entryContent.trim()) {
      toast.error("Entry content cannot be empty");
      return;
    }

    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    const newEntry: DiaryEntry = {
      id: editingEntryId || Date.now().toString(),
      date: selectedDate,
      content: entryContent,
      mood: selectedMood,
      image: imagePreview || null,
    };

    if (editingEntryId) {
      // Update existing entry
      const updatedEntries = diaryEntries.map(entry =>
        entry.id === editingEntryId ? newEntry : entry
      );
      setDiaryEntries(updatedEntries);
      toast.success("Entry updated successfully!");
    } else {
      // Add new entry
      setDiaryEntries([...diaryEntries, newEntry]);
      toast.success("Entry saved successfully!");
    }

    handleCloseNewEntryModal();
  };

  const handleDeleteEntry = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmDelete) return;

    const updatedEntries = diaryEntries.filter(entry => !isSameDay(entry.date, selectedDate));
    setDiaryEntries(updatedEntries);
    setEntryContent('');
    setSelectedMood('');
    setImagePreview(null);
    toast.success("Entry deleted successfully!");
  };

  const handleEditEntry = () => {
    const entryToEdit = diaryEntries.find(entry => isSameDay(entry.date, selectedDate));
    if (entryToEdit) {
      setIsNewEntryModalOpen(true);
      setEditingEntryId(entryToEdit.id);
      setEntryContent(entryToEdit.content);
      setSelectedMood(entryToEdit.mood);
      setImagePreview(entryToEdit.image || null);
      setSelectedDate(entryToEdit.date);
    }
  };

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
    const endDate = new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate());

    const dateFormat = "d";
    const rows: JSX.Element[] = [];

    let days: JSX.Element[] = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const isSelected = isSameDay(day, selectedDate);
        // Fixed: Converting Date to string for key comparison
        const hasEntry = diaryEntries.some(entry => isSameDay(entry.date, day));
        const dayClasses = cn(
          "text-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-accent hover:text-accent-foreground focus:outline-none",
          {
            "bg-primary text-primary-foreground": isSelected,
            "cursor-not-allowed opacity-50": !isSameMonth(day, monthStart),
            "relative": hasEntry
          }
        );

        days.push(
          <div
            className="col cell"
            key={day.toString()} // Fixed: Converting Date to string for key
          >
            {isSameMonth(day, monthStart) ? (
              <Button
                className={dayClasses}
                onClick={() => handleDateSelect(cloneDay)}
                variant="ghost"
                disabled={!isSameMonth(day, monthStart)}
              >
                {formattedDate}
                {hasEntry && !isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary"></div>
                )}
              </Button>
            ) : (
              <span className="text-sm w-9 h-9 flex items-center justify-center cursor-not-allowed opacity-50">
                {formattedDate}
              </span>
            )}
          </div>
        );
        day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
      }
      rows.push(
        <div className="row" key={day.toString()}> {/* Fixed: Converting Date to string for key */}
          {days}
        </div>
      );
      days = [];
    }
    return <div className="body">{rows}</div>;
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navClasses = "h-7 w-7 bg-muted hover:bg-secondary rounded-full";

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white dark:from-gray-900 dark:to-gray-800">
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
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <h1 className="text-xl font-semibold">Diary & Mood Tracker</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium">{format(currentMonth, "MMMM yyyy")}</h2>
                <div className="flex items-center gap-2">
                  <Button size="icon" className={navClasses} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" className={navClasses} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {days.map((day, index) => (
                  <div key={index} className="text-xs font-medium text-center">
                    {day}
                  </div>
                ))}
              </div>
              {renderCalendar()}
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">
                  {format(selectedDate, "MMM d, yyyy")}
                </CardTitle>
                <div>
                  <Button size="sm" onClick={handleOpenNewEntryModal}>
                    {diaryEntries.some(entry => isSameDay(entry.date, selectedDate)) ? 'Edit Entry' : 'Add Entry'}
                  </Button>
                  {diaryEntries.some(entry => isSameDay(entry.date, selectedDate)) && (
                    <Button size="sm" variant="destructive" onClick={handleDeleteEntry} className="ml-2">
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {diaryEntries.some(entry => isSameDay(entry.date, selectedDate)) ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {entryContent}
                  </p>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium">Mood:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{moods.find(mood => mood.value === selectedMood)?.icon} {selectedMood}</p>
                  </div>
                  {imagePreview && (
                    <div className="mt-4">
                      <img src={imagePreview} alt="Diary Entry" className="max-h-40 rounded-md" />
                    </div>
                  )}
                  <Button size="sm" className="mt-4" onClick={handleEditEntry}>
                    Edit Entry
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No entry for this day.</p>
                  <Button size="sm" className="mt-4" onClick={handleOpenNewEntryModal}>
                    Add Entry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isNewEntryModalOpen} onOpenChange={setIsNewEntryModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>
              {editingEntryId ? 'Edit Diary Entry' : 'New Diary Entry'}
            </DialogTitle>
            <DialogDescription>
              {editingEntryId
                ? 'Edit your thoughts and feelings for this day.'
                : 'Share your thoughts and feelings for this day.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="mood">Mood</Label>
              <Select value={selectedMood} onValueChange={handleMoodSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a mood" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((mood) => (
                    <SelectItem key={mood.value} value={mood.value}>
                      {mood.icon} {mood.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="entry">Entry</Label>
              <VoiceToTextInput
                value={entryContent}
                onChange={setEntryContent}
                placeholder="Write about your day..."
                isTextarea={true}
                className="min-h-[150px]"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <FileUploadButton onFileSelect={handleImageSelect} />
                {imagePreview && (
                  <Button variant="outline" size="sm" onClick={() => setImagePreview(null)}>
                    Remove Image
                  </Button>
                )}
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="max-h-40 rounded-md" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={handleCloseNewEntryModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveEntry}>
              Save Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Diary;
