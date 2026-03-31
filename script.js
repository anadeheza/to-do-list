const input = document.getElementById('task-input');
const tagInput = document.getElementById('tag-input');
const searchInput = document.getElementById('search-input');
const tagFilter = document.getElementById('tag-filter');
const tasksList = document.querySelector('.tasks');

function saveTasks() {
    const tasks = [];
    tasksList.querySelectorAll('li').forEach(li => {
        const textSpan = li.querySelector('.task-text');
        const tagSpan = li.querySelector('.task-tag');
        tasks.push({
            text: textSpan ? textSpan.textContent.trim() : '',
            tag: tagSpan ? tagSpan.textContent.trim() : '',
            done: li.classList.contains('checked')
        });
    });
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function renderTask(task) {
    const li = document.createElement('li');
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    li.appendChild(textSpan);
    if (task.tag) {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'task-tag';
        tagSpan.textContent = task.tag;
        li.appendChild(tagSpan);
    }
    if (task.done) {
        li.classList.add('checked');
    }

    const clearBtn = document.createElement('span');
    clearBtn.textContent = '✕';
    clearBtn.className = 'clearBtn';
    clearBtn.title = 'Remove task';
    clearBtn.onclick = (e) => {
        e.stopPropagation();
        li.remove();
        saveTasks();
    };

    li.onclick = () => {
        li.classList.toggle('checked');
        saveTasks();
    };

    li.appendChild(clearBtn);
    tasksList.appendChild(li);
}

function loadTasks() {
    const json = localStorage.getItem('todoTasks');
    if (!json) return;
    let tasks = [];
    try {
        tasks = JSON.parse(json);
        if (!Array.isArray(tasks)) throw new Error('Invalid tasks format');
    } catch (e) {
        console.warn('Could not parse saved to-do tasks:', e);
        return;
    }
    tasksList.innerHTML = '';
    tasks.forEach(renderTask);
    updateTagFilter();
}

function newTask() {
    const text = input.value.trim();
    const tag = tagInput.value.trim();
    if (text === '') {
        alert('Please enter a task.');
        input.focus();
        return;
    }
    renderTask({ text, tag, done: false });
    saveTasks();
    updateTagFilter();
    input.value = '';
    tagInput.value = '';
    input.focus();
}

function clearTasks() {
    if (!tasksList.children.length) return;
    if (!confirm('Delete all tasks?')) return;
    tasksList.innerHTML = '';
    localStorage.removeItem('todoTasks');
    updateTagFilter();
}

function updateTagFilter() {
    const tags = new Set();
    tasksList.querySelectorAll('li').forEach(li => {
        const tagSpan = li.querySelector('.task-tag');
        if (tagSpan && tagSpan.textContent.trim()) {
            tags.add(tagSpan.textContent.trim());
        }
    });
    const sortedTags = Array.from(tags).sort();
    tagFilter.innerHTML = '<option value="">All tags</option>';
    sortedTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });
}

function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedTag = tagFilter.value.toLowerCase();
    tasksList.querySelectorAll('li').forEach(li => {
        const text = li.querySelector('.task-text').textContent.toLowerCase();
        const tag = li.querySelector('.task-tag') ? li.querySelector('.task-tag').textContent.toLowerCase() : '';
        const matchesSearch = text.includes(searchTerm) || tag.includes(searchTerm);
        const matchesTag = !selectedTag || tag === selectedTag;
        li.style.display = (matchesSearch && matchesTag) ? '' : 'none';
    });
}

input.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        newTask();
    }
});

tagInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        newTask();
    }
});

searchInput.addEventListener('input', filterTasks);

tagFilter.addEventListener('change', filterTasks);