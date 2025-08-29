import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { X } from 'lucide-react';

const schema = z.object({
  message: z.string().min(2, 'Message must be at least 2 characters'),
  dueDate: z.string().min(1, 'Select a due date'),
  dueTime: z.string().min(1, 'Select a due time'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initial?: { message?: string; dueAt?: string; };
  onSubmit: (data: { message: string; file: File | null; dueAt: string; }) => Promise<void> | void;
  title?: string;
}

const AssignmentModal: React.FC<Props> = ({ isOpen, onClose, initial, onSubmit, title = 'New Assignment' }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    let dueDate = '';
    let dueTime = '';
    if (initial?.dueAt) {
      const d = new Date(initial.dueAt);
      dueDate = d.toISOString().slice(0,10);
      dueTime = d.toTimeString().slice(0,5);
    }
    reset({ message: initial?.message || '', dueDate, dueTime });
    setFile(null);
  }, [initial, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">{title}</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Attach a PDF/Word file and set a due date & time</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(async (data) => {
            const dueAt = new Date(`${data.dueDate}T${data.dueTime}:00`).toISOString();
            await onSubmit({ message: data.message, file, dueAt });
            onClose();
          })} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={4} placeholder="Instructions for the assignment..." {...register('message')} className={errors.message ? 'border-red-500' : ''} />
              {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Attachment (PDF or Word)</Label>
              <Input id="file" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              <p className="text-xs text-gray-500">Max size depends on browser limits (stored locally for demo).</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" {...register('dueDate')} className={errors.dueDate ? 'border-red-500' : ''} />
                {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueTime">Due Time</Label>
                <Input id="dueTime" type="time" {...register('dueTime')} className={errors.dueTime ? 'border-red-500' : ''} />
                {errors.dueTime && <p className="text-sm text-red-500">{errors.dueTime.message}</p>}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>Post</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentModal;
