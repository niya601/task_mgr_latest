import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTasks, createTask, updateTaskStatus, updateTaskPriority, deleteTask, Task } from '../lib/tasks';
import { generateSubtasks } from '../lib/subtasks';
import { smartSearch, SearchResult } from '../lib/search';
import { Loader2, Plus, Trash2, Home, ChevronDown, ChevronUp, Search } from 'lucide-react';
import UserProfile from './UserProfile';

interface DashboardProps {
  onLogout: () => void;
  onBackToHome: () => void;
  onGoToProfile: () => void;
}

function Dashboard({ onLogout, onBackToHome, onGoToProfile }: DashboardProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newStatus, setNewStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddTaskExpanded, setIsAddTaskExpanded] = useState(false);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{ [taskId: string]: string[] }>({});
  const [loadingSubtasks, setLoadingSubtasks] = useState<{ [taskId: string]: boolean }>({});
  const [subtaskErrors, setSubtaskErrors] = useState<{ [taskId: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

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
    if (!newTaskText.trim()) return;

    try {
      setIsAddingTask(true);
      setError(null);
      
      const { data, error } = await createTask(newTaskText.trim(), newPriority, newStatus);
      
      if (error) {
        setError('Failed to create task');
        console.error('Error creating task:', error);
      } else if (data) {
        setTasks([data, ...tasks]);
        setNewTaskText('');
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

  const handleUpdateSubtaskStatus = async (subtaskId: string, newStatus: 'pending' | 'in-progress' | 'completed', parentTaskId: string) => {
    try {
      const { data, error } = await updateTaskStatus(subtaskId, newStatus);
      
      if (error) {
        setError('Failed to update subtask status');
        console.error('Error updating subtask status:', error);
      } else if (data) {
        // Update the subtask within the parent task
        setTasks(tasks.map(task => 
          task.id === parentTaskId 
            ? {
                ...task,
                subtasks: task.subtasks?.map(subtask =>
                  subtask.id === subtaskId ? data : subtask
                ) || []
              }
            : task
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

  const handleGenerateSubtasks = async (taskId: string, taskText: string) => {
    try {
      setLoadingSubtasks(prev => ({ ...prev, [taskId]: true }));
      setSubtaskErrors(prev => ({ ...prev, [taskId]: '' }));
      
      const { data, error } = await generateSubtasks(taskText);
      
      if (error) {
        setSubtaskErrors(prev => ({ ...prev, [taskId]: 'Failed to generate subtasks' }));
        console.error('Error generating subtasks:', error);
      } else if (data) {
        setExpandedSubtasks(prev => ({ ...prev, [taskId]: data }));
      }
    } catch (err) {
      setSubtaskErrors(prev => ({ ...prev, [taskId]: 'An unexpected error occurred' }));
      console.error('Error:', err);
    } finally {
      setLoadingSubtasks(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleSaveSubtask = async (subtaskText: string, parentTask: Task) => {
    try {
      const { data, error } = await createTask(subtaskText, parentTask.priority, 'pending', parentTask.id);
      
      if (error) {
        setError('Failed to save subtask');
        console.error('Error saving subtask:', error);
      } else if (data) {
        // Update the parent task with the new subtask
        setTasks(tasks.map(task => 
          task.id === parentTask.id 
            ? { ...task, subtasks: [...(task.subtasks || []), data] }
            : task
        ));
        // Remove the saved subtask from the suggestions
        setExpandedSubtasks(prev => ({
          ...prev,
          [parentTask.id]: prev[parentTask.id]?.filter(s => s !== subtaskText) || []
        }));
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error:', err);
    }
  };

  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setSearchError(null);
      setShowSearchResults(true);
      
      const { data, error } = await smartSearch(searchQuery);
      
      if (error) {
        setSearchError('Failed to perform search');
        console.error('Search error:', error);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
      }
    } catch (err) {
      setSearchError('An unexpected error occurred');
      console.error('Error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchError(null);
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
              onClick={() => {
                console.log('Back to home clicked');
                onBackToHome();
              }}
              className="flex items-center gap-2 bg-white/80 hover:bg-white/90 text-gray-700 hover:text-blue-600 font-medium py-2 px-4 rounded-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 hover:shadow-md group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">TaskFlow Dashboard</h1>
          </div>
          <UserProfile onLogout={onLogout} onGoToProfile={onGoToProfile} />
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
            
            {/* Smart Search Section */}
            <div className="mb-8">
              <form onSubmit={handleSmartSearch} className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="smart-search" className="block text-sm font-semibold text-gray-700 mb-2">
                      Smart Search
                    </label>
                    <input
                      id="smart-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 text-base border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-white placeholder-gray-500"
                      placeholder="Search your tasks using natural language..."
                    />
                  </div>
                  <div className="flex gap-2 sm:items-end">
                    <button
                      type="submit"
                      disabled={isSearching || !searchQuery.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:transform-none disabled:shadow-none flex items-center gap-2 whitespace-nowrap"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Search
                        </>
                      )}
                    </button>
                    {showSearchResults && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 whitespace-nowrap"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Search Results */}
              {showSearchResults && (
                <div className="mt-4 bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Search Results {searchResults.length > 0 && `(${searchResults.length})`}
                  </h3>
                  
                  {/* Search Error */}
                  {searchError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-600 text-sm font-medium">{searchError}</p>
                    </div>
                  )}
                  
                  {/* Search Results List */}
                  {isSearching ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-blue-600" />
                      <p className="text-gray-600">Searching your tasks...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600">
                        {searchQuery ? 'No similar tasks found. Try a different search term.' : 'Enter a search query to find similar tasks.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.map((result, index) => (
                        <div key={result.id} className="bg-white rounded-xl p-4 border border-blue-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            {/* Result Number */}
                            <span className="font-semibold text-blue-600 text-sm min-w-[1.5rem] bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mt-0.5">
                              {index + 1}
                            </span>
                            
                            {/* Task Content */}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 mb-2">{result.text}</h4>
                              
                              <div className="flex flex-wrap items-center gap-2 text-sm">
                                {/* Priority Badge */}
                                <span className={`px-2 py-1 rounded-full font-medium ${
                                  result.priority === 'high' 
                                    ? 'bg-red-100 text-red-700' 
                                    : result.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {result.priority === 'high' ? '⚡ High' : result.priority === 'medium' ? '⏰ Medium' : '⭕ Low'}
                                </span>
                                
                                {/* Status Badge */}
                                <span className={`px-2 py-1 rounded-full font-medium ${
                                  result.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : result.status === 'in-progress'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {result.status === 'completed' ? '✅ Done' : result.status === 'in-progress' ? '📋 In Progress' : '⏳ Pending'}
                                </span>
                                
                                {/* Similarity Score */}
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                                  {Math.round(result.similarity * 100)}% match
                                </span>
                                
                                {/* Created Date */}
                                <span className="text-gray-500">
                                  {new Date(result.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-center font-medium">{error}</p>
              </div>
            )}
            
            {/* Collapsible Tasks Section */}
            <div className="mb-8 space-y-6">
              {/* Tasks Header */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-6">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Your Tasks {tasks.length > 0 && `(${tasks.length})`}
                </h3>
                <button
                  onClick={() => setIsAddTaskExpanded(!isAddTaskExpanded)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 flex items-center gap-2 hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                  {isAddTaskExpanded ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </button>
              </div>

              {/* Collapsible Add New Task Form */}
              {isAddTaskExpanded && (
                <form onSubmit={handleAddTask} className="bg-white border-2 border-blue-200 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Add New Task</h4>
                  
                  <div className="mb-4">
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-white"
                      placeholder="Enter task title"
                      required
                      autoFocus
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
                  
                  {/* Form Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isAddingTask || !newTaskText.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
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
                    <button
                      type="button"
                      onClick={() => setIsAddTaskExpanded(false)}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List - Always Visible */}
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Loading your tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-600 text-lg">No tasks yet. Click "Add Task" above to create your first task!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div key={task.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        {/* Task Number */}
                        <span className="font-semibold text-blue-600 text-sm min-w-[1.5rem] bg-blue-50 rounded-full w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </span>
                        
                        {/* Checkbox */}
                        <button
                          onClick={() => handleUpdateTaskStatus(
                            task.id, 
                            task.status === 'completed' ? 'pending' : 'completed'
                          )}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                            task.status === 'completed'
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-gray-300 hover:border-blue-400 bg-white'
                          }`}
                        >
                          {task.status === 'completed' && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        
                        {/* Task Title */}
                        <h3 className={`text-lg font-medium flex-1 transition-all duration-300 ${
                          task.status === 'completed' 
                            ? 'line-through text-gray-500' 
                            : 'text-gray-700'
                        }`}>
                          {task.text}
                        </h3>
                        
                        {/* Priority Badge */}
                        <select
                          value={task.priority}
                          onChange={(e) => handleUpdateTaskPriority(task.id, e.target.value as 'high' | 'medium' | 'low')}
                          className={`px-3 py-1 rounded-full text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                            task.priority === 'high' 
                              ? 'bg-red-100 text-red-700' 
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          <option value="high">⚡ High</option>
                          <option value="medium">⏰ Medium</option>
                          <option value="low">⭕ Low</option>
                        </select>
                        
                        {/* Status Badge */}
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as 'pending' | 'in-progress' | 'completed')}
                          className={`px-3 py-1 rounded-full text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : task.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="in-progress">📋 In Progress</option>
                          <option value="completed">✅ Done</option>
                        </select>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Created Date */}
                      <div className="ml-12 mt-2">
                        <div className="text-xs text-gray-500">
                          Created: {new Date(task.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {/* Subtasks Display */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="ml-12 mt-3">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Subtasks:</h4>
                          <div className="space-y-2">
                            {task.subtasks.map((subtask, subtaskIndex) => (
                              <div key={subtask.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                {/* Subtask Checkbox */}
                                <button
                                  onClick={() => handleUpdateTaskStatus(
                                    subtask.id,
                                    subtask.status === 'completed' ? 'pending' : 'completed',
                                    task.id
                                  )}
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                    subtask.status === 'completed'
                                      ? 'bg-blue-500 border-blue-500 text-white'
                                      : 'border-gray-300 hover:border-blue-400 bg-white'
                                  }`}
                                >
                                  {subtask.status === 'completed' && (
                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                                
                                {/* Subtask Text */}
                                <span className={`text-sm flex-1 transition-all duration-300 ${
                                  subtask.status === 'completed' 
                                    ? 'line-through text-gray-500' 
                                    : 'text-gray-700'
                                }`}>
                                  {subtask.text}
                                </span>
                                
                                {/* Subtask Status */}
                                <select
                                  value={subtask.status}
                                  onChange={(e) => {
                                    const newStatus = e.target.value as 'pending' | 'in-progress' | 'completed';
                                    handleUpdateSubtaskStatus(subtask.id, newStatus, task.id);
                                  }}
                                  className={`px-2 py-1 rounded-md text-xs font-medium border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                                    subtask.status === 'completed'
                                      ? 'bg-green-100 text-green-700'
                                      : subtask.status === 'in-progress'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  <option value="pending">⏳ Pending</option>
                                  <option value="in-progress">📋 In Progress</option>
                                  <option value="completed">✅ Done</option>
                                </select>
                                
                                {/* Delete Subtask */}
                                <button
                                  onClick={() => handleDeleteTask(subtask.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                  title="Delete subtask"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Generate Subtasks Button */}
                      <div className="ml-12 mt-3">
                        <button
                          onClick={() => handleGenerateSubtasks(task.id, task.text)}
                          disabled={loadingSubtasks[task.id]}
                          className="bg-purple-100 hover:bg-purple-200 disabled:bg-purple-50 text-purple-700 disabled:text-purple-400 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-300 flex items-center gap-2 disabled:cursor-not-allowed"
                        >
                          {loadingSubtasks[task.id] ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              ✨ Generate Subtasks with AI
                            </>
                          )}
                        </button>
                        
                        {/* Subtask Error */}
                        {subtaskErrors[task.id] && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{subtaskErrors[task.id]}</p>
                          </div>
                        )}
                        
                        {/* Generated Subtasks */}
                        {expandedSubtasks[task.id] && expandedSubtasks[task.id].length > 0 && (
                          <div className="mt-3 bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <h4 className="text-sm font-semibold text-purple-800 mb-3">
                              AI Generated Subtasks:
                            </h4>
                            <div className="space-y-2">
                              {expandedSubtasks[task.id].map((subtask, index) => (
                                <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-purple-100">
                                  <span className="text-sm text-gray-700 flex-1">{subtask}</span>
                                  <button
                                    onClick={() => handleSaveSubtask(subtask, task)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-1 px-3 rounded-md text-xs transition-all duration-300 hover:scale-105 ml-3"
                                  >
                                    Save
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
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
            ) : null}
            {/* Summary Stats (always visible) */}
            {!loading && tasks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {tasks.filter(task => task.status === 'pending').length}
                  </div>
                  <div className="text-sm text-blue-700">Pending Tasks</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {tasks.filter(task => task.status === 'in-progress').length}
                  </div>
                  <div className="text-sm text-yellow-700">In Progress</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {tasks.filter(task => task.status === 'completed').length}
                  </div>
                  <div className="text-sm text-green-700">Completed</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;