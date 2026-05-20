/**
 * SPDWP TO-DO LIST APPLICATION
 * Complete JavaScript with Local Storage Functionality
 * 
 * Features:
 * - Add, edit, delete tasks
 * - Mark tasks as complete
 * - Priority levels (Low, Medium, High)
 * - Filter tasks
 * - Statistics dashboard
 * - Auto-save to local storage
 * - Export tasks as JSON
 */

class TodoApp {
    /**
     * Initialize the Todo App
     */
    constructor() {
        this.storageKey = 'spdwp_todos';
        this.currentFilter = 'all';
        this.tasks = [];
        this.editingId = null;

        // DOM Elements
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.addBtn = document.getElementById('addBtn');
        this.tasksList = document.getElementById('tasksList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.exportBtn = document.getElementById('exportBtn');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');

        // Statistics elements
        this.totalCount = document.getElementById('totalCount');
        this.completedCount = document.getElementById('completedCount');
        this.remainingCount = document.getElementById('remainingCount');
        this.progressFill = document.getElementById('progressFill');
        this.progressPercent = document.getElementById('progressPercent');

        this.init();
    }

    /**
     * Initialize the app
     */
    init() {
        this.loadTasks();
        this.attachEventListeners();
        this.render();
        console.log('📋 Todo App Initialized');
        console.log(`✅ ${this.tasks.length} tasks loaded from local storage`);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Add task
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter tasks
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Action buttons
        this.exportBtn.addEventListener('click', () => this.exportTasks());
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
    }

    /**
     * Add a new task
     */
    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) {
            alert('Please enter a task description');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            priority: this.prioritySelect.value,
            completed: false,
            createdAt: new Date().toLocaleDateString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.taskInput.value = '';
        this.prioritySelect.value = 'medium';
        this.render();
        console.log(`✅ Task added: "${text}"`);
    }

    /**
     * Delete a task
     */
    deleteTask(id) {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex > -1) {
            const taskText = this.tasks[taskIndex].text;
            this.tasks.splice(taskIndex, 1);
            this.saveTasks();
            this.render();
            console.log(`🗑️ Task deleted: "${taskText}"`);
        }
    }

    /**
     * Toggle task completion
     */
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            const status = task.completed ? '✅' : '⬜';
            console.log(`${status} Task toggled: "${task.text}"`);
        }
    }

    /**
     * Edit a task
     */
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            this.saveTasks();
            this.render();
            console.log(`✏️ Task edited: "${newText}"`);
        }
    }

    /**
     * Clear all completed tasks
     */
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear');
            return;
        }

        if (confirm(`Clear ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
            console.log(`🗑️ Cleared ${completedCount} completed tasks`);
        }
    }

    /**
     * Clear all tasks
     */
    clearAll() {
        if (this.tasks.length === 0) {
            alert('No tasks to clear');
            return;
        }

        if (confirm(`Delete ALL ${this.tasks.length} tasks? This cannot be undone!`)) {
            this.tasks = [];
            this.saveTasks();
            this.render();
            console.log('⚠️ All tasks cleared');
        }
    }

    /**
     * Export tasks as JSON
     */
    exportTasks() {
        if (this.tasks.length === 0) {
            alert('No tasks to export');
            return;
        }

        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `spdwp-todos-${date}.json`;
        link.click();
        URL.revokeObjectURL(url);
        console.log(`📥 Tasks exported as spdwp-todos-${date}.json`);
    }

    /**
     * Get filtered tasks
     */
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            case 'high':
                return this.tasks.filter(t => t.priority === 'high');
            case 'medium':
                return this.tasks.filter(t => t.priority === 'medium');
            case 'low':
                return this.tasks.filter(t => t.priority === 'low');
            default:
                return this.tasks;
        }
    }

    /**
     * Update statistics
     */
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const remaining = total - completed;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        this.totalCount.textContent = total;
        this.completedCount.textContent = completed;
        this.remainingCount.textContent = remaining;
        this.progressFill.style.width = percentage + '%';
        this.progressPercent.textContent = percentage + '%';
    }

    /**
     * Render all tasks
     */
    render() {
        const filteredTasks = this.getFilteredTasks();
        this.tasksList.innerHTML = '';

        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';

            let message = '';
            switch (this.currentFilter) {
                case 'active':
                    message = '✨ All tasks completed! Great job!';
                    break;
                case 'completed':
                    message = '📋 No completed tasks yet.';
                    break;
                case 'high':
                    message = '🎯 No high priority tasks.';
                    break;
                case 'medium':
                    message = '📌 No medium priority tasks.';
                    break;
                case 'low':
                    message = '🟢 No low priority tasks.';
                    break;
                default:
                    message = '✨ No tasks yet! Add one to get started.';
            }

            emptyState.innerHTML = `<p>${message}</p>`;
            this.tasksList.appendChild(emptyState);
        } else {
            filteredTasks.forEach(task => {
                const taskElement = this.createTaskElement(task);
                this.tasksList.appendChild(taskElement);
            });
        }

        this.updateStats();
    }

    /**
     * Create a task element
     */
    createTaskElement(task) {
        const template = document.getElementById('taskTemplate');
        const element = template.content.cloneNode(true);

        const taskItem = element.querySelector('.task-item');
        const checkbox = element.querySelector('.task-checkbox');
        const taskText = element.querySelector('.task-text');
        const taskDate = element.querySelector('.task-date');
        const taskPriority = element.querySelector('.task-priority');
        const editBtn = element.querySelector('.btn-edit');
        const deleteBtn = element.querySelector('.btn-delete');

        // Set task data
        checkbox.checked = task.completed;
        taskText.textContent = task.text;
        taskDate.textContent = `Created: ${task.createdAt}`;
        taskPriority.textContent = task.priority.toUpperCase();
        taskPriority.className = `task-priority ${task.priority}`;

        if (task.completed) {
            taskItem.classList.add('completed');
        }

        // Event listeners
        checkbox.addEventListener('change', () => this.toggleTask(task.id));
        editBtn.addEventListener('click', () => this.editTask(task.id));
        deleteBtn.addEventListener('click', () => {
            taskItem.classList.add('deleting');
            setTimeout(() => this.deleteTask(task.id), 300);
        });

        return element;
    }

    /**
     * Save tasks to local storage
     */
    saveTasks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
            console.log(`💾 Saved ${this.tasks.length} tasks to local storage`);
        } catch (error) {
            console.error('❌ Error saving to local storage:', error);
            alert('Failed to save tasks. Your browser may have limited storage.');
        }
    }

    /**
     * Load tasks from local storage
     */
    loadTasks() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.tasks = stored ? JSON.parse(stored) : [];
            console.log(`📂 Loaded ${this.tasks.length} tasks from local storage`);
        } catch (error) {
            console.error('❌ Error loading from local storage:', error);
            this.tasks = [];
        }
    }
}

/**
 * Initialize app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

/**
 * Console messages for debugging
 */
console.log('%c📋 SPDWP TO-DO LIST', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('%cLocal Storage Features:', 'color: #764ba2; font-weight: bold;');
console.log('✅ Auto-save enabled - Every change is saved');
console.log('✅ Persistent storage - Your tasks survive browser restart');
console.log('✅ No server needed - Everything stays on your device');
console.log('✅ Export available - Backup your tasks as JSON');
console.log('%cStorage Info:', 'color: #667eea; font-weight: bold;');
console.log(`Storage Key: ${new TodoApp().storageKey}`);
console.log('Open DevTools > Application > Local Storage to view data');
