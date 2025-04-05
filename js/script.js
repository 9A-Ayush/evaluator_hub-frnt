// Function to fetch evaluations from the API
async function fetchEvaluations() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:5001/evaluations', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch evaluations');
        const evaluations = await response.json();
        return evaluations;
    } catch (error) {
        console.error('Error fetching evaluations:', error);
        return [];
    }
}

// Function to populate evaluations table
async function populateEvaluationsTable() {
    const tableBody = document.getElementById('evaluationsList');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    const evaluations = await fetchEvaluations();

    evaluations.forEach(eval => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${eval._id}</td>
            <td>${eval.title}</td>
            <td>${eval.category}</td>
            <td><span class="badge ${eval.status === 'Pending' ? 'bg-warning' : 'bg-success'}">${eval.status}</span></td>
            <td>${new Date(eval.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewEvaluation('${eval._id}')">View</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEvaluation('${eval._id}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to handle new evaluation submission
document.getElementById('evaluationForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(this);
        const evaluationData = {
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description'),
            status: 'Pending',
            client: {
                name: formData.get('clientName'),
                email: formData.get('clientEmail'),
                phone: formData.get('clientPhone')
            }
        };

        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:5001/evaluations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(evaluationData)
        });

        if (!response.ok) throw new Error('Failed to create evaluation');

        await populateEvaluationsTable();
        const modal = bootstrap.Modal.getInstance(document.getElementById('newEvaluationModal'));
        modal.hide();
        
        // Show success message
        alert('Evaluation created successfully!');
    } catch (error) {
        console.error('Error creating evaluation:', error);
        alert('Failed to create evaluation. Please try again.');
    }
});

// Function to view evaluation details
async function viewEvaluation(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:5001/evaluations/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch evaluation');
        const evaluation = await response.json();
        // TODO: Show evaluation details in a modal
        console.log('Evaluation details:', evaluation);
    } catch (error) {
        console.error('Error viewing evaluation:', error);
        alert('Failed to view evaluation details.');
    }
}

// Function to delete evaluation
async function deleteEvaluation(id) {
    if (!confirm('Are you sure you want to delete this evaluation?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:5001/evaluations/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete evaluation');
        await populateEvaluationsTable();
        alert('Evaluation deleted successfully!');
    } catch (error) {
        console.error('Error deleting evaluation:', error);
        alert('Failed to delete evaluation.');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    populateEvaluationsTable();
});