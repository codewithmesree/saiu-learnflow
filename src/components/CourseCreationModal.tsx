import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, X, Clipboard, ClipboardCheck } from 'lucide-react';
import { CreateCourseInput, Course } from '../types/course';

const schema = z.object({
  name: z.string().min(2, 'Course name must be at least 2 characters'),
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateCourseInput) => Promise<Course> | Course;
}

const CourseCreationModal: React.FC<Props> = ({ isOpen, onClose, onCreate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCourse, setCreatedCourse] = useState<Course | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  if (!isOpen) return null;

  const submit = async (data: FormData) => {
    try {
      setError('');
      setIsLoading(true);
      const course = await onCreate({ name: data.name, subject: data.subject });
      setCreatedCourse(course);
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setCreatedCourse(null);
    setCopied(false);
    onClose();
  };

  const copyCode = async () => {
    if (!createdCourse) return;
    await navigator.clipboard.writeText(createdCourse.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Create New Course</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Enter the course details and share the generated code with students</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!createdCourse ? (
            <form onSubmit={handleSubmit(submit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name</Label>
                <Input id="name" placeholder="e.g., Introduction to AI" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="e.g., Artificial Intelligence" {...register('subject')} className={errors.subject ? 'border-red-500' : ''} />
                {errors.subject && <p className="text-sm text-red-500">{errors.subject.message}</p>}
              </div>

              <div className="flex space-x-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={isLoading}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>) : 'Create Course'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded border bg-green-50">
                <p className="text-sm text-gray-700">Course created successfully!</p>
                <p className="text-sm mt-1"><span className="font-medium">Name:</span> {createdCourse.name}</p>
                <p className="text-sm"><span className="font-medium">Subject:</span> {createdCourse.subject}</p>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="text-xs text-gray-500">Share this code with students</p>
                  <p className="font-mono text-lg">{createdCourse.code}</p>
                </div>
                <Button variant="outline" onClick={copyCode}>
                  {copied ? <><ClipboardCheck className="h-4 w-4 mr-2" />Copied</> : <><Clipboard className="h-4 w-4 mr-2" />Copy</>}
                </Button>
              </div>
              <div className="flex space-x-3 pt-2">
                <Button className="flex-1" onClick={handleClose}>Done</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseCreationModal;
