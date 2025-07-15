import React, { useState } from 'react';

interface SignupPageProps {
  onBackToHome: () => void;
  onGoToLogin: () => void;
}

function SignupPage({ onBackToHome, onGoToLogin }: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Signup attempt:', { name, email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Content Container */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          {/* Signup Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-12 text-center tracking-tight">
            Create Account
          </h1>
          
          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Field */}
            <div>
              <label 
                htmlFor="name" 
                className="block text-lg font-semibold text-gray-700 mb-3"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-gray-50 focus:bg-white"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-lg font-semibold text-gray-700 mb-3"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-gray-50 focus:bg-white"
                placeholder="Enter your email"
                required
              />
            </div>
            
            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-lg font-semibold text-gray-700 mb-3"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-gray-50 focus:bg-white"
                placeholder="Create a password"
                required
              />
            </div>
            
            {/* Signup Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl text-lg md:text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Signup
              </button>
            </div>
          </form>
          
          {/* Back to Home Link */}
          <div className="text-center mt-8">
            <div className="mb-4">
              <span className="text-gray-600 text-base">Already have an account? </span>
              <button 
                onClick={onGoToLogin}
                className="text-blue-600 hover:text-blue-700 font-medium text-base transition-colors duration-300 hover:underline"
              >
                Login here
              </button>
            </div>
            <button 
              onClick={onBackToHome}
              className="text-blue-600 hover:text-blue-700 font-medium text-base transition-colors duration-300"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;