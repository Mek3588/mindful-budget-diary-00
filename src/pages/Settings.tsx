import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Settings as SettingsIcon, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const Settings = () => {
  const navigate = useNavigate();
  const { currentTheme, setTheme, themes } = useTheme();
  const { toast } = useToast();
  const [printSectionValue, setPrintSectionValue] = useState<string>("diary");
  const [printData, setPrintData] = useState<any>(null);

  const masculineThemes = themes.filter(theme => theme.type === 'masculine');
  const feminineThemes = themes.filter(theme => theme.type === 'feminine');

  const fetchPrintData = () => {
    let data = null;
    
    switch (printSectionValue) {
      case "diary":
        const diaryEntries = JSON.parse(localStorage.getItem("diary-entries") || "[]");
        data = diaryEntries.map((entry: any) => ({
          date: format(new Date(entry.date), "PPP"),
          mood: entry.mood,
          content: entry.content
        }));
        break;
      
      case "budget":
        const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
        data = transactions.map((transaction: any) => ({
          date: format(new Date(transaction.date), "PPP"),
          description: transaction.description,
          category: transaction.category,
          amount: `$${transaction.amount.toFixed(2)}`,
          type: transaction.type
        }));
        break;
      
      case "notes":
        const notes = JSON.parse(localStorage.getItem("quick-notes") || "[]");
        data = notes.map((note: any) => ({
          title: note.title,
          content: note.content,
          date: format(new Date(note.date), "PPP"),
          updatedAt: note.updatedAt ? format(new Date(note.updatedAt), "PPP") : "-"
        }));
        break;
      
      case "goals":
        const goals = JSON.parse(localStorage.getItem("goals") || "[]");
        data = goals.map((goal: any) => ({
          title: goal.title,
          description: goal.description,
          dueDate: goal.dueDate ? format(new Date(goal.dueDate), "PPP") : "-",
          category: goal.category,
          progress: `${goal.progress}%`,
          status: goal.status
        }));
        break;
      
      case "medical":
        const medicalRecords = JSON.parse(localStorage.getItem("medical-records") || "[]");
        data = medicalRecords.map((record: any) => ({
          title: record.title,
          type: record.type,
          provider: record.provider,
          date: record.date ? format(new Date(record.date), "PPP") : "-",
          notes: record.notes,
          reminder: record.reminder ? format(new Date(record.reminder), "PPP") : "No reminder",
          completed: record.completed ? "Yes" : "No"
        }));
        break;
    }
    
    return data;
  };

  const handlePrintSection = () => {
    try {
      let contentToPrint = "";
      
      // Get the section name for the toast message
      if (printSectionValue === "diary") {
        contentToPrint = "Diary";
      } else if (printSectionValue === "budget") {
        contentToPrint = "Budget";
      } else if (printSectionValue === "notes") {
        contentToPrint = "Notes";
      } else if (printSectionValue === "goals") {
        contentToPrint = "Goal Planner";
      } else if (printSectionValue === "medical") {
        contentToPrint = "Medical Records & Reminders";
      }
      
      const data = fetchPrintData();
      
      // Create a temporary hidden iframe for printing
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);
      
      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        
        // Define a flexible print stylesheet
        const printStyles = `
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 2rem;
              color: #000;
              background: #fff;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 1rem;
              color: #333;
              border-bottom: 1px solid #ddd;
              padding-bottom: 0.5rem;
            }
            .item {
              margin-bottom: 1.5rem;
              padding-bottom: 1rem;
              border-bottom: 1px solid #eee;
            }
            .item:last-child {
              border-bottom: none;
            }
            .field {
              margin-bottom: 0.5rem;
            }
            .label {
              font-weight: bold;
              display: inline-block;
              width: 120px;
              color: #555;
            }
            .value {
              display: inline-block;
            }
            .date {
              color: #666;
              font-style: italic;
              margin-top: 0.25rem;
              font-size: 0.9rem;
            }
            p {
              white-space: pre-wrap;
              margin: 0.5rem 0;
            }
            @media print {
              body {
                margin: 1.5cm;
              }
            }
          </style>
        `;
        
        let content = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${contentToPrint}</title>
            ${printStyles}
          </head>
          <body>
            <h1>${contentToPrint}</h1>
        `;
        
        if (data && data.length > 0) {
          data.forEach((item: any, index: number) => {
            content += `<div class="item">`;
            
            // Handle different formats based on section type
            if (printSectionValue === "diary") {
              content += `
                <div class="field"><span class="label">Date:</span> <span class="value">${item.date}</span></div>
                <div class="field"><span class="label">Mood:</span> <span class="value">${item.mood}</span></div>
                <p>${item.content}</p>
              `;
            } else if (printSectionValue === "budget") {
              content += `
                <div class="field"><span class="label">Date:</span> <span class="value">${item.date}</span></div>
                <div class="field"><span class="label">Description:</span> <span class="value">${item.description}</span></div>
                <div class="field"><span class="label">Category:</span> <span class="value">${item.category}</span></div>
                <div class="field"><span class="label">Amount:</span> <span class="value">${item.amount}</span></div>
                <div class="field"><span class="label">Type:</span> <span class="value">${item.type}</span></div>
              `;
            } else if (printSectionValue === "notes") {
              content += `
                <div class="field"><span class="label">Title:</span> <span class="value">${item.title}</span></div>
                <p>${item.content}</p>
                <div class="date">Created: ${item.date}</div>
                ${item.updatedAt !== "-" ? `<div class="date">Updated: ${item.updatedAt}</div>` : ""}
              `;
            } else if (printSectionValue === "goals") {
              content += `
                <div class="field"><span class="label">Title:</span> <span class="value">${item.title}</span></div>
                <div class="field"><span class="label">Category:</span> <span class="value">${item.category}</span></div>
                <div class="field"><span class="label">Due Date:</span> <span class="value">${item.dueDate}</span></div>
                <div class="field"><span class="label">Progress:</span> <span class="value">${item.progress}</span></div>
                <div class="field"><span class="label">Status:</span> <span class="value">${item.status}</span></div>
                <p>${item.description}</p>
              `;
            } else if (printSectionValue === "medical") {
              content += `
                <div class="field"><span class="label">Title:</span> <span class="value">${item.title}</span></div>
                <div class="field"><span class="label">Type:</span> <span class="value">${item.type}</span></div>
                <div class="field"><span class="label">Provider:</span> <span class="value">${item.provider}</span></div>
                <div class="field"><span class="label">Date:</span> <span class="value">${item.date}</span></div>
                <div class="field"><span class="label">Reminder:</span> <span class="value">${item.reminder}</span></div>
                <div class="field"><span class="label">Completed:</span> <span class="value">${item.completed}</span></div>
                <p>${item.notes}</p>
              `;
            }
            
            content += `</div>`;
          });
        } else {
          content += `<p>No data available for ${contentToPrint}.</p>`;
        }
        
        content += `
          </body>
          </html>
        `;
        
        frameDoc.write(content);
        frameDoc.close();
        
        // Wait for content to load before printing
        setTimeout(() => {
          printFrame.contentWindow?.print();
          // Remove the frame after printing
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 500);
        }, 500);
      }
      
      toast({
        title: "Print Initiated",
        description: `Printing ${contentToPrint}...`,
      });
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print Failed",
        description: "There was an error printing. Please try again.",
        variant: "destructive",
      });
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
                <SettingsIcon className="h-5 w-5 mr-2" />
                <h1 className="text-xl font-semibold">Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Theme Selection</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium mb-3">Masculine Themes</h3>
                    <RadioGroup
                      value={currentTheme.id}
                      onValueChange={setTheme}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                    >
                      {masculineThemes.map((theme) => (
                        <div key={theme.id} className="space-y-2">
                          <RadioGroupItem
                            value={theme.id}
                            id={theme.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={theme.id}
                            className="flex flex-col items-center justify-center w-full p-4 border-2 rounded-lg cursor-pointer hover:border-primary peer-data-[state=checked]:border-primary"
                            style={{
                              backgroundColor: theme.primaryColor,
                              borderColor: theme.accentColor,
                            }}
                          >
                            <span className="text-sm font-medium" style={{ color: theme.secondaryColor }}>
                              {theme.name}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <h3 className="text-md font-medium mb-3">Feminine Themes</h3>
                    <RadioGroup
                      value={currentTheme.id}
                      onValueChange={setTheme}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                    >
                      {feminineThemes.map((theme) => (
                        <div key={theme.id} className="space-y-2">
                          <RadioGroupItem
                            value={theme.id}
                            id={theme.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={theme.id}
                            className="flex flex-col items-center justify-center w-full p-4 border-2 rounded-lg cursor-pointer hover:border-primary peer-data-[state=checked]:border-primary"
                            style={{
                              backgroundColor: theme.primaryColor,
                              borderColor: theme.accentColor,
                            }}
                          >
                            <span className="text-sm font-medium" style={{ color: theme.secondaryColor }}>
                              {theme.name}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Print Section */}
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Data Management</h2>
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-md font-medium">Print Section</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-full sm:w-64">
                    <Select value={printSectionValue} onValueChange={setPrintSectionValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section to print" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diary">Diary</SelectItem>
                        <SelectItem value="budget">Budget</SelectItem>
                        <SelectItem value="notes">Notes</SelectItem>
                        <SelectItem value="goals">Goal Planner</SelectItem>
                        <SelectItem value="medical">Medical Records & Reminders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handlePrintSection} className="whitespace-nowrap">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Print any section of the app for physical records.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
