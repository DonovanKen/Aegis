// Afficher le tableau de bord
async function renderDashboard() {
    const contentDiv = document.getElementById('content');
    const loadingDiv = document.getElementById('loading');
    
    try {
        loadingDiv.classList.remove('hidden');
        
        // Récupérer la liste des patients
        const patients = await apiGet('/patients');
        
        loadingDiv.classList.add('hidden');
        
        if (!patients || patients.length === 0) {
            contentDiv.innerHTML = `
                <div class="dashboard-header">
                    <h1>Tableau de bord</h1>
                    <button class="btn-primary" onclick="showAddPatientForm()">+ Nouveau patient</button>
                </div>
                <div class="empty-state">
                    <p>Aucun patient vulnérable enregistré.</p>
                    <button class="btn-primary" onclick="showAddPatientForm()">Ajouter un patient</button>
                </div>
            `;
            return;
        }
        
        let cardsHtml = `
            <div class="dashboard-header">
                <h1>Patients vulnérables suivis</h1>
                <button class="btn-primary" onclick="showAddPatientForm()">+ Nouveau patient</button>
            </div>
            <div class="cards-grid">
        `;
        
        patients.forEach(patient => {
            cardsHtml += `
                <div class="patient-card" onclick="viewPatient(${patient.id})">
                    <div class="patient-name">${escapeHtml(patient.firstName)} ${escapeHtml(patient.lastName)}</div>
                    ${patient.triggers ? `<div class="patient-triggers">⚠️ ${escapeHtml(patient.triggers)}</div>` : ''}
                    ${patient.deescalationStrategies ? `<div class="patient-strategies">✓ ${escapeHtml(patient.deescalationStrategies)}</div>` : ''}
                </div>
            `;
        });
        
        cardsHtml += `</div>`;
        contentDiv.innerHTML = cardsHtml;
        
    } catch (error) {
        loadingDiv.classList.add('hidden');
        contentDiv.innerHTML = `
            <div class="error-container">
                <p>Erreur lors du chargement des patients.</p>
                <button class="btn-secondary" onclick="renderDashboard()">Réessayer</button>
            </div>
        `;
    }
}

// Formulaire d'ajout de patient (modal simple)
function showAddPatientForm() {
    const modalHtml = `
        <div id="patientModal" class="modal-overlay">
            <div class="modal-content">
                <h2>Ajouter un patient</h2>
                <form id="addPatientForm">
                    <div class="form-group">
                        <label>Prénom</label>
                        <input type="text" id="firstName" required>
                    </div>
                    <div class="form-group">
                        <label>Nom</label>
                        <input type="text" id="lastName" required>
                    </div>
                    <div class="form-group">
                        <label>Déclencheurs (ce qui peut aggraver la crise)</label>
                        <textarea id="triggers" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Stratégies de désescalade</label>
                        <textarea id="deescalationStrategies" rows="2"></textarea>
                    </div>
                    <div class="modal-buttons">
                        <button type="button" class="btn-secondary" onclick="closeModal()">Annuler</button>
                        <button type="submit" class="btn-primary">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const form = document.getElementById('addPatientForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const patient = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            triggers: document.getElementById('triggers').value,
            deescalationStrategies: document.getElementById('deescalationStrategies').value
        };
        
        try {
            await apiPost('/patients', patient);
            showToast('Patient ajouté avec succès', 'success');
            closeModal();
            renderDashboard();
        } catch (error) {
            showToast('Erreur lors de l\'ajout', 'error');
        }
    });
}

// Fermer la modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

// Voir le détail d'un patient
async function viewPatient(id) {
    navigateTo('patient', { id });
}