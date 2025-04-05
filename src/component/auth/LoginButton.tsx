import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import RegisterModal from './RegistarModal';
import ProfileMenu from './ProfileMenu';
import { getProfile } from '../../lib/supabase';
import styles from './LoginButton.module.css';

interface LoginButtonProps {
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ className }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const router = useRouter();
  const [returnPath, setReturnPath] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        checkProfileCompletion(session?.user || null);
      }
    );

    setReturnPath(window.location.pathname);
    getCurrentUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await checkProfileCompletion(user);
    } catch (error) {
      console.error('Error getting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkProfileCompletion = async (user: User | null) => {
    if (!user) {
      setIsProfileComplete(false);
      return;
    }

    try {
      const profile = await getProfile(user.id);
      setIsProfileComplete(!!profile);
      if (user && !profile) {
        setShowRegisterModal(true);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${returnPath}`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleRegistrationComplete = () => {
    setIsProfileComplete(true);
    setShowRegisterModal(false);
  };

  if (loading) {
    return (
      <button className={`${styles.loginButton} ${className}`} disabled>
        로그인
      </button>
    );
  }

  if (user && isProfileComplete) {
    return <ProfileMenu user={user} />;
  }

  return (
    <>
      <button className={`${styles.loginButton} ${className}`} onClick={handleLogin}>
        로그인
      </button>
      {user && (
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          user={user}
          onRegistrationComplete={handleRegistrationComplete}
        />
      )}
    </>
  );
};

export default LoginButton;
