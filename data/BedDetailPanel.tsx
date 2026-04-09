import { Bed } from "@/data/wardData";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Thermometer, Droplets, Activity, Clock, User, Phone, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface BedDetailPanelProps {
  bed: Bed | null;
  open: boolean;
  onClose: () => void;
  onDischarge: (bed: Bed) => void;
  onTransfer: (bed: Bed) => void;
}

export function BedDetailPanel({ bed, open, onClose, onDischarge, onTransfer }: BedDetailPanelProps) {
  if (!bed) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span>Bed {bed.number}</span>
            <Badge className={cn(bed.status === "occupied" ? "bg-status-occupied" : "bg-status-available")}>
              {bed.status}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {bed.patient ? (
            <>
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  {bed.patient.initials}
                </div>
                <div>
                  <h3 className="font-semibold">{bed.patient.name}</h3>
                  <p className="text-sm text-muted-foreground">MRN: {bed.patient.mrn}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" /> {bed.patient.gender}, {bed.patient.age}y
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> {bed.patient.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" /> Admitted {bed.patient.admissionDate}
                </div>
                
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Diagnosis</h4>
                <p className="text-sm bg-muted p-2 rounded">{bed.patient.diagnosis}</p>
              </div>

              {bed.patient.specialRequirements && (
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Special Requirements</h4>
                  <p className="text-sm bg-muted p-2 rounded">{bed.patient.specialRequirements}</p>
                </div>
              )}

              {bed.vitals && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Vitals</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted p-2 rounded flex items-center gap-2">
                      <Heart className="h-4 w-4 text-status-occupied" /> {bed.vitals.heartRate} bpm
                    </div>
                    <div className="bg-muted p-2 rounded flex items-center gap-2">
                      <Activity className="h-4 w-4 text-status-occupied" /> {bed.vitals.bloodPressure}
                    </div>
                    <div className="bg-muted p-2 rounded flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-status-occupied" /> SpO₂ {bed.vitals.spO2}%
                    </div>
                    <div className="bg-muted p-2 rounded flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-status-occupied" /> {bed.vitals.temperature.toFixed(1)}°C
                    </div>
                  </div>
                </div>
              )}

              <Tabs defaultValue="notes">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="notes" className="space-y-2 mt-2">
                  {bed.notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
                  {bed.notes.map(note => (
                    <div key={note.id} className="bg-muted p-2 rounded">
                      <p className="text-sm">{note.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{note.author} · {note.timestamp}</p>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="history" className="mt-2">
                  <p className="text-sm text-muted-foreground">Admitted: {bed.patient.admissionDate}</p>
                  {/* Could add more history */}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button variant="destructive" className="flex-1" onClick={() => onDischarge(bed)}>Discharge</Button>
                <Button variant="outline" className="flex-1" onClick={() => onTransfer(bed)}>Transfer</Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">No patient assigned.</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}