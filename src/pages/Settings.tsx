
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Settings as SettingsIcon, Download, Printer, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const navigate = useNavigate();
  const { currentTheme, setTheme, themes } = useTheme();
  const { toast } = useToast();
  const [exportSection, setExportSection] = useState<string>("all");
  const [printSectionValue, setPrintSectionValue] = useState<string>("all");

  const masculineThemes = themes.filter(theme => theme.type === 'masculine');
  const feminineThemes = themes.filter(theme => theme.type === 'feminine');

  const exportToCSV = () => {
    try {
      // Get data based on selected section
      let data: any = {};
      
      if (exportSection === "all" || exportSection === "diary") {
        const diaryEntries = localStorage.getItem("diary-entries");
        if (diaryEntries) data.diaryEntries = JSON.parse(diaryEntries);
      }
      
      if (exportSection === "all" || exportSection === "budget") {
        const budgetData = localStorage.getItem("budget-data");
        if (budgetData) data.budgetData = JSON.parse(budgetData);
      }
      
      if (exportSection === "all" || exportSection === "notes") {
        const notes = localStorage.getItem("notes");
        if (notes) data.notes = JSON.parse(notes);
      }
      
      if (exportSection === "all" || exportSection === "calendar") {
        const events = localStorage.getItem("calendar-events");
        if (events) data.events = JSON.parse(events);
      }
      
      // Convert to CSV format (simplified - in a real app you'd use a proper CSV library)
      const jsonString = JSON.stringify(data, null, 2);
      
      // Create and download the file
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journal_backup_${exportSection}_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: `${exportSection === "all" ? "All data" : exportSection + " data"} has been exported successfully.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrintSection = () => {
    try {
      let contentToPrint = "";
      
      if (printSectionValue === "all") {
        contentToPrint = "Whole Journal App";
        window.print();
      } else {
        // In a real application, you would build a targeted print view
        // For this demo, we'll just navigate to the section and print
        const originalLocation = window.location.href;
        
        // Navigate to the selected section
        navigate(`/${printSectionValue === "diary" ? "diary" : 
                    printSectionValue === "budget" ? "budget" : 
                    printSectionValue === "notes" ? "notes" : 
                    printSectionValue === "calendar" ? "calendar" : "/"}`);
        
        // Give the page time to load before printing
        setTimeout(() => {
          window.print();
          // Navigate back after printing
          setTimeout(() => {
            navigate("/settings");
          }, 500);
        }, 800);
      }
      
      toast({
        title: "Print Initiated",
        description: `Printing ${printSectionValue === "all" ? "all sections" : printSectionValue}...`,
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

          {/* Data Export Section */}
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Data Management</h2>
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-md font-medium">Export Data</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-full sm:w-64">
                    <Select value={exportSection} onValueChange={setExportSection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        <SelectItem value="diary">Diary</SelectItem>
                        <SelectItem value="budget">Budget</SelectItem>
                        <SelectItem value="notes">Notes</SelectItem>
                        <SelectItem value="calendar">Calendar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={exportToCSV} className="whitespace-nowrap">
                    <Download className="mr-2 h-4 w-4" />
                    Export to JSON
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Export your data as a JSON file for backup or transfer purposes.
                </p>
              </div>

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
                        <SelectItem value="all">Entire App</SelectItem>
                        <SelectItem value="diary">Diary</SelectItem>
                        <SelectItem value="budget">Budget</SelectItem>
                        <SelectItem value="notes">Notes</SelectItem>
                        <SelectItem value="calendar">Calendar</SelectItem>
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
