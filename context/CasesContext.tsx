"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SurgeryCase } from '../types';

interface User {
  name: string;
  email: string;
  role: string;
}

interface CasesContextType {
  cases: SurgeryCase[];
  auditLogs: any[];
  getCaseById: (id: string) => SurgeryCase | undefined;
  updateCase: (updatedCase: SurgeryCase) => Promise<void>;
  addCase: (newCase: Partial<SurgeryCase>) => Promise<void>;
  refreshCases: () => Promise<void>;
  refreshAuditLogs: () => Promise<void>;
  activeUser: User;
  setActiveUser: (user: User) => void;
  loading: boolean;
  error: string | null;
}

const CLINICAL_USERS: User[] = [
  { name: 'Dr. S. Clinical', email: 'abhishekgatty0@gmail.com', role: 'Admin' },
  { name: 'Dr. Devendra Mehta', email: 'mehta@swasti.gov.in', role: 'Surgeon' },
  { name: 'Dr. Ronald D\'Souza', email: 'ronald@swasti.gov.in', role: 'Anesthetist' },
  { name: 'Sister Jaspreet Kaur', email: 'jaspreet@swasti.gov.in', role: 'Nurse' }
];

const CasesContext = createContext<CasesContextType | undefined>(undefined);

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<SurgeryCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<User>(CLINICAL_USERS[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCases = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ot/cases', {
        headers: {
          'x-user-email': activeUser.email,
          'x-user-role': activeUser.role,
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to load cases from API server: ${res.statusText}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCases(data);
      } else if (data && typeof data === 'object' && Array.isArray(data.cases)) {
        setCases(data.cases);
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        setCases(data.data);
      } else {
        console.error("Fetched cases is not an array:", data);
        setCases([]);
      }
    } catch (e: any) {
      console.error("API error fetching cases:", e);
      setError(e.message || "Could not retrieve cases from SQL database.");
    } finally {
      setLoading(false);
    }
  };

  const refreshAuditLogs = async () => {
    try {
      const res = await fetch('/api/ot/audit-logs');
      if (res.ok) {
        const logs = await res.json();
        setAuditLogs(logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    }
  };

  useEffect(() => {
    refreshCases();
    refreshAuditLogs();
  }, [activeUser]);

  const getCaseById = (id: string) => {
    return cases.find(c => c && c.id === id);
  };

  const updateCase = async (updatedCase: SurgeryCase) => {
    // ✅ Safety check: ensure updatedCase is valid
    if (!updatedCase || !updatedCase.id) {
      console.error("updateCase called with invalid case:", updatedCase);
      throw new Error("Invalid case data provided to updateCase");
    }

    try {
      // Optimistic client update
      const previousCases = [...cases];
      setCases(prev => prev.map(c => c && c.id === updatedCase.id ? updatedCase : c));

      const res = await fetch(`/api/ot/cases/${updatedCase.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeUser.email,
          'x-user-role': activeUser.role,
        },
        body: JSON.stringify(updatedCase),
      });

      if (!res.ok) {
        setCases(previousCases);
        const errData = await res.json();
        throw new Error(errData.error || `Server transaction rejected with status ${res.status}`);
      }

      const savedCase = await res.json();
      if (savedCase && savedCase.id) {
        setCases(prev => prev.map(c => c && c.id === savedCase.id ? savedCase : c));
      }
      refreshAuditLogs();
    } catch (e: any) {
      console.error("Failed to save surgery case changes to backend database:", e);
      alert(`Database Synchronization Error: ${e.message}`);
      throw e;
    }
  };

  const addCase = async (newCase: Partial<SurgeryCase>) => {
    // ✅ Safety check: ensure newCase has required fields
    if (!newCase || !newCase.patient?.name || !newCase.recommendation?.surgeryName) {
      console.error("addCase called with invalid case:", newCase);
      throw new Error("Invalid case data: patient name and surgery name are required");
    }

    try {
      const res = await fetch('/api/ot/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeUser.email,
          'x-user-role': activeUser.role,
        },
        body: JSON.stringify(newCase),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Server rejected creation with status ${res.status}`);
      }

      const created = await res.json();
      if (created && created.id) {
        setCases(prev => [created, ...prev]);
      }
      refreshAuditLogs();
    } catch (e: any) {
      console.error("Failed to insert surgery case to database:", e);
      alert(`Database Insertion Error: ${e.message}`);
      throw e;
    }
  };

  return (
    <CasesContext.Provider
      value={{
        cases,
        auditLogs,
        getCaseById,
        updateCase,
        addCase,
        refreshCases,
        refreshAuditLogs,
        activeUser,
        setActiveUser,
        loading,
        error
      }}
    >
      {children}
    </CasesContext.Provider>
  );
}

export function useCases() {
  const context = useContext(CasesContext);
  if (!context) {
    throw new Error('useCases must be used within a CasesProvider');
  }
  return context;
}