import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, CheckSquare, Clock, User, Play, Pause, BarChart3 } from 'lucide-react';
import { useData } from '../context/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// TaskItem Component with enhanced functionality
const TaskItem = ({ task, onComplete, onUpdateStatus, onDelete, onStartTimer }) => {
  // Safety check for task object
  if (!task || !task._id) {
    return null;
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in-progress': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'done': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return '';
    try {
      const date = new Date(dueDate);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
      if (diffDays === 0) return 'Due today';
      if (diffDays === 1) return 'Due tomorrow';
      return `Due in ${diffDays} days`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && task.status !== 'done';
  };

  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${
      isOverdue(task.dueDate) ? 'border-red-500 bg-red-50' : 
      task.status === 'in-progress' ? 'border-orange-500' : 
      task.status === 'done' ? 'border-green-500' : 'border-transparent'
    }`}>
      <div className="flex items-start space-x-3">
        {/* Priority Indicator */}
        <div className={`w-3 h-3 rounded-full mt-2 ${getPriorityColor(task.priority)}`} />
        
        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-base font-medium mb-1 ${
                task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title || 'Untitled Task'}
              </h3>
              {task.description && (
                <p className="text-gray-600 text-sm mb-2">
                  {task.description}
                </p>
              )}
              
              {/* Task Meta */}
              <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                {task.dueDate && (
                  <div className={`flex items-center space-x-1 ${
                    isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{formatDueDate(task.dueDate)}</span>
                  </div>
                )}
                <span className="capitalize">{task.category || 'other'}</span>
                <span className="capitalize">{task.priority || 'medium'}</span>
                {task.scoreImpact && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Impact: {task.scoreImpact}/10
                  </span>
                )}
              </div>

              {/* Time Tracking Info */}
              {(task.estimatedTime || task.actualTime) && (
                <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                  {task.estimatedTime && (
                    <span>Est: {Math.round(task.estimatedTime / 60)}h {task.estimatedTime % 60}m</span>
                  )}
                  {task.actualTime && (
                    <span>Actual: {Math.round(task.actualTime / 60)}h {task.actualTime % 60}m</span>
                  )}
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status || 'todo')}`}>
                {task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 mt-3">
            {task.status !== 'done' && (
              <>
                <button
                  onClick={() => onComplete(task._id)}
                  className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-xs font-medium bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition-colors"
                >
                  <CheckSquare className="w-3 h-3" />
                  <span>Complete</span>
                </button>
                
                {task.status === 'todo' && (
                  <button
                    onClick={() => onUpdateStatus(task._id, 'in-progress')}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs font-medium bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>Start</span>
                  </button>
                )}

                {task.status === 'in-progress' && (
                  <button
                    onClick={() => onUpdateStatus(task._id, 'todo')}
                    className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-xs font-medium bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded transition-colors"
                  >
                    <Pause className="w-3 h-3" />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  onClick={() => onStartTimer(task)}
                  className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-xs font-medium bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded transition-colors"
                >
                  <Clock className="w-3 h-3" />
                  <span>Track Time</span>
                </button>
              </>
            )}
            
            <button 
              onClick={() => onDelete(task._id)}
              className="text-red-400 hover:text-red-600 text-xs font-medium bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [activePanel, setActivePanel] = useState('all'); // New panel filter
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'other',
    panel: 'personal', // New panel field
    dueDate: ''
  });

  const {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask
  } = useData();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const result = await createTask(newTask);
    if (result.success) {
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        category: 'other',
        panel: activePanel === 'all' ? 'personal' : activePanel,
        dueDate: ''
      });
      setShowAddTask(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    await completeTask(taskId);
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    await updateTask(taskId, { status });
  };

  const handleStartTimer = (task) => {
    // Navigate to time tracker with task context
    const taskInfo = {
      id: task._id,
      title: task.title,
      category: task.category,
      panel: task.panel
    };
    
    // Store task info in sessionStorage for time tracker
    sessionStorage.setItem('activeTask', JSON.stringify(taskInfo));
    
    // Navigate to time tracker
    window.location.href = '/app/time-tracker';
    
    // Show success message
    toast.success(`Started time tracking for "${task.title}"`);
  };

  const filteredTasks = (tasks || []).filter(task => {
    const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPanel = activePanel === 'all' || task.panel === activePanel;
    
    let matchesStatus = true;
    if (activeTab === 'todo') matchesStatus = task.status === 'todo';
    else if (activeTab === 'in-progress') matchesStatus = task.status === 'in-progress';
    else if (activeTab === 'done') matchesStatus = task.status === 'done';
    
    return matchesSearch && matchesPanel && matchesStatus;
  });

  if (loading.tasks) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading tasks..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks & Productivity</h1>
          <p className="text-gray-600">Manage your tasks and track productivity</p>
        </div>
        <button
          onClick={() => {
            setNewTask({
              title: '',
              description: '',
              priority: 'medium',
              category: 'other',
              panel: activePanel === 'all' ? 'personal' : activePanel,
              dueDate: ''
            });
            setShowAddTask(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-blue-600">
            {(() => {
              const academicTodos = (tasks || []).filter(t => t.status === 'todo' && t.panel === 'academic').length;
              const personalTodos = (tasks || []).filter(t => t.status === 'todo' && t.panel === 'personal').length;
              const totalTodos = academicTodos + personalTodos;
              
              if (activePanel === 'all') {
                return (
                  <div className="flex flex-col">
                    <span>{totalTodos}</span>
                    <div className="text-xs text-gray-500 font-normal mt-1">
                      Academic: {academicTodos} + Personal: {personalTodos}
                    </div>
                  </div>
                );
              } else {
                return (tasks || []).filter(t => t.status === 'todo' && t.panel === activePanel).length;
              }
            })()}
          </div>
          <div className="text-sm text-gray-600">To Do</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-orange-600">
            {(() => {
              const academicInProgress = (tasks || []).filter(t => t.status === 'in-progress' && t.panel === 'academic').length;
              const personalInProgress = (tasks || []).filter(t => t.status === 'in-progress' && t.panel === 'personal').length;
              const totalInProgress = academicInProgress + personalInProgress;
              
              if (activePanel === 'all') {
                return (
                  <div className="flex flex-col">
                    <span>{totalInProgress}</span>
                    <div className="text-xs text-gray-500 font-normal mt-1">
                      Academic: {academicInProgress} + Personal: {personalInProgress}
                    </div>
                  </div>
                );
              } else {
                return (tasks || []).filter(t => t.status === 'in-progress' && t.panel === activePanel).length;
              }
            })()}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-600">
            {(() => {
              const academicDone = (tasks || []).filter(t => t.status === 'done' && t.panel === 'academic').length;
              const personalDone = (tasks || []).filter(t => t.status === 'done' && t.panel === 'personal').length;
              const totalDone = academicDone + personalDone;
              
              if (activePanel === 'all') {
                return (
                  <div className="flex flex-col">
                    <span>{totalDone}</span>
                    <div className="text-xs text-gray-500 font-normal mt-1">
                      Academic: {academicDone} + Personal: {personalDone}
                    </div>
                  </div>
                );
              } else {
                return (tasks || []).filter(t => t.status === 'done' && t.panel === activePanel).length;
              }
            })()}
          </div>
          <div className="text-sm text-gray-600">Done</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-900">
            {(() => {
              if (activePanel === 'all') {
                const allTasks = (tasks || []);
                const totalTasks = allTasks.length;
                const completedTasks = allTasks.filter(t => t.status === 'done').length;
                return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              } else {
                const panelTasks = (tasks || []).filter(t => t.panel === activePanel);
                return panelTasks.length > 0 ? Math.round((panelTasks.filter(t => t.status === 'done').length / panelTasks.length) * 100) : 0;
              }
            })()}%
          </div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="space-y-4">
          {/* Panel Buttons */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All', icon: Filter },
              { key: 'academic', label: 'Academic', icon: CheckSquare },
              { key: 'personal', label: 'Personal', icon: User }
            ].map(panel => (
              <button
                key={panel.key}
                onClick={() => setActivePanel(panel.key)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activePanel === panel.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <panel.icon className="w-4 h-4" />
                <span>{panel.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Status Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'todo', label: 'To Do' },
                { key: 'in-progress', label: 'In Progress' },
                { key: 'done', label: 'Done' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task Panels */}
      {activePanel === 'all' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Academic Panel */}
          <div className="card">
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-blue-900">Academic Tasks</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {(tasks || []).filter(t => t.panel === 'academic' && (activeTab === 'all' || t.status === activeTab)).length}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {(tasks || []).filter(t => t.panel === 'academic' && (activeTab === 'all' || t.status === activeTab) && 
                ((t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                 (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()))).map(task => (
                <TaskItem key={task._id} task={task} onComplete={handleCompleteTask} onUpdateStatus={handleUpdateTaskStatus} onDelete={deleteTask} onStartTimer={handleStartTimer} />
              ))}
              {(tasks || []).filter(t => t.panel === 'academic' && (activeTab === 'all' || t.status === activeTab) && 
                ((t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                 (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 && (
                <div className="p-8 text-center">
                  <CheckSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500 text-sm">No academic tasks found</p>
                </div>
              )}
            </div>
          </div>

          {/* Personal Panel */}
          <div className="card">
            <div className="p-4 border-b border-gray-200 bg-purple-50">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-purple-900">Personal Tasks</h2>
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                  {(tasks || []).filter(t => t.panel === 'personal' && (activeTab === 'all' || t.status === activeTab)).length}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {(tasks || []).filter(t => t.panel === 'personal' && (activeTab === 'all' || t.status === activeTab) && 
                ((t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                 (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()))).map(task => (
                <TaskItem key={task._id} task={task} onComplete={handleCompleteTask} onUpdateStatus={handleUpdateTaskStatus} onDelete={deleteTask} onStartTimer={handleStartTimer} />
              ))}
              {(tasks || []).filter(t => t.panel === 'personal' && (activeTab === 'all' || t.status === activeTab) && 
                ((t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                 (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 && (
                <div className="p-8 text-center">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500 text-sm">No personal tasks found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Single Panel View */
        <div className="card">
          <div className={`p-4 border-b border-gray-200 ${activePanel === 'academic' ? 'bg-blue-50' : 'bg-purple-50'}`}>
            <div className="flex items-center space-x-2">
              {activePanel === 'academic' ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <User className="w-5 h-5 text-purple-600" />
              )}
              <h2 className={`text-lg font-semibold ${activePanel === 'academic' ? 'text-blue-900' : 'text-purple-900'}`}>
                {activePanel === 'academic' ? 'Academic Tasks' : 'Personal Tasks'}
              </h2>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                activePanel === 'academic' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {filteredTasks.length}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredTasks.map(task => (
              <TaskItem key={task._id} task={task} onComplete={handleCompleteTask} onUpdateStatus={handleUpdateTaskStatus} onDelete={deleteTask} onStartTimer={handleStartTimer} />
            ))}

            {filteredTasks.length === 0 && (
              <div className="p-12 text-center">
                {activePanel === 'academic' ? (
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                ) : (
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                )}
                <h3 className="text-lg font-medium text-gray-900 mb-2">No {activePanel} tasks found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : `Get started by creating your first ${activePanel} task`}
                </p>
                <button
                  onClick={() => {
                    setNewTask({
                      title: '',
                      description: '',
                      priority: 'medium',
                      category: 'other',
                      panel: activePanel === 'all' ? 'personal' : activePanel,
                      dueDate: ''
                    });
                    setShowAddTask(true);
                  }}
                  className="btn-primary"
                >
                  Add Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add New {newTask.panel === 'academic' ? 'Academic' : 'Personal'} Task
            </h2>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Panel <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTask.panel}
                  onChange={(e) => setNewTask({ ...newTask, panel: e.target.value })}
                  className="input"
                  required
                >
                  <option value="personal">📋 Personal</option>
                  <option value="academic">🎓 Academic</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Choose whether this is an academic or personal task</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="input"
                  >
                    <option value="work">Work</option>
                    <option value="study">Study</option>
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;