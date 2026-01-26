import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, CheckSquare, Clock, User } from 'lucide-react';
import { useData } from '../context/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';

// TaskItem Component
const TaskItem = ({ task, onComplete, onUpdateStatus, onDelete }) => {
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
      case 'todo': return 'text-blue-600 bg-blue-50';
      case 'in-progress': return 'text-orange-600 bg-orange-50';
      case 'done': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3">
        {/* Priority Indicator */}
        <div className={`w-3 h-3 rounded-full mt-2 ${getPriorityColor(task.priority)}`} />
        
        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-gray-600 text-sm mb-2">
                  {task.description}
                </p>
              )}
              
              {/* Task Meta */}
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                {task.dueDate && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>
                  </div>
                )}
                <span className="capitalize">{task.category}</span>
                <span className="capitalize">{task.priority}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                {task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 mt-2">
            {task.status !== 'done' && (
              <button
                onClick={() => onComplete(task._id)}
                className="text-green-600 hover:text-green-700 text-xs font-medium"
              >
                Complete
              </button>
            )}
            
            {task.status === 'todo' && (
              <button
                onClick={() => onUpdateStatus(task._id, 'in-progress')}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
              >
                Start
              </button>
            )}
            
            <button className="text-gray-400 hover:text-gray-600 text-xs font-medium">
              Edit
            </button>
            <button 
              onClick={() => onDelete(task._id)}
              className="text-red-400 hover:text-red-600 text-xs font-medium"
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
            {tasks.filter(t => t.status === 'todo' && (activePanel === 'all' || t.panel === activePanel)).length}
          </div>
          <div className="text-sm text-gray-600">To Do</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-orange-600">
            {tasks.filter(t => t.status === 'in-progress' && (activePanel === 'all' || t.panel === activePanel)).length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-600">
            {tasks.filter(t => t.status === 'done' && (activePanel === 'all' || t.panel === activePanel)).length}
          </div>
          <div className="text-sm text-gray-600">Done</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-900">
            {(() => {
              const panelTasks = tasks.filter(t => activePanel === 'all' || t.panel === activePanel);
              return panelTasks.length > 0 ? Math.round((panelTasks.filter(t => t.status === 'done').length / panelTasks.length) * 100) : 0;
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
                  {tasks.filter(t => t.panel === 'academic' && (activeTab === 'all' || t.status === activeTab)).length}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {tasks.filter(t => t.panel === 'academic' && (activeTab === 'all' || t.status === activeTab) && 
                (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 t.description?.toLowerCase().includes(searchTerm.toLowerCase()))).map(task => (
                <TaskItem key={task._id} task={task} onComplete={handleCompleteTask} onUpdateStatus={handleUpdateTaskStatus} onDelete={deleteTask} />
              ))}
              {tasks.filter(t => t.panel === 'academic' && (activeTab === 'all' || t.status === activeTab) && 
                (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 t.description?.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 && (
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
                  {tasks.filter(t => t.panel === 'personal' && (activeTab === 'all' || t.status === activeTab)).length}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {tasks.filter(t => t.panel === 'personal' && (activeTab === 'all' || t.status === activeTab) && 
                (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 t.description?.toLowerCase().includes(searchTerm.toLowerCase()))).map(task => (
                <TaskItem key={task._id} task={task} onComplete={handleCompleteTask} onUpdateStatus={handleUpdateTaskStatus} onDelete={deleteTask} />
              ))}
              {tasks.filter(t => t.panel === 'personal' && (activeTab === 'all' || t.status === activeTab) && 
                (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 t.description?.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 && (
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
              <TaskItem key={task._id} task={task} onComplete={handleCompleteTask} onUpdateStatus={handleUpdateTaskStatus} onDelete={deleteTask} />
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