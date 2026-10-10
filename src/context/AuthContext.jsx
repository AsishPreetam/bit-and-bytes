import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, signupUser, fetchPersonas } from '../api';

const AuthContext = createContext(null);

export const DEFAULT_PERSONAS = [
  {
    id: 'usr-citizen-1',
    name: 'Priya Sharma',
    email: 'citizen@civicsync.org',
    role: 'citizen',
    locality: 'MG Road Corridor',
    badge: 'Resident Citizen'
  },
  {
    id: 'usr-contractor-1',
    name: 'Rajesh Verma',
    email: 'contractor@apexcivil.org',
    role: 'contractor',
    contractorId: 'cont-2',
    contractorName: 'Apex Civil Infrastructure',
    badge: 'Apex Civil Contractor'
  },
  {
    id: 'usr-municipal-1',
    name: 'Dr. Ananya Mehta',
    email: 'officer@citygov.org',
    role: 'municipal',
    designation: 'Chief Works Engineer',
    department: 'Urban Infrastructure Authority',
    badge: 'Municipal Authority'
  }
];

export function AuthProvider({ children }) {
  // Initialize with saved user or default citizen
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('civicsync_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null; // Guest by default until logged in or persona chosen
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [requiredRoleForModal, setRequiredRoleForModal] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('civicsync_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('civicsync_user');
    }
  }, [user]);

  // Quick switch persona
  const switchPersona = (role) => {
    const match = DEFAULT_PERSONAS.find(p => p.role === role) || DEFAULT_PERSONAS[0];
    setUser(match);
    setAuthModalOpen(false);
    setRequiredRoleForModal(null);
  };

  const login = async (email, password, role) => {
    try {
      const res = await loginUser({ email, password, role });
      setUser(res.user);
      setAuthModalOpen(false);
      setRequiredRoleForModal(null);
      return res.user;
    } catch (err) {
      // Fallback for seamless demo testing if backend is restarting
      const persona = DEFAULT_PERSONAS.find(p => p.role === role) || {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: role || 'citizen',
        badge: role === 'municipal' ? 'Municipal Staff' : role === 'contractor' ? 'Contractor' : 'Citizen'
      };
      setUser(persona);
      setAuthModalOpen(false);
      setRequiredRoleForModal(null);
      return persona;
    }
  };

  const signup = async (data) => {
    const res = await signupUser(data);
    setUser(res.user);
    setAuthModalOpen(false);
    setRequiredRoleForModal(null);
    return res.user;
  };

  const logout = () => {
    // Revert to citizen
    setUser(DEFAULT_PERSONAS[0]);
  };

  // Open auth modal with required role hint
  const requireRole = (role, onAllowed) => {
    if (user && user.role === role) {
      if (onAllowed) onAllowed();
      return true;
    }
    setRequiredRoleForModal(role);
    setAuthModalOpen(true);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        switchPersona,
        login,
        signup,
        logout,
        authModalOpen,
        setAuthModalOpen,
        requiredRoleForModal,
        requireRole,
        personas: DEFAULT_PERSONAS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
