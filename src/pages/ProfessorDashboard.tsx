import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  LogOut, 
  Plus,
  Menu,
  X,
  Users,
  BarChart3,
  Calendar,
  Activity,
  FileText,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ListChecks,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CourseCreationModal from '../components/CourseCreationModal';
import { createCourse, getCoursesByProfessor } from '../lib/courseStorage';
import { Course } from '../types/course';
import { listAssignmentsByCourse } from '../lib/assignmentStorage';
import { listSubmissionsByAssignment, updateSubmission } from '../lib/submissionStorage';
import { Submission } from '../types/submission';
import { useToast } from '../hooks/use-toast';
import GradeSubmissionsModal from '../components/GradeSubmissionsModal';

// Mock data for demonstration
const mockStats = {
  totalStudents: 156,
  totalCourses: 8,
  activeStudents: 142,
  averageProgress: 78,
  completedAssignments: 89,
  pendingAssignments: 23
};

const mockStudentProgress = [
  { id: 1, name: 'John Doe', course: 'Advanced Mathematics', progress: 85, status: 'active', lastActivity: '2 hours ago' },
  { id: 2, name: 'Emily Johnson', course: 'Computer Science', progress: 92, status: 'active', lastActivity: '1 hour ago' },
  { id: 3, name: 'Michael Brown', course: 'Physics', progress: 67, status: 'active', lastActivity: '3 hours ago' },
  { id: 4, name: 'Sarah Davis', course: 'Chemistry', progress: 78, status: 'active', lastActivity: '5 hours ago' },
  { id: 5, name: 'David Wilson', course: 'Biology', progress: 45, status: 'struggling', lastActivity: '1 day ago' },
  { id: 6, name: 'Lisa Anderson', course: 'English Literature', progress: 88, status: 'active', lastActivity: '4 hours ago' },
];

const mockRecentActivity = [
  { id: 1, type: 'assignment', action: 'submitted', name: 'John Doe', course: 'Advanced Mathematics', time: '2 hours ago' },
  { id: 2, type: 'quiz', action: 'completed', name: 'Emily Johnson', course: 'Computer Science', time: '3 hours ago' },
  { id: 3, type: 'discussion', action: 'participated', name: 'Michael Brown', course: 'Physics', time: '4 hours ago' },
  { id: 4, type: 'assignment', action: 'graded', name: 'Sarah Davis', course: 'Chemistry', time: '1 day ago' },
];

const ProfessorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'assignments' | 'all_assignments'>('dashboard');

  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [gradeList, setGradeList] = useState<Submission[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const professorCourses = useMemo<Course[]>(() => {
    return user ? getCoursesByProfessor(user.id) : [];
  }, [user, isCreateOpen]);

  const allAssignments = useMemo(() => {
    if (!user) return [] as any[];
    const data: Array<{ id: string; courseId: string; courseName: string; message: string; dueAt: string; fileDataBase64?: string; fileName?: string; }> = [];
    for (const c of professorCourses) {
      const asns = listAssignmentsByCourse(c.id);
      for (const a of asns) {
        data.push({ id: a.id, courseId: c.id, courseName: c.name, message: a.message, dueAt: a.dueAt, fileDataBase64: a.fileDataBase64, fileName: a.fileName });
      }
    }
    // sort by due date ascending
    data.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
    return data;
  }, [professorCourses]);

  const studentGroups = useMemo(() => {
    const byStudent = new Map<string, { studentName: string; submissions: Submission[] }>();
    for (const a of allAssignments) {
      const subs = listSubmissionsByAssignment(a.id);
      for (const s of subs) {
        const entry = byStudent.get(s.studentId) || { studentName: s.studentName, submissions: [] };
        entry.submissions.push(s);
        byStudent.set(s.studentId, entry);
      }
    }
    return Array.from(byStudent.entries()).map(([studentId, data]) => ({ studentId, ...data }));
  }, [allAssignments, refreshKey]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateCourse = async (input: { name: string; subject: string; }) => {
    if (!user) throw new Error('Not authenticated');
    const course = createCourse(user, input);
    return course;
  };

  const downloadAttachment = (aId: string) => {
    const a = allAssignments.find(x => x.id === aId);
    if (!a || !a.fileDataBase64) return;
    const link = document.createElement('a');
    link.href = a.fileDataBase64;
    link.download = a.fileName || 'assignment';
    link.click();
  };

  if (!user || user.role !== 'professor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Access denied. Professor privileges required.</p>
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
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'struggling':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'struggling':
        return <AlertCircle className="h-4 w-4" />;
      case 'inactive':
        return <Clock className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="mr-4 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <GraduationCap className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">LearnFlow Professor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user.name}</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Professor</Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveSection('dashboard'); setIsSidebarOpen(false); }}>
              <BarChart3 className="h-4 w-4 mr-3" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsSidebarOpen(false)}>
              <BookOpen className="h-4 w-4 mr-3" />
              My Courses
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsSidebarOpen(false)}>
              <Users className="h-4 w-4 mr-3" />
              Students
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveSection('assignments'); setIsSidebarOpen(false); }}>
              <FileText className="h-4 w-4 mr-3" />
              Assignments
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsSidebarOpen(false)}>
              <Calendar className="h-4 w-4 mr-3" />
              Schedule
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsSidebarOpen(false)}>
              <Award className="h-4 w-4 mr-3" />
              Grades
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveSection('all_assignments'); setIsSidebarOpen(false); }}>
              <ListChecks className="h-4 w-4 mr-3" />
              All Assignments
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeSection === 'dashboard' ? (
              <>
                {/* Page Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Professor Dashboard</h2>
                    <p className="text-gray-600">Monitor student progress and manage your courses</p>
                  </div>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Course
                  </Button>
                </div>

                {/* Your Courses */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Courses</CardTitle>
                    <CardDescription>Courses you have created</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {professorCourses.length === 0 ? (
                      <div className="text-sm text-gray-500">You have not created any courses yet.</div>
                    ) : (
                      <div className="space-y-3">
                        {professorCourses.map(course => (
                          <div key={course.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">156</div>
                      <p className="text-xs text-muted-foreground">
                        142 active
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{professorCourses.length}</div>
                      <p className="text-xs text-muted-foreground">
                        All active
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">78%</div>
                      <p className="text-xs text-muted-foreground">
                        Across all courses
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">89</div>
                      <p className="text-xs text-muted-foreground">
                        23 pending
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Student Analytics and Recent Activity remain */}
              </>
            ) : activeSection === 'assignments' ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Student Submissions</h2>
                    <p className="text-gray-600">Click to review what each student submitted</p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Students</CardTitle>
                    <CardDescription>Across your courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {studentGroups.length === 0 ? (
                      <div className="text-sm text-gray-500">No submissions from students yet.</div>
                    ) : (
                      <div className="space-y-3">
                        {studentGroups.map(group => (
                          <div key={group.studentId} className="p-3 border rounded">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{group.studentName}</div>
                                <div className="text-xs text-gray-500">{group.submissions.length} submission{group.submissions.length === 1 ? '' : 's'}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" onClick={() => { setGradeList(group.submissions); setIsGradeOpen(true); }}>
                                  <ListChecks className="h-4 w-4 mr-2" /> Review All
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 space-y-2">
                              {group.submissions.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                                  <div>
                                    <div className="text-sm">Submitted: {new Date(s.submittedAt).toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">Grade: {s.grade !== undefined ? s.grade : 'Pending'}</div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => { const link = document.createElement('a'); link.href = s.fileDataBase64; link.download = s.fileName || 'submission'; link.click(); }}>
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" onClick={() => { setGradeList([s]); setIsGradeOpen(true); }}>
                                      Review
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">All Assignments</h2>
                    <p className="text-gray-600">View and grade submissions across your courses</p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Assignments</CardTitle>
                    <CardDescription>Across all your courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {allAssignments.length === 0 ? (
                      <div className="text-sm text-gray-500">No assignments found.</div>
                    ) : (
                      <div className="space-y-3">
                        {allAssignments.map(a => {
                          const subs = listSubmissionsByAssignment(a.id);
                          return (
                            <div key={a.id} className="p-3 border rounded flex items-center justify-between">
                              <div>
                                <div className="font-medium">{a.courseName}</div>
                                <div className="text-sm text-gray-700 whitespace-pre-wrap">{a.message}</div>
                                <div className="text-xs text-gray-500 mt-1">Due: {new Date(a.dueAt).toLocaleString()} • Submissions: {subs.length}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {a.fileDataBase64 && (
                                  <Button size="sm" variant="outline" onClick={() => downloadAttachment(a.id)}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button size="sm" onClick={() => { setGradeList(listSubmissionsByAssignment(a.id)); setIsGradeOpen(true); }}>
                                  <ListChecks className="h-4 w-4 mr-2" /> Grade
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>

      <CourseCreationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateCourse}
      />

      <GradeSubmissionsModal
        isOpen={isGradeOpen}
        onClose={() => { setIsGradeOpen(false); setGradeList([]); }}
        submissions={gradeList}
        onSave={(id: string, updates) => {
          const updated = updateSubmission(id, updates);
          setGradeList(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
          setRefreshKey(v => v + 1);
          toast({ title: 'Saved', description: 'Grade and feedback saved.' });
        }}
      />

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfessorDashboard;
