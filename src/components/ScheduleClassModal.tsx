import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initial?: { id?: string; date?: string; courseId?: string; subject?: string; startTime?: string; endTime?: string; notes?: string };
  courses: Array<{ id: string; name: string }>;
  onSubmit: (payload: { id?: string; date: string; courseId: string; subject: string; startTime: string; endTime: string; notes?: string }) => void;
  onCancel?: (id: string) => void;
}

const ScheduleClassModal: React.FC<Props> = ({ isOpen, onClose, initial, courses, onSubmit, onCancel }) => {
  const [date, setDate] = useState('');
  const [courseId, setCourseId] = useState('');
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initial) {
      setDate(initial.date || '');
      setCourseId(initial.courseId || '');
      setSubject(initial.subject || '');
      setStartTime(initial.startTime || '');
      setEndTime(initial.endTime || '');
      setNotes(initial.notes || '');
    } else {
      setDate('');
      setCourseId('');
      setSubject('');
      setStartTime('');
      setEndTime('');
      setNotes('');
    }
  }, [initial, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!date || !courseId || !subject || !startTime || !endTime) return;
    onSubmit({ id: initial?.id, date, courseId, subject, startTime, endTime, notes: notes || undefined });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">{initial?.id ? 'Edit Class' : 'Schedule Class'}</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Pick date, course, and time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Subject</Label>
            <Input placeholder="e.g., Linear Algebra" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Notes (optional)</Label>
            <Input placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-between">
            {initial?.id && onCancel ? (
              <Button variant="outline" onClick={() => onCancel(initial.id!)}>Cancel Class</Button>
            ) : <div />}
            <Button onClick={handleSubmit}>{initial?.id ? 'Save Changes' : 'Schedule'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleClassModal;


