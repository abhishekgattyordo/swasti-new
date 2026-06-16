// 'use client';

// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import { BarChart3, Users, AlertCircle, Pill, FileText, CheckSquare, Bell, BookOpen, Loader2 } from 'lucide-react';
// import { nurseApi } from '@/lib/api/nurse';
// import toast from 'react-hot-toast';

// interface DashboardStats {
//   totalPatients: number;
//   pendingTasks: number;
//   criticalAlerts: number;
//   activeMedications: number;
// }

// interface RecentActivity {
//   id: string;
//   type: 'vitals' | 'medication' | 'alert' | 'task' | 'note';
//   description: string;
//   patientName: string;
//   timestamp: string;
//   timeAgo: string;
// }

// export default function Dashboard() {
//   const [stats, setStats] = useState<DashboardStats>({
//     totalPatients: 0,
//     pendingTasks: 0,
//     criticalAlerts: 0,
//     activeMedications: 0,
//   });
//   const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [nurseName, setNurseName] = useState('');

//   useEffect(() => {
//     // Get nurse name from localStorage
//     const name = localStorage.getItem('userName') || 'Nurse';
//     setNurseName(name);

//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const staffId = localStorage.getItem('staffId') || '';
      
//       // Fetch patients in nurse's ward
//       const patientsResult = await nurseApi.getMyWardPatients(staffId, { status: 'active' });
//       let patients = [];
//       if (patientsResult?.success && patientsResult?.data) {
//         patients = patientsResult.data;
//       } else if (Array.isArray(patientsResult)) {
//         patients = patientsResult;
//       }
//       const totalPatients = patients.length;

//       // Fetch tasks for all patients (you'll need to aggregate)
//       let totalPendingTasks = 0;
//       let allTasks: any[] = [];
      
//       // Fetch tasks for each patient (limit to first 5 for performance)
//       const patientsToFetch = patients.slice(0, 5);
//       for (const patient of patientsToFetch) {
//         try {
//           const tasksResult = await nurseApi.getTasks(patient.patient_id);
//           let tasks = [];
//           if (tasksResult?.success && tasksResult?.data) {
//             tasks = tasksResult.data;
//           } else if (Array.isArray(tasksResult)) {
//             tasks = tasksResult;
//           }
//           allTasks = [...allTasks, ...tasks];
//           const pending = tasks.filter((t: any) => 
//             t.status === 'pending' || t.status === 'in-progress'
//           ).length;
//           totalPendingTasks += pending;
//         } catch (err) {
//           console.error('Error fetching tasks for patient:', patient.patient_id);
//         }
//       }

//       // Fetch medications count
//       let totalActiveMeds = 0;
//       for (const patient of patientsToFetch) {
//         try {
//           const medsResult = await nurseApi.getMedications(patient.patient_id);
//           let meds = [];
//           if (medsResult?.success && medsResult?.data) {
//             meds = medsResult.data;
//           } else if (Array.isArray(medsResult)) {
//             meds = medsResult;
//           }
//           const activeMeds = meds.filter((m: any) => m.status === 'active' || m.status === 'pending').length;
//           totalActiveMeds += activeMeds;
//         } catch (err) {
//           console.error('Error fetching medications for patient:', patient.patient_id);
//         }
//       }

//       // Get critical alerts (tasks that are overdue or critical priority)
//       const criticalAlerts = allTasks.filter((t: any) => 
//         t.priority === 'critical' || t.status === 'overdue'
//       ).length;

//       // Generate recent activities from tasks and notes
//       const activities: RecentActivity[] = [];

//       // Add recent tasks
//       const recentTasks = allTasks
//         .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
//         .slice(0, 5);
      
//       recentTasks.forEach((task: any) => {
//         activities.push({
//           id: task.id,
//           type: 'task',
//           description: `Task "${task.title}" ${task.status === 'completed' ? 'completed' : 'assigned'}`,
//           patientName: task.patient_name || 'Unknown',
//           timestamp: task.created_at,
//           timeAgo: getTimeAgo(task.created_at),
//         });
//       });

//       // Fetch recent notes for activities
//       for (const patient of patientsToFetch.slice(0, 3)) {
//         try {
//           const notesResult = await nurseApi.getNotes(patient.patient_id);
//           let notes = [];
//           if (notesResult?.success && notesResult?.data) {
//             notes = notesResult.data;
//           } else if (Array.isArray(notesResult)) {
//             notes = notesResult;
//           }
          
//           const recentNotes = notes.slice(0, 2);
//           recentNotes.forEach((note: any) => {
//             activities.push({
//               id: note.id,
//               type: 'note',
//               description: `Nursing note added: ${note.title || 'Clinical note'}`,
//               patientName: patient.patient_name,
//               timestamp: note.createdAt || note.created_at,
//               timeAgo: getTimeAgo(note.createdAt || note.created_at),
//             });
//           });
//         } catch (err) {
//           console.error('Error fetching notes for patient:', patient.patient_id);
//         }
//       }

//       // Sort activities by timestamp and take top 5
//       const sortedActivities = activities
//         .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
//         .slice(0, 5);

//       setStats({
//         totalPatients,
//         pendingTasks: totalPendingTasks,
//         criticalAlerts,
//         activeMedications: totalActiveMeds,
//       });
//       setRecentActivities(sortedActivities);

//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       toast.error('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getTimeAgo = (timestamp: string) => {
//     if (!timestamp) return 'Recently';
    
//     const now = new Date();
//     const past = new Date(timestamp);
//     const diffMs = now.getTime() - past.getTime();
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);

//     if (diffMins < 1) return 'Just now';
//     if (diffMins < 60) return `${diffMins} min ago`;
//     if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
//     return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
//   };

//   const statsCards = [
//     { label: 'Total Patients', value: stats.totalPatients.toString(), icon: Users, color: 'bg-blue-100 text-blue-700' },
//     { label: 'Pending Tasks', value: stats.pendingTasks.toString(), icon: CheckSquare, color: 'bg-green-100 text-green-700' },
//     { label: 'Critical Alerts', value: stats.criticalAlerts.toString(), icon: AlertCircle, color: 'bg-red-100 text-red-700' },
//     { label: 'Active Medications', value: stats.activeMedications.toString(), icon: Pill, color: 'bg-purple-100 text-purple-700' },
//   ];

//   const navItems = [
//     { href: '/nurse/patients', label: 'My Patients', icon: Users },
//     { href: '/nurse/vitals', label: 'Vitals Entry', icon: BarChart3 },
//     { href: '/nurse/medications', label: 'Medications', icon: Pill },
//     { href: '/nurse/nursing-notes', label: 'Nursing Notes', icon: FileText },
//     { href: '/nurse/tasks', label: 'Tasks', icon: CheckSquare },
//     // { href: '/nurse/alerts', label: 'Alerts', icon: Bell },
//     { href: '/nurse/handover', label: 'Shift Handover', icon: BookOpen },
//   ];

//   const getActivityIcon = (type: string) => {
//     switch (type) {
//       case 'vitals':
//         return 'bg-green-500';
//       case 'medication':
//         return 'bg-purple-500';
//       case 'alert':
//         return 'bg-red-500';
//       case 'task':
//         return 'bg-blue-500';
//       case 'note':
//         return 'bg-yellow-500';
//       default:
//         return 'bg-gray-500';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
//       {/* Header */}
//       <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 sticky top-0 z-30 shadow-sm">
//         <div className="px-4 md:px-8 py-4">
//           <h1 className="text-3xl font-bold text-foreground">
//             Welcome back, {nurseName.split(' ')[0]}!
//           </h1>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//             {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
//           </p>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="px-4 md:px-8 py-8">
//         {/* Quick Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           {statsCards.map((stat) => {
//             const Icon = stat.icon;
//             return (
//               <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
//                     <p className="text-3xl font-bold mt-1 text-foreground">{stat.value}</p>
//                   </div>
//                   <div className={`p-3 rounded-lg ${stat.color}`}>
//                     <Icon size={24} />
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Navigation Grid */}
//         <h2 className="text-2xl font-bold mb-4 text-foreground">Quick Access</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {navItems.map((item) => {
//             const Icon = item.icon;
//             return (
//               <Link key={item.href} href={item.href}>
//                 <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
//                   <div className="flex items-center gap-3 mb-3">
//                     <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition">
//                       <Icon size={20} className="text-blue-600 dark:text-blue-400" />
//                     </div>
//                     <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{item.label}</h3>
//                   </div>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">→ Access {item.label.toLowerCase()}</p>
//                 </div>
//               </Link>
//             );
//           })}
//         </div>

//         {/* Recent Activity */}
//         {/* <div className="mt-8">
//           <h2 className="text-2xl font-bold mb-4 text-foreground">Recent Activity</h2>
//           <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
//             {recentActivities.length === 0 ? (
//               <p className="text-center text-gray-500 dark:text-gray-400 py-8">
//                 No recent activity to display
//               </p>
//             ) : (
//               <div className="space-y-3">
//                 {recentActivities.map((activity, index) => (
//                   <div 
//                     key={activity.id} 
//                     className={`flex items-center gap-3 pb-3 ${index < recentActivities.length - 1 ? 'border-b border-gray-200 dark:border-slate-700' : ''}`}
//                   >
//                     <div className={`w-2 h-2 ${getActivityIcon(activity.type)} rounded-full`} />
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {activity.description} for{' '}
//                       <span className="font-medium text-foreground">{activity.patientName}</span>
//                     </p>
//                     <span className="ml-auto text-xs text-gray-500">{activity.timeAgo}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div> */}
//       </main>
//     </div>
//   );
// }



'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BarChart3, Users, AlertCircle, Pill, FileText, CheckSquare, Bell, BookOpen, Loader2 } from 'lucide-react';
import { nurseApi } from '@/lib/api/nurse';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalPatients: number;
  pendingTasks: number;
  criticalAlerts: number;
  activeMedications: number;
}

interface RecentActivity {
  id: string;
  type: 'vitals' | 'medication' | 'alert' | 'task' | 'note';
  description: string;
  patientName: string;
  timestamp: string;
  timeAgo: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    pendingTasks: 0,
    criticalAlerts: 0,
    activeMedications: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [nurseName, setNurseName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Nurse';
    setNurseName(name);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const staffId = localStorage.getItem('staffId') || '';
      
      const patientsResult = await nurseApi.getMyWardPatients(staffId, { status: 'active' });
      let patients = [];
      if (patientsResult?.success && patientsResult?.data) {
        patients = patientsResult.data;
      } else if (Array.isArray(patientsResult)) {
        patients = patientsResult;
      }
      const totalPatients = patients.length;

      let totalPendingTasks = 0;
      let allTasks: any[] = [];
      
      const patientsToFetch = patients.slice(0, 5);
      for (const patient of patientsToFetch) {
        try {
          const tasksResult = await nurseApi.getTasks(patient.patient_id);
          let tasks = [];
          if (tasksResult?.success && tasksResult?.data) {
            tasks = tasksResult.data;
          } else if (Array.isArray(tasksResult)) {
            tasks = tasksResult;
          }
          allTasks = [...allTasks, ...tasks];
          const pending = tasks.filter((t: any) => 
            t.status === 'pending' || t.status === 'in-progress'
          ).length;
          totalPendingTasks += pending;
        } catch (err) {
          console.error('Error fetching tasks for patient:', patient.patient_id);
        }
      }

      let totalActiveMeds = 0;
      for (const patient of patientsToFetch) {
        try {
          const medsResult = await nurseApi.getMedications(patient.patient_id);
          let meds = [];
          if (medsResult?.success && medsResult?.data) {
            meds = medsResult.data;
          } else if (Array.isArray(medsResult)) {
            meds = medsResult;
          }
          const activeMeds = meds.filter((m: any) => m.status === 'active' || m.status === 'pending').length;
          totalActiveMeds += activeMeds;
        } catch (err) {
          console.error('Error fetching medications for patient:', patient.patient_id);
        }
      }

      const criticalAlerts = allTasks.filter((t: any) => 
        t.priority === 'critical' || t.status === 'overdue'
      ).length;

      const activities: RecentActivity[] = [];

      const recentTasks = allTasks
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 5);
      
      recentTasks.forEach((task: any) => {
        activities.push({
          id: task.id,
          type: 'task',
          description: `Task "${task.title}" ${task.status === 'completed' ? 'completed' : 'assigned'}`,
          patientName: task.patient_name || 'Unknown',
          timestamp: task.created_at,
          timeAgo: getTimeAgo(task.created_at),
        });
      });

      for (const patient of patientsToFetch.slice(0, 3)) {
        try {
          const notesResult = await nurseApi.getNotes(patient.patient_id);
          let notes = [];
          if (notesResult?.success && notesResult?.data) {
            notes = notesResult.data;
          } else if (Array.isArray(notesResult)) {
            notes = notesResult;
          }
          
          const recentNotes = notes.slice(0, 2);
          recentNotes.forEach((note: any) => {
            activities.push({
              id: note.id,
              type: 'note',
              description: `Nursing note added: ${note.title || 'Clinical note'}`,
              patientName: patient.patient_name,
              timestamp: note.createdAt || note.created_at,
              timeAgo: getTimeAgo(note.createdAt || note.created_at),
            });
          });
        } catch (err) {
          console.error('Error fetching notes for patient:', patient.patient_id);
        }
      }

      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      setStats({
        totalPatients,
        pendingTasks: totalPendingTasks,
        criticalAlerts,
        activeMedications: totalActiveMeds,
      });
      setRecentActivities(sortedActivities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'Recently';
    
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const statsCards = [
    { label: 'Total Patients', value: stats.totalPatients.toString(), icon: Users, color: 'bg-[#3B1E6F]/10 text-[#3B1E6F]' },
    { label: 'Pending Tasks', value: stats.pendingTasks.toString(), icon: CheckSquare, color: 'bg-[#7A329F]/10 text-[#7A329F]' },
    { label: 'Critical Alerts', value: stats.criticalAlerts.toString(), icon: AlertCircle, color: 'bg-red-100 text-red-700' },
    { label: 'Active Medications', value: stats.activeMedications.toString(), icon: Pill, color: 'bg-[#0D5CB3]/10 text-[#0D5CB3]' },
  ];

  const navItems = [
    { href: '/nurse/patients', label: 'My Patients', icon: Users },
    { href: '/nurse/vitals', label: 'Vitals Entry', icon: BarChart3 },
    { href: '/nurse/medications', label: 'Medications', icon: Pill },
    { href: '/nurse/nursing-notes', label: 'Nursing Notes', icon: FileText },
    { href: '/nurse/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/nurse/handover', label: 'Shift Handover', icon: BookOpen },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vitals':
        return 'bg-[#3B1E6F]';
      case 'medication':
        return 'bg-[#7A329F]';
      case 'alert':
        return 'bg-red-500';
      case 'task':
        return 'bg-[#0D5CB3]';
      case 'note':
        return 'bg-[#1A438A]';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7A329F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="px-4 md:px-8 py-4">
          <h1 className="text-3xl font-bold text-[#3B1E6F] dark:text-white">
            Welcome back, {nurseName.split(' ')[0]}!
          </h1>
          <p className="text-sm text-[#1A438A] dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1 text-[#1A438A] dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Grid */}
        <h2 className="text-2xl font-bold mb-4 text-[#3B1E6F] dark:text-white">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#3B1E6F]/10 dark:bg-[#3B1E6F]/30 rounded-lg group-hover:bg-[#3B1E6F]/20 dark:group-hover:bg-[#3B1E6F]/40 transition">
                      <Icon size={20} className="text-[#7A329F] dark:text-[#7A329F]" />
                    </div>
                    <h3 className="font-semibold text-[#1A438A] dark:text-white group-hover:text-[#7A329F] dark:group-hover:text-[#7A329F] transition">{item.label}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">→ Access {item.label.toLowerCase()}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity - Uncommented and styled */}
        
      </main>
    </div>
  );
}