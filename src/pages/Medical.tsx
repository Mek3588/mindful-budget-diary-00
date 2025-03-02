import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  Heart,
  Plus,
  Weight,
  Activity,
  Pill,
  Stethoscope,
  MoreVertical,
  Edit,
  Trash2,
  CalendarDays,
  Clock,
  Archive,
  Filter,
  HelpCircle,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { useMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/PageLayout";
import HelpDialog from "@/components/HelpDialog";
import { Switch } from "@/components/ui/switch";

type RecordType = "vitals" | "medication" | "appointment" | "note";
type ArchiveFilter = "active" | "archived" | "all";
type UnitSystem = "metric" | "imperial";

interface MedicalRecord {
  id: string;
  type: RecordType;
  date: string;
  time?: string;
  title: string;
  description?: string;
  values?: { [key: string]: string | number };
  archived?: boolean;
}

const recordTypeInfo = {
  vitals: {
    label: "Vitals & Metrics",
    icon: <Activity className="h-5 w-5" />,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  medication: {
    label: "Medications",
    icon: <Pill className="h-5 w-5" />,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  appointment: {
    label: "Appointments",
    icon: <Stethoscope className="h-5 w-5" />,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  note: {
    label: "Medical Notes",
    icon: <Heart className="h-5 w-5" />,
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
};

const convertWeight = (value: string, toImperial: boolean): string => {
  if (!value || value.trim() === "") return "";
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return value;
  
  if (toImperial) {
    return (numValue * 2.20462).toFixed(1);
  } else {
    return (numValue / 2.20462).toFixed(1);
  }
};

const convertTemperature = (value: string, toImperial: boolean): string => {
  if (!value || value.trim() === "") return "";
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return value;
  
  if (toImperial) {
    return ((numValue * 9/5) + 32).toFixed(1);
  } else {
    return ((numValue - 32) * 5/9).toFixed(1);
  }
};

const MedicalPage = () => {
  const isMobile = useMobile();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordType, setRecordType] = useState<RecordType>("vitals");
  const [recordTitle, setRecordTitle] = useState("");
  const [recordDescription, setRecordDescription] = useState("");
  const [recordDate, setRecordDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [recordTime, setRecordTime] = useState(format(new Date(), "HH:mm"));
  const [vitalValues, setVitalValues] = useState<{[key: string]: string}>({
    weight: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    bloodSugar: "",
  });
  const [medicationValues, setMedicationValues] = useState<{[key: string]: string}>({
    name: "",
    dosage: "",
    frequency: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: "",
  });
  const [appointmentValues, setAppointmentValues] = useState<{[key: string]: string}>({
    doctor: "",
    location: "",
    reason: "",
  });
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<RecordType | "all">("all");
  const [selectedRecordType, setSelectedRecordType] = useState<RecordType | "all">("all");
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>("active");
  const [showHelp, setShowHelp] = useState(false);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  useEffect(() => {
    const savedRecords = localStorage.getItem("medical-records");
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
    
    const savedUnitSystem = localStorage.getItem("medical-unit-system");
    if (savedUnitSystem) {
      setUnitSystem(savedUnitSystem as UnitSystem);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("medical-records", JSON.stringify(records));
  }, [records]);
  
  useEffect(() => {
    localStorage.setItem("medical-unit-system", unitSystem);
  }, [unitSystem]);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesType = selectedRecordType === "all" || record.type === selectedRecordType;
      const matchesArchiveStatus = 
        archiveFilter === "all" ||
        (archiveFilter === "active" && !record.archived) ||
        (archiveFilter === "archived" && record.archived);
      
      return matchesType && matchesArchiveStatus;
    });
  }, [records, selectedRecordType, archiveFilter]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      
      return 0;
    });
  }, [filteredRecords]);

  const resetForm = () => {
    setRecordType("vitals");
    setRecordTitle("");
    setRecordDescription("");
    setRecordDate(format(new Date(), "yyyy-MM-dd"));
    setRecordTime(format(new Date(), "HH:mm"));
    setVitalValues({
      weight: "",
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      bloodSugar: "",
    });
    setMedicationValues({
      name: "",
      dosage: "",
      frequency: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
    });
    setAppointmentValues({
      doctor: "",
      location: "",
      reason: "",
    });
    setEditingRecord(null);
    setShowDeleteConfirm(false);
  };

  const handleSaveRecord = () => {
    if (!recordTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    let values = {};
    switch (recordType) {
      case "vitals":
        values = vitalValues;
        break;
      case "medication":
        values = medicationValues;
        break;
      case "appointment":
        values = appointmentValues;
        break;
      default:
        values = {};
    }

    if (editingRecord) {
      const updatedRecords = records.map(record => 
        record.id === editingRecord.id 
          ? {
              ...record,
              type: recordType,
              title: recordTitle,
              description: recordDescription,
              date: recordDate,
              time: recordTime,
              values: values,
            }
          : record
      );
      setRecords(updatedRecords);
      toast.success("Record updated successfully");
    } else {
      const newRecord: MedicalRecord = {
        id: Date.now().toString(),
        type: recordType,
        title: recordTitle,
        description: recordDescription,
        date: recordDate,
        time: recordTime,
        values: values,
        archived: false,
      };
      setRecords([...records, newRecord]);
      toast.success("Record added successfully");
    }

    setShowRecordDialog(false);
    resetForm();
  };

  const handleDeleteRecord = () => {
    if (editingRecord) {
      const updatedRecords = records.filter(record => record.id !== editingRecord.id);
      setRecords(updatedRecords);
      toast.success("Record deleted successfully");
      setShowRecordDialog(false);
      resetForm();
    }
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setRecordType(record.type);
    setRecordTitle(record.title);
    setRecordDescription(record.description || "");
    setRecordDate(record.date);
    setRecordTime(record.time || format(new Date(), "HH:mm"));
    
    if (record.values) {
      switch (record.type) {
        case "vitals":
          setVitalValues(record.values as {[key: string]: string});
          break;
        case "medication":
          setMedicationValues(record.values as {[key: string]: string});
          break;
        case "appointment":
          setAppointmentValues(record.values as {[key: string]: string});
          break;
      }
    }
    
    setShowRecordDialog(true);
  };

  const toggleArchiveRecord = (recordId: string) => {
    const updatedRecords = records.map((record) =>
      record.id === recordId
        ? { ...record, archived: !record.archived }
        : record
    );
    setRecords(updatedRecords);
    
    const record = records.find(r => r.id === recordId);
    if (record) {
      if (!record.archived) {
        toast.success("Record archived successfully");
      } else {
        toast.success("Record unarchived successfully");
      }
    }
  };

  const toggleUnitSystem = () => {
    setUnitSystem(current => current === "metric" ? "imperial" : "metric");
    toast.success(`Switched to ${unitSystem === "metric" ? "imperial" : "metric"} units`);
  };

  const renderFormFields = () => {
    switch (recordType) {
      case "vitals":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">
                  Weight {unitSystem === "metric" ? "(kg)" : "(lbs)"}
                </Label>
                <Input
                  id="weight"
                  value={vitalValues.weight}
                  onChange={(e) => setVitalValues({...vitalValues, weight: e.target.value})}
                  placeholder={unitSystem === "metric" ? "e.g., 70" : "e.g., 154"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood-pressure">Blood Pressure (mmHg)</Label>
                <Input
                  id="blood-pressure"
                  value={vitalValues.bloodPressure}
                  onChange={(e) => setVitalValues({...vitalValues, bloodPressure: e.target.value})}
                  placeholder="e.g., 120/80"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
                <Input
                  id="heart-rate"
                  value={vitalValues.heartRate}
                  onChange={(e) => setVitalValues({...vitalValues, heartRate: e.target.value})}
                  placeholder="e.g., 72"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">
                  Temperature {unitSystem === "metric" ? "(°C)" : "(°F)"}
                </Label>
                <Input
                  id="temperature"
                  value={vitalValues.temperature}
                  onChange={(e) => setVitalValues({...vitalValues, temperature: e.target.value})}
                  placeholder={unitSystem === "metric" ? "e.g., 36.8" : "e.g., 98.6"}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blood-sugar">Blood Sugar (mg/dL)</Label>
              <Input
                id="blood-sugar"
                value={vitalValues.bloodSugar}
                onChange={(e) => setVitalValues({...vitalValues, bloodSugar: e.target.value})}
                placeholder="e.g., 90"
              />
            </div>
          </div>
        );
      case "medication":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medication-name">Medication Name</Label>
              <Input
                id="medication-name"
                value={medicationValues.name}
                onChange={(e) => setMedicationValues({...medicationValues, name: e.target.value})}
                placeholder="e.g., Aspirin"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={medicationValues.dosage}
                  onChange={(e) => setMedicationValues({...medicationValues, dosage: e.target.value})}
                  placeholder="e.g., 100mg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={medicationValues.frequency}
                  onChange={(e) => setMedicationValues({...medicationValues, frequency: e.target.value})}
                  placeholder="e.g., Once daily"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={medicationValues.startDate}
                  onChange={(e) => setMedicationValues({...medicationValues, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date (optional)</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={medicationValues.endDate}
                  onChange={(e) => setMedicationValues({...medicationValues, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>
        );
      case "appointment":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor/Provider</Label>
              <Input
                id="doctor"
                value={appointmentValues.doctor}
                onChange={(e) => setAppointmentValues({...appointmentValues, doctor: e.target.value})}
                placeholder="e.g., Dr. Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={appointmentValues.location}
                onChange={(e) => setAppointmentValues({...appointmentValues, location: e.target.value})}
                placeholder="e.g., City Hospital"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment-reason">Reason for Visit</Label>
              <Input
                id="appointment-reason"
                value={appointmentValues.reason}
                onChange={(e) => setAppointmentValues({...appointmentValues, reason: e.target.value})}
                placeholder="e.g., Annual checkup"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderRecordCard = (record: MedicalRecord) => {
    if (!record.type || !recordTypeInfo[record.type]) {
      console.error("Invalid record type:", record.type);
      return null;
    }
    
    const typeInfo = recordTypeInfo[record.type];
    
    return (
      <Card key={record.id} className={`${record.archived ? "opacity-70" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className={typeInfo.color}>
                  <span className="flex items-center gap-1">
                    {typeInfo.icon}
                    <span>{typeInfo.label}</span>
                  </span>
                </Badge>
                {record.archived && (
                  <Badge variant="outline" className="text-gray-500 border-gray-400">
                    <Archive className="h-3 w-3 mr-1" />
                    Archived
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{record.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 mr-1" />
                {format(new Date(record.date), "MMM d, yyyy")}
                {record.time && (
                  <>
                    <Clock className="h-4 w-4 ml-2 mr-1" />
                    {record.time}
                  </>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEditRecord(record)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleArchiveRecord(record.id)}>
                  <Archive className="h-4 w-4 mr-2" />
                  {record.archived ? "Unarchive" : "Archive"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    handleEditRecord(record);
                    setShowDeleteConfirm(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {record.description && <p className="text-sm text-muted-foreground mb-4">{record.description}</p>}
          
          {record.type === "vitals" && record.values && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {record.values.weight && (
                <div className="flex items-center">
                  <Weight className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">Weight:</span>
                  <span className="ml-2">
                    {unitSystem === "metric" 
                      ? `${record.values.weight} kg` 
                      : `${convertWeight(record.values.weight as string, true)} lbs`}
                  </span>
                </div>
              )}
              {record.values.bloodPressure && (
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-red-500" />
                  <span className="font-medium">BP:</span>
                  <span className="ml-2">{record.values.bloodPressure} mmHg</span>
                </div>
              )}
              {record.values.heartRate && (
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-red-500" />
                  <span className="font-medium">HR:</span>
                  <span className="ml-2">{record.values.heartRate} bpm</span>
                </div>
              )}
              {record.values.temperature && (
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="font-medium">Temp:</span>
                  <span className="ml-2">
                    {unitSystem === "metric" 
                      ? `${record.values.temperature} °C` 
                      : `${convertTemperature(record.values.temperature as string, true)} °F`}
                  </span>
                </div>
              )}
              {record.values.bloodSugar && (
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-purple-500" />
                  <span className="font-medium">Blood Sugar:</span>
                  <span className="ml-2">{record.values.bloodSugar} mg/dL</span>
                </div>
              )}
            </div>
          )}
          
          {record.type === "medication" && record.values && (
            <div className="space-y-1 text-sm">
              <div className="flex">
                <span className="font-medium w-24">Dosage:</span>
                <span>{record.values.dosage}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-24">Frequency:</span>
                <span>{record.values.frequency}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-24">Start Date:</span>
                <span>{format(new Date(record.values.startDate), "MMM d, yyyy")}</span>
              </div>
              {record.values.endDate && (
                <div className="flex">
                  <span className="font-medium w-24">End Date:</span>
                  <span>{format(new Date(record.values.endDate), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          )}
          
          {record.type === "appointment" && record.values && (
            <div className="space-y-1 text-sm">
              <div className="flex">
                <span className="font-medium w-24">Doctor:</span>
                <span>{record.values.doctor}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-24">Location:</span>
                <span>{record.values.location}</span>
              </div>
              {record.values.reason && (
                <div className="flex">
                  <span className="font-medium w-24">Reason:</span>
                  <span>{record.values.reason}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <PageLayout
      title="Medical Records"
      icon={<Heart className="h-5 w-5 text-white" />}
      pageType="medical"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col space-y-2">
            <h2 className="text-2xl font-bold">Personal Health Tracker</h2>
            <p className="text-muted-foreground max-w-xl">
              Track and manage your health records, medications, and medical appointments.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center space-x-2 mr-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
              <Label htmlFor="unit-toggle" className="text-sm whitespace-nowrap">
                {unitSystem === "metric" ? "Metric" : "Imperial"}
              </Label>
              <Switch
                id="unit-toggle"
                checked={unitSystem === "imperial"}
                onCheckedChange={toggleUnitSystem}
              />
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <Button onClick={() => {
              resetForm();
              setShowRecordDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowHelp(true)}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value as RecordType | "all");
              setSelectedRecordType(value as RecordType | "all");
            }}
            className="w-full sm:w-auto"
          >
            <TabsList className="w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="medication">Meds</TabsTrigger>
              <TabsTrigger value="appointment">Appts</TabsTrigger>
              <TabsTrigger value="note">Notes</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            <span className="text-sm font-medium mr-2">View:</span>
            <Button 
              variant={archiveFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setArchiveFilter("active")}
              className="h-8"
            >
              Active
            </Button>
            <Button 
              variant={archiveFilter === "archived" ? "default" : "outline"}
              size="sm"
              onClick={() => setArchiveFilter("archived")}
              className="h-8"
            >
              Archived
            </Button>
            <Button 
              variant={archiveFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setArchiveFilter("all")}
              className="h-8"
            >
              All
            </Button>
          </div>
        </div>

        {sortedRecords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedRecords.map((record) => renderRecordCard(record))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 mb-4 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-2">No Records Found</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {archiveFilter === "archived" 
                  ? "You don't have any archived medical records." 
                  : "Start tracking your health by adding medical records, vitals, medications, or appointments."}
              </p>
              <Button onClick={() => {
                resetForm();
                setShowRecordDialog(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit Medical Record" : "Add Medical Record"}
            </DialogTitle>
            <DialogDescription>
              {editingRecord 
                ? "Update your medical record information." 
                : "Enter the details of your medical record."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="record-type">Record Type</Label>
              <Select 
                value={recordType} 
                onValueChange={(value) => setRecordType(value as RecordType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select record type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vitals">Vitals & Metrics</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="note">Medical Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="record-title">Title</Label>
              <Input
                id="record-title"
                value={recordTitle}
                onChange={(e) => setRecordTitle(e.target.value)}
                placeholder="Enter a title for this record"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="record-date">Date</Label>
                <Input
                  id="record-date"
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="record-time">Time (optional)</Label>
                <Input
                  id="record-time"
                  type="time"
                  value={recordTime}
                  onChange={(e) => setRecordTime(e.target.value)}
                />
              </div>
            </div>
            
            {renderFormFields()}
            
            <div className="space-y-2">
              <Label htmlFor="record-description">Notes (optional)</Label>
              <Textarea
                id="record-description"
                value={recordDescription}
                onChange={(e) => setRecordDescription(e.target.value)}
                placeholder="Add any additional notes or information"
                rows={3}
              />
            </div>
          </div>
          
          {showDeleteConfirm ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Confirm Deletion</h4>
              <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                Are you sure you want to delete this record? This action cannot be undone.
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
                  onClick={handleDeleteRecord}
                >
                  Delete Record
                </Button>
              </div>
            </div>
          ) : (
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRecordDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveRecord}>
                {editingRecord ? "Update Record" : "Save Record"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      
      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
    </PageLayout>
  );
};

export default MedicalPage;
