import React, { useState, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import EditProfileModal from './EditPofile';
import styles from './ProfileMenu.module.css';

interface ProfileMenuProps {
  user: User;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className={styles.menuContainer} ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={styles.avatarButton}
        aria-label="프로필 메뉴"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="프로필"
            className={styles.avatarImage}
          />
        ) : (
          <span className="text-white text-sm">
            {(user.user_metadata?.full_name || user.email || '?').charAt(0)}
          </span>
        )}
      </button>

      {isMenuOpen && (
        <div className={styles.profileMenu}>
          <div className={styles.profileHeader}>
            <p className={styles.profileName}>
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </p>
            <p className={styles.profileEmail}>{user.email}</p>
          </div>
          <button
            onClick={() => {
              setIsEditModalOpen(true);
              setIsMenuOpen(false);
            }}
            className={styles.menuButton}
          >
            회원정보 수정
          </button>
          <button onClick={handleLogout} className={styles.menuButton}>
            로그아웃
          </button>
        </div>
      )}

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default ProfileMenu;
