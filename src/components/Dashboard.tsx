import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTasks, createTask, updateTaskStatus, updateTaskPriority, deleteTask, Task } from '../lib/tasks';
import { Loader2, Plus, Trash2, Home } from 'lucide-react';
import UserProfile from './UserProfile';

interface DashboardProps {
  onLogout: () => void;
  onBackToHome: () => void;
}

function Dashboard({ onLogout, onBackToHome }: DashboardProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newStatus, setNewStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await getTasks();
      
      if (error) {
        setError('Failed to load tasks');
        console.error('Error loading tasks:', error);
      } else {
        setTasks(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setIsAddingTask(true);
      setError(null);
      
      const { data, error } = await createTask(newTaskTitle.trim(), newPriority, newStatus);
      
      if (error) {
        setError('Failed to create task');
        console.error('Error creating task:', error);
      } else if (data) {
        setTasks([data, ...tasks]);
        setNewTaskTitle('');
        setNewPriority('medium');
        setNewStatus('pending');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error:', err);
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (id: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      const { data, error } = await updateTaskStatus(id, newStatus);
      
      if (error) {
        setError('Failed to update task status');
        console.error('Error updating task status:', error);
      } else if (data) {
        setTasks(tasks.map(task => 
          task.id === id ? data : task
        ));
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error:', err);
    }
  };

  const handleUpdateTaskPriority = async (id: string, newPriority: 'high' | 'medium' | 'low') => {
    try {
      const { data, error } = await updateTaskPriority(id, newPriority);
      
      if (error) {
        setError('Failed to update task priority');
        console.error('Error updating task priority:', error);
      } else if (data) {
        setTasks(tasks.map(task => 
          task.id === id ? data : task
        ));
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await deleteTask(id);
      
      if (error) {
        setError('Failed to delete task');
        console.error('Error deleting task:', error);
      } else {
        setTasks(tasks.filter(task => task.id !== id));
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-800">TaskFlow Dashboard</h1>
          </div>
          <UserProfile onLogout={onLogout} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Content Container */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            {/* Dashboard Heading */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">
                Your Tasks
              </h2>
              <p className="text-lg text-gray-600">
                Welcome back, {user.user_metadata?.full_name || user.email}!
              </p>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-center font-medium">{error}</p>
              </div>
            )}
            
            {/* Add New Task Form */}
            <form onSubmit={handleAddTask} className="mb-12 bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Task</h3>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-white"
                  placeholder="Enter task title"
                  required
                />
              </div>
              
              {/* Priority and Status Selectors for New Task */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              {/* Add Task Button */}
              <button
                type="submit"
                disabled={isAddingTask || !newTaskTitle.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isAddingTask ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding Task...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Task
                  </>
                )}
              </button>
            </form>
            
            {/* Tasks List */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading your tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No tasks yet. Create your first task above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Tasks ({tasks.length})</h3>
                {tasks.map((task, index) => (
                  <div key={task.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center flex-1">
                        <span className="font-semibold text-blue-600 mr-4 min-w-[2rem] text-lg">
                          {index + 1}.
                        </span>
                        <h3 className={`text-lg font-medium flex-1 transition-all duration-300 ${
                          task.status === 'completed' 
                            ? 'line-through text-gray-500' 
                            : 'text-gray-700'
                        }`}>
                          {task.title || task.text}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors ml-4"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className={`ml-12 flex flex-wrap gap-4 items-center transition-opacity duration-300 ${
                      task.status === 'completed' ? 'opacity-60' : 'opacity-100'
                    }`}>
                      {/* Priority Selector */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-600">Priority:</label>
                        <select
                          value={task.priority}
                          onChange={(e) => handleUpdateTaskPriority(task.id, e.target.value as 'high' | 'medium' | 'low')}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      
                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-600">Status:</label>
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as 'pending' | 'in-progress' | 'completed')}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      
                      {/* Created Date */}
                      <div className="text-xs text-gray-500">
                        Created: {new Date(task.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;