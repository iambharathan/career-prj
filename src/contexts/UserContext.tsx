import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  created_at: string;
}

interface UserContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  isLoading: boolean;
  openAIKey: string;
  setOpenAIKey: (key: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openAIKey, setOpenAIKeyState] = useState<string>('');

  useEffect(() => {
    // Check localStorage for existing user profile
    const storedProfileId = localStorage.getItem('user_profile_id');
    const storedApiKey = localStorage.getItem('openai_api_key');
    
    if (storedApiKey) {
      setOpenAIKeyState(storedApiKey);
    }
    
    if (storedProfileId) {
      fetchUserProfile(storedProfileId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (data && !error) {
        setUserProfile(data);
      } else {
        localStorage.removeItem('user_profile_id');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetUserProfile = (profile: UserProfile | null) => {
    setUserProfile(profile);
    if (profile) {
      localStorage.setItem('user_profile_id', profile.id);
    } else {
      localStorage.removeItem('user_profile_id');
    }
  };

  const handleSetOpenAIKey = (key: string) => {
    setOpenAIKeyState(key);
    if (key) {
      localStorage.setItem('openai_api_key', key);
    } else {
      localStorage.removeItem('openai_api_key');
    }
  };

  return (
    <UserContext.Provider value={{ 
      userProfile, 
      setUserProfile: handleSetUserProfile, 
      isLoading,
      openAIKey,
      setOpenAIKey: handleSetOpenAIKey
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
