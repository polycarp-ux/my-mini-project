// Task Management Specific JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const taskModal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const closeButtons = document.querySelectorAll('.close');
    const addTaskButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .add-task-btn');

    const todoTasksContainer = document.getElementById('todo-tasks');
    const progressTasksContainer = document.getElementById('progress-tasks');
    const completedTasksContainer = document.getElementById('completed-tasks');

    function openModal() {
        taskModal.style.display = 'block';
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('taskDueDate').value = today;
    }

    function closeModal() {
        taskModal.style.display = 'none';
        taskForm.reset();
    }

    addTaskButtons.forEach(button => {
        button.addEventListener('click', openModal);
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    window.addEventListener('click', (event) => {
        if (event.target == taskModal) {
            closeModal();
        }
    });

    function renderTask(task) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.setAttribute('draggable', 'true');
        taskCard.dataset.taskId = task.id;
        taskCard.dataset.taskStatus = task.status;

        let priorityClass = '';
        if (task.priority === 'high') priorityClass = 'high';
        else if (task.priority === 'medium') priorityClass = 'medium';
        else if (task.priority === 'low') priorityClass = 'low';

        const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';

        taskCard.innerHTML = `
            <div class="task-card-header">
                <span class="task-priority ${priorityClass}">${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'N/A'}</span>
                <span class="task-date">Due: ${dueDate}</span>
            </div>
            <h4 class="task-title">${task.title}</h4>
            <p class="task-desc">${task.description || ''}</p>
            <div class="task-footer">
                <div class="task-assignee">
                    <img src="https://randomuser.me/api/portraits/men/99.jpg" alt="${task.assigned_to || 'Unassigned'}">
                    <span>${task.assigned_to || 'Unassigned'}</span>
                </div>
                <div class="task-actions">
                    <button class="task-btn edit-task-btn" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn complete-task-btn" title="Complete">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="task-btn delete-task-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        return taskCard;
    }

    async function fetchAndDisplayTasks() {
        try {
            const response = await fetch('http://localhost:3000/api/tasks');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // The backend now returns the array directly, so we don't need `data.tasks`.
            const tasks = await response.json();

            todoTasksContainer.innerHTML = '';
            progressTasksContainer.innerHTML = '';
            completedTasksContainer.innerHTML = '';

            tasks.forEach(task => {
                const taskCard = renderTask(task);
                if (task.status === 'todo') {
                    todoTasksContainer.appendChild(taskCard);
                } else if (task.status === 'in_progress') {
                    progressTasksContainer.appendChild(taskCard);
                } else if (task.status === 'completed') {
                    completedTasksContainer.appendChild(taskCard);
                }
            });

            updateTaskCounts();

        } catch (error) {
            console.error('Error fetching tasks:', error);
            alert('Failed to load tasks. Please ensure your backend is running and reachable.');
        }
    }

    function updateTaskCounts() {
        document.querySelector('#todo-tasks').previousElementSibling.querySelector('.task-count').textContent = todoTasksContainer.children.length;
        document.querySelector('#progress-tasks').previousElementSibling.querySelector('.task-count').textContent = progressTasksContainer.children.length;
        document.querySelector('#completed-tasks').previousElementSibling.querySelector('.task-count').textContent = completedTasksContainer.children.length;
    }

    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            due_date: document.getElementById('taskDueDate').value || null,
            priority: document.getElementById('taskPriority').value,
            status: 'todo',
            assigned_to: document.getElementById('taskAssignedTo').value || null,
            category: document.getElementById('taskCategory').value
        };

        try {
            const response = await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });

            const result = await response.json();

            if (response.ok) {
                // The backend now returns the new task data, not a message
                alert('Task created successfully!');
                closeModal();
                fetchAndDisplayTasks();
            } else {
                alert(`Failed to create task: ${result.error}`);
                console.error('Backend error:', result.error);
            }
        } catch (error) {
            console.error('Error submitting task:', error);
            alert('An error occurred while creating the task. Please check your backend server.');
        }
    });

    fetchAndDisplayTasks();

    const tasks = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.task-list');

    function addDragDropListeners() {
        document.querySelectorAll('.task-card').forEach(task => {
            task.addEventListener('dragstart', dragStart);
            task.addEventListener('dragend', dragEnd);
        });
        columns.forEach(column => {
            column.addEventListener('dragover', dragOver);
            column.addEventListener('dragenter', dragEnter);
            column.addEventListener('dragleave', dragLeave);
            column.addEventListener('drop', dragDrop);
        });
    }

    let draggedTask = null;

    function dragStart() {
        draggedTask = this;
        setTimeout(() => {
            this.style.opacity = '0.5';
        }, 0);
    }

    function dragEnd() {
        this.style.opacity = '1';
        draggedTask = null;
    }

    function dragOver(e) {
        e.preventDefault();
        if (this.classList.contains('task-list')) {
            this.style.backgroundColor = 'rgba(108, 99, 255, 0.1)';
        }
    }

    function dragEnter(e) {
        e.preventDefault();
        if (this.classList.contains('task-list')) {
            this.style.backgroundColor = 'rgba(108, 99, 255, 0.1)';
        }
    }

    function dragLeave() {
        if (this.classList.contains('task-list')) {
            this.style.backgroundColor = 'transparent';
        }
    }

    async function dragDrop() {
        if (this.classList.contains('task-list')) {
            this.style.backgroundColor = 'transparent';
            this.appendChild(draggedTask);

            let newStatus;
            if (this.id === 'todo-tasks') {
                newStatus = 'todo';
            } else if (this.id === 'progress-tasks') {
                newStatus = 'in_progress';
            } else if (this.id === 'completed-tasks') {
                newStatus = 'completed';
            }

            try {
                const response = await fetch(`http://localhost:3000/api/tasks/${draggedTask.dataset.taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) {
                    throw new Error('Failed to update task status.');
                }
                draggedTask.dataset.taskStatus = newStatus;
                updateTaskCounts();
            } catch (error) {
                console.error('Error updating task status:', error);
                alert('Failed to update task status on the server. Please check your backend.');
            }
        }
    }

    addDragDropListeners();

    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
});