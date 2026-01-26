import React from 'react';
import { CheckSquare, User, Plus } from 'lucide-react';
import { format } from 'date-fns';

const TaskSummary = ({ tasks = [] }) => {
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'done');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const TaskItem = ({ task }) => (
    <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {task.title}
        </p>
        {task.dueDate && (
          <p className="text-xs text-gray-500">
            Due {format(new Date(task.dueDate), 'MMM d')}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-1">
        {task.assignee && (
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-gray-600" />
          </div>
        )}
        <CheckSquare className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">Task Assignments</h3>
        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{todoTasks.length}</div>
          <div className="text-xs text-gray-500">To Do</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{inProgressTasks.length}</div>
          <div className="text-xs text-gray-500">In Progress</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
          <div className="text-xs text-gray-500">Done</div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Tasks</h4>
        {tasks.slice(0, 5).map(task => (
          <TaskItem key={task._id} task={task} />
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs">Add your first task to get started</p>
          </div>
        )}
      </div>

      {/* Completion Progress */}
      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Today's Progress</span>
            <span>{Math.round((completedTasks.length / tasks.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedTasks.length / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSummary;