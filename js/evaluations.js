// Global evaluations array
let evaluations = [];
let evaluators = [];
let currentUser = null;

// Get API endpoints from config
const { API_ENDPOINTS, getAuthHeader } = window;

// Function to initialize user data
async function initializeUserData() {
    currentUser = await userContext.getCurrentUser();
    if (!currentUser) return;

    // Update user name in navbar
    const userNameElements = document.querySelectorAll('#currentUserName');
    userNameElements.forEach(el => {
        if (el) {
            el.textContent = currentUser.name || currentUser.email;
        }
    });

    // Show/hide elements based on user role
    const isAdmin = currentUser.role === 'admin';
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
    });

    // Fetch evaluators for all users
    await fetchEvaluators();

    // Set minimum date for due date field
    const dueDateField = document.querySelector('[name="dueDate"]');
    if (dueDateField) {
        const today = new Date().toISOString().split('T')[0];
        dueDateField.min = today;
        dueDateField.value = today;
    }

    // Initialize modal
    const newEvaluationModal = document.getElementById('newEvaluationModal');
    if (newEvaluationModal) {
        const modal = new bootstrap.Modal(newEvaluationModal);
        
        // Add button click handler
        const newEvalButton = document.querySelector('[data-bs-target="#newEvaluationModal"]');
        if (newEvalButton) {
            newEvalButton.addEventListener('click', () => {
                const form = document.getElementById('evaluationForm');
                if (form) {
                    resetForm(form);
                    modal.show();
                }
            });
        }
    }
}

// Function to fetch evaluators
async function fetchEvaluators() {
    if (!userContext.requireAuth()) return;

    try {
        const response = await fetch(`${API_ENDPOINTS.USERS_EVALUATORS}`, {
            headers: {
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch evaluators');
        }

        evaluators = await response.json();
        populateEvaluatorSelect();
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Failed to fetch evaluators');
    }
}

// Function to populate evaluator select
function populateEvaluatorSelect() {
    const select = document.querySelector('[name="assignedTo"]');
    if (!select) return;

    select.innerHTML = '<option value="">Select Evaluator</option>';
    evaluators.forEach(evaluator => {
        const option = document.createElement('option');
        option.value = evaluator._id;
        option.textContent = evaluator.name || evaluator.email;
        select.appendChild(option);
    });
}

// Function to fetch evaluations
async function fetchEvaluations() {
    try {
        console.log('Fetching evaluations...');
        const response = await fetch(API_ENDPOINTS.evaluations, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch evaluations');
        }

        const data = await response.json();
        console.log('Fetched evaluations:', data);

        evaluations = data.evaluations || [];
        await populateEvaluationsTable();
        updateDashboardStats();
    } catch (error) {
        console.error('Error fetching evaluations:', error);
        showToast('error', 'Failed to fetch evaluations');
    }
}

// Function to populate evaluations table
async function populateEvaluationsTable() {
    const tableBody = document.querySelector('#evaluationsTable tbody');
    if (!tableBody) {
        console.error('Evaluations table body not found');
        return;
    }

    tableBody.innerHTML = '';
    
    if (evaluations.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No evaluations found</td>
            </tr>
        `;
        return;
    }

    // Filter and sort evaluations
    const filteredEvaluations = applyFilters();
    const sortedEvaluations = [...filteredEvaluations].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    sortedEvaluations.forEach(evaluation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-${getAssetIcon(evaluation.category)} me-2"></i>
                    ${evaluation.title || evaluation.assetId?.name || 'N/A'}
                </div>
            </td>
            <td>${evaluation.client?.name || evaluation.clientId?.name || 'N/A'}</td>
            <td>
                <span class="badge bg-${getStatusColor(evaluation.status)}">${evaluation.status}</span>
            </td>
            <td>${new Date(evaluation.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-info" onclick="viewEvaluation('${evaluation._id}')">View</button>
                    ${currentUser.role === 'admin' || currentUser._id === evaluation.assignedTo ? `
                        <button class="btn btn-sm btn-primary" onclick="updateStatus('${evaluation._id}')">Update Status</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEvaluation('${evaluation._id}')">Delete</button>
                    ` : ''}
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to update dashboard stats
function updateDashboardStats() {
    const totalCount = evaluations.length;
    const pendingCount = evaluations.filter(e => e.status === 'pending').length;
    const inProgressCount = evaluations.filter(e => e.status === 'in-progress').length;
    const completedCount = evaluations.filter(e => e.status === 'completed').length;

    document.querySelector('#totalEvaluations').textContent = totalCount;
    document.querySelector('#pendingEvaluations').textContent = pendingCount;
    document.querySelector('#inProgressEvaluations').textContent = inProgressCount;
    document.querySelector('#completedEvaluations').textContent = completedCount;
    const total = evaluations.length;
    const pending = evaluations.filter(e => e.status === 'pending').length;
    const completed = evaluations.filter(e => e.status === 'completed').length;
    const inProgress = evaluations.filter(e => e.status === 'in-progress').length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('completedCount').textContent = completed;
}

// Function to apply filters
function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');

    let filtered = [...evaluations];

    // Apply search filter
    if (searchInput && searchInput.value) {
        const searchTerm = searchInput.value.toLowerCase();
        filtered = filtered.filter(evaluation => 
            evaluation.title.toLowerCase().includes(searchTerm) ||
            evaluation.client.name.toLowerCase().includes(searchTerm) ||
            evaluation.category.toLowerCase().includes(searchTerm)
        );
    }

    // Apply category filter
    if (categoryFilter && categoryFilter.value) {
        filtered = filtered.filter(evaluation => 
            evaluation.category === categoryFilter.value
        );
    }

    // Apply status filter
    if (statusFilter && statusFilter.value) {
        filtered = filtered.filter(evaluation => 
            evaluation.status === statusFilter.value
        );
    }

    return filtered;
}

// Helper function to get asset icon
function getAssetIcon(category) {
    const icons = {
        'metals': 'fa-coins',
        'property': 'fa-home',
        'vehicles': 'fa-car',
        'jewelry': 'fa-gem',
        'default': 'fa-box'
    };
    return icons[category] || icons.default;
}

// Function to get status color
function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'in-progress': 'info',
        'completed': 'success',
        'cancelled': 'danger',
        'default': 'secondary'
    };
    return colors[status] || colors.default;
}

// Function to show toast notification
function showToast(type, message) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}

// Function to handle form validation
function handleFormValidation(form) {
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }
    return true;
}

// Function to reset form
function resetForm(form) {
    form.reset();
    form.classList.remove('was-validated');
    const dueDateField = form.querySelector('[name="dueDate"]');
    if (dueDateField) {
        const today = new Date().toISOString().split('T')[0];
        dueDateField.value = today;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize user context and fetch evaluations
    if (!userContext.requireAuth()) {
        return;
    }

    initializeUserData();
    fetchEvaluations();

    // Get form and add submit handler
    const evaluationForm = document.getElementById('evaluationForm');
    if (!evaluationForm) {
        console.error('Evaluation form not found');
        return;
    }

    evaluationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submission started'); // Debug log
        
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Creating...';

        try {
            // Get form data
            const formData = new FormData(this);
            const data = {
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                client: {
                    name: formData.get('client.name'),
                    contact: formData.get('client.contact'),
                    email: formData.get('client.email'),
                    address: formData.get('client.address')
                },
                details: {
                    location: formData.get('details.location'),
                    condition: formData.get('details.condition'),
                    marketValue: formData.get('details.marketValue') ? parseFloat(formData.get('details.marketValue')) : null,
                    additionalNotes: formData.get('details.additionalNotes')
                },
                status: 'pending'
            };

            // Validate required fields
            const requiredFields = ['title', 'description', 'category', 'client.name', 'client.contact'];
            const missingFields = requiredFields.filter(field => {
                if (field.includes('.')) {
                    const [parent, child] = field.split('.');
                    return !data[parent]?.[child];
                }
                return !data[field];
            });

            if (missingFields.length > 0) {
                throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            }

            console.log('Sending evaluation data:', data);

            const response = await fetch(API_ENDPOINTS.evaluations, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    userContext.handleUnauthorized();
                    return;
                }
                throw new Error(responseData.message || 'Failed to create evaluation');
            }

            console.log('Created evaluation:', responseData);

            // Reset form and close modal
            this.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('newEvaluationModal'));
            modal?.hide();

            // Refresh evaluations table
            await fetchEvaluations();
            showToast('success', 'Evaluation created successfully');

        } catch (error) {
            console.error('Error creating evaluation:', error);
            showToast('error', error.message || 'Failed to create evaluation. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Create Evaluation';
        }
    });

    // Add event listeners for filters
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) searchInput.addEventListener('input', populateEvaluationsTable);
    if (typeFilter) typeFilter.addEventListener('change', populateEvaluationsTable);
    if (statusFilter) statusFilter.addEventListener('change', populateEvaluationsTable);
});

// Function to update evaluation status
window.updateStatus = async function(id) {
    const evaluation = evaluations.find(e => e._id === id);
    if (!evaluation) return;

    const statusMap = {
        'pending': 'in-progress',
        'in-progress': 'completed',
        'completed': 'pending'
    };

    const newStatus = statusMap[evaluation.status];

    try {
        const response = await fetch(`${API_ENDPOINTS.EVALUATIONS}/${id}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            if (response.status === 401) {
                userContext.handleUnauthorized();
                return;
            }
            throw new Error('Failed to update status');
        }

        showToast('success', 'Status updated successfully');
        await fetchEvaluations();
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Failed to update status');
    }
};

// Function to delete evaluation (admin only)
window.deleteEvaluation = async function(id) {
    if (!currentUser || currentUser.role !== 'admin') {
        showToast('error', 'Only administrators can delete evaluations');
        return;
    }

    if (!confirm('Are you sure you want to delete this evaluation? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_ENDPOINTS.EVALUATIONS}/${id}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                userContext.handleUnauthorized();
                return;
            }
            throw new Error('Failed to delete evaluation');
        }

        evaluations = evaluations.filter(e => e._id !== id);
        updateDashboardStats();
        populateEvaluationsTable();
        showToast('success', 'Evaluation deleted successfully');
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Failed to delete evaluation');
    }
};

// Function to view evaluation details
window.viewEvaluation = async function(id) {
    if (!id) return;

    try {
        const response = await fetch(`${API_ENDPOINTS.EVALUATIONS}/${id}`, {
            headers: {
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                userContext.handleUnauthorized();
                return;
            }
            throw new Error('Failed to fetch evaluation details');
        }

        const { evaluation } = await response.json();
        
        // Show evaluation details in modal
        const modalContent = `
            <div class="modal-header">
                <h5 class="modal-title">Evaluation Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <strong>Asset:</strong> ${evaluation.asset}
                </div>
                <div class="mb-3">
                    <strong>Client:</strong> ${evaluation.client}
                </div>
                <div class="mb-3">
                    <strong>Status:</strong> <span class="badge bg-${getStatusColor(evaluation.status)}">${evaluation.status}</span>
                </div>
                <div class="mb-3">
                    <strong>Created:</strong> ${new Date(evaluation.createdAt).toLocaleDateString()}
                </div>
                ${evaluation.notes ? `
                <div class="mb-3">
                    <strong>Notes:</strong>
                    <p class="mt-2">${evaluation.notes}</p>
                </div>` : ''}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        `;

        // Get or create modal
        let modalElement = document.getElementById('evaluationDetailsModal');
        if (!modalElement) {
            modalElement = document.createElement('div');
            modalElement.id = 'evaluationDetailsModal';
            modalElement.className = 'modal fade';
            modalElement.setAttribute('tabindex', '-1');
            document.body.appendChild(modalElement);
        }

        modalElement.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    ${modalContent}
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Failed to load evaluation details');
    }
};