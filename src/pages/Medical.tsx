
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  ArrowLeft,
  Clipboard,
  PlusCircle,
  Calendar as CalendarIcon,
  Clock,
  Pill,
  Heart,
  FileText,
  Stethoscope,
  Trash,
  CalendarCheck,
  BellRing,
  Pencil
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// Type definitions
type RecordType = "appointment" | "medication" | "vital" | "note";

interface MedicalRecord {
  id: string;
  type: RecordType;
  title: string;
  description: string;
  date: Date;
  time?: string;
  reminder: boolean;
  reminderDays: number;
  completed: boolean;
  category?: string;
  dosage?: string;
  frequency?: string;
  doctor?: string;
  location?: string;
  value?: string;
  unit?: string;
}

// Helper function to generate unique IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const Medical = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [records, setRecords] = useState<MedicalRecord[]>(() => {
    const savedRecords = localStorage.getItem("medical-records");
    return savedRecords ? JSON.parse(savedRecords) : [];
  });
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  
  // New record form state
  const [newRecord, setNewRecord] = useState<Partial<MedicalRecord>>({
    type: "appointment",
    title: "",
    description: "",
    date: new Date(),
    time: "",
    reminder: true,
    reminderDays: 1,
    completed: false,
  });
  
  const [selectedTab, setSelectedTab] = useState<string>("upcoming");
  
  // Save records to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("medical-records", JSON.stringify(records));
  }, [records]);
  
  // Filter records based on the selected date and tab
  const filteredRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    
    if (selectedTab === "upcoming") {
      return recordDate >= new Date(new Date().setHours(0, 0, 0, 0)) && !record.completed;
    } else if (selectedTab === "completed") {
      return record.completed;
    } else if (selectedTab === "all") {
      return true;
    } else {
      // Filter by date
      return recordDate.getDate() === selectedDate.getDate() &&
             recordDate.getMonth() === selectedDate.getMonth() &&
             recordDate.getFullYear() === selectedDate.getFullYear();
    }
  });
  
  // Find dates with records for calendar highlights
  const datesWithRecords = records.map(record => new Date(record.date));
  
  // Handler for adding a new record
  const handleAddRecord = () => {
    if (!newRecord.title) {
      toast({
        title: "Required Field Missing",
        description: "Please enter a title for your record.",
        variant: "destructive",
      });
      return;
    }
    
    const recordToAdd: MedicalRecord = {
      id: generateId(),
      type: newRecord.type as RecordType,
      title: newRecord.title!,
      description: newRecord.description || "",
      date: newRecord.date || new Date(),
      time: newRecord.time,
      reminder: newRecord.reminder || false,
      reminderDays: newRecord.reminderDays || 1,
      completed: false,
      category: newRecord.category,
      dosage: newRecord.dosage,
      frequency: newRecord.frequency,
      doctor: newRecord.doctor,
      location: newRecord.location,
      value: newRecord.value,
      unit: newRecord.unit,
    };
    
    if (editingRecord) {
      // Update existing record
      setRecords(records.map(r => r.id === editingRecord.id ? recordToAdd : r));
      setEditingRecord(null);
      toast({
        title: "Record Updated",
        description: "Your medical record has been updated successfully.",
      });
    } else {
      // Add new record
      setRecords([...records, recordToAdd]);
      toast({
        title: "Record Added",
        description: "Your medical record has been added successfully.",
      });
    }
    
    // Reset form
    setNewRecord({
      type: "appointment",
      title: "",
      description: "",
      date: new Date(),
      time: "",
      reminder: true,
      reminderDays: 1,
      completed: false,
    });
    setIsAddingRecord(false);
  };
  
  // Handler for deleting a record
  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter(record => record.id !== id));
    toast({
      title: "Record Deleted",
      description: "Your medical record has been deleted.",
    });
  };
  
  // Handler for toggling record completion
  const handleToggleCompletion = (id: string) => {
    setRecords(records.map(record => 
      record.id === id ? { ...record, completed: !record.completed } : record
    ));
  };
  
  // Handler for editing a record
  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setNewRecord({
      ...record,
      date: new Date(record.date),
    });
    setIsAddingRecord(true);
  };
  
  // Get icon based on record type
  const getRecordIcon = (type: RecordType) => {
    switch (type) {
      case "appointment":
        return <CalendarCheck className="h-5 w-5 text-blue-500" />;
      case "medication":
        return <Pill className="h-5 w-5 text-green-500" />;
      case "vital":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "note":
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <Clipboard className="h-5 w-5" />;
    }
  };
  
  // Render additional fields based on record type
  const renderTypeSpecificFields = () => {
    switch (newRecord.type) {
      case "appointment":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor/Provider</Label>
                <Input
                  id="doctor"
                  placeholder="Dr. Smith"
                  value={newRecord.doctor || ""}
                  onChange={(e) => setNewRecord({ ...newRecord, doctor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="123 Medical Center"
                  value={newRecord.location || ""}
                  onChange={(e) => setNewRecord({ ...newRecord, location: e.target.value })}
                />
              </div>
            </div>
          </div>
        );
      case "medication":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  placeholder="50mg"
                  value={newRecord.dosage || ""}
                  onChange={(e) => setNewRecord({ ...newRecord, dosage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={newRecord.frequency || ""}
                  onValueChange={(value) => setNewRecord({ ...newRecord, frequency: value })}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice-daily">Twice Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="as-needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case "vital":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  placeholder="120"
                  value={newRecord.value || ""}
                  onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={newRecord.unit || ""}
                  onValueChange={(value) => setNewRecord({ ...newRecord, unit: value })}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mmHg">mmHg (Blood Pressure)</SelectItem>
                    <SelectItem value="bpm">BPM (Heart Rate)</SelectItem>
                    <SelectItem value="mg/dL">mg/dL (Blood Sugar)</SelectItem>
                    <SelectItem value="kg">kg (Weight)</SelectItem>
                    <SelectItem value="cm">cm (Height)</SelectItem>
                    <SelectItem value="°C">°C (Temperature)</SelectItem>
                    <SelectItem value="°F">°F (Temperature)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
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
                <Stethoscope className="h-5 w-5 mr-2 text-purple-500" />
                <h1 className="text-xl font-semibold">Medical Records & Reminders</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-purple-500" />
                  Medical Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md"
                />
                
                <div className="mt-6">
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setNewRecord({
                        ...newRecord,
                        date: selectedDate,
                      });
                      setIsAddingRecord(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Record
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Records */}
          <div className="lg:col-span-2">
            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedTab === "date" 
                      ? `Records for ${format(selectedDate, "MMMM d, yyyy")}` 
                      : selectedTab === "upcoming" 
                        ? "Upcoming Records & Reminders"
                        : selectedTab === "completed"
                          ? "Completed Records"
                          : "All Medical Records"}
                  </CardTitle>
                  <Button 
                    onClick={() => {
                      setNewRecord({
                        ...newRecord,
                        type: "appointment",
                        date: selectedDate,
                      });
                      setIsAddingRecord(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs 
                  defaultValue="upcoming" 
                  value={selectedTab} 
                  onValueChange={setSelectedTab}
                  className="mb-6"
                >
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="date">By Date</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="all">All Records</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {filteredRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Clipboard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No records found</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {selectedTab === "date" 
                        ? `There are no medical records for ${format(selectedDate, "MMMM d, yyyy")}.` 
                        : selectedTab === "upcoming"
                          ? "You don't have any upcoming appointments or medications."
                          : selectedTab === "completed"
                            ? "You don't have any completed medical records."
                            : "Start by adding your first medical record."}
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => {
                        setNewRecord({
                          ...newRecord,
                          date: selectedDate,
                        });
                        setIsAddingRecord(true);
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Record
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRecords.map((record) => (
                      <div 
                        key={record.id}
                        className={`p-4 rounded-lg border ${
                          record.completed 
                            ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="pt-1">
                              {getRecordIcon(record.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={`font-medium ${record.completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}>
                                  {record.title}
                                </h3>
                                <Badge variant={
                                  record.type === "appointment" ? "default" :
                                  record.type === "medication" ? "secondary" :
                                  record.type === "vital" ? "destructive" : "outline"
                                }>
                                  {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                                </Badge>
                                {record.reminder && (
                                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700">
                                    <BellRing className="h-3 w-3 mr-1" />
                                    Reminder
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {format(new Date(record.date), "MMMM d, yyyy")}
                                {record.time && ` at ${record.time}`}
                              </p>
                              {record.description && (
                                <p className="text-sm mt-2">{record.description}</p>
                              )}
                              
                              {/* Show type-specific details */}
                              {record.type === "appointment" && (record.doctor || record.location) && (
                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  {record.doctor && <p>Doctor: {record.doctor}</p>}
                                  {record.location && <p>Location: {record.location}</p>}
                                </div>
                              )}
                              
                              {record.type === "medication" && (record.dosage || record.frequency) && (
                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  {record.dosage && <p>Dosage: {record.dosage}</p>}
                                  {record.frequency && <p>Frequency: {
                                    record.frequency === "once" ? "Once" :
                                    record.frequency === "daily" ? "Daily" :
                                    record.frequency === "twice-daily" ? "Twice Daily" :
                                    record.frequency === "weekly" ? "Weekly" :
                                    record.frequency === "monthly" ? "Monthly" :
                                    record.frequency === "as-needed" ? "As Needed" : record.frequency
                                  }</p>}
                                </div>
                              )}
                              
                              {record.type === "vital" && (record.value || record.unit) && (
                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  <p>Value: {record.value}{record.unit && ` ${record.unit}`}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleCompletion(record.id)}
                              title={record.completed ? "Mark as Incomplete" : "Mark as Complete"}
                            >
                              <input
                                type="checkbox"
                                checked={record.completed}
                                onChange={() => {}}
                                className="h-5 w-5 rounded border-gray-300"
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditRecord(record)}
                              title="Edit Record"
                            >
                              <Pencil className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRecord(record.id)}
                              title="Delete Record"
                            >
                              <Trash className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add/Edit Record Dialog */}
      <Dialog open={isAddingRecord} onOpenChange={setIsAddingRecord}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit Medical Record" : "Add New Medical Record"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="record-type">Record Type</Label>
              <Select
                value={newRecord.type}
                onValueChange={(value) => setNewRecord({ ...newRecord, type: value as RecordType })}
              >
                <SelectTrigger id="record-type">
                  <SelectValue placeholder="Select record type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment">
                    <div className="flex items-center">
                      <CalendarCheck className="h-4 w-4 mr-2 text-blue-500" />
                      Appointment
                    </div>
                  </SelectItem>
                  <SelectItem value="medication">
                    <div className="flex items-center">
                      <Pill className="h-4 w-4 mr-2 text-green-500" />
                      Medication
                    </div>
                  </SelectItem>
                  <SelectItem value="vital">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                      Vital Sign
                    </div>
                  </SelectItem>
                  <SelectItem value="note">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-purple-500" />
                      Medical Note
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                placeholder="Enter title"
                value={newRecord.title || ""}
                onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="flex items-center">
                  <Input
                    id="date"
                    type="date"
                    value={newRecord.date ? format(new Date(newRecord.date), "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const newDate = e.target.value ? new Date(e.target.value) : new Date();
                      setNewRecord({ ...newRecord, date: newDate });
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time (Optional)</Label>
                <Input
                  id="time"
                  type="time"
                  value={newRecord.time || ""}
                  onChange={(e) => setNewRecord({ ...newRecord, time: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add details about this record"
                value={newRecord.description || ""}
                onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                rows={3}
              />
            </div>
            
            {/* Render type-specific fields */}
            {renderTypeSpecificFields()}
            
            <div className="flex items-center space-x-2 pt-4">
              <Switch
                id="reminder"
                checked={newRecord.reminder}
                onCheckedChange={(checked) => setNewRecord({ ...newRecord, reminder: checked })}
              />
              <Label htmlFor="reminder">Set Reminder</Label>
            </div>
            
            {newRecord.reminder && (
              <div className="pl-8 space-y-2">
                <Label htmlFor="reminderDays">Remind me this many days before:</Label>
                <Select
                  value={newRecord.reminderDays?.toString() || "1"}
                  onValueChange={(value) => setNewRecord({ ...newRecord, reminderDays: parseInt(value) })}
                >
                  <SelectTrigger id="reminderDays">
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Same day</SelectItem>
                    <SelectItem value="1">1 day before</SelectItem>
                    <SelectItem value="2">2 days before</SelectItem>
                    <SelectItem value="3">3 days before</SelectItem>
                    <SelectItem value="7">1 week before</SelectItem>
                    <SelectItem value="14">2 weeks before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddingRecord(false);
              if (editingRecord) {
                setEditingRecord(null);
              }
              setNewRecord({
                type: "appointment",
                title: "",
                description: "",
                date: new Date(),
                time: "",
                reminder: true,
                reminderDays: 1,
                completed: false,
              });
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddRecord}>
              {editingRecord ? "Update Record" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Medical;
