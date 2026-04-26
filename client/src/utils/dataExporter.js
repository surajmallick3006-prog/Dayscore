// Data Exporter Utility for Task and Productivity Data
import { format } from 'date-fns';

class DataExporter {
  constructor(tasks = [], timeLogs = []) {
    this.tasks = tasks;
    this.timeLogs = timeLogs;
    this.exportDate = new Date();
  }

  // Get current task statistics
  getTaskStatistics() {
    const stats = {
      total: this.tasks.length,
      byStatus: {
        todo: this.tasks.filter(t => t.status === 'todo').length,
        inProgress: this.tasks.filter(t => t.status === 'in-progress').length,
        done: this.tasks.filter(t => t.status === 'done').length
      },
      byPanel: {
        academic: this.tasks.filter(t => t.panel === 'academic').length,
        personal: this.tasks.filter(t => t.panel === 'personal').length
      },
      byPriority: {
        urgent: this.tasks.filter(t => t.priority === 'urgent').length,
        high: this.tasks.filter(t => t.priority === 'high').length,
        medium: this.tasks.filter(t => t.priority === 'medium').length,
        low: this.tasks.filter(t => t.priority === 'low').length
      },
      completionRate: this.tasks.length > 0 ? 
        Math.round((this.tasks.filter(t => t.status === 'done').length / this.tasks.length) * 100) : 0
    };

    return stats;
  }

  // Get productivity metrics
  getProductivityMetrics() {
    const today = new Date().toDateString();
    const todayLogs = this.timeLogs.filter(log => {
      try {
        const dateValue = log.startTime || log.createdAt || log.date;
        if (!dateValue) return false;
        const logDate = new Date(dateValue);
        if (isNaN(logDate.getTime())) return false;
        return logDate.toDateString() === today;
      } catch (error) {
        return false;
      }
    });

    const studyTime = todayLogs
      .filter(log => log.type === 'study')
      .reduce((total, log) => total + (log.duration || 0), 0);

    const workTime = todayLogs
      .filter(log => log.type === 'work')
      .reduce((total, log) => total + (log.duration || 0), 0);

    const entertainmentTime = todayLogs
      .filter(log => log.type === 'entertainment')
      .reduce((total, log) => total + (log.duration || 0), 0);

    return {
      todayTimeTracking: {
        study: studyTime,
        work: workTime,
        entertainment: entertainmentTime,
        total: studyTime + workTime + entertainmentTime
      },
      totalSessions: todayLogs.length,
      averageSessionLength: todayLogs.length > 0 ? 
        Math.round((studyTime + workTime + entertainmentTime) / todayLogs.length) : 0
    };
  }

  // Export as JSON
  exportAsJSON() {
    const data = {
      exportInfo: {
        timestamp: this.exportDate.toISOString(),
        date: format(this.exportDate, 'yyyy-MM-dd HH:mm:ss'),
        version: '1.0'
      },
      taskStatistics: this.getTaskStatistics(),
      productivityMetrics: this.getProductivityMetrics(),
      rawData: {
        tasks: this.tasks.map(task => ({
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          category: task.category,
          panel: task.panel,
          dueDate: task.dueDate,
          completedAt: task.completedAt,
          estimatedTime: task.estimatedTime,
          actualTime: task.actualTime,
          scoreImpact: task.scoreImpact,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        })),
        timeLogs: this.timeLogs.map(log => ({
          id: log._id,
          type: log.type,
          duration: log.duration,
          description: log.description,
          startTime: log.startTime,
          createdAt: log.createdAt,
          focusQuality: log.focusQuality,
          productivityRating: log.productivityRating
        }))
      }
    };

    return JSON.stringify(data, null, 2);
  }

  // Export as CSV (Tasks)
  exportTasksAsCSV() {
    if (this.tasks.length === 0) return 'No tasks to export';

    const headers = [
      'ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 
      'Panel', 'Due Date', 'Completed At', 'Estimated Time (min)', 
      'Actual Time (min)', 'Score Impact', 'Created At', 'Updated At'
    ];

    const csvRows = [
      headers.join(','),
      ...this.tasks.map(task => [
        task._id || '',
        `"${(task.title || '').replace(/"/g, '""')}"`,
        `"${(task.description || '').replace(/"/g, '""')}"`,
        task.status || '',
        task.priority || '',
        task.category || '',
        task.panel || '',
        task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        task.completedAt ? format(new Date(task.completedAt), 'yyyy-MM-dd HH:mm:ss') : '',
        task.estimatedTime || 0,
        task.actualTime || 0,
        task.scoreImpact || 0,
        task.createdAt ? format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
        task.updatedAt ? format(new Date(task.updatedAt), 'yyyy-MM-dd HH:mm:ss') : ''
      ].join(','))
    ];

    return csvRows.join('\n');
  }

  // Export as CSV (Time Logs)
  exportTimeLogsAsCSV() {
    if (this.timeLogs.length === 0) return 'No time logs to export';

    const headers = [
      'ID', 'Type', 'Duration (min)', 'Description', 'Start Time', 
      'Created At', 'Focus Quality', 'Productivity Rating'
    ];

    const csvRows = [
      headers.join(','),
      ...this.timeLogs.map(log => [
        log._id || '',
        log.type || '',
        log.duration || 0,
        `"${(log.description || '').replace(/"/g, '""')}"`,
        log.startTime ? format(new Date(log.startTime), 'yyyy-MM-dd HH:mm:ss') : '',
        log.createdAt ? format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
        log.focusQuality || 0,
        log.productivityRating || 0
      ].join(','))
    ];

    return csvRows.join('\n');
  }

  // Export as Markdown Report
  exportAsMarkdown() {
    const stats = this.getTaskStatistics();
    const productivity = this.getProductivityMetrics();

    return `# Task & Productivity Report

**Generated:** ${format(this.exportDate, 'MMMM dd, yyyy \'at\' HH:mm:ss')}

## 📊 Task Statistics

### Overview
- **Total Tasks:** ${stats.total}
- **Completion Rate:** ${stats.completionRate}%

### By Status
- **To Do:** ${stats.byStatus.todo} (${stats.total > 0 ? Math.round((stats.byStatus.todo / stats.total) * 100) : 0}%)
- **In Progress:** ${stats.byStatus.inProgress} (${stats.total > 0 ? Math.round((stats.byStatus.inProgress / stats.total) * 100) : 0}%)
- **Done:** ${stats.byStatus.done} (${stats.total > 0 ? Math.round((stats.byStatus.done / stats.total) * 100) : 0}%)

### By Panel
- **Academic:** ${stats.byPanel.academic}
- **Personal:** ${stats.byPanel.personal}

### By Priority
- **Urgent:** ${stats.byPriority.urgent}
- **High:** ${stats.byPriority.high}
- **Medium:** ${stats.byPriority.medium}
- **Low:** ${stats.byPriority.low}

## ⏱️ Productivity Metrics (Today)

### Time Tracking
- **Study Time:** ${this.formatMinutes(productivity.todayTimeTracking.study)}
- **Work Time:** ${this.formatMinutes(productivity.todayTimeTracking.work)}
- **Entertainment Time:** ${this.formatMinutes(productivity.todayTimeTracking.entertainment)}
- **Total Time:** ${this.formatMinutes(productivity.todayTimeTracking.total)}

### Session Statistics
- **Total Sessions:** ${productivity.totalSessions}
- **Average Session Length:** ${this.formatMinutes(productivity.averageSessionLength)}

## 📋 Task Details

${this.tasks.length > 0 ? this.tasks.map(task => `
### ${task.title || 'Untitled Task'}
- **Status:** ${task.status || 'unknown'}
- **Priority:** ${task.priority || 'medium'}
- **Panel:** ${task.panel || 'personal'}
- **Category:** ${task.category || 'other'}
${task.description ? `- **Description:** ${task.description}` : ''}
${task.dueDate ? `- **Due Date:** ${format(new Date(task.dueDate), 'MMMM dd, yyyy')}` : ''}
${task.estimatedTime ? `- **Estimated Time:** ${this.formatMinutes(task.estimatedTime)}` : ''}
${task.actualTime ? `- **Actual Time:** ${this.formatMinutes(task.actualTime)}` : ''}
`).join('\n') : 'No tasks available.'}

---
*Report generated by Task & Productivity Tracker*
`;
  }

  // Helper method to format minutes
  formatMinutes(minutes) {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  // Download file helper
  static downloadFile(content, filename, contentType = 'text/plain') {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Send data to console (for debugging)
  logToConsole() {
    console.group('📊 Task & Productivity Data Export');
    console.log('Task Statistics:', this.getTaskStatistics());
    console.log('Productivity Metrics:', this.getProductivityMetrics());
    console.log('Raw Tasks:', this.tasks);
    console.log('Raw Time Logs:', this.timeLogs);
    console.groupEnd();
  }

  // Send data via email (requires backend integration)
  async sendViaEmail(emailAddress, format = 'json') {
    // This would require backend integration
    console.log(`Would send ${format} data to ${emailAddress}`);
    throw new Error('Email integration not implemented yet');
  }

  // Copy to clipboard
  async copyToClipboard(format = 'json') {
    let content;
    switch (format) {
      case 'json':
        content = this.exportAsJSON();
        break;
      case 'markdown':
        content = this.exportAsMarkdown();
        break;
      case 'csv-tasks':
        content = this.exportTasksAsCSV();
        break;
      case 'csv-timelogs':
        content = this.exportTimeLogsAsCSV();
        break;
      default:
        content = this.exportAsJSON();
    }

    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}

export default DataExporter;