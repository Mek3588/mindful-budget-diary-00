
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Plus, Save, Smile, Meh, Frown, HeartCrack, Heart, Angry } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DiaryEntry {
  id: string;
  content: string;
  date: Date;
  mood: string;
}

const moodOptions = [
  { value: "happy", icon: Smile, label: "Happy", color: "text-green-500" },
  { value: "neutral", icon: Meh, label: "Neutral", color: "text-gray-500" },
  { value: "sad", icon: Frown, label: "Sad", color: "text-blue-500" },
  { value: "angry", icon: Angry, label: "Angry", color: "text-red-500" },
  { value: "love", icon: Heart, label: "Love", color: "text-pink-500" },
  { value: "heartbreak", icon: HeartCrack, label: "Heartbreak", color: "text-purple-500" },
];

const Diary = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [selectedMood, setSelectedMood] = useState("neutral");

  const handleSaveEntry = () => {
    if (!newEntry.trim()) return;

    const entry: DiaryEntry = {
      id: Date.now().toString(),
      content: newEntry,
      date: new Date(),
      mood: selectedMood,
    };

    setEntries([entry, ...entries]);
    setNewEntry("");
    setSelectedMood("neutral");
    setIsWriting(false);
  };

  const MoodIcon = moodOptions.find(mood => mood.value === selectedMood)?.icon || Meh;

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
                <BookOpen className="h-5 w-5 mr-2" />
                <h1 className="text-xl font-semibold">Diary</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {!isWriting ? (
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 mb-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-4">Start Your Daily Entry</h2>
              <Button onClick={() => setIsWriting(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Entry
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6 mb-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">How are you feeling today?</h2>
                <RadioGroup
                  value={selectedMood}
                  onValueChange={setSelectedMood}
                  className="grid grid-cols-3 sm:grid-cols-6 gap-4"
                >
                  {moodOptions.map((mood) => {
                    const Icon = mood.icon;
                    return (
                      <div key={mood.value} className="text-center space-y-2">
                        <RadioGroupItem
                          value={mood.value}
                          id={mood.value}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={mood.value}
                          className="flex flex-col items-center space-y-2 cursor-pointer peer-aria-checked:text-primary"
                        >
                          <div className={`p-2 rounded-full transition-colors ${
                            selectedMood === mood.value 
                              ? 'bg-primary/10 ' + mood.color
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}>
                            <Icon className={`h-8 w-8 ${
                              selectedMood === mood.value ? mood.color : ''
                            }`} />
                          </div>
                          <span className="text-sm">{mood.label}</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Write Your Entry</h2>
                <Textarea
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  placeholder="What's on your mind today?"
                  className="min-h-[200px]"
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsWriting(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEntry}>
                    <Save className="mr-2 h-4 w-4" /> Save Entry
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {entries.map((entry) => {
            const mood = moodOptions.find(m => m.value === entry.mood);
            const EntryMoodIcon = mood?.icon || Meh;
            
            return (
              <Card
                key={entry.id}
                className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {entry.date.toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Mood:</span>
                      <EntryMoodIcon className={`h-5 w-5 ${mood?.color || ''}`} />
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap">{entry.content}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Diary;
