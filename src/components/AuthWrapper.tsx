import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Login from './auth/Login';
import Register from './auth/Register';
import RegisterSuccess from './auth/RegisterSuccess';
import EmailConfirmed from './auth/EmailConfirmed';
import Onboarding from './auth/Onboarding';
import PasswordReset from './auth/PasswordReset';
import Dashboard from './Dashboard';

function AuthWrapper() {
  const [currentView, setCurrentView] = useState<string>('login');
  const { 
    user, 
    profile, 
    loading, 
    error,
    isAuthenticated, 
    isEmailConfirmed, 
    isOnboardingCompleted 
  } = useAuth();

  useEffect(() => {
    // URLパラメータの処理
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    const code = urlParams.get('code');
    const error = urlParams.get('error') || hashParams.get('error');
    
    if (error) {
      console.error('Auth error:', error);
      setCurrentView('login');
      return;
    }

    if (code) {
      // URLパラメータをクリア
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    // デモモードの場合は直接ダッシュボードを表示
    if (localStorage.getItem('demoMode') === 'true') {
      return;
    }

    if (isAuthenticated && user) {
      if (!isEmailConfirmed) {
        setCurrentView('login');
      } else if (!isOnboardingCompleted) {
        setCurrentView('onboarding');
      } else {
        // 認証完了
        return;
      }
    } else {
      setCurrentView('login');
    }
  }, [isAuthenticated, user, profile, loading, isEmailConfirmed, isOnboardingCompleted]);

  const handleLoginSuccess = () => {
    // useAuthフックが自動的に状態を更新するため、何もしない
  };

  const handleOnboardingComplete = () => {
    // useAuthフックが自動的に状態を更新するため、何もしない
  };

  const navigateToView = (view: string) => {
    setCurrentView(view);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/20 rounded-xl p-8 border border-white/30 shadow-xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-800 font-medium mb-2">システムを初期化中...</p>
          <p className="text-slate-600 text-sm">しばらくお待ちください</p>
        </div>
      </div>
    );
  }

  // 認証済みまたはデモモードの場合はダッシュボードを表示
  if (isAuthenticated || localStorage.getItem('demoMode') === 'true') {
    return <Dashboard />;
  }

  switch (currentView) {
    case 'register':
      return <Register onNavigate={navigateToView} />;
    case 'register-success':
      return <RegisterSuccess onNavigate={navigateToView} />;
    case 'email-confirmed':
      return <EmailConfirmed onNavigate={navigateToView} />;
    case 'onboarding':
      return <Onboarding onNavigate={navigateToView} onComplete={handleOnboardingComplete} />;
    case 'password-reset':
      return <PasswordReset onNavigate={navigateToView} />;
    default:
      return <Login onNavigate={navigateToView} onLoginSuccess={handleLoginSuccess} />;
  }
}

export default AuthWrapper;