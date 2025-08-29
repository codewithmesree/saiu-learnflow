import React, { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { X, Download, CheckCircle } from 'lucide-react';
import { Submission } from '../types/submission';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  submissions: Submission[];
  onSave: (id: string, updates: { grade?: number; feedback?: string; }) => void;
}

const GradeSubmissionsModal: React.FC<Props> = ({ isOpen, onClose, submissions, onSave }) => {
  const [local, setLocal] = useState<Record<string, { grade?: string; feedback?: string }>>({});

  const list = useMemo(() => submissions, [submissions]);

  if (!isOpen) return null;

  const handleDownload = (s: Submission) => {
    const link = document.createElement('a');
    link.href = s.fileDataBase64;
    link.download = s.fileName || 'submission';
    link.click();
  };

  const handleSave = (id: string) => {
    const entry = local[id] || {};
    const grade = entry.grade !== undefined && entry.grade !== '' ? Number(entry.grade) : undefined;
    const feedback = entry.feedback;
    onSave(id, { grade, feedback });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Review Submissions</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Download files and assign grades/feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {list.length === 0 ? (
            <div className="text-sm text-gray-500">No submissions yet.</div>
          ) : (
            list.map((s) => (
              <div key={s.id} className="p-3 border rounded space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{s.studentName}</div>
                    <div className="text-xs text-gray-500">Submitted: {new Date(s.submittedAt).toLocaleString()}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDownload(s)}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="space-y-1">
                    <Label>Grade</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 85"
                      value={local[s.id]?.grade ?? (s.grade?.toString() ?? '')}
                      onChange={(e) => setLocal(prev => ({ ...prev, [s.id]: { ...prev[s.id], grade: e.target.value } }))}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label>Feedback</Label>
                    <Textarea
                      rows={2}
                      placeholder="Short feedback"
                      value={local[s.id]?.feedback ?? (s.feedback ?? '')}
                      onChange={(e) => setLocal(prev => ({ ...prev, [s.id]: { ...prev[s.id], feedback: e.target.value } }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => handleSave(s.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Save
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeSubmissionsModal;
