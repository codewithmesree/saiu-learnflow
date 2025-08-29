import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../lib/courseStorage';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Megaphone, FileText, Users, Edit3, Trash2, Download, Plus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { listAnnouncementsByCourse, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../lib/announcementStorage';
import { useAuth } from '../contexts/AuthContext';
import AnnouncementModal from '../components/AnnouncementModal';
import { listAssignmentsByCourse, createAssignment, updateAssignment, deleteAssignment } from '../lib/assignmentStorage';
import AssignmentModal from '../components/AssignmentModal';

const toDataUrl = (file: File): Promise<{ base64: string; type: string; name: string; }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ base64: reader.result as string, type: file.type, name: file.name });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CoursePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const course = id ? getCourseById(id) : null;
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isAsnModalOpen, setIsAsnModalOpen] = useState(false);
  const [editAsnId, setEditAsnId] = useState<string | null>(null);

  const announcements = useMemo(() => {
    return course ? listAnnouncementsByCourse(course.id) : [];
  }, [course, refreshKey]);

  const assignments = useMemo(() => {
    return course ? listAssignmentsByCourse(course.id) : [];
  }, [course, refreshKey]);

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

  const isProfessor = user?.role === 'professor' && user.id === course.professorId;

  const handleCreateAnnouncement = async (content: string) => {
    if (!user) throw new Error('Not authenticated');
    createAnnouncement({ courseId: course.id, authorId: user.id, authorName: user.name, content });
    setRefreshKey(v => v + 1);
  };

  const handleEditAnnouncement = async (content: string) => {
    if (!editId) return;
    updateAnnouncement({ id: editId, content });
    setEditId(null);
    setRefreshKey(v => v + 1);
  };

  const requestEdit = (id: string) => {
    setEditId(id);
    setIsAnnModalOpen(true);
  };

  const removeAnnouncement = (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    deleteAnnouncement(id);
    setRefreshKey(v => v + 1);
  };

  const getAnnouncementContent = (id: string) => announcements.find(a => a.id === id)?.content || '';

  // Assignments handlers
  const handleCreateAssignment = async (data: { message: string; file: File | null; dueAt: string; }) => {
    if (!user) throw new Error('Not authenticated');
    let fileName = '';
    let fileType = '';
    let fileDataBase64 = '';
    if (data.file) {
      const { base64, type, name } = await toDataUrl(data.file);
      fileName = name;
      fileType = type;
      fileDataBase64 = base64;
    }
    createAssignment({
      courseId: course.id,
      authorId: user.id,
      authorName: user.name,
      message: data.message,
      fileName,
      fileType,
      fileDataBase64,
      dueAt: data.dueAt,
    });
    setRefreshKey(v => v + 1);
  };

  const handleEditAssignment = async (id: string, data: { message?: string; file?: File | null; dueAt?: string; }) => {
    let updates: any = { ...data };
    if (data.file) {
      const { base64, type, name } = await toDataUrl(data.file);
      updates.fileName = name;
      updates.fileType = type;
      updates.fileDataBase64 = base64;
    }
    delete updates.file;
    updateAssignment(id, updates);
    setEditAsnId(null);
    setRefreshKey(v => v + 1);
  };

  const downloadAssignment = (aId: string) => {
    const a = assignments.find(x => x.id === aId);
    if (!a || !a.fileDataBase64) return;
    const link = document.createElement('a');
    link.href = a.fileDataBase64;
    link.download = a.fileName || 'assignment';
    link.click();
  };

  const removeAssignment = (aId: string) => {
    if (!confirm('Delete this assignment?')) return;
    deleteAssignment(aId);
    setRefreshKey(v => v + 1);
  };

  const getAssignmentInitial = (aId: string) => {
    const a = assignments.find(x => x.id === aId);
    if (!a) return undefined;
    return { message: a.message, dueAt: a.dueAt };
  };

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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Announcements</CardTitle>
                    <CardDescription>Updates visible to all enrolled students</CardDescription>
                  </div>
                  {isProfessor && (
                    <Button onClick={() => { setEditId(null); setIsAnnModalOpen(true); }}>
                      <Megaphone className="h-4 w-4 mr-2" /> New Announcement
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <div className="text-sm text-gray-500">No announcements yet.</div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map(a => (
                      <div key={a.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">By {a.authorName} • {new Date(a.createdAt).toLocaleString()}</div>
                          {isProfessor && (
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline" onClick={() => { setEditId(a.id); setIsAnnModalOpen(true); }}>
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => deleteAnnouncement(a.id)} className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 whitespace-pre-wrap text-gray-800 text-sm">
                          {a.content}
                        </div>
                        {a.updatedAt && (
                          <div className="mt-1 text-xs text-gray-400">Edited {new Date(a.updatedAt).toLocaleString()}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Assignments & Quizzes</CardTitle>
                    <CardDescription>Share files and set a deadline</CardDescription>
                  </div>
                  {isProfessor && (
                    <Button onClick={() => { setEditAsnId(null); setIsAsnModalOpen(true); }}>
                      <Plus className="h-4 w-4 mr-2" /> New Assignment
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-sm text-gray-500">No assignments yet.</div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map(a => (
                      <div key={a.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">By {a.authorName} • {new Date(a.createdAt).toLocaleString()}</div>
                          <div className="flex items-center space-x-2">
                            {a.fileDataBase64 && (
                              <Button size="sm" variant="outline" onClick={() => downloadAssignment(a.id)}>
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {isProfessor && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => { setEditAsnId(a.id); setIsAsnModalOpen(true); }}>
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => removeAssignment(a.id)} className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 whitespace-pre-wrap text-gray-800 text-sm">
                          {a.message}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Due: {new Date(a.dueAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Create/Edit Announcement */}
      <AnnouncementModal
        isOpen={isAnnModalOpen}
        onClose={() => { setIsAnnModalOpen(false); setEditId(null); setRefreshKey(v => v + 1); }}
        initialContent={editId ? getAnnouncementContent(editId) : ''}
        onSubmit={(content: string) => editId ? handleEditAnnouncement(content) : handleCreateAnnouncement(content)}
        title={editId ? 'Edit Announcement' : 'New Announcement'}
      />

      {/* Create/Edit Assignment */}
      <AssignmentModal
        isOpen={isAsnModalOpen}
        onClose={() => { setIsAsnModalOpen(false); setEditAsnId(null); setRefreshKey(v => v + 1); }}
        initial={editAsnId ? getAssignmentInitial(editAsnId) : undefined}
        onSubmit={(payload) => editAsnId ? handleEditAssignment(editAsnId, payload) : handleCreateAssignment(payload)}
        title={editAsnId ? 'Edit Assignment' : 'New Assignment'}
      />
    </div>
  );
};

export default CoursePage;
