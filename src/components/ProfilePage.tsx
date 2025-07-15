import React, { useState, useEffect, useRef } from 'react';
import { User, Upload, Camera, Loader2, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { uploadProfilePicture, getCurrentProfilePicture } from '../lib/profile';
import UserProfile from './UserProfile';

interface ProfilePageProps {
  onLogout: () => void;
  onBackToHome: () => void;
}

function ProfilePage({ onLogout, onBackToHome }: ProfilePageProps) {
  const { user } = useAuth();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadCurrentProfilePicture();
    }
  }, [user]);

  const loadCurrentProfilePicture = async () => {
    try {
      const { url, error } = await getCurrentProfilePicture();
      if (error) {
        console.error('Error loading profile picture:', error);
      } else {
        setProfilePictureUrl(url);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const { url, error } = await uploadProfilePicture(file);

      if (error) {
        setError('Failed to upload profile picture');
        console.error('Upload error:', error);
      } else if (url) {
        setProfilePictureUrl(url);
        setSuccess('Profile picture updated successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error:', err);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Please log in to access your profile.</p>
        </div>
      </div>
    );
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200">
      {/* Header with User Profile */}
      <div className="bg-white/30 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 bg-white/80 hover:bg-white/90 text-gray-700 hover:text-blue-600 font-medium py-2 px-4 rounded-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 hover:shadow-md group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
          </div>
          <UserProfile onLogout={onLogout} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Main Profile Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            {/* Profile Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">
                Your Profile
              </h2>
              <p className="text-lg text-gray-600">
                Manage your account settings and profile information
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-center font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-600 text-center font-medium">{success}</p>
              </div>
            )}

            {/* Profile Picture Section */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Profile Picture
              </h3>
              
              <div className="flex flex-col items-center space-y-6">
                {/* Profile Picture Display */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    {profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Camera Icon Overlay */}
                  <div className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200">
                    <Camera className="w-5 h-5 text-gray-600" />
                  </div>
                </div>

                {/* Upload Button */}
                <button
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:transform-none disabled:shadow-none flex items-center gap-3"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Profile Picture
                    </>
                  )}
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Upload Instructions */}
                <p className="text-sm text-gray-500 text-center max-w-md">
                  Choose a profile picture to personalize your account. 
                  Supported formats: JPG, PNG, GIF. Maximum size: 5MB.
                </p>
              </div>
            </div>

            {/* User Information Section */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Account Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl">
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-600">{userName}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl">
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="text-gray-600">{userEmail}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl">
                  <span className="font-medium text-gray-700">Account Created:</span>
                  <span className="text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;