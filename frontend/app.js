// API Base URL - proxied through Nginx
const API_URL = '/api/students';

// DOM Elements
const studentForm = document.getElementById('studentForm');
const editForm = document.getElementById('editForm');
const studentsTableBody = document.getElementById('studentsTableBody');
const studentCount = document.getElementById('studentCount');
const messageBox = document.getElementById('messageBox');
const editModal = document.getElementById('editModal');

// Load students when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
});

// Show message to user
function showMessage(message, type = 'success') {
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 5000);
}

// Fetch and display all students
async function loadStudents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const students = data.students || [];

        // Update count
        studentCount.textContent = `${students.length} student${students.length !== 1 ? 's' : ''}`;

        // Clear table
        studentsTableBody.innerHTML = '';

        // Populate table
        if (students.length === 0) {
            studentsTableBody.innerHTML = '<tr><td colspan="7" class="empty">No students found. Add your first student above!</td></tr>';
        } else {
            students.forEach(student => {
                const row = createStudentRow(student);
                studentsTableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading students:', error);
        studentsTableBody.innerHTML = '<tr><td colspan="7" class="error">Failed to load students. Please check if the API is running.</td></tr>';
        showMessage('Failed to load students. Please try again.', 'error');
    }
}

// Create table row for a student
function createStudentRow(student) {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${student.id}</td>
        <td>${escapeHtml(student.name)}</td>
        <td>${student.age}</td>
        <td>${escapeHtml(student.father_name)}</td>
        <td>${student.aadhaar_number}</td>
        <td>${escapeHtml(student.class)}</td>
        <td>
            <div class="actions">
                <button class="btn btn-edit" onclick="openEditModal(${student.id}, '${escapeHtml(student.name)}', ${student.age}, '${escapeHtml(student.father_name)}', '${student.aadhaar_number}', '${escapeHtml(student.class)}')">Edit</button>
                <button class="btn btn-delete" onclick="deleteStudent(${student.id}, '${escapeHtml(student.name)}')">Delete</button>
            </div>
        </td>
    `;

    return row;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle add student form submission
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(studentForm);
    const studentData = {
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        father_name: formData.get('father_name'),
        aadhaar_number: formData.get('aadhaar_number'),
        class: formData.get('class')
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to add student');
        }

        showMessage(`Student "${studentData.name}" added successfully!`, 'success');
        studentForm.reset();
        loadStudents();
    } catch (error) {
        console.error('Error adding student:', error);
        showMessage(error.message, 'error');
    }
});

// Open edit modal
function openEditModal(id, name, age, fatherName, aadhaar, studentClass) {
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editAge').value = age;
    document.getElementById('editFatherName').value = fatherName;
    document.getElementById('editAadhaar').value = aadhaar;
    document.getElementById('editClass').value = studentClass;

    editModal.classList.remove('hidden');
}

// Close edit modal
function closeEditModal() {
    editModal.classList.add('hidden');
    editForm.reset();
}

// Handle edit form submission
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const studentData = {
        name: document.getElementById('editName').value,
        age: parseInt(document.getElementById('editAge').value),
        father_name: document.getElementById('editFatherName').value,
        aadhaar_number: document.getElementById('editAadhaar').value,
        class: document.getElementById('editClass').value
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to update student');
        }

        showMessage(`Student "${studentData.name}" updated successfully!`, 'success');
        closeEditModal();
        loadStudents();
    } catch (error) {
        console.error('Error updating student:', error);
        showMessage(error.message, 'error');
    }
});

// Delete student
async function deleteStudent(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete student');
        }

        showMessage(`Student "${name}" deleted successfully!`, 'success');
        loadStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
        showMessage(error.message, 'error');
    }
}

// Close modal when clicking outside
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeEditModal();
    }
});
