import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  BookOpen, 
  LogOut, 
  Calendar,
  FileText,
  Award,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JoinCourseModal from '../components/JoinCourseModal';
import { listAllCourses, joinCourseByCode, getCourseById } from '../lib/courseStorage';
import { useToast } from '../hooks/use-toast';
import { listAssignmentsByCourse } from '../lib/assignmentStorage';
import { listSubmissionsByStudent, createSubmission } from '../lib/submissionStorage';
import SubmitAssignmentModal from '../components/SubmitAssignmentModal';

const toDataUrl = (file: File): Promise<{ base64: string; type: string; name: string; }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ base64: reader.result as string, type: file.type, name: file.name });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);

  const myCourses = useMemo(() => {
    const all = listAllCourses();
    return user ? all.filter(c => c.studentIds.includes(user.id)) : [];
  }, [user, isJoinOpen, refreshKey]);

  const myPendingAssignments = useMemo(() => {
    if (!user) return [] as any[];
    const submissions = listSubmissionsByStudent(user.id);
    const submittedMap = new Set(submissions.map(s => s.assignmentId));
    const assignments: any[] = [];
    for (const c of myCourses) {
      const asns = listAssignmentsByCourse(c.id);
      for (const a of asns) {
        const due = new Date(a.dueAt).getTime();
        const now = Date.now();
        const isSubmitted = submittedMap.has(a.id);
        if (!isSubmitted && due >= now) assignments.push({ ...a, courseName: c.name });
      }
    }
    // sort by nearest due date
    assignments.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
    return assignments;
  }, [myCourses, refreshKey, user]);

  const mySubmissions = useMemo(() => {
    if (!user) return [] as any[];
    return listSubmissionsByStudent(user.id).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [user, refreshKey]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Access denied. Student privileges required.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'not-started':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">LearnFlow Student</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user.name}</span>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">Student</Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Student Dashboard</h2>
              <p className="text-gray-600">Join courses and track your progress</p>
            </div>
            <Button onClick={() => setIsJoinOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Join Course
            </Button>
          </div>

          {/* Pending Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
              <CardDescription>Assignments you need to submit before the deadline</CardDescription>
            </CardHeader>
            <CardContent>
              {myPendingAssignments.length === 0 ? (
                <div className="text-sm text-gray-500">No pending assignments. Great job!</div>
              ) : (
                <div className="space-y-3">
                  {myPendingAssignments.map((a) => (
                    <div key={a.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{a.courseName}</div>
                          <div className="text-sm text-gray-500">Due: {new Date(a.dueAt).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {a.fileDataBase64 && (
                            <Button size="sm" variant="outline" onClick={() => {
                              const link = document.createElement('a');
                              link.href = a.fileDataBase64;
                              link.download = a.fileName || 'assignment';
                              link.click();
                            }}>
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" onClick={() => { setActiveAssignment(a); setIsSubmitOpen(true); }}>
                            Submit
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{a.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submitted Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Assignments</CardTitle>
              <CardDescription>Your submissions and grades</CardDescription>
            </CardHeader>
            <CardContent>
              {mySubmissions.length === 0 ? (
                <div className="text-sm text-gray-500">No submissions yet.</div>
              ) : (
                <div className="space-y-3">
                  {mySubmissions.map((s) => (
                    <div key={s.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">Submitted: {new Date(s.submittedAt).toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Grade: {s.grade !== undefined ? s.grade : 'Pending'}</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => { const link = document.createElement('a'); link.href = s.fileDataBase64; link.download = s.fileName || 'submission'; link.click(); }}>
                          <Download className="h-4 w-4 mr-2" /> Download
                        </Button>
                      </div>
                      {s.feedback && (
                        <div className="mt-1 text-xs text-gray-600">Feedback: {s.feedback}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Courses */}
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Courses you've joined</CardDescription>
            </CardHeader>
            <CardContent>
              {myCourses.length === 0 ? (
                <div className="text-sm text-gray-500">You haven't joined any courses yet.</div>
              ) : (
                <div className="space-y-3">
                  {myCourses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-gray-500">Subject: {course.subject} • Code: <span className="font-mono">{course.code}</span></div>
                      </div>
                      <Button variant="outline" onClick={() => navigate(`/course/${course.id}`)}>
                        Open <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <BookOpen className="h-6 w-6 mb-2" />
                  View Courses
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Assignments
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Submit assignment modal */}
      <SubmitAssignmentModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        assignment={activeAssignment}
        onSubmit={async (file: File) => {
          if (!user || !activeAssignment) return;
          const { base64, type, name } = await toDataUrl(file);
          createSubmission({
            assignmentId: activeAssignment.id,
            courseId: activeAssignment.courseId,
            studentId: user.id,
            studentName: user.name,
            fileName: name,
            fileType: type,
            fileDataBase64: base64,
          });
          toast({ title: 'Submitted', description: 'Your assignment was submitted successfully.' });
          setIsSubmitOpen(false);
          setRefreshKey(v => v + 1);
        }}
      />

      <JoinCourseModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoin={(code: string) => {
          if (!user) throw new Error('Not authenticated');
          const course = joinCourseByCode(code, user);
          toast({ title: 'Joined course', description: `You joined ${course.name}` });
          setRefreshKey(v => v + 1);
        }}
      />
    </div>
  );
};

export default StudentDashboard;
