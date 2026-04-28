'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckSquare, Clock, User, AlertCircle, 
  CheckCircle2, XCircle, Filter, Search, Plus, 
  Calendar, Flag, ChevronRight
} from 'lucide-react';

interface Task {
  id: string;
  patientId: string;
  patientName: string;
  bed: string;
  taskType: 'vitals' | 'medication' | 'lab' | 'dressing' | 'procedure' | 'documentation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  dueTime: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

interface Patient {
  id: string;
  name: string;
  bed: string;
  status: 'critical' | 'warning' | 'stable';
}

const MOCK_PATIENTS: Patient[] = [
  { id: 'P001', name: 'John Doe', bed: 'ICU-101', status: 'critical' },
  { id: 'P002', name: 'Mary Smith', bed: 'ICU-102', status: 'warning' },
  { id: 'P003', name: 'Robert Johnson', bed: 'Ward-201', status: 'stable' },
  { id: 'P004', name: 'Sarah Williams', bed: 'Ward-202', status: 'stable' },
];

const MOCK_TASKS: Task[] = [
  {
    id: 'T001',
    patientId: 'P001',
    patientName: 'John Doe',
    bed: 'ICU-101',
    taskType: 'vitals',
    title: 'Record Vital Signs',
    description: 'Record BP, HR, Temperature, SpO2, Respiratory Rate',
    priority: 'high',
    status: 'pending',
    dueDate: '2026-04-28',
    dueTime: '10:00',
    assignedTo: 'Nurse Smith',
    assignedBy: 'Dr. Williams',
    assignedAt: '2026-04-28 08:00',
  },
  {
    id: 'T002',
    patientId: 'P001',
    patientName: 'John Doe',
    bed: 'ICU-101',
    taskType: 'medication',
    title: 'Administer Lisinopril',
    description: '10 mg PO (oral)',
    priority: 'high',
    status: 'completed',
    dueDate: '2026-04-28',
    dueTime: '09:00',
    assignedTo: 'Nurse Smith',
    assignedBy: 'Dr. Williams',
    assignedAt: '2026-04-28 07:30',
    completedAt: '2026-04-28 09:05',
    completedBy: 'Nurse Smith',
  },
  {
    id: 'T003',
    patientId: 'P002',
    patientName: 'Mary Smith',
    bed: 'ICU-102',
    taskType: 'lab',
    title: 'Collect Blood Sample',
    description: 'CBC, LFT, KFT',
    priority: 'high',
    status: 'overdue',
    dueDate: '2026-04-28',
    dueTime: '08:00',
    assignedTo: 'Nurse Johnson',
    assignedBy: 'Dr. Patel',
    assignedAt: '2026-04-28 06:00',
    notes: 'Patient NPO after midnight',
  },
  {
    id: 'T004',
    patientId: 'P002',
    patientName: 'Mary Smith',
    bed: 'ICU-102',
    taskType: 'dressing',
    title: 'Change Wound Dressing',
    description: 'Surgical site - abdominal incision',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-04-28',
    dueTime: '14:00',
    assignedTo: 'Nurse Johnson',
    assignedBy: 'Dr. Patel',
    assignedAt: '2026-04-28 09:00',
  },
  {
    id: 'T005',
    patientId: 'P003',
    patientName: 'Robert Johnson',
    bed: 'Ward-201',
    taskType: 'procedure',
    title: 'Insert IV Line',
    description: 'Left arm, 18G cannula',
    priority: 'medium',
    status: 'in-progress',
    dueDate: '2026-04-28',
    dueTime: '11:00',
    assignedTo: 'Nurse Davis',
    assignedBy: 'Dr. Smith',
    assignedAt: '2026-04-28 08:30',
  },
  {
    id: 'T006',
    patientId: 'P003',
    patientName: 'Robert Johnson',
    bed: 'Ward-201',
    taskType: 'documentation',
    title: 'Complete Nursing Assessment',
    description: 'Shift assessment notes',
    priority: 'low',
    status: 'pending',
    dueDate: '2026-04-28',
    dueTime: '16:00',
    assignedTo: 'Nurse Davis',
    assignedBy: 'Head Nurse',
    assignedAt: '2026-04-28 07:00',
  },
  {
    id: 'T007',
    patientId: 'P004',
    patientName: 'Sarah Williams',
    bed: 'Ward-202',
    taskType: 'medication',
    title: 'Administer Metformin',
    description: '500 mg PO with food',
    priority: 'medium',
    status: 'completed',
    dueDate: '2026-04-28',
    dueTime: '08:00',
    assignedTo: 'Nurse Wilson',
    assignedBy: 'Dr. Johnson',
    assignedAt: '2026-04-28 07:00',
    completedAt: '2026-04-28 08:10',
    completedBy: 'Nurse Wilson',
  },
  {
    id: 'T008',
    patientId: 'P004',
    patientName: 'Sarah Williams',
    bed: 'Ward-202',
    taskType: 'vitals',
    title: 'Record Vital Signs',
    description: 'Evening vitals check',
    priority: 'low',
    status: 'pending',
    dueDate: '2026-04-28',
    dueTime: '18:00',
    assignedTo: 'Nurse Wilson',
    assignedBy: 'Dr. Johnson',
    assignedAt: '2026-04-28 12:00',
  },
];

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'low':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  }
};

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'in-progress':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'completed':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'overdue':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  }
};

const getTaskTypeIcon = (taskType: Task['taskType']) => {
  switch (taskType) {
    case 'vitals':
      return '❤️';
    case 'medication':
      return '💊';
    case 'lab':
      return '🔬';
    case 'dressing':
      return '🏥';
    case 'procedure':
      return '🩺';
    case 'documentation':
      return '📝';
    default:
      return '✓';
  }
};

export default function TasksPage() {
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Task['status']>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Task['priority']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const patient = MOCK_PATIENTS.find(p => p.id === selectedPatient);

  const filteredTasks = MOCK_TASKS.filter(task => {
    const matchesPatient = selectedPatient === 'all' || task.patientId === selectedPatient;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPatient && matchesStatus && matchesPriority && matchesSearch;
  });

  const pendingCount = MOCK_TASKS.filter(t => t.status === 'pending').length;
  const inProgressCount = MOCK_TASKS.filter(t => t.status === 'in-progress').length;
  const overdueCount = MOCK_TASKS.filter(t => t.status === 'overdue').length;
  const completedCount = MOCK_TASKS.filter(t => t.status === 'completed').length;

  const handleCompleteTask = (taskId: string) => {
    // In real app, this would call an API
    console.log('Complete task:', taskId);
    alert(`Task completed! (Demo action)`);
  };

  const handleStartTask = (taskId: string) => {
    console.log('Start task:', taskId);
    alert(`Task started! (Demo action)`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link 
            href="/nurse" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <CheckSquare size={24} className="text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock size={32} className="text-yellow-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
              </div>
              <Flag size={32} className="text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
              </div>
              <AlertCircle size={32} className="text-red-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <CheckCircle2 size={32} className="text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Patient Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter by Patient</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedPatient('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPatient === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              All Patients
            </button>
            {MOCK_PATIENTS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatient(p.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPatient === p.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks by title, patient, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedPatient === 'all' ? 'All Tasks' : `Tasks for ${patient?.name}`}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                ({filteredTasks.length} tasks)
              </span>
            </h2>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-12 text-center">
              <CheckSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 dark:text-gray-400">No tasks found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    task.status === 'overdue' 
                      ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10' 
                      : 'border-gray-200 dark:border-slate-800'
                  }`}
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskModal(true);
                  }}
                >
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-xl">{getTaskTypeIcon(task.taskType)}</span>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(task.status)}`}>
                          {task.status === 'in-progress' ? 'IN PROGRESS' : task.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                      <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {task.patientName} (Bed {task.bed})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Due: {task.dueDate} at {task.dueTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Assigned to: {task.assignedTo}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartTask(task.id);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition flex items-center gap-1"
                        >
                          <Flag size={14} />
                          Start
                        </button>
                      )}
                      {(task.status === 'pending' || task.status === 'in-progress') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteTask(task.id);
                          }}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center gap-1"
                        >
                          <CheckCircle2 size={14} />
                          Complete
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                          setShowTaskModal(true);
                        }}
                        className="px-3 py-1.5 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTask.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedTask.patientName} • Bed {selectedTask.bed}
                </p>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-400"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Priority */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedTask.status)}`}>
                  {selectedTask.status === 'in-progress' ? 'IN PROGRESS' : selectedTask.status.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority.toUpperCase()} PRIORITY
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                  {getTaskTypeIcon(selectedTask.taskType)} {selectedTask.taskType.toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedTask.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Due Date & Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTask.dueDate} at {selectedTask.dueTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Assigned To</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTask.assignedTo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Assigned By</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTask.assignedBy}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Assigned At</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTask.assignedAt}</p>
                </div>
                {selectedTask.completedAt && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed At</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedTask.completedAt}</p>
                  </div>
                )}
                {selectedTask.completedBy && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed By</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedTask.completedBy}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedTask.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
                  <p className="text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                    {selectedTask.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                {selectedTask.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleStartTask(selectedTask.id);
                      setShowTaskModal(false);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Start Task
                  </button>
                )}
                {(selectedTask.status === 'pending' || selectedTask.status === 'in-progress') && (
                  <button
                    onClick={() => {
                      handleCompleteTask(selectedTask.id);
                      setShowTaskModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Mark Complete
                  </button>
                )}
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}