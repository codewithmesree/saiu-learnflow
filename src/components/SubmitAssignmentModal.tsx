import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { X, Download } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assignment: {
    id: string;
    message: string;
    fileName: string;
    fileDataBase64: string;
    dueAt: string;
  } | null;
  onSubmit: (file: File) => Promise<void> | void;
}

const toDataUrl = (file: File): Promise<{ base64: string; type: string; name: string; }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ base64: reader.result as string, type: file.type, name: file.name });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const SubmitAssignmentModal: React.FC<Props> = ({ isOpen, onClose, assignment, onSubmit }) => {
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => { setFile(null); }, [isOpen]);

  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Submit Assignment</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Upload your solution before the deadline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 border rounded">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.message}</div>
            <div className="text-xs text-gray-500 mt-1">Due: {new Date(assignment.dueAt).toLocaleString()}</div>
            {assignment.fileDataBase64 && (
              <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                const link = document.createElement('a');
                link.href = assignment.fileDataBase64;
                link.download = assignment.fileName || 'assignment';
                link.click();
              }}>
                <Download className="h-4 w-4 mr-2" /> Download Attachment
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Your Submission (PDF or Word)</Label>
            <Input id="file" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
          </div>

          <div className="flex space-x-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="button" className="flex-1" disabled={!file} onClick={async () => { if (file) await onSubmit(file); onClose(); }}>Submit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitAssignmentModal;
