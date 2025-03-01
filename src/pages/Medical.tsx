
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
  Calendar as CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useMobile } from "@/hooks/use-mobile";

interface MedicalRecord {
  id: string;
  type: string;
  appointmentDate: Date;
  provider: string;
  notes: string;
  prescription?: string;
  status: string;
  attachments?: string[];
}

const Medical = () => {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: "",
    appointmentDate: new Date(),
    provider: "",
    notes: "",
    prescription: "",
    status: ""
  });
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [showRecordDetailsDialog, setShowRecordDetailsDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    const loadRecords = () => {
      const savedRecords = localStorage.getItem('medical-records');
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords).map((record: any) => ({
          ...record,
          appointmentDate: new Date(record.appointmentDate)
        })));
      }
    };

    loadRecords();
  }, []);

  useEffect(() => {
    localStorage.setItem('medical-records', JSON.stringify(records));
  }, [records]);

  const handleAddRecord = () => {
    setShowAddRecordDialog(true);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecordId(record.id);
    setNewRecord({
      type: record.type,
      appointmentDate: new Date(record.appointmentDate),
      provider: record.provider,
      notes: record.notes,
      prescription: record.prescription || "",
      status: record.status
    });
    setShowAddRecordDialog(true);
  };

  const handleSaveRecord = () => {
    if (!newRecord.type.trim() || !newRecord.appointmentDate || !newRecord.provider.trim() || !newRecord.notes.trim() || !newRecord.status.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (editingRecordId) {
      const updatedRecords = records.map(record =>
        record.id === editingRecordId ? { ...record, ...newRecord } : record
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
        status: newRecord.status
      };
      setRecords([record, ...records]);
      toast.success("Record saved successfully!");
    }

    setShowAddRecordDialog(false);
    setNewRecord({ type: "", appointmentDate: new Date(), provider: "", notes: "", prescription: "", status: "" });
    setEditingRecordId(null);
  };

  const handleDeleteRecord = (recordId: string) => {
    setRecords(records.filter(record => record.id !== recordId));
    setShowRecordDetailsDialog(false);
    toast.success("Record deleted successfully!");
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
                <CalendarIcon className="h-5 w-5 mr-2" />
                <h1 className="text-xl font-semibold">Medical Records</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Medical Records</h2>
              <Button onClick={handleAddRecord}>
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {records.map((record) => (
                <Card key={record.id} className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{record.type}</h3>
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
                </Card>
              ))}
            </div>
          </Card>
        </div>
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
              <Label htmlFor="type" className="text-right text-white">
                Type
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
                Appointment Date
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

      {/* Record Details Dialog */}
      <Dialog open={showRecordDetailsDialog} onOpenChange={setShowRecordDetailsDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border border-gray-700 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedRecord?.type}</DialogTitle>
            <DialogDescription className="text-gray-300">Medical record details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="appointmentDate" className="text-right text-white">
                Appointment Date
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
    </div>
  );
};

export default Medical;
