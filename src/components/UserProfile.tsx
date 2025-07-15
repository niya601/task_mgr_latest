import React, { useState } from 'react';
import { User, LogOut, Settings, ChevronDown, UserCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserProfileProps {
  onLogout: () => void;
  onGoToProfile?: () => void;
}

function UserProfile({ onLogout, onGoToProfile }: UserProfileProps) {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-xl px-4 py-2 transition-all duration-300 border border-gray-200 hover:border-blue-300 hover:shadow-lg group"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-left hidden md:block">
          <p className="text-sm font-semibold text-gray-800 truncate max-w-32">
            {userName}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-32">
            {userEmail}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-gray-800">{userName}</p>
              <p className="text-sm text-gray-500">{userEmail}</p>
            </div>
            
            <div className="py-1">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onGoToProfile?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                Profile Settings
              </button>
              
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserProfile;