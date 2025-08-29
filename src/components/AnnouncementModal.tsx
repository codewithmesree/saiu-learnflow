import React, { useEffect } from 'react';
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
  content: z.string().min(2, 'Announcement must be at least 2 characters')
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  onSubmit: (content: string) => Promise<void> | void;
  title?: string;
}

const AnnouncementModal: React.FC<Props> = ({ isOpen, onClose, initialContent, onSubmit, title = 'New Announcement' }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    reset({ content: initialContent || '' });
  }, [initialContent, reset, isOpen]);

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
          <CardDescription>Compose your announcement</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(async (data) => { await onSubmit(data.content); onClose(); })} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Announcement</Label>
              <Textarea id="content" rows={6} placeholder="Type your announcement..." {...register('content')} className={errors.content ? 'border-red-500' : ''} />
              {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
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

export default AnnouncementModal;
