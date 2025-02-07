
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Plus, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface DiaryEntry {
  id: string;
  content: string;
  date: Date;
  mood: string;
}

const Diary = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [isWriting, setIsWriting] = useState(false);

  const handleSaveEntry = () => {
    if (!newEntry.trim()) return;

    const entry: DiaryEntry = {
      id: Date.now().toString(),
      content: newEntry,
      date: new Date(),
      mood: "neutral", // We'll add mood selection later
    };

    setEntries([entry, ...entries]);
    setNewEntry("");
    setIsWriting(false);
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
          </Card>
        )}

        <div className="space-y-4">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {entry.date.toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-500">Mood: {entry.mood}</span>
                </div>
                <p className="whitespace-pre-wrap">{entry.content}</p>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Diary;
