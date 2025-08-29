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
  Download,
  Menu,
  X,
  BarChart3,
  ListChecks
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JoinCourseModal from '../components/JoinCourseModal';
import { listAllCourses, joinCourseByCode, getCourseById } from '../lib/courseStorage';
import { listSessionsByCourseIds } from '../lib/scheduleStorage';
import { ClassSession } from '../types/schedule';
import { useToast } from '../hooks/use-toast';
import { listAssignmentsByCourse } from '../lib/assignmentStorage';
import { listSubmissionsByStudent, createSubmission } from '../lib/submissionStorage';
import SubmitAssignmentModal from '../components/SubmitAssignmentModal';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'assignments' | 'courses' | 'schedule' | 'cgpa'>('dashboard');
  const [cgpaRows, setCgpaRows] = useState<Array<{ id: string; name: string; credits: string; mode: 'credit' | 'audit'; grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F' | '' }>>([
    { id: Date.now().toString(), name: '', credits: '', mode: 'credit', grade: '' },
  ]);
  const [cgpaResult, setCgpaResult] = useState<number | null>(null);

  const gradeToPoint: Record<string, number> = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'P': 4,
    'F': 0,
  } as const;

  const addCgpaRow = () => {
    setCgpaRows(prev => [...prev, { id: (Date.now() + Math.random()).toString(), name: '', credits: '', mode: 'credit', grade: '' }]);
  };

  const removeCgpaRow = (id: string) => {
    setCgpaRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev);
  };

  const updateCgpaRow = (id: string, updates: Partial<{ name: string; credits: string; mode: 'credit' | 'audit'; grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F' | '' }>) => {
    setCgpaRows(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const calculateCgpa = () => {
    let totalWeighted = 0;
    let totalCredits = 0;
    for (const r of cgpaRows) {
      if (r.mode === 'audit') continue; // exclude audits
      const creditsNum = Number(r.credits);
      if (!r.grade || Number.isNaN(creditsNum) || creditsNum <= 0) continue;
      const gp = gradeToPoint[r.grade];
      totalWeighted += gp * creditsNum;
      totalCredits += creditsNum;
    }
    const result = totalCredits > 0 ? totalWeighted / totalCredits : 0;
    setCgpaResult(result);
  };

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

  const mySessions = useMemo<ClassSession[]>(() => {
    const ids = myCourses.map(c => c.id);
    if (ids.length === 0) return [];
    return listSessionsByCourseIds(ids).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [myCourses, refreshKey]);

  const currentMonth = useMemo(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1), []);
  const monthLabel = useMemo(() => currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' }), [currentMonth]);
  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ date: string; dayNum: number } | null> = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      // Build a local date string (YYYY-MM-DD) to avoid UTC shifting
      const yyyy = year.toString();
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const localDate = `${yyyy}-${mm}-${dd}`;
      days.push({ date: localDate, dayNum: d });
    }
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [currentMonth]);
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, ClassSession[]>();
    for (const s of mySessions) {
      const arr = map.get(s.date) || [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return map;
  }, [mySessions]);

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
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="mr-4 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
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
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveSection('assignments'); setIsSidebarOpen(false); }}>
              <ListChecks className="h-4 w-4 mr-3" />
              Assignments
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveSection('courses'); setIsSidebarOpen(false); }}>
              <BookOpen className="h-4 w-4 mr-3" />
              Courses
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveSection('schedule'); setIsSidebarOpen(false); }}>
              <Calendar className="h-4 w-4 mr-3" />
              Schedule
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveSection('cgpa'); setIsSidebarOpen(false); }}>
              <Award className="h-4 w-4 mr-3" />
              CGPA Calculator
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeSection === 'dashboard' ? (
              <>
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

                {/* Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">My Courses</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{myCourses.length}</div>
                      <p className="text-xs text-muted-foreground">Active enrollments</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{myPendingAssignments.length}</div>
                      <p className="text-xs text-muted-foreground">Due soon</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mySubmissions.length}</div>
                      <p className="text-xs text-muted-foreground">All-time</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{myPendingAssignments.filter(a => new Date(a.dueAt).getTime() - Date.now() < 1000*60*60*24*7).length}</div>
                      <p className="text-xs text-muted-foreground">Due within 7 days</p>
                    </CardContent>
                  </Card>
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
              </>
            ) : activeSection === 'assignments' ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Assignments</h2>
                    <p className="text-gray-600">View pending and submitted assignments</p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Pending</CardTitle>
                    <CardDescription>Assignments awaiting your submission</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myPendingAssignments.length === 0 ? (
                      <div className="text-sm text-gray-500">No pending assignments.</div>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Submitted</CardTitle>
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
              </>
            ) : activeSection === 'courses' ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">My Courses</h2>
                    <p className="text-gray-600">Courses you've joined</p>
                  </div>
                  <Button onClick={() => setIsJoinOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Join Course
                  </Button>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Courses</CardTitle>
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
              </>
            ) : activeSection === 'cgpa' ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">CGPA Calculator</h2>
                    <p className="text-gray-600">Use the 10-point system; audited courses are excluded</p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Courses</CardTitle>
                    <CardDescription>Enter course details to compute your CGPA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cgpaRows.map((row) => (
                        <div key={row.id} className="p-3 border rounded">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                            <div className="space-y-1 md:col-span-2">
                              <Label>Course Name</Label>
                              <Input placeholder="e.g., Data Structures" value={row.name} onChange={(e) => updateCgpaRow(row.id, { name: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                              <Label>Credits</Label>
                              <Input type="number" min="0" placeholder="e.g., 4" value={row.credits} onChange={(e) => updateCgpaRow(row.id, { credits: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                              <Label>Mode</Label>
                              <Select value={row.mode} onValueChange={(v: 'credit' | 'audit') => updateCgpaRow(row.id, { mode: v })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="credit">Credit</SelectItem>
                                  <SelectItem value="audit">Audit</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label>Grade</Label>
                              <Select value={row.grade} onValueChange={(v: any) => updateCgpaRow(row.id, { grade: v })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="O">O (10)</SelectItem>
                                  <SelectItem value="A+">A+ (9)</SelectItem>
                                  <SelectItem value="A">A (8)</SelectItem>
                                  <SelectItem value="B+">B+ (7)</SelectItem>
                                  <SelectItem value="B">B (6)</SelectItem>
                                  <SelectItem value="C">C (5)</SelectItem>
                                  <SelectItem value="P">P (4)</SelectItem>
                                  <SelectItem value="F">F (0)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => removeCgpaRow(row.id)}>Remove</Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" onClick={addCgpaRow}>Add Course</Button>
                        <Button onClick={calculateCgpa}>Calculate</Button>
                      </div>
                      {cgpaResult !== null && (
                        <div className="text-sm text-gray-700">Your CGPA: <span className="font-semibold">{cgpaResult.toFixed(2)}</span></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Schedule</h2>
                    <p className="text-gray-600">Upcoming deadlines</p>
                  </div>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Course Calendar</CardTitle>
                    <CardDescription>Read-only view of your classes this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{monthLabel}</div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-xs text-gray-600 mb-2">
                      <div className="text-center">Sun</div>
                      <div className="text-center">Mon</div>
                      <div className="text-center">Tue</div>
                      <div className="text-center">Wed</div>
                      <div className="text-center">Thu</div>
                      <div className="text-center">Fri</div>
                      <div className="text-center">Sat</div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {monthDays.map((d, idx) => (
                        <div key={idx} className="border rounded p-2 min-h-[100px]">
                          {d ? (
                            <>
                              <div className="text-xs font-medium mb-1">{d.dayNum}</div>
                              <div className="space-y-1">
                                {(sessionsByDate.get(d.date) || []).map(s => (
                                  <div key={s.id} className={`p-1 rounded border ${s.canceled ? 'opacity-60 line-through' : ''}`}>
                                    <div className="text-[10px] font-medium">{s.subject}</div>
                                    <div className="text-[10px] text-gray-600">{s.courseName} • {s.startTime}-{s.endTime}</div>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>

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
