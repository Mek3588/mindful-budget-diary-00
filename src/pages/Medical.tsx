
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
  DialogDescription,
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
  Pencil,
  Camera,
  Image,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  X
} from "lucide-react";
import { format, addDays, isAfter } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import CameraCapture from "@/components/CameraCapture";
import { PageLayout } from "@/components/PageLayout";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  photos?: string[];
  isExpanded?: boolean;
  reminderShown?: boolean;
}

// New interface for reminders
interface Reminder {
  id: string;
  recordId: string;
  title: string;
  date: Date;
  time?: string;
  dismissed: boolean;
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const Medical = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [records, setRecords] = useState<MedicalRecord[]>(() => {
    const savedRecords = localStorage.getItem("medical-records");
    return savedRecords ? JSON.parse(savedRecords).map((record: MedicalRecord) => ({
      ...record, 
      date: new Date(record.date),
      isExpanded: false
    })) : [];
  });
  
  // New state for reminders
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const savedReminders = localStorage.getItem("medical-reminders");
    return savedReminders ? JSON.parse(savedReminders).map((reminder: Reminder) => ({
      ...reminder,
      date: new Date(reminder.date)
    })) : [];
  });
  
  // New state for showing reminders dialog
  const [showRemindersDialog, setShowRemindersDialog] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [editingRecordForPhoto, setEditingRecordForPhoto] = useState<string | null>(null);
  
  const [newRecord, setNewRecord] = useState<Partial<MedicalRecord>>({
    type: "appointment",
    title: "",
    description: "",
    date: new Date(),
    time: "",
    reminder: true,
    reminderDays: 1,
    completed: false,
    photos: []
  });
  
  const [selectedTab, setSelectedTab] = useState<string>("upcoming");
  
  // Count active reminders
  const activeRemindersCount = reminders.filter(r => !r.dismissed).length;
  
  useEffect(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Check for new reminders
    records.forEach(record => {
      if (record.reminder && !record.completed && !record.reminderShown) {
        const recordDate = new Date(record.date);
        const reminderDate = addDays(recordDate, -record.reminderDays);
        reminderDate.setHours(0, 0, 0, 0);
        
        if (!isAfter(reminderDate, now)) {
          // Instead of showing toast, add to reminders list
          const reminderExists = reminders.some(r => r.recordId === record.id && !r.dismissed);
          
          if (!reminderExists) {
            const newReminder: Reminder = {
              id: generateId(),
              recordId: record.id,
              title: record.title,
              date: new Date(record.date),
              time: record.time,
              dismissed: false
            };
            
            setReminders(prev => [...prev, newReminder]);
            updateRecord(record.id, { reminderShown: true });
            
            // Only show a single toast notification that reminders are available
            if (activeRemindersCount === 0) {
              toast({
                title: "Medical Reminders Available",
                description: "You have new medical reminders to review.",
                action: (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowRemindersDialog(true)}
                  >
                    View
                  </Button>
                ),
              });
            }
          }
        }
      }
    });
  }, [records]);
  
  // Save reminders to localStorage
  useEffect(() => {
    localStorage.setItem("medical-reminders", JSON.stringify(reminders));
  }, [reminders]);
  
  useEffect(() => {
    localStorage.setItem("medical-records", JSON.stringify(records));
  }, [records]);
  
  const filteredRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    
    if (selectedTab === "upcoming") {
      return recordDate >= new Date(new Date().setHours(0, 0, 0, 0)) && !record.completed;
    } else if (selectedTab === "completed") {
      return record.completed;
    } else if (selectedTab === "all") {
      return true;
    } else {
      return recordDate.getDate() === selectedDate.getDate() &&
             recordDate.getMonth() === selectedDate.getMonth() &&
             recordDate.getFullYear() === selectedDate.getFullYear();
    }
  });
  
  const datesWithRecords = records.map(record => new Date(record.date));
  
  const updateRecord = (id: string, updates: Partial<MedicalRecord>) => {
    const updatedRecords = records.map(record => 
      record.id === id ? { ...record, ...updates } : record
    );
    setRecords(updatedRecords);
  };
  
  // Handle reminder dismissal
  const dismissReminder = (id: string) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, dismissed: true } : reminder
    ));
  };
  
  // Dismiss all reminders
  const dismissAllReminders = () => {
    setReminders(reminders.map(reminder => ({ ...reminder, dismissed: true })));
    setShowRemindersDialog(false);
  };
  
  // Get record from reminder
  const getRecordFromReminder = (recordId: string) => {
    return records.find(record => record.id === recordId);
  };
  
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
      photos: newRecord.photos || [],
      isExpanded: false,
      reminderShown: false
    };
    
    if (editingRecord) {
      setRecords(records.map(r => r.id === editingRecord.id ? {...recordToAdd, id: editingRecord.id} : r));
      setEditingRecord(null);
      toast({
        title: "Success",
        description: "Record updated successfully",
      });
    } else {
      setRecords([...records, recordToAdd]);
      toast({
        title: "Success",
        description: "Record added successfully",
      });
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
      photos: []
    });
    setIsAddingRecord(false);
  };
  
  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter(record => record.id !== id));
    // Also delete any reminders for this record
    setReminders(reminders.filter(reminder => reminder.recordId !== id));
    toast({
      title: "Success",
      description: "Record deleted",
    });
  };
  
  const handleToggleCompletion = (id: string) => {
    setRecords(records.map(record => 
      record.id === id ? { ...record, completed: !record.completed } : record
    ));
    
    const record = records.find(r => r.id === id);
    if (record) {
      // If marked as completed, dismiss any reminders
      if (!record.completed) {
        setReminders(reminders.map(reminder => 
          reminder.recordId === id ? { ...reminder, dismissed: true } : reminder
        ));
      }
      
      toast({
        title: "Status Changed",
        description: record.completed ? "Record marked as incomplete" : "Record marked as complete",
      });
    }
  };
  
  const handleToggleExpansion = (id: string) => {
    setRecords(records.map(record => 
      record.id === id ? { ...record, isExpanded: !record.isExpanded } : record
    ));
  };
  
  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setNewRecord({
      ...record,
      date: new Date(record.date),
    });
    setIsAddingRecord(true);
  };
  
  const handleAddPhoto = (recordId: string, photoUrl: string) => {
    setRecords(records.map(record => {
      if (record.id === recordId) {
        return {
          ...record,
          photos: [...(record.photos || []), photoUrl]
        };
      }
      return record;
    }));
    
    toast({
      title: "Success",
      description: "Photo added to record",
    });
  };
  
  const handleCameraCapture = (imageDataUrl: string) => {
    if (editingRecordForPhoto) {
      handleAddPhoto(editingRecordForPhoto, imageDataUrl);
      setEditingRecordForPhoto(null);
    } else if (isAddingRecord) {
      setNewRecord({
        ...newRecord,
        photos: [...(newRecord.photos || []), imageDataUrl]
      });
    }
  };
  
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
  
  const renderPhotos = (photos: string[] = []) => {
    if (photos.length === 0) return null;
    
    return (
      <div className="mt-2 grid grid-cols-3 gap-1">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square">
            <img 
              src={photo} 
              alt={`Medical record photo ${index + 1}`} 
              className="w-full h-full object-cover rounded"
            />
          </div>
        ))}
      </div>
    );
  };
  
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
    <PageLayout title="Medical Records & Reminders" icon={<Stethoscope className="h-5 w-5 mr-2" />} pageType="medical">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-purple-500" />
                    Medical Calendar
                  </div>
                  
                  {/* Reminders indicator */}
                  {activeRemindersCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1" 
                      onClick={() => setShowRemindersDialog(true)}
                    >
                      <BellRing className="h-4 w-4 text-amber-500" />
                      <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {activeRemindersCount}
                      </span>
                    </Button>
                  )}
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
                <div className="flex items-center justify-between mb-4">
                  <div className="block md:hidden w-full">
                    <Select
                      value={selectedTab}
                      onValueChange={setSelectedTab}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">By Date</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="all">All Records</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Reminders button for mobile */}
                  {activeRemindersCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1 md:hidden ml-2 flex-shrink-0" 
                      onClick={() => setShowRemindersDialog(true)}
                    >
                      <BellRing className="h-4 w-4 text-amber-500" />
                      <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {activeRemindersCount}
                      </span>
                    </Button>
                  )}
                </div>
                
                <div className="hidden md:block">
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
                </div>
                
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
                  <ScrollArea className="h-[500px] pr-1 overflow-visible">
                    <div className="space-y-4 pr-1">
                      {filteredRecords.map((record) => (
                        <Collapsible 
                          key={record.id}
                          open={record.isExpanded} 
                          onOpenChange={() => handleToggleExpansion(record.id)}
                          className={`p-3 sm:p-4 rounded-lg border ${
                            record.completed 
                              ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm"
                          } w-full overflow-visible`}
                        >
                          <CollapsibleTrigger asChild>
                            <div className="flex items-start justify-between cursor-pointer w-full overflow-visible">
                              <div className="flex items-start space-x-3 flex-1 min-w-0">
                                <div className="pt-1 flex-shrink-0">
                                  {getRecordIcon(record.type)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className={`font-medium ${record.completed ? "line-through text-gray-500 dark:text-gray-400" : ""} truncate`}>
                                      {record.title}
                                    </h3>
                                    <Badge variant={
                                      record.type === "appointment" ? "default" :
                                      record.type === "medication" ? "secondary" :
                                      record.type === "vital" ? "destructive" : "outline"
                                    }>
                                      {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                                    </Badge>
                                    {record.reminder && !record.completed && 
                                     reminders.some(r => r.recordId === record.id && !r.dismissed) && (
                                      <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700">
                                        <BellRing className="h-3 w-3 mr-1" />
                                        Reminder
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                                    {format(new Date(record.date), "MMMM d, yyyy")}
                                    {record.time && ` at ${record.time}`}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCompletion(record.id);
                                  }}
                                  title={record.completed ? "Mark as Incomplete" : "Mark as Complete"}
                                  className="flex-shrink-0"
                                >
                                  <CheckCircle2 className={`h-5 w-5 ${record.completed ? 'text-green-500 fill-green-500' : 'text-gray-300'}`} />
                                </Button>
                                {record.isExpanded ? 
                                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                }
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="mt-4 space-y-3">
                            {record.description && (
                              <p className="text-sm">{record.description}</p>
                            )}
                            
                            {record.type === "appointment" && (record.doctor || record.location) && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {record.doctor && <p>Doctor: {record.doctor}</p>}
                                {record.location && <p>Location: {record.location}</p>}
                              </div>
                            )}
                            
                            {record.type === "medication" && (record.dosage || record.frequency) && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
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
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p>Value: {record.value}{record.unit && ` ${record.unit}`}</p>
                              </div>
                            )}
                            
                            {record.reminder && !record.completed && (
                              <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                                <BellRing className="h-4 w-4 mr-1" />
                                <span>
                                  Reminder: {record.reminderDays === 0 
                                    ? "Same day" 
                                    : record.reminderDays === 1 
                                      ? "1 day before" 
                                      : `${record.reminderDays} days before`}
                                </span>
                              </div>
                            )}
                            
                            {record.photos && record.photos.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-1">Photos</h4>
                                {renderPhotos(record.photos)}
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingRecordForPhoto(record.id);
                                  setCameraOpen(true);
                                }}
                              >
                                <Camera className="h-4 w-4 mr-1" /> Take Photo
                              </Button>
                            </div>
                            
                            <div className="flex space-x-2 pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRecord(record)}
                                title="Edit Record"
                              >
                                <Pencil className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRecord(record.id)}
                                title="Delete Record"
                              >
                                <Trash className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Reminders Dialog */}
      <Dialog open={showRemindersDialog} onOpenChange={setShowRemindersDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BellRing className="h-5 w-5 mr-2 text-amber-500" />
              Medical Reminders
            </DialogTitle>
            <DialogDescription>
              Your upcoming medical reminders and appointments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {reminders.filter(r => !r.dismissed).length === 0 ? (
              <div className="text-center py-6">
                <BellRing className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <p className="text-gray-500">No active reminders</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-2">
                <div className="space-y-3">
                  {reminders
                    .filter(r => !r.dismissed)
                    .map(reminder => {
                      const record = getRecordFromReminder(reminder.recordId);
                      if (!record) return null;
                      
                      return (
                        <div 
                          key={reminder.id}
                          className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="pt-1">
                              {record && getRecordIcon(record.type)}
                            </div>
                            <div>
                              <h3 className="font-medium">{reminder.title}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {format(new Date(reminder.date), "MMMM d, yyyy")}
                                {reminder.time && ` at ${reminder.time}`}
                              </p>
                              {record && record.type === "appointment" && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {record.doctor && `Dr. ${record.doctor}`}
                                  {record.doctor && record.location && ` • `}
                                  {record.location}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => dismissReminder(reminder.id)}
                            title="Dismiss reminder"
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            )}
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowRemindersDialog(false)}
            >
              Close
            </Button>
            {reminders.filter(r => !r.dismissed).length > 0 && (
              <Button
                variant="default"
                onClick={dismissAllReminders}
              >
                Dismiss All
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CameraCapture 
        open={cameraOpen} 
        onOpenChange={setCameraOpen} 
        onCapture={handleCameraCapture} 
      />

      <Dialog open={isAddingRecord} onOpenChange={(open) => {
        setIsAddingRecord(open);
        if (!open) {
          setEditingRecord(null);
          setNewRecord({
            type: "appointment",
            title: "",
            description: "",
            date: new Date(),
            time: "",
            reminder: true,
            reminderDays: 1,
            completed: false,
            photos: []
          });
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit Medical Record" : "Add New Medical Record"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingRecord ? "update your" : "create a new"} medical record.
            </DialogDescription>
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newRecord.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newRecord.date ? format(new Date(newRecord.date), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={newRecord.date}
                      onSelect={(date) => {
                        if (date) {
                          setNewRecord({ ...newRecord, date });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
            
            {renderTypeSpecificFields()}
            
            {newRecord.photos && newRecord.photos.length > 0 && (
              <div className="space-y-2">
                <Label>Photos</Label>
                {renderPhotos(newRecord.photos)}
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCameraOpen(true)}
              className="mt-2"
            >
              <Camera className="h-4 w-4 mr-1" /> Take Photo
            </Button>
            
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
                  <SelectTrigger id="reminderDays" className="w-full">
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
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingRecord(false);
                setEditingRecord(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddRecord}>
              {editingRecord ? "Update Record" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Medical;
