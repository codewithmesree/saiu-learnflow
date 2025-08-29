import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../lib/courseStorage';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Megaphone, FileText } from 'lucide-react';

const CoursePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = id ? getCourseById(id) : null;

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Course not found.</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">{course.name}</h1>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{course.subject}</span>
          </div>
          <div className="text-sm text-gray-700">
            Code: <span className="font-mono">{course.code}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>Create updates and share with students</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="mb-4">
                <Megaphone className="h-4 w-4 mr-2" /> New Announcement
              </Button>
              <div className="text-sm text-gray-500">Announcements feed will appear here.</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignments & Quizzes</CardTitle>
              <CardDescription>Create assessments for this course</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="mb-4" variant="outline">
                <FileText className="h-4 w-4 mr-2" /> New Assignment / Quiz
              </Button>
              <div className="text-sm text-gray-500">Assignments and quizzes list will appear here.</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CoursePage;
