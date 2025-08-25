import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, UserProfile, getCurrentUserProfile } from '../lib/supabase';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        // デモモードのチェック
        const demoMode = localStorage.getItem('demoMode');
        const demoSession = localStorage.getItem('demoSession');
        
        if (demoMode === 'true' && demoSession) {
          try {
            const session = JSON.parse(demoSession);
            const demoProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            
            if (mounted) {
              setAuthState({
                user: session.user,
                profile: demoProfile,
                loading: false,
                error: null
              });
            }
            return;
          } catch (error) {
            console.error('Demo session parse error:', error);
            localStorage.removeItem('demoMode');
            localStorage.removeItem('demoSession');
            localStorage.removeItem('userProfile');
          }
        }

        // 環境変数チェック
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('demo')) {
          console.warn('Supabase not configured, using demo mode');
          if (mounted) {
            setAuthState({
              user: null,
              profile: null,
              loading: false,
              error: null
            });
          }
          return;
        }

        // 通常の認証チェック
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.warn('Supabase auth error, falling back to demo mode:', error);
            if (mounted) {
              setAuthState({
                user: null,
                profile: null,
                loading: false,
                error: null
              });
            }
            return;
          }

          if (session?.user) {
            try {
              const profile = await getCurrentUserProfile();
              if (mounted) {
                setAuthState({
                  user: session.user,
                  profile,
                  loading: false,
                  error: null
                });
              }
            } catch (profileError) {
              console.warn('Profile fetch error:', profileError);
              if (mounted) {
                setAuthState({
                  user: session.user,
                  profile: null,
                  loading: false,
                  error: null
                });
              }
            }
          } else {
            if (mounted) {
              setAuthState({
                user: null,
                profile: null,
                loading: false,
                error: null
              });
            }
          }
        } catch (supabaseError) {
          console.warn('Supabase connection failed, using offline mode:', supabaseError);
          if (mounted) {
            setAuthState({
              user: null,
              profile: null,
              loading: false,
              error: null
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null
          });
        }
      }
    };

    getInitialSession();

    // Supabase接続チェック
    const checkSupabaseConnection = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl || supabaseUrl.includes('demo')) {
          return; // Supabase未設定の場合はスキップ
        }
        
        // 認証状態の変更を監視
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change:', event, session?.user?.id);
            
            if (!mounted) return;

            if (event === 'SIGNED_IN' && session?.user) {
              try {
                const profile = await getCurrentUserProfile();
                setAuthState({
                  user: session.user,
                  profile,
                  loading: false,
                  error: null
                });
              } catch (error) {
                console.warn('Profile fetch error during sign in:', error);
                setAuthState({
                  user: session.user,
                  profile: null,
                  loading: false,
                  error: null
                });
              }
            } else if (event === 'SIGNED_OUT') {
              setAuthState({
                user: null,
                profile: null,
                loading: false,
                error: null
              });
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              try {
                const profile = await getCurrentUserProfile();
                setAuthState(prev => ({
                  ...prev,
                  user: session.user,
                  profile,
                  error: null
                }));
              } catch (error) {
                console.warn('Profile fetch error during token refresh:', error);
              }
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.warn('Supabase auth subscription failed:', error);
        return () => {}; // 空の cleanup 関数を返す
      }
    };

    const cleanup = checkSupabaseConnection();

    return () => {
      mounted = false;
      if (cleanup) {
        cleanup.then(fn => fn && fn());
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // デモアカウントの処理
      if (email === 'demo' && password === 'pass9981') {
        try {
          const demoProfile = {
            id: 'demo-user-id',
            email: 'demo',
            full_name: 'デモユーザー',
            company_name: '株式会社デモ',
            position: '代表取締役',
            phone: '090-0000-0000',
            department: '経営企画部',
            role: 'admin',
            default_organization_id: null,
            avatar_url: null,
            onboarding_completed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          localStorage.setItem('userProfile', JSON.stringify(demoProfile));
          localStorage.setItem('demoMode', 'true');
          
          const demoSession = {
            user: {
              id: 'demo-user-id',
              email: 'demo',
              email_confirmed_at: new Date().toISOString()
            }
          };
          
          localStorage.setItem('demoSession', JSON.stringify(demoSession));
          
          setAuthState({
            user: demoSession.user as any,
            profile: demoProfile,
            loading: false,
            error: null
          });
          
          return { success: true, user: demoSession.user, profile: demoProfile };
        } catch (err) {
          console.error('Demo login error:', err);
          setAuthState(prev => ({ ...prev, loading: false, error: 'デモログインに失敗しました' }));
          return { success: false, error: 'デモログインに失敗しました' };
        }
      }

      // 環境変数チェック
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('demo')) {
        setAuthState(prev => ({ ...prev, loading: false, error: 'Supabaseが設定されていません' }));
        return { success: false, error: 'Supabaseが設定されていません' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        try {
          const profile = await getCurrentUserProfile();
          setAuthState({
            user: data.user,
            profile,
            loading: false,
            error: null
          });
          return { success: true, user: data.user, profile };
        } catch (profileError) {
          console.warn('Profile fetch error:', profileError);
          setAuthState({
            user: data.user,
            profile: null,
            loading: false,
            error: null
          });
          return { success: true, user: data.user, profile: null };
          }
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await getCurrentUserProfile();
          setAuthState({
            user: session.user,
            profile,
            loading: false,
            error: null
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null
          });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const profile = await getCurrentUserProfile();
          setAuthState(prev => ({
            ...prev,
            user: session.user,
            profile,
            error: null
          }));
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await getCurrentUserProfile();
        setAuthState({
          user: data.user,
          profile,
          loading: false,
          error: null
        });
        return { success: true, user: data.user, profile };
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, profileData?: {
    full_name: string;
    company_name: string;
    position: string;
    phone: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: profileData ? {
            full_name: profileData.full_name,
            company_name: profileData.company_name,
            position: profileData.position,
            phone: profileData.phone
          } : undefined
        }
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      // プロフィールデータがある場合は、ユーザー作成後にプロフィールを更新
      if (data.user && profileData) {
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              id: data.user.id,
              email: data.user.email || '',
              full_name: profileData.full_name,
              company_name: profileData.company_name,
              position: profileData.position,
              phone: profileData.phone,
              onboarding_completed: true
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
        } catch (profileError) {
          console.error('Profile creation failed:', profileError);
        }
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // デモモードの場合
      if (localStorage.getItem('demoMode') === 'true') {
        localStorage.removeItem('demoMode');
        localStorage.removeItem('demoSession');
        localStorage.removeItem('userProfile');
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null
        });
        return { success: true };
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      // ローカルストレージのクリア
      localStorage.removeItem('userProfile');
      
      setAuthState({
        user: null,
        profile: null,
        loading: false,
        error: null
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      if (!authState.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      setAuthState(prev => ({
        ...prev,
        profile: data,
        loading: false,
        error: null
      }));

      return { success: true, profile: data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    isAuthenticated: !!authState.user,
    isEmailConfirmed: !!authState.user?.email_confirmed_at,
    isOnboardingCompleted: !!authState.profile?.onboarding_completed
  };
}