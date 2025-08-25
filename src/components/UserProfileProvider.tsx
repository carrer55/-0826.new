import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '../lib/supabase';

interface UserProfileContextType {
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, profile: authProfile, updateProfile: authUpdateProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProfile(authProfile);
  }, [authProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setLoading(true);
    try {
      const result = await authUpdateProfile(updates);
      if (result.success && result.profile) {
        setProfile(result.profile);
        // ローカルストレージも更新（デモモード対応）
        localStorage.setItem('userProfile', JSON.stringify(result.profile));
      } else {
        throw new Error(result.error || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // プロフィールを再取得する処理
      // useAuthフックが自動的に最新のプロフィールを取得
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserProfileContext.Provider value={{
      profile,
      updateProfile,
      refreshProfile,
      loading
    }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}