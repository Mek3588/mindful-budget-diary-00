
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Plus, Save, X, Edit, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import VoiceToTextInput from "@/components/VoiceToTextInput";

interface Note {
  id: string;
  title: string;
  content: string;
  date: Date;
  updatedAt?: Date;
}

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isWriting, setIsWriting] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editedNote, setEditedNote] = useState({ title: "", content: "" });

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('quick-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        date: new Date(note.date),
        updatedAt: note.updatedAt ? new Date(note.updatedAt) : undefined
      })));
    }
  }, []);

  // Save notes to localStorage whenever they change
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
    };

    // Create calendar event for the note
    const calendarEvent = {
      id: `note-${note.id}`,
      title: note.title,
      description: note.content,
      date: note.date,
      category: 'notes' as const
    };

    // Get existing calendar events
    const existingEvents = JSON.parse(localStorage.getItem('calendar-events') || '[]');
    localStorage.setItem('calendar-events', JSON.stringify([...existingEvents, calendarEvent]));

    setNotes([note, ...notes]);
    setNewNote({ title: "", content: "" });
    setIsWriting(false);
    toast.success("Note saved successfully!");
  };

  const handleDeleteNote = (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;
    
    setNotes(notes.filter(note => note.id !== id));
    
    // Remove corresponding calendar event
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
        content: noteToEdit.content
      });
    }
  };

  const handleSaveEdit = (id: string) => {
    if (!editedNote.title.trim() || !editedNote.content.trim()) {
      toast.error("Please provide both title and content for your note");
      return;
    }

    const now = new Date();
    
    // Update note in notes array
    const updatedNotes = notes.map(note => 
      note.id === id 
        ? { ...note, title: editedNote.title, content: editedNote.content, updatedAt: now }
        : note
    );
    
    setNotes(updatedNotes);

    // Update calendar event
    const existingEvents = JSON.parse(localStorage.getItem('calendar-events') || '[]');
    const updatedEvents = existingEvents.map((event: any) => 
      event.id === `note-${id}`
        ? { ...event, title: editedNote.title, description: editedNote.content }
        : event
    );
    
    localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));
    
    setEditingNote(null);
    toast.success("Note updated successfully!");
  };

  const cancelEdit = () => {
    setEditingNote(null);
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
                <VoiceToTextInput
                  value={newNote.title}
                  onChange={(value) => setNewNote({ ...newNote, title: value })}
                  placeholder="Note title"
                />
                <VoiceToTextInput
                  value={newNote.content}
                  onChange={(value) => setNewNote({ ...newNote, content: value })}
                  placeholder="Write your note here..."
                  isTextarea={true}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsWriting(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNote}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Note
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setIsWriting(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            )}
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Card key={note.id} className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
                {editingNote === note.id ? (
                  <div className="space-y-4">
                    <VoiceToTextInput
                      value={editedNote.title}
                      onChange={(value) => setEditedNote({ ...editedNote, title: value })}
                      placeholder="Note title"
                    />
                    <VoiceToTextInput
                      value={editedNote.content}
                      onChange={(value) => setEditedNote({ ...editedNote, content: value })}
                      placeholder="Write your note here..."
                      isTextarea={true}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleSaveEdit(note.id)}>
                        <Check className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{note.title}</h3>
                      <div className="flex gap-1">
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
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created: {format(note.date, "MMM d, yyyy 'at' h:mm a")}
                      </p>
                      {note.updatedAt && note.updatedAt.getTime() !== note.date.getTime() && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Updated: {format(note.updatedAt, "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notes;
