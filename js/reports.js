// Global variables
let reports = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async function() {
    if (!window.userContext.requireAuth()) return;

    // Update user name
    const user = window.userContext.getCurrentUser();
    if (user) {
        const userNameElement = document.getElementById('currentUserName');
        if (userNameElement) {
            userNameElement.textContent = user.name || user.email;
        }
    }

    try {
        // Load reports list
        await fetchReports();

        // Add event listeners
        document.getElementById('reportForm').addEventListener('submit', function(e) {
            e.preventDefault();
            generateReport();
        });
        
        // Add event listener for report type change
        const reportTypeSelect = document.querySelector('select[name="reportType"]');
        if (reportTypeSelect) {
            reportTypeSelect.addEventListener('change', handleReportTypeChange);
        }

        // Initialize form validation
        initializeFormValidation();
    } catch (error) {
        console.error('Error initializing page:', error);
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
            window.userContext.handleUnauthorized();
        }
    }
});

// Function to handle report type change
async function handleReportTypeChange(event) {
    const reportType = event.target.value;
    const evaluationsSection = document.getElementById('evaluationsSection');
    const assetsSection = document.getElementById('assetsSection');

    if (evaluationsSection && assetsSection) {
        evaluationsSection.classList.toggle('d-none', reportType !== 'evaluation');
        assetsSection.classList.toggle('d-none', reportType !== 'asset');

        if (reportType === 'evaluation') {
            await fetchEvaluations();
        }
    }
}

// Function to fetch reports
async function fetchReports() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/reports`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        reports = data.reports || [];
        
        // Update UI
        populateReportsTable();
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Failed to fetch reports');
    }
}


// Function to populate reports table
function populateReportsTable() {
    const tableBody = document.getElementById('reportsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (reports.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">No reports found</td>
            </tr>
        `;
        return;
    }

    reports.forEach(report => {
        const row = document.createElement('tr');
        const createdDate = new Date(report.createdAt).toLocaleDateString();
        
        row.innerHTML = `
            <td>${report.title}</td>
            <td>${report.type}</td>
            <td>${createdDate}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="downloadReport('${report._id}')">
                    <i class="fas fa-file-pdf me-1"></i>Download PDF
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteReport('${report._id}')">
                    <i class="fas fa-trash me-1"></i>Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to download report
async function downloadReport(id) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/reports/${id}/download`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to download report');
        }

        // Get the PDF blob
        const blob = await response.blob();
        
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link and click it
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('success', 'Report downloaded successfully');
    } catch (error) {
        console.error('Error:', error);
        showToast('error', error.message || 'Failed to download report');
    }
}

// Function to delete report
async function deleteReport(id) {
    if (!confirm('Are you sure you want to delete this report?')) {
        return;
    }

    try {
        const response = await fetch(`${window.API_BASE_URL}/reports/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Failed to delete report');
        }

        showToast('success', 'Report deleted successfully');
        await fetchReports(); // Refresh the list
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Failed to delete report');
    }
}

// Function to fetch evaluations
async function fetchEvaluations() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/evaluations`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch evaluations');
        }

        const data = await response.json();
        const evaluationsSelect = document.querySelector('select[name="evaluation"]');
        
        if (evaluationsSelect) {
            evaluationsSelect.innerHTML = '<option value="">Select an evaluation</option>';
            data.evaluations.forEach(evaluation => {
                const option = document.createElement('option');
                option.value = evaluation._id;
                option.textContent = evaluation.title || `Evaluation ${evaluation._id}`;
                evaluationsSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Failed to fetch evaluations');
    }
}

// Function to generate report
async function generateReport() {
    const form = document.getElementById('reportForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const formData = new FormData(form);
    const reportType = formData.get('reportType');
    
    // Validate evaluation selection for evaluation reports
    if (reportType === 'evaluation' && !formData.get('evaluation')) {
        showToast('error', 'Please select an evaluation');
        return;
    }

    const reportData = {
        title: formData.get('title'),
        type: reportType,
        content: formData.get('content'),
        findings: formData.get('findings'),
        recommendations: formData.get('recommendations'),
        evaluation: formData.get('evaluation') || undefined,
        status: 'draft'
    };

    try {
        const response = await fetch(`${window.API_BASE_URL}/reports`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(reportData)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to generate report');
        }

        // Show success message
        showToast('success', 'Report generated successfully');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('newReportModal'));
        modal.hide();

        // Reset form
        form.reset();
        form.classList.remove('was-validated');

        // Refresh reports list
        await fetchReports();
    } catch (error) {
        console.error('Error:', error);
        showToast('error', error.message || 'Failed to generate report');
    }
}

// Function to show toast messages
function showToast(type, message) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
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

    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

// Function to initialize form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}

// Function to populate assets list
function populateAssetsList() {
    const container = document.getElementById('assetsList');
    if (!container) return;

    container.innerHTML = assets.map(asset => `
        <label class="list-group-item">
            <input class="form-check-input me-1" type="checkbox" value="${asset._id}">
            ${asset.title}
            <small class="text-muted d-block">Type: ${asset.type}</small>
        </label>
    `).join('');
}

// Function to update asset distribution chart
function updateAssetDistributionChart() {
    if (!assetDistributionChart) return;

    const categories = {};
    assets.forEach(asset => {
        categories[asset.category] = (categories[asset.category] || 0) + 1;
    });

    assetDistributionChart.data.labels = Object.keys(categories);
    assetDistributionChart.data.datasets[0].data = Object.values(categories);
    assetDistributionChart.update();
}

// Function to initialize form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}