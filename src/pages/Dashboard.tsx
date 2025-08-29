import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  LogOut, 
  Plus,
  UserPlus,
  Settings,
  BarChart3,
  Calendar,
  Activity,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserRegistrationModal from '../components/UserRegistrationModal';
import UserManagementPanel from '../components/UserManagementPanel';
import { StudentRegistrationData, ProfessorRegistrationData } from '../types/auth';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';
import { setupDemoUsers } from '../lib/demoSetup';

// Mock data for demonstration
const mockStats = {
  totalStudents: 1247,
  totalProfessors: 89,
  totalCourses: 156,
  activeUsers: 892,
  newRegistrations: 23,
  courseCompletions: 67
};

const mockRecentActivity = [
  { id: 1, type: 'student', action: 'registered', name: 'John Doe', time: '2 hours ago' },
  { id: 2, type: 'professor', action: 'joined', name: 'Dr. Sarah Wilson', time: '4 hours ago' },
  { id: 3, type: 'course', action: 'created', name: 'Advanced Mathematics', time: '1 day ago' },
  { id: 4, type: 'student', action: 'completed', name: 'Emily Johnson', time: '2 days ago' },
];

const Dashboard: React.FC = () => {
  const { user, logout, registerStudent, registerProfessor } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isProfessorModalOpen, setIsProfessorModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStudentRegistration = async (data: StudentRegistrationData) => {
    try {
      await registerStudent(data);
      toast({
        title: "Success!",
        description: `Student ${data.name} has been registered successfully.`,
      });
      // In a real app, you might want to refresh the user list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfessorRegistration = async (data: ProfessorRegistrationData) => {
    try {
      await registerProfessor(data);
      toast({
        title: "Success!",
        description: `Professor ${data.name} has been registered successfully.`,
      });
      // In a real app, you might want to refresh the user list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register professor. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Access denied. Admin privileges required.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">LearnFlow Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user.name}</span>
              </div>
              <Badge variant="secondary">Admin</Badge>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalStudents.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{mockStats.newRegistrations} this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Professors</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalProfessors}</div>
                  <p className="text-xs text-muted-foreground">
                    +5 this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalCourses}</div>
                  <p className="text-xs text-muted-foreground">
                    +12 this quarter
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +23% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions in the system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.name}</span> {activity.action} 
                          {activity.type === 'student' && ' as a student'}
                          {activity.type === 'professor' && ' as a professor'}
                          {activity.type === 'course' && ' course'}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setIsStudentModalOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register New Student
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setIsProfessorModalOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register New Professor
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create New Course
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">User Management</h3>
                <p className="text-sm text-gray-600">Manage all users in the system</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setupDemoUsers();
                    toast({
                      title: "Demo Users Created!",
                      description: "Sample users have been added to the system. Check the user list below.",
                    });
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Setup Demo Users
                </Button>
                <Button onClick={() => setIsStudentModalOpen(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
                <Button onClick={() => setIsProfessorModalOpen(true)}>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Add Professor
                </Button>
              </div>
            </div>
            <UserManagementPanel />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Comprehensive insights and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics dashboard will be implemented here</p>
                  <p className="text-sm">Features: Charts, graphs, performance metrics, trend analysis</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system preferences and security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Settings panel will be implemented here</p>
                  <p className="text-sm">Features: System configuration, security settings, user preferences</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Registration Modals */}
      <UserRegistrationModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        userType="student"
        onRegister={handleStudentRegistration}
      />

      <UserRegistrationModal
        isOpen={isProfessorModalOpen}
        onClose={() => setIsProfessorModalOpen(false)}
        userType="professor"
        onRegister={handleProfessorRegistration}
      />
      <Toaster />
    </div>
  );
};

export default Dashboard;
