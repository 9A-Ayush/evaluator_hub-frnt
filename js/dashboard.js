// Dashboard management
let dashboardData = {
    evaluations: [],
    stats: {
        pending: 0,
        completed: 0,
        total: 0
    }
};

// Function to fetch dashboard data
async function fetchDashboardData() {
    if (!userContext.requireAuth()) return;

    try {
        const response = await fetch(API_ENDPOINTS.evaluations, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) {
                userContext.handleUnauthorized();
                return;
            }
            throw new Error('Failed to fetch evaluations');
        }

        const data = await response.json();
        if (data.success) {
            dashboardData.evaluations = data.evaluations;
            updateDashboardStats();
            updateRecentEvaluations();
        } else {
            throw new Error(data.message || 'Failed to fetch evaluations');
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    dashboardData.stats.pending = dashboardData.evaluations.filter(e => e.status === 'pending').length;
    dashboardData.stats.completed = dashboardData.evaluations.filter(e => e.status === 'completed').length;
    dashboardData.stats.total = dashboardData.evaluations.length;

    // Update UI
    document.querySelector('#pendingCount').textContent = dashboardData.stats.pending;
    document.querySelector('#completedCount').textContent = dashboardData.stats.completed;
    document.querySelector('#totalCount').textContent = dashboardData.stats.total;
}

// Update recent evaluations table
function updateRecentEvaluations() {
    const tbody = document.getElementById('evaluationsList');
    if (!tbody) return;

    // Get 5 most recent evaluations
    const recentEvaluations = dashboardData.evaluations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    tbody.innerHTML = recentEvaluations.map(eval => `
        <tr>
            <td>${eval._id}</td>
            <td>${eval.title}</td>
            <td>${eval.category}</td>
            <td><span class="badge bg-${getStatusColor(eval.status)}">${eval.status}</span></td>
            <td>${new Date(eval.dueDate).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewEvaluation('${eval._id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Function to get status color
function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'warning';
        case 'completed':
            return 'success';
        case 'in-progress':
            return 'info';
        default:
            return 'secondary';
    }
}

// Function to view evaluation details
async function viewEvaluation(id) {
    if (!id) return;

    try {
        const response = await fetch(`${API_ENDPOINTS.evaluations}/${id}`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) {
                userContext.handleUnauthorized();
                return;
            }
            throw new Error('Failed to fetch evaluation details');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch evaluation details');
        }

        const evaluation = data.evaluation;
        
        // Show evaluation details in modal
        const modalContent = `
            <div class="modal-header">
                <h5 class="modal-title">Evaluation Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <strong>Title:</strong> ${evaluation.title}
                </div>
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
        alert('Failed to load evaluation details');
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (userContext.isAuthenticated()) {
        fetchDashboardData();
    }
});
