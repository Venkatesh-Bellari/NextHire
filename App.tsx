
import React, { useState, useEffect } from 'react';
import { onAuthChange, User } from './services/firebaseService';
import LandingPage from './components/LandingPage';
import LoginView from './components/LoginView';
import SignUpView from './components/SignUpView';
import DashboardView from './components/DashboardView';
import Spinner from './components/Spinner';
import VerifyEmailView from './components/VerifyEmailView';

export type View = 'landing' | 'login' | 'signup';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('landing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a consistent dark theme for the entire application life-cycle.
    document.body.className = 'bg-slate-900 text-slate-100';
    
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const handleNavigate = (newView: View) => {
    setView(newView);
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-900">
            <Spinner />
        </div>
    );
  }

  if (user) {
    if (user.emailVerified) {
        return <DashboardView user={user} />;
    } else {
        return <VerifyEmailView user={user} />;
    }
  }
  
  switch (view) {
    case 'login':
      return <LoginView onNavigate={handleNavigate} />;
    case 'signup':
      return <SignUpView onNavigate={handleNavigate} />;
    case 'landing':
    default:
      return <LandingPage onNavigate={handleNavigate} />;
  }
};

export default App;
