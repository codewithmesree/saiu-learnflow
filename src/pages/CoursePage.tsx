import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../lib/courseStorage';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Megaphone, FileText, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

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
        <Tabs defaultValue="announcements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="assignments">Assignments / Quizzes</TabsTrigger>
            <TabsTrigger value="classmates">Classmates</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements">
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
          </TabsContent>

          <TabsContent value="assignments">
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
          </TabsContent>

          <TabsContent value="classmates">
            <Card>
              <CardHeader>
                <CardTitle>Classmates</CardTitle>
                <CardDescription>Students enrolled in this course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.studentIds.length === 0 ? (
                    <div className="text-sm text-gray-500">No students have joined yet.</div>
                  ) : (
                    course.studentIds.map((sid) => (
                      <div key={sid} className="flex items-center space-x-3 p-2 border rounded">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="text-sm text-gray-700">Student ID: {sid}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CoursePage;
