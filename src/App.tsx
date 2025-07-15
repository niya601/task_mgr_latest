import React from 'react';
import { CheckSquare, LogIn, UserPlus, LayoutDashboard, Edit3, BarChart3, Users } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { signOut } from './lib/supabase';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = React.useState<'home' | 'login' | 'signup' | 'dashboard'>('home');
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg mb-4">
            <CheckSquare className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg">Loading TaskFlow...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show dashboard by default
  if (user && currentPage === 'home') {
    setCurrentPage('dashboard');
  }

  const handleLogout = async () => {
    await signOut();
    setCurrentPage('home');
  };
  
  if (currentPage === 'login') {
    return <LoginPage 
      onBackToHome={() => setCurrentPage('home')} 
      onGoToSignup={() => setCurrentPage('signup')}
    />;
  }
  
  if (currentPage === 'signup') {
    return <SignupPage 
      onBackToHome={() => setCurrentPage('home')} 
      onGoToLogin={() => setCurrentPage('login')}
    />;
  }
  
  if (currentPage === 'dashboard') {
    return <Dashboard 
      onLogout={handleLogout} 
      onBackToHome={() => setCurrentPage('home')}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        {/* Header with Icon */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg mb-8">
            <CheckSquare className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-gray-800">Welcome to </span>
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              TaskFlow
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Stay organized, boost productivity, and never miss a deadline with our 
            intuitive task management solution.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-20">
          <button 
            onClick={() => setCurrentPage('login')}
            className="group bg-white hover:bg-gray-50 text-blue-600 font-semibold py-4 px-8 rounded-2xl text-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-w-[200px] flex items-center justify-center gap-3"
            disabled={user !== null}
          >
            <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {user ? 'Logged In' : 'Login'}
          </button>
          
          <button 
            onClick={() => setCurrentPage('signup')}
            className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-w-[200px] flex items-center justify-center gap-3"
            disabled={user !== null}
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {user ? 'Signed Up' : 'Sign Up'}
          </button>
          
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={`group ${user ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600' : 'bg-gray-400 cursor-not-allowed'} text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-w-[200px] flex items-center justify-center gap-3`}
            disabled={!user}
          >
            <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {user ? 'Dashboard' : 'Login Required'}
          </button>
        </div>
        
        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 text-center hover:bg-white/90 transition-all duration-300 hover:shadow-xl hover:scale-105 group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <Edit3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Easy Task Creation</h3>
            <p className="text-gray-600 leading-relaxed">
              Create and organize tasks with just a few clicks
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 text-center hover:bg-white/90 transition-all duration-300 hover:shadow-xl hover:scale-105 group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-200 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Smart Dashboard</h3>
            <p className="text-gray-600 leading-relaxed">
              Get insights and track your productivity
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 text-center hover:bg-white/90 transition-all duration-300 hover:shadow-xl hover:scale-105 group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Team Collaboration</h3>
            <p className="text-gray-600 leading-relaxed">
              Share tasks and collaborate with your team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;