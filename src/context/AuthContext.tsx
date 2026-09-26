// MahaSkill Intelligence - Authentication & Role Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type UserRole = 
  | 'GOVERNMENT_OFFICIAL' 
  | 'TRAINING_INSTITUTE' 
  | 'EMPLOYER' 
  | 'PUBLIC_ANALYST';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  district?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLoading: boolean;
  loginDemo: (role: UserRole) => void;
  logout: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-gov-01',
  email: 'planner.pune@maharashtra.gov.in',
  name: 'Rajesh Patil (IAS)',
  role: 'GOVERNMENT_OFFICIAL',
  department: 'Skills & Innovation Department',
  district: 'Pune'
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER,
  role: 'GOVERNMENT_OFFICIAL',
  setRole: () => {},
  isLoading: false,
  loginDemo: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [role, setRoleState] = useState<UserRole>('GOVERNMENT_OFFICIAL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email || 'Government Delegate',
            role: (session.user.user_metadata?.role as UserRole) || 'GOVERNMENT_OFFICIAL'
          });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email || 'Government Delegate',
            role: (session.user.user_metadata?.role as UserRole) || 'GOVERNMENT_OFFICIAL'
          });
        } else {
          setUser(DEFAULT_USER);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  const loginDemo = (selectedRole: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      const names: Record<UserRole, string> = {
        GOVERNMENT_OFFICIAL: 'Rajesh Patil (IAS - State Planner)',
        TRAINING_INSTITUTE: 'Dr. Suresh Deshmukh (Principal, ITI Aundh)',
        EMPLOYER: 'Vikram Joshi (Head of HR, Tata Motors EV)',
        PUBLIC_ANALYST: 'Public Data Research Analyst'
      };

      setUser({
        id: `usr-${selectedRole.toLowerCase()}`,
        email: `${selectedRole.toLowerCase()}@maharashtra.gov.in`,
        name: names[selectedRole],
        role: selectedRole
      });
      setRoleState(selectedRole);
      setIsLoading(false);
    }, 200);
  };

  const logout = () => {
    setUser(null);
    if (isSupabaseConfigured) {
      supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole, isLoading, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
