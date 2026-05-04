'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, CheckSquare, Clock, User, AlertCircle, 
  CheckCircle2, XCircle, Search,  
  Calendar, Flag, RefreshCw, Loader2
} from 'lucide-react';
import { nurseApi } from '@/lib/api/nurse';
import toast from 'react-hot-toast';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-700';
    case 'medium': return 'bg-yellow-100 text-yellow-700';
    case 'low': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'in-progress': return 'bg-blue-100 text-blue-700';
    case 'completed': return 'bg-green-100 text-green-700';
    case 'overdue': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getTaskTypeIcon = (taskType: string) => {
  switch (taskType) {
    case 'vitals': return '❤️';
    case 'medication': return '💊';
    case 'lab': return '🔬';
    case 'dressing': return '🏥';
    case 'procedure': return '🩺';
    case 'documentation': return '📝';
    default: return '✅';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle2 size={16} className="text-green-500" />;
    case 'pending': return <Clock size={16} className="text-yellow-500" />;
    case 'in-progress': return <Flag size={16} className="text-blue-500" />;
    case 'overdue': return <AlertCircle size={16} className="text-red-500" />;
    default: return null;
  }
};

export default function PatientTasksPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const patientId = params?.patientId as string;
  const patientName = searchParams.get('name') || 'Patient';

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // ✅ Fetch tasks for THIS patient ONLY
  const fetchTasks = useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const result = await nurseApi.getTasks(patientId);
      
      if (result?.success && result?.data) {
        setTasks(result.data);
      } else if (Array.isArray(result)) {
        setTasks(result);
      } else {
        setTasks([]);
      }
    } catch (err) { 
      console.error('Failed to fetch tasks:', err); 
    } finally { 
      setLoading(false); 
    }
  }, [patientId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

const handleUpdateTask = async (taskId: string, status: string, result?: string) => {
  try {
    const nurseName = localStorage.getItem('userName') || 'Nurse';
    const res = await nurseApi.updateTask(taskId, { status, result, completedBy: nurseName });
    
    console.log('Update task response:', res); // Debug log
    
    // ✅ Check for success in multiple formats
    const isSuccess = 
      res?.success === true ||      // Standard format
      res?.id ||                     // Direct data return
      res?.data?.id ||              // Wrapped in data
      (res && !res?.error);          // Any response without error
    
    if (isSuccess) {
      toast.success(status === 'completed' ? 'Task completed!' : 'Task started!');
      await fetchTasks();
      setShowTaskModal(false);
    } else {
      toast.error(res?.message || 'Failed to update task');
    }
  } catch (err: any) { 
    console.error('Update task error:', err);
    toast.error(err.message || 'Failed to update task'); 
  }
};

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/nurse/tasks')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare size={20} className="text-green-600" />
              <h1 className="text-xl font-bold">{patientName}</h1>
            </div>
            <p className="text-sm text-gray-500">{tasks.length} tasks • {pendingCount} pending • {completedCount} completed</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs text-gray-500">Pending</p><p className="text-xl font-bold text-yellow-600">{pendingCount}</p></div><Clock size={28} className="text-yellow-600 opacity-20" /></div></div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs text-gray-500">In Progress</p><p className="text-xl font-bold text-blue-600">{inProgressCount}</p></div><Flag size={28} className="text-blue-600 opacity-20" /></div></div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs text-gray-500">Overdue</p><p className="text-xl font-bold text-red-600">{overdueCount}</p></div><AlertCircle size={28} className="text-red-600 opacity-20" /></div></div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs text-gray-500">Completed</p><p className="text-xl font-bold text-green-600">{completedCount}</p></div><CheckCircle2 size={28} className="text-green-600 opacity-20" /></div></div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative"><Search size={18} className="absolute left-3 top-2.5 text-gray-400" /><input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-sm" /></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-sm"><option value="all">All Status</option><option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="overdue">Overdue</option><option value="completed">Completed</option></select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-sm"><option value="all">All Priority</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tasks for {patientName} <span className="text-sm font-normal text-gray-500">({filteredTasks.length})</span></h2>
            <button onClick={fetchTasks} className="p-2 hover:bg-gray-100 rounded-lg"><RefreshCw size={18} className="text-gray-500" /></button>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border p-12 text-center"><CheckSquare size={48} className="mx-auto mb-4 text-gray-300" /><p className="text-gray-500">No tasks assigned</p></div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className={`bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm cursor-pointer ${task.status === 'overdue' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}
                onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xl">{getTaskTypeIcon(task.task_type)}</span>
                      <h3 className="font-semibold text-sm">{task.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority?.toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(task.status)}`}>{getStatusIcon(task.status)} {task.status === 'in-progress' ? 'IN PROGRESS' : task.status?.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{task.description}</p>
                    <div className="flex gap-3 text-xs text-gray-500"><span className="flex items-center gap-1"><Calendar size={12} />Due: {task.due_date} {task.due_time}</span><span className="flex items-center gap-1"><User size={12} />{task.assigned_to}</span></div>
                  </div>
                  <div className="flex gap-2">
                    {task.status === 'pending' && <button onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, 'in-progress'); }} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg flex items-center gap-1"><Flag size={12} />Start</button>}
                    {(task.status === 'pending' || task.status === 'in-progress') && <button onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, 'completed'); }} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg flex items-center gap-1"><CheckCircle2 size={12} />Complete</button>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b p-4 flex items-center justify-between"><h2 className="text-lg font-bold">{selectedTask.title}</h2><button onClick={() => setShowTaskModal(false)} className="p-1 hover:bg-gray-100 rounded"><XCircle size={20} /></button></div>
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap gap-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedTask.status)}`}>{selectedTask.status?.toUpperCase()}</span><span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>{selectedTask.priority?.toUpperCase()}</span></div>
              <div><h3 className="text-sm font-medium mb-1">Description</h3><p className="text-sm text-gray-600">{selectedTask.description}</p></div>
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg text-sm"><div><p className="text-xs text-gray-500">Due</p><p className="font-medium">{selectedTask.due_date} at {selectedTask.due_time}</p></div><div><p className="text-xs text-gray-500">Assigned To</p><p className="font-medium">{selectedTask.assigned_to}</p></div><div><p className="text-xs text-gray-500">Assigned By</p><p className="font-medium">{selectedTask.assigned_by}</p></div>{selectedTask.completed_at && <div><p className="text-xs text-gray-500">Completed</p><p className="font-medium">{new Date(selectedTask.completed_at).toLocaleString()}</p></div>}</div>
              {selectedTask.result && <div className="p-3 bg-blue-50 rounded-lg border border-blue-200"><p className="text-xs font-medium text-blue-700 mb-1">📋 Results:</p><p className="text-sm text-blue-900">{selectedTask.result}</p></div>}
              {selectedTask.notes && <div><h3 className="text-sm font-medium mb-1">Notes</h3><p className="text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">{selectedTask.notes}</p></div>}
              <div className="flex gap-2 pt-3 border-t">
                {selectedTask.status === 'pending' && <button onClick={() => handleUpdateTask(selectedTask.id, 'in-progress')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm">Start Task</button>}
                {(selectedTask.status === 'pending' || selectedTask.status === 'in-progress') && <button onClick={() => handleUpdateTask(selectedTask.id, 'completed')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg text-sm">Complete</button>}
                <button onClick={() => setShowTaskModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 rounded-lg text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}