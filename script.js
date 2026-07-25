'use strict';

const changeBgBtn = document.getElementById('change-bg-btn');
const tasksContainer = document.querySelector('.tasks-container');
const tasksSummary = document.getElementById('tasks-summary');
const addTaskBtn = document.getElementById('add-task-btn');
const clearTasksBtn = document.getElementById('clear-tasks-btn');
const taskInput = document.getElementById('add-task-input');

const bgColors = {
    1: '#0a1410',
    2: '#030303',
    3: '#030303',
    4: '#3a5c3a',
    5: '#4a4038',
    6: '#020202',
    7: '#10240f',
    8: '#6b5b7b',
    9: '#020202',
    10: '#3d1010',
};

let tasks = loadTasks();
let bgId = getBgId();

applyBackground(bgId);
renderTasks();

addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

clearTasksBtn.addEventListener('click', () => {
    if (!tasks.length) return;
    if (!confirm('Clear all tasks? This cannot be undone.')) return;

    tasks = [];
    saveTasks();
    renderTasks();
});

tasksContainer.addEventListener('click', (e) => {
    const checkbox = e.target.closest('input[type="checkbox"]');
    if (checkbox) {
        toggleTask(checkbox.dataset.id);
        return;
    }

    const deleteBtn = e.target.closest('.delete-task-btn');
    if (deleteBtn) {
        removeTask(deleteBtn.dataset.id);
    }
});

changeBgBtn.addEventListener('click', () => {
    bgId = bgId >= 10 ? 1 : bgId + 1;
    localStorage.setItem('bgId', bgId);
    applyBackground(bgId);
});

function addTask() {
    const name = taskInput.value.trim();
    if (!name) return;

    tasks.push({ id: generateId(), name, isDone: false });
    saveTasks();
    taskInput.value = '';
    taskInput.focus();
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    task.isDone = !task.isDone;
    saveTasks();
    updateSummary();
}

function removeTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
}

function loadTasks() {
    const raw = localStorage.getItem('tasks');
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function generateId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getBgId() {
    const stored = +localStorage.getItem('bgId');
    return stored >= 1 && stored <= 10 ? stored : 1;
}

function applyBackground(id) {
    document.body.style.backgroundImage = `url("./backgrounds/${id}.jpg")`;
    document.body.style.backgroundColor = bgColors[id] || '#030b0d';
}

function renderTasks() {
    tasksContainer.innerHTML = '';

    if (!tasks.length) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'No tasks yet — add one below';
        tasksContainer.appendChild(emptyState);
        updateSummary();
        return;
    }

    for (const task of tasks) {
        tasksContainer.appendChild(createTaskElement(task));
    }

    updateSummary();
}

function createTaskElement(task) {
    const li = document.createElement('li');

    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-wrapper';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `task-checkbox-${task.id}`;
    checkbox.checked = task.isDone;
    checkbox.dataset.id = task.id;

    const box = document.createElement('span');
    box.className = 'box';
    box.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5L6.5 12L13 4"/></svg>';

    const label = document.createElement('label');
    label.setAttribute('for', checkbox.id);
    label.textContent = task.name;

    wrapper.append(checkbox, box, label);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-task-btn';
    deleteBtn.dataset.id = task.id;
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

    li.append(wrapper, deleteBtn);
    return li;
}

function updateSummary() {
    if (!tasks.length) {
        tasksSummary.textContent = '';
        return;
    }

    const remaining = tasks.filter((t) => !t.isDone).length;
    tasksSummary.textContent = remaining === 0
        ? 'All tasks done'
        : `${remaining} of ${tasks.length} left`;
}
