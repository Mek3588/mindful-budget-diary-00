
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Edit, 
  Trash,
  Printer,
  File,
  Calendar as CalendarIcon,
  Pills,
  Stethoscope,
  Syringe,
  Clipboard,
  Menu
} from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MedicalRecord {
  id: string;
  type: string;
  appointmentDate: Date;
  provider: string;
  notes: string;
  prescription?: string;
  status: string;
  attachments?: string[];
  category?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  notes: string;
  active: boolean;
}

const Medical = () => {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [activeTab, setActiveTab] = useState("records");
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false);
  const [showAddMedicationDialog, setShowAddMedicationDialog] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: "",
    appointmentDate: new Date(),
    provider: "",
    notes: "",
    prescription: "",
    status: "",
    category: "appointment"
  });
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    prescribedBy: "",
    notes: "",
    active: true
  });
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);
  const [showRecordDetailsDialog, setShowRecordDetailsDialog] = useState(false);
  const [showMedicationDetailsDialog, setShowMedicationDetailsDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const recordCategories = [
    { value: "appointment", label: "Appointment", icon: <CalendarIcon className="h-4 w-4 mr-2" /> },
    { value: "test", label: "Test Results", icon: <Clipboard className="h-4 w-4 mr-2" /> },
    { value: "procedure", label: "Procedure", icon: <Stethoscope className="h-4 w-4 mr-2" /> },
    { value: "vaccination", label: "Vaccination", icon: <Syringe className="h-4 w-4 mr-2" /> },
    { value: "other", label: "Other", icon: <File className="h-4 w-4 mr-2" /> }
  ];

  useEffect(() => {
    const loadRecords = () => {
      const savedRecords = localStorage.getItem('medical-records');
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords).map((record: any) => ({
          ...record,
          appointmentDate: new Date(record.appointmentDate),
          category: record.category || "appointment" // Default category for backward compatibility
        })));
      }
    };

    const loadMedications = () => {
      const savedMedications = localStorage.getItem('medical-medications');
      if (savedMedications) {
        setMedications(JSON.parse(savedMedications).map((med: any) => ({
          ...med,
          startDate: new Date(med.startDate),
          endDate: med.endDate ? new Date(med.endDate) : undefined
        })));
      } else {
        // Add sample medication if none exist
        const sampleMedications = [
          {
            id: "sample-med-1",
            name: "Ibuprofen",
            dosage: "200mg",
            frequency: "Every 6 hours as needed",
            startDate: new Date(),
            prescribedBy: "Dr. Smith",
            notes: "Take with food to prevent stomach upset",
            active: true
          },
          {
            id: "sample-med-2",
            name: "Multivitamin",
            dosage: "1 tablet",
            frequency: "Once daily",
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            prescribedBy: "Dr. Johnson",
            notes: "Take in the morning with breakfast",
            active: true
          }
        ];
        setMedications(sampleMedications);
        localStorage.setItem('medical-medications', JSON.stringify(sampleMedications));
      }
    };

    loadRecords();
    loadMedications();
  }, []);

  useEffect(() => {
    localStorage.setItem('medical-records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('medical-medications', JSON.stringify(medications));
  }, [medications]);

  const handleAddRecord = () => {
    setShowAddRecordDialog(true);
  };

  const handleAddMedication = () => {
    setShowAddMedicationDialog(true);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecordId(record.id);
    setNewRecord({
      type: record.type,
      appointmentDate: new Date(record.appointmentDate),
      provider: record.provider,
      notes: record.notes,
      prescription: record.prescription || "",
      status: record.status,
      category: record.category || "appointment"
    });
    setShowAddRecordDialog(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedicationId(medication.id);
    setNewMedication({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      startDate: new Date(medication.startDate),
      endDate: medication.endDate,
      prescribedBy: medication.prescribedBy,
      notes: medication.notes,
      active: medication.active
    });
    setShowAddMedicationDialog(true);
  };

  const handleSaveRecord = () => {
    if (!newRecord.type.trim() || !newRecord.appointmentDate || !newRecord.provider.trim() || !newRecord.notes.trim() || !newRecord.status.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingRecordId) {
      const updatedRecords = records.map(record =>
        record.id === editingRecordId ? { 
          ...record, 
          ...newRecord,
          category: newRecord.category
        } : record
      );
      setRecords(updatedRecords);
      toast.success("Record updated successfully!");
    } else {
      const record: MedicalRecord = {
        id: Date.now().toString(),
        type: newRecord.type,
        appointmentDate: newRecord.appointmentDate,
        provider: newRecord.provider,
        notes: newRecord.notes,
        prescription: newRecord.prescription,
        status: newRecord.status,
        category: newRecord.category
      };
      setRecords([record, ...records]);
      toast.success("Record saved successfully!");
    }

    setShowAddRecordDialog(false);
    setNewRecord({ type: "", appointmentDate: new Date(), provider: "", notes: "", prescription: "", status: "", category: "appointment" });
    setEditingRecordId(null);
  };

  const handleSaveMedication = () => {
    if (!newMedication.name.trim() || !newMedication.dosage.trim() || !newMedication.frequency.trim() || !newMedication.startDate || !newMedication.prescribedBy.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingMedicationId) {
      const updatedMedications = medications.map(medication =>
        medication.id === editingMedicationId ? { ...medication, ...newMedication } : medication
      );
      setMedications(updatedMedications);
      toast.success("Medication updated successfully!");
    } else {
      const medication: Medication = {
        id: Date.now().toString(),
        name: newMedication.name,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        startDate: newMedication.startDate,
        endDate: newMedication.endDate,
        prescribedBy: newMedication.prescribedBy,
        notes: newMedication.notes,
        active: newMedication.active
      };
      setMedications([medication, ...medications]);
      toast.success("Medication saved successfully!");
    }

    setShowAddMedicationDialog(false);
    setNewMedication({ name: "", dosage: "", frequency: "", startDate: new Date(), endDate: undefined, prescribedBy: "", notes: "", active: true });
    setEditingMedicationId(null);
  };

  const handleDeleteRecord = (recordId: string) => {
    setRecords(records.filter(record => record.id !== recordId));
    setShowRecordDetailsDialog(false);
    toast.success("Record deleted successfully!");
  };

  const handleDeleteMedication = (medicationId: string) => {
    setMedications(medications.filter(medication => medication.id !== medicationId));
    setShowMedicationDetailsDialog(false);
    toast.success("Medication deleted successfully!");
  };

  const handleToggleMedicationStatus = (medicationId: string) => {
    const updatedMedications = medications.map(medication =>
      medication.id === medicationId ? { ...medication, active: !medication.active } : medication
    );
    setMedications(updatedMedications);
    toast.success(`Medication ${updatedMedications.find(m => m.id === medicationId)?.active ? 'activated' : 'deactivated'}`);
  };

  const handlePrintRecord = (record: MedicalRecord) => {
    // Create a printable version of the record
    const printableContent = document.createElement('div');
    printableContent.className = 'print-content';
    
    // Create a styled container for print
    printableContent.innerHTML = `
      <style>
        @media print {
          body { font-family: Arial, sans-serif; color: #333; background: white; }
          .print-header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .print-section { margin-bottom: 15px; }
          .print-label { font-weight: bold; margin-right: 8px; }
          .print-value { display: inline-block; }
          .print-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .print-table th { background-color: #f8f8f8; }
          .print-footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
          .print-page { page-break-after: always; padding: 20px; }
          .print-date { font-style: italic; color: #666; font-size: 0.9em; }
        }
      </style>
      <div class="print-page">
        <div class="print-header">
          <h1>Medical Record</h1>
          <p class="print-date">Date: ${format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        
        <div class="print-section">
          <span class="print-label">Type:</span>
          <span class="print-value">${record.type || 'Not specified'}</span>
        </div>
        
        <div class="print-section">
          <span class="print-label">Date:</span>
          <span class="print-value">${format(new Date(record.appointmentDate), 'MMMM d, yyyy')}</span>
        </div>
        
        <div class="print-section">
          <span class="print-label">Provider:</span>
          <span class="print-value">${record.provider || 'Not specified'}</span>
        </div>
        
        <div class="print-section">
          <span class="print-label">Status:</span>
          <span class="print-value">${record.status || 'Not specified'}</span>
        </div>
        
        <div class="print-section">
          <span class="print-label">Category:</span>
          <span class="print-value">${record.category || 'Appointment'}</span>
        </div>
        
        <div class="print-section">
          <span class="print-label">Notes:</span>
          <div class="print-value">${record.notes?.replace(/\n/g, '<br>') || 'No notes'}</div>
        </div>
        
        ${record.prescription ? `
          <div class="print-section">
            <span class="print-label">Prescription:</span>
            <div class="print-value">${record.prescription.replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}
        
        ${record.attachments && record.attachments.length > 0 ? `
          <div class="print-section">
            <span class="print-label">Attachments:</span>
            <div class="print-value">${record.attachments.length} attachment(s)</div>
          </div>
        ` : ''}
        
        <div class="print-footer">
          <p>This is a confidential medical record. Please handle with care.</p>
        </div>
      </div>
    `;
    
    // Append to body, print, then remove
    document.body.appendChild(printableContent);
    window.print();
    document.body.removeChild(printableContent);
    
    toast.success("Record sent to printer");
  };

  const filteredRecords = categoryFilter === "all" 
    ? records 
    : records.filter(record => record.category === categoryFilter);

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
                <Stethoscope className="h-5 w-5 mr-2" />
                <h1 className="text-xl font-semibold">Medical Records</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="records" className="flex items-center">
              <File className="mr-2 h-4 w-4" />
              <span>Records</span>
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center">
              <Pills className="mr-2 h-4 w-4" />
              <span>Medications</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="records" className="space-y-6">
            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Medical Records</h2>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {recordCategories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center">
                            {category.icon}
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddRecord}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <Card key={record.id} className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {recordCategories.find(c => c.value === record.category)?.icon || <File className="h-4 w-4" />}
                          <h3 className="font-semibold">{record.type}</h3>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowRecordDetailsDialog(true);
                            }}
                          >
                            <File className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditRecord(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRecord(record.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Date: {format(new Date(record.appointmentDate), "MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Provider: {record.provider}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Status: {record.status}
                      </p>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">No records found. Add your first medical record!</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="medications" className="space-y-6">
            <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Medications</h2>
                <Button onClick={handleAddMedication}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {medications.map((medication) => (
                  <Card 
                    key={medication.id} 
                    className={`bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-4 ${!medication.active ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <PillsIcon active={medication.active} />
                        <h3 className="font-semibold">{medication.name}</h3>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedMedication(medication);
                            setShowMedicationDetailsDialog(true);
                          }}
                        >
                          <File className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditMedication(medication)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMedication(medication.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Dosage: {medication.dosage}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Frequency: {medication.frequency}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Status: {medication.active ? 'Active' : 'Inactive'}
                    </p>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add/Edit Record Dialog */}
      <Dialog open={showAddRecordDialog} onOpenChange={setShowAddRecordDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border border-gray-700 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-white">{editingRecordId ? "Edit Record" : "Add Record"}</DialogTitle>
            <DialogDescription className="text-gray-300">
              {editingRecordId ? "Update the medical record details." : "Fill in the details for the new medical record."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right text-white">
                Category
              </Label>
              <Select
                value={newRecord.category}
                onValueChange={(value) => setNewRecord({ ...newRecord, category: value })}
              >
                <SelectTrigger className="col-span-3 bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  {recordCategories.map(category => (
                    <SelectItem key={category.value} value={category.value} className="text-white">
                      <div className="flex items-center">
                        {category.icon}
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right text-white">
                Title
              </Label>
              <Input
                type="text"
                id="type"
                value={newRecord.type}
                onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentDate" className="text-right text-white">
                Date
              </Label>
              <Input
                type="date"
                id="appointmentDate"
                value={format(newRecord.appointmentDate, "yyyy-MM-dd")}
                onChange={(e) => setNewRecord({ ...newRecord, appointmentDate: new Date(e.target.value) })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="provider" className="text-right text-white">
                Provider
              </Label>
              <Input
                type="text"
                id="provider"
                value={newRecord.provider}
                onChange={(e) => setNewRecord({ ...newRecord, provider: e.target.value })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right text-white">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prescription" className="text-right text-white">
                Prescription
              </Label>
              <Textarea
                id="prescription"
                value={newRecord.prescription}
                onChange={(e) => setNewRecord({ ...newRecord, prescription: e.target.value })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right text-white">
                Status
              </Label>
              <Select
                value={newRecord.status}
                onValueChange={(value) => setNewRecord({ ...newRecord, status: value })}
              >
                <SelectTrigger className="col-span-3 bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="scheduled" className="text-white">Scheduled</SelectItem>
                  <SelectItem value="completed" className="text-white">Completed</SelectItem>
                  <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveRecord}>{editingRecordId ? "Update Record" : "Save Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Medication Dialog */}
      <Dialog open={showAddMedicationDialog} onOpenChange={setShowAddMedicationDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border border-gray-700 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-white">{editingMedicationId ? "Edit Medication" : "Add Medication"}</DialogTitle>
            <DialogDescription className="text-gray-300">
              {editingMedicationId ? "Update the medication details." : "Fill in the details for the new medication."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-white">
                Name
              </Label>
              <Input
                type="text"
                id="name"
                value={newMedication.name}
                onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dosage" className="text-right text-white">
                Dosage
              </Label>
              <Input
                type="text"
                id="dosage"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right text-white">
                Frequency
              </Label>
              <Input
                type="text"
                id="frequency"
                value={newMedication.frequency}
                onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right text-white">
                Start Date
              </Label>
              <Input
                type="date"
                id="startDate"
                value={format(newMedication.startDate, "yyyy-MM-dd")}
                onChange={(e) => setNewMedication({ ...newMedication, startDate: new Date(e.target.value) })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right text-white">
                End Date
              </Label>
              <Input
                type="date"
                id="endDate"
                value={newMedication.endDate ? format(newMedication.endDate, "yyyy-MM-dd") : ""}
                onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value ? new Date(e.target.value) : undefined })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prescribedBy" className="text-right text-white">
                Prescribed By
              </Label>
              <Input
                type="text"
                id="prescribedBy"
                value={newMedication.prescribedBy}
                onChange={(e) => setNewMedication({ ...newMedication, prescribedBy: e.target.value })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right text-white">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={newMedication.notes}
                onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right text-white">
                Status
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={newMedication.active}
                  onChange={(e) => setNewMedication({ ...newMedication, active: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="active" className="text-white cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveMedication}>{editingMedicationId ? "Update Medication" : "Save Medication"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Details Dialog */}
      <Dialog open={showRecordDetailsDialog} onOpenChange={setShowRecordDetailsDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border border-gray-700 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedRecord?.type}</DialogTitle>
            <DialogDescription className="text-gray-300">Medical record details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="category" className="text-right text-white">
                Category
              </Label>
              <div className="col-span-3 text-white flex items-center gap-2">
                {selectedRecord && recordCategories.find(c => c.value === selectedRecord.category)?.icon}
                <span>
                  {selectedRecord?.category 
                    ? recordCategories.find(c => c.value === selectedRecord.category)?.label 
                    : 'Appointment'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="appointmentDate" className="text-right text-white">
                Date
              </Label>
              <div className="col-span-3 text-white">
                {selectedRecord ? format(new Date(selectedRecord.appointmentDate), "MMM d, yyyy") : ''}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="provider" className="text-right text-white">
                Provider
              </Label>
              <div className="col-span-3 text-white">
                {selectedRecord?.provider}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right text-white">
                Notes
              </Label>
              <div className="col-span-3 whitespace-pre-line text-white">
                {selectedRecord?.notes}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="prescription" className="text-right text-white">
                Prescription
              </Label>
              <div className="col-span-3 whitespace-pre-line text-white">
                {selectedRecord?.prescription}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="status" className="text-right text-white">
                Status
              </Label>
              <div className="col-span-3 text-white">
                {selectedRecord?.status}
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex flex-wrap space-x-2 w-full justify-between">
              <Button variant="secondary" onClick={() => selectedRecord && handlePrintRecord(selectedRecord)}>
                Print Record
                <Printer className="h-4 w-4 ml-2" />
              </Button>
              <div className="flex space-x-2">
                <Button onClick={() => {
                  if (selectedRecord) {
                    handleEditRecord(selectedRecord);
                    setShowRecordDetailsDialog(false);
                  }
                }}>
                  Edit Record
                </Button>
                <Button variant="destructive" onClick={() => selectedRecord && handleDeleteRecord(selectedRecord.id)}>
                  Delete Record
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medication Details Dialog */}
      <Dialog open={showMedicationDetailsDialog} onOpenChange={setShowMedicationDetailsDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border border-gray-700 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedMedication?.name}</DialogTitle>
            <DialogDescription className="text-gray-300">Medication details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="dosage" className="text-right text-white">
                Dosage
              </Label>
              <div className="col-span-3 text-white">
                {selectedMedication?.dosage}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="frequency" className="text-right text-white">
                Frequency
              </Label>
              <div className="col-span-3 text-white">
                {selectedMedication?.frequency}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="startDate" className="text-right text-white">
                Start Date
              </Label>
              <div className="col-span-3 text-white">
                {selectedMedication ? format(new Date(selectedMedication.startDate), "MMM d, yyyy") : ''}
              </div>
            </div>
            {selectedMedication?.endDate && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="endDate" className="text-right text-white">
                  End Date
                </Label>
                <div className="col-span-3 text-white">
                  {format(new Date(selectedMedication.endDate), "MMM d, yyyy")}
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="prescribedBy" className="text-right text-white">
                Prescribed By
              </Label>
              <div className="col-span-3 text-white">
                {selectedMedication?.prescribedBy}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right text-white">
                Notes
              </Label>
              <div className="col-span-3 whitespace-pre-line text-white">
                {selectedMedication?.notes}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="active" className="text-right text-white">
                Status
              </Label>
              <div className="col-span-3 text-white">
                {selectedMedication?.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex flex-wrap space-x-2 w-full justify-between">
              <Button 
                variant="secondary" 
                onClick={() => selectedMedication && handleToggleMedicationStatus(selectedMedication.id)}
              >
                {selectedMedication?.active ? 'Mark as Inactive' : 'Mark as Active'}
              </Button>
              <div className="flex space-x-2">
                <Button onClick={() => {
                  if (selectedMedication) {
                    handleEditMedication(selectedMedication);
                    setShowMedicationDetailsDialog(false);
                  }
                }}>
                  Edit Medication
                </Button>
                <Button variant="destructive" onClick={() => selectedMedication && handleDeleteMedication(selectedMedication.id)}>
                  Delete Medication
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component for pills icon with active/inactive state
const PillsIcon = ({ active }: { active: boolean }) => {
  return (
    <div className={`p-1 rounded-full ${active ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
      <PillsIcon className={`h-4 w-4 ${active ? 'text-green-500' : 'text-gray-500'}`} />
    </div>
  );
};

export default Medical;
