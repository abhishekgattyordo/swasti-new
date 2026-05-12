// components/emergency/DischargeDialog.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DischargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: string;
  patientName: string;
  uhid: string;
  diagnosis: string;
  onDischargeComplete?: () => void;
}

export function DischargeDialog({
  open,
  onOpenChange,
  assessmentId,
  patientName,
  uhid,
  diagnosis,
  onDischargeComplete
}: DischargeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [dischargeData, setDischargeData] = useState({
    dischargeDate: new Date().toISOString().split('T')[0],
    dischargeTime: new Date().toTimeString().slice(0, 5),
    dischargeReason: '',
    dischargeNotes: '',
    dischargeType: 'Regular'
  });

  const handleDischarge = async () => {
    if (!dischargeData.dischargeReason) {
      toast.error("Please enter a discharge reason");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/emergency/assessments/${assessmentId}/discharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dischargeDate: dischargeData.dischargeDate,
          dischargeTime: dischargeData.dischargeTime,
          dischargeReason: dischargeData.dischargeReason,
          dischargeNotes: dischargeData.dischargeNotes,
          dischargeType: dischargeData.dischargeType
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Patient discharged successfully");
        onOpenChange(false);
        if (onDischargeComplete) {
          onDischargeComplete();
        }
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to discharge patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Discharge Patient</DialogTitle>
          <DialogDescription>
            Complete the discharge process for {patientName || 'this patient'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Discharge Date</label>
              <Input 
                type="date"
                value={dischargeData.dischargeDate}
                onChange={(e) => setDischargeData({...dischargeData, dischargeDate: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Discharge Time</label>
              <Input 
                type="time"
                value={dischargeData.dischargeTime}
                onChange={(e) => setDischargeData({...dischargeData, dischargeTime: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Discharge Type</label>
            <Select 
              value={dischargeData.dischargeType}
              onValueChange={(v) => setDischargeData({...dischargeData, dischargeType: v})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select discharge type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Regular">Regular Discharge</SelectItem>
                <SelectItem value="LAMA">LAMA (Left Against Medical Advice)</SelectItem>
                <SelectItem value="Referred">Referred to Another Facility</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Discharge Reason</label>
            <Textarea 
              placeholder="e.g., Patient recovered, referred to specialist, etc."
              value={dischargeData.dischargeReason}
              onChange={(e) => setDischargeData({...dischargeData, dischargeReason: e.target.value})}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Discharge Notes (Optional)</label>
            <Textarea 
              placeholder="Additional notes about discharge"
              value={dischargeData.dischargeNotes}
              onChange={(e) => setDischargeData({...dischargeData, dischargeNotes: e.target.value})}
              rows={2}
            />
          </div>

          {/* Discharge Summary Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2">Discharge Summary Preview</h4>
            <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <p><strong>Patient:</strong> {patientName}</p>
              <p><strong>MRN:</strong> {uhid}</p>
              <p><strong>Diagnosis:</strong> {diagnosis || 'Not specified'}</p>
              <p><strong>Discharge Date:</strong> {dischargeData.dischargeDate} at {dischargeData.dischargeTime}</p>
              <p><strong>Discharge Type:</strong> {dischargeData.dischargeType}</p>
              <p><strong>Reason:</strong> {dischargeData.dischargeReason || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleDischarge} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
            Confirm Discharge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}