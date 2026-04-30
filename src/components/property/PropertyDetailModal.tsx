import { useState } from 'react';
import { 
  X, Settings, DollarSign, Users, Leaf, AlertTriangle, 
  CheckCircle, ArrowRight, Home, User, Calendar, StickyNote, Plus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Property, PropertyNote } from '@/types/property';
import { PropertyNotesTimeline } from './PropertyNotesTimeline';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PropertyDetailModalProps {
  property: Property | null;
  open: boolean;
  onClose: () => void;
}

export function PropertyDetailModal({ property, open, onClose }: PropertyDetailModalProps) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<PropertyNote['type']>('general');

  if (!property) return null;

  const pillars = [
    { name: 'Operations', icon: Settings, score: property.scoreBreakdown.operations, max: 40, color: 'text-blue-500', bgColor: 'bg-blue-500' },
    { name: 'Financial', icon: DollarSign, score: property.scoreBreakdown.financial, max: 15, color: property.scoreBreakdown.financial < 0 ? 'text-destructive' : 'text-green-500', bgColor: property.scoreBreakdown.financial < 0 ? 'bg-destructive' : 'bg-green-500' },
    { name: 'Customer', icon: Users, score: property.scoreBreakdown.customerExperience, max: 25, color: 'text-purple-500', bgColor: 'bg-purple-500' },
    { name: 'Ecosystem', icon: Leaf, score: property.scoreBreakdown.ecosystem, max: 20, color: 'text-teal-500', bgColor: 'bg-teal-500' },
  ];

  const totalRecoveryPoints = property.issues.reduce((sum, i) => sum + i.recoveryPoints, 0);

  const noteTypeColors: Record<PropertyNote['type'], string> = {
    general: 'bg-primary/10 text-primary border-primary/30',
    escalation: 'bg-destructive/10 text-destructive border-destructive/30',
    'follow-up': 'bg-warning/10 text-warning border-warning/30',
    resolution: 'bg-success/10 text-success border-success/30',
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    toast.success('Note added successfully');
    setNoteText('');
    setShowAddNote(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Home className="h-5 w-5 text-primary" />
            <div>
              <span className="text-lg">{property.basic.propertyName}</span>
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({property.basic.propertyId})
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Basic Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{property.basic.ownerName}</span>
          </div>
          <div>
            <Badge variant={property.basic.tenantStatus === 'occupied' ? 'default' : 'secondary'}>
              {property.basic.tenantStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Lease: {property.retention.daysToLeaseEnd}d left</span>
          </div>
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-muted-foreground" />
            <span>{property.notes.length} note{property.notes.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <Separator />

        {/* Health Score Summary */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">Property Health Score</p>
            <p className={cn(
              "text-4xl font-bold",
              property.healthScore >= 70 && "text-success",
              property.healthScore >= 50 && property.healthScore < 70 && "text-warning",
              property.healthScore < 50 && "text-destructive"
            )}>
              {property.healthScore}
              <span className="text-lg font-normal text-muted-foreground">/100</span>
            </p>
          </div>
          <Badge 
            variant={property.riskLevel === 'low' ? 'default' : property.riskLevel === 'medium' ? 'secondary' : 'destructive'}
            className={cn(
              "text-lg px-4 py-2",
              property.riskLevel === 'low' && "bg-success"
            )}
          >
            {property.riskLevel.toUpperCase()} RISK
          </Badge>
        </div>

        {/* Score Breakdown */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pillars.map((pillar) => (
              <div key={pillar.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <pillar.icon className={cn("h-4 w-4", pillar.color)} />
                    <span>{pillar.name}</span>
                  </div>
                  <span className={cn("font-bold tabular-nums", pillar.color)}>
                    {pillar.score}/{pillar.max}
                  </span>
                </div>
                <Progress value={Math.max(0, (pillar.score / pillar.max) * 100)} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-primary" />
                Notes ({property.notes.length})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowAddNote(!showAddNote)}>
                <Plus className="h-3 w-3 mr-1" />
                Add Note
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showAddNote && (
              <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                <Textarea
                  placeholder="Type your note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-[60px]"
                />
                <div className="flex items-center gap-2">
                  <Select value={noteType} onValueChange={(v) => setNoteType(v as PropertyNote['type'])}>
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="escalation">Escalation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="resolution">Resolution</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddNote(false)}>Cancel</Button>
                </div>
              </div>
            )}
            {property.notes.length > 0 ? (
              property.notes.map(note => (
                <div key={note.id} className="flex items-start gap-3 p-2 rounded bg-muted/30 text-sm">
                  <Badge variant="outline" className={cn("text-[10px] shrink-0 mt-0.5", noteTypeColors[note.type])}>
                    {note.type}
                  </Badge>
                  <div className="flex-1">
                    <p>{note.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {note.createdBy} • {note.createdAt}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notes yet. Add a note to track updates for this property.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Issues */}
        {property.issues.length > 0 && (
          <Card className="border-destructive/30">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                What Went Wrong ({property.issues.length} issues)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {property.issues.map((issue) => (
                <div key={issue.id} className="flex items-start gap-3 p-2 rounded bg-destructive/5 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{issue.issue}</p>
                    <p className="text-xs text-muted-foreground">Impact: -{issue.impact} points</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* What To Fix */}
        {property.issues.length > 0 && (
          <Card className="border-success/30">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2 text-success">
                <CheckCircle className="h-4 w-4" />
                What To Fix (Recover up to {totalRecoveryPoints} points)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {property.issues.filter(i => i.recoveryPoints > 0).map((issue) => (
                <div key={issue.id} className="flex items-center gap-3 p-2 rounded bg-success/5 text-sm">
                  <ArrowRight className="h-4 w-4 text-success shrink-0" />
                  <div className="flex-1"><p>{issue.actionRequired}</p></div>
                  <Badge variant="outline" className="text-success border-success shrink-0">+{issue.recoveryPoints} pts</Badge>
                </div>
              ))}
              {property.issues.filter(i => i.recoveryPoints === 0).length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Some issues (like past late rent) cannot be recovered this month.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* All Good */}
        {property.issues.length === 0 && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="py-6 text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
              <p className="font-medium text-success">All Good!</p>
              <p className="text-sm text-muted-foreground">This property has no outstanding issues.</p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
