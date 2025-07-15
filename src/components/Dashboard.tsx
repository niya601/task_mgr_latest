import React, { useState } from 'react';

interface Task {
  id: number;
  text: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
}

interface DashboardProps {
  onLogout: () => void;
}

function Dashboard({ onLogout }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: 'Finish homework', priority: 'high', status: 'in-progress' },
    { id: 2, text: 'Call John', priority: 'medium', status: 'pending' },
    { id: 3, text: 'Buy groceries', priority: 'low', status: 'completed' }
  ]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newStatus, setNewStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      const newTaskObj: Task = {
        id: Date.now(),
        text: newTask.trim(),
        priority: newPriority,
        status: newStatus
      };
      setTasks([...tasks, newTaskObj]);
      setNewTask('');
      setNewPriority('medium');
      setNewStatus('pending');
    }
  };

  const updateTaskStatus = (id: number, newStatus: 'pending' | 'in-progress' | 'completed') => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: newStatus } : task
    ));
  };

  const updateTaskPriority = (id: number, newPriority: 'high' | 'medium' | 'low') => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, priority: newPriority } : task
    ));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Main Content Container */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          {/* Dashboard Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-12 text-center tracking-tight">
            Your Tasks
          </h1>
          
          {/* Tasks List */}
          <div className="mb-12">
            <div className="space-y-6">
              {tasks.map((task, index) => (
                <div key={task.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="font-semibold text-blue-600 mr-4 min-w-[2rem] text-lg">
                        {index + 1}.
                      </span>
                      <span className="text-lg text-gray-700 font-medium">{task.text}</span>
                    </div>
                  </div>
                  
                  <div className="ml-12 flex flex-wrap gap-4 items-center">
                    {/* Priority Selector */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-600">Priority:</label>
                      <select
                        value={task.priority}
                        onChange={(e) => updateTaskPriority(task.id, e.target.value as 'high' | 'medium' | 'low')}
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
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as 'pending' | 'in-progress' | 'completed')}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Add New Task Form */}
          <form onSubmit={handleAddTask} className="mb-8">
            <div className="mb-6">
              <label 
                htmlFor="newTask" 
                className="block text-lg font-semibold text-gray-700 mb-3"
              >
                New Task
              </label>
              <input
                type="text"
                id="newTask"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-gray-50 focus:bg-white"
                placeholder="Enter a new task"
              />
            </div>
            
            {/* Priority and Status Selectors for New Task */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-gray-50 focus:bg-white"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-gray-50 focus:bg-white"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl text-lg md:text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 mb-6"
            >
              Add Task
            </button>
          </form>
          
          {/* Logout Button */}
          <div className="text-center">
            <button 
              onClick={onLogout}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-xl text-lg md:text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;