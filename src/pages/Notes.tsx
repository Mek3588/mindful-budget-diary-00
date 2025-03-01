
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Plus, Save, X, Edit, Check, Mic, Camera, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import VoiceToText from "@/components/VoiceToText";
import CameraCapture from "@/components/CameraCapture";

interface Note {
  id: string;
  title: string;
  content: string;
  date: Date;
  updatedAt?: Date;
  images?: string[];
}

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isWriting, setIsWriting] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editedNote, setEditedNote] = useState({ title: "", content: "" });
  const [images, setImages] = useState<string[]>([]);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [activeForCamera, setActiveForCamera] = useState<'new' | 'edit' | null>(null);

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
      images: images.length > 0 ? [...images] : undefined
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
    setImages([]);
    toast.success("Note saved successfully!");
  };

  const handleDeleteNote = (id: string) => {
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
      setEditImages(noteToEdit.images || []);
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
        ? { 
            ...note, 
            title: editedNote.title, 
            content: editedNote.content, 
            updatedAt: now,
            images: editImages.length > 0 ? [...editImages] : undefined
          }
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
                
                <VoiceToText onTranscript={handleVoiceTranscriptNew} />
                
                <Textarea
                  placeholder="Write your note here..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="min-h-[100px]"
                />
                
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
                
                <div className="flex gap-2">
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
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsWriting(false);
                    setNewNote({ title: "", content: "" });
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
                    <Input
                      placeholder="Note title"
                      value={editedNote.title}
                      onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
                    />
                    
                    <VoiceToText onTranscript={handleVoiceTranscriptEdit} />
                    
                    <Textarea
                      placeholder="Write your note here..."
                      value={editedNote.content}
                      onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
                      className="min-h-[100px]"
                    />
                    
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
                    
                    <div className="flex gap-2">
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
                    </div>
                    
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
                    
                    {note.images && note.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 mb-3">
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

      <CameraCapture 
        open={showCamera} 
        onOpenChange={setShowCamera}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};

export default Notes;
