"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, CheckSquare, Calendar, Clock, Loader2, Plus,
  CheckCircle2, AlertCircle, XCircle, User, Flag, RefreshCw,
} from "lucide-react";
import { doctorsApi } from "@/lib/api/doctors";
import toast from "react-hot-toast";

const getTaskTypeIcon = (taskType: string) => {
  switch (taskType) {
    case "vitals": return "";
    case "medication": return "💊";
    case "lab": return "🔬";
    case "dressing": return "🏥";
    case "procedure": return "🩺";
    case "documentation": return "📝";
    default: return "✅";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 text-green-700 border-green-200";
    case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "in-progress": return "bg-blue-100 text-blue-700 border-blue-200";
    case "overdue": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle2 size={16} className="text-green-500" />;
    case "pending": return <Clock size={16} className="text-yellow-500" />;
    case "in-progress": return <Flag size={16} className="text-blue-500" />;
    case "overdue": return <AlertCircle size={16} className="text-red-500" />;
    default: return null;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-100 text-red-700";
    case "medium": return "bg-yellow-100 text-yellow-700";
    case "low": return "bg-green-100 text-green-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

export default function AssignTaskPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.patientId as string;

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nurses, setNurses] = useState<any[]>([]);
  const [loadingNurses, setLoadingNurses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wardInfo, setWardInfo] = useState<any>(null);
  const [taskForm, setTaskForm] = useState({
    taskType: "vitals",
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    dueTime: "",
    assignedTo: "",
    notes: "",
    customTaskType: "",
  });

  // ✅ Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const result = await doctorsApi.getTasks(patientId);
      
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

  // Fetch nurses when form opens
  const fetchNurses = async () => {
    try {
      setLoadingNurses(true);
      const result = await doctorsApi.getWardNurses(patientId);
      if (Array.isArray(result)) setNurses(result);
      else if (result?.success && result?.data) { setNurses(result.data); setWardInfo(result.ward); }
      else if (result?.data && Array.isArray(result.data)) { setNurses(result.data); if (result.ward) setWardInfo(result.ward); }
      else setNurses([]);
    } catch (err) { setNurses([]); }
    finally { setLoadingNurses(false); }
  };

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { if (showForm) fetchNurses(); }, [showForm]);

  // ✅ Create task via API
 const handleCreateTask = async () => {
  if (!taskForm.title || !taskForm.dueDate || !taskForm.dueTime || !taskForm.assignedTo) {
    toast.error("Please fill all required fields"); 
    return;
  }
  setSubmitting(true);
  try {
    const doctorName = localStorage.getItem('userName') || 'Doctor';
    
    const result = await doctorsApi.createTask({
      patientId,
      taskType: taskForm.taskType,
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      dueDate: taskForm.dueDate,
      dueTime: taskForm.dueTime,
      assignedTo: taskForm.assignedTo,
      assignedBy: doctorName,
      notes: taskForm.notes,
      customTaskType: taskForm.customTaskType,
    });

    console.log('Create task response:', result); // Debug
    console.log('Response keys:', Object.keys(result)); // Debug

    // Check for success in multiple formats
    const isSuccess = 
      result?.success === true ||      // Standard format
      result?.id ||                     // Direct data return
      result?.data?.id ||              // Wrapped in data
      (result && !result?.error);      // Any response without error

    if (isSuccess) {
      toast.success("Task assigned successfully!");
      setShowForm(false);
      setTaskForm({ taskType: "vitals", title: "", description: "", priority: "medium", dueDate: "", dueTime: "", assignedTo: "", notes: "", customTaskType: "" });
      await fetchTasks();
    } else {
      toast.error(result?.message || result?.data?.message || "Failed to create task");
    }
  } catch (err: any) {
    console.error('Create task error:', err);
    toast.error(err.message || "Failed to create task");
  } finally {
    setSubmitting(false);
  }
};

  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "in-progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto" /><p className="mt-2 text-gray-500">Loading tasks...</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
            <div>
              <div className="flex items-center gap-2"><CheckSquare size={20} className="text-green-500" /><h1 className="text-xl font-bold">Tasks</h1></div>
              <p className="text-sm text-gray-500">{tasks.length} tasks • {pendingTasks.length} pending • {completedTasks.length} completed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchTasks} className="p-2 hover:bg-gray-100 rounded-lg"><RefreshCw size={18} className="text-gray-500" /></button>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"><Plus size={16} /> New Task</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task History</h2>
          {tasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border p-12 text-center"><CheckSquare size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">No tasks assigned yet</p></div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xl">{getTaskTypeIcon(task.task_type)}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority?.toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBadge(task.status)}`}>{getStatusIcon(task.status)} {task.status === "in-progress" ? "IN PROGRESS" : task.status?.toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><User size={12} /> {task.assigned_to}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> Due: {task.due_date} {task.due_time}</span>
                      {task.completed_at && <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Done: {new Date(task.completed_at).toLocaleString()}</span>}
                      {task.assigned_by && <span className="flex items-center gap-1"><User size={12} /> By: {task.assigned_by}</span>}
                    </div>
                    {task.result && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-2">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">📋 Results:</p>
                        <p className="text-sm text-blue-900 dark:text-blue-100">{task.result}</p>
                      </div>
                    )}
                    {task.notes && <p className="text-xs text-gray-500">📝 {task.notes}</p>}
                    {task.status === "pending" && <p className="text-xs text-yellow-600 mt-2">⏳ Waiting for nurse to complete</p>}
                    {task.status === "in-progress" && <p className="text-xs text-blue-600 mt-2">🔄 Nurse is working on this task</p>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal - same as before */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h2 className="text-lg font-semibold flex items-center gap-2"><CheckSquare size={20} className="text-green-500" />New Task</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><XCircle size={20} /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateTask(); }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Task Type *</label>
                  <select value={taskForm.taskType} onChange={(e) => setTaskForm(prev => ({ ...prev, taskType: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm">
                    <option value="vitals">❤️ Vitals</option><option value="medication">💊 Medication</option><option value="lab">🔬 Lab Test</option><option value="dressing">🏥 Dressing</option><option value="procedure">🩺 Procedure</option><option value="documentation">📝 Documentation</option><option value="other">✏️ Other (Type below)</option>
                  </select>
                  {taskForm.taskType === "other" && <input type="text" value={taskForm.customTaskType || ""} onChange={(e) => setTaskForm(prev => ({ ...prev, customTaskType: e.target.value }))} placeholder="Enter custom task type..." className="w-full mt-2 px-3 py-2 border rounded-lg text-sm" />}
                </div>
                <div><label className="block text-sm font-medium mb-2">Task Title *</label><input type="text" value={taskForm.title} onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg text-sm" required /></div>
                <div><label className="block text-sm font-medium mb-2">Description</label><textarea value={taskForm.description} onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border rounded-lg text-sm resize-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-2">Priority</label><div className="flex gap-2">{[{ value: "high", label: "🔴 High" }, { value: "medium", label: "🟡 Medium" }, { value: "low", label: "🟢 Low" }].map(p => (<button key={p.value} type="button" onClick={() => setTaskForm(prev => ({ ...prev, priority: p.value }))} className={`flex-1 px-2 py-2 rounded-lg text-xs border font-medium ${taskForm.priority === p.value ? "border-green-500 bg-green-50 text-green-700" : "border-slate-300"}`}>{p.label}</button>))}</div></div>
                  <div><label className="block text-sm font-medium mb-2">Assign To *</label><select value={taskForm.assignedTo} onChange={(e) => setTaskForm(prev => ({ ...prev, assignedTo: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg text-sm" disabled={loadingNurses} required><option value="">{loadingNurses ? "Loading..." : "Select Nurse"}</option>{nurses.map((n: any) => (<option key={n.id} value={`${n.first_name} ${n.last_name}`}>{n.first_name} {n.last_name}</option>))}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-2"><Calendar size={14} className="inline mr-1" />Due Date *</label><input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg text-sm" required /></div>
                  <div><label className="block text-sm font-medium mb-2"><Clock size={14} className="inline mr-1" />Due Time *</label><input type="time" value={taskForm.dueTime} onChange={(e) => setTaskForm(prev => ({ ...prev, dueTime: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg text-sm" required /></div>
                </div>
                <div><label className="block text-sm font-medium mb-2">Notes</label><textarea value={taskForm.notes} onChange={(e) => setTaskForm(prev => ({ ...prev, notes: e.target.value }))} rows={2} className="w-full px-3 py-2.5 border rounded-lg text-sm resize-none" /></div>
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border rounded-lg text-sm">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">{submitting ? <><Loader2 size={16} className="animate-spin" />Assigning...</> : <><CheckSquare size={16} />Assign Task</>}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}