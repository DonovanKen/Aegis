// Afficher le profil d'un patient
async function renderPatientProfile(patientId) {
    const contentDiv = document.getElementById('content');
    const loadingDiv = document.getElementById('loading');
    
    try {
        loadingDiv.classList.remove('hidden');
        
        const patient = await apiGet(`/patients/${patientId}`);
        
        loadingDiv.classList.add('hidden');
        
        if (!patient) {
            contentDiv.innerHTML = '<p>Patient non trouvé</p>';
            return;
        }
        
        contentDiv.innerHTML = `
            <div class="profile-header">
                <div class="profile-name">${escapeHtml(patient.firstName)} ${escapeHtml(patient.lastName)}</div>
                <p>Ajouté le ${new Date(patient.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div class="profile-section">
                <h3>⚠️ Déclencheurs connus</h3>
                <p>${patient.triggers ? escapeHtml(patient.triggers) : 'Aucun déclencheur renseigné'}</p>
            </div>
            
            <div class="profile-section">
                <h3>✓ Stratégies de désescalade</h3>
                <p>${patient.deescalationStrategies ? escapeHtml(patient.deescalationStrategies) : 'Aucune stratégie renseignée'}</p>
            </div>
            
            <div class="profile-section">
                <h3>📋 Historique des interventions</h3>
                <div id="interventionHistory">Chargement...</div>
            </div>
            
            <div class="profile-actions">
                <button class="btn-primary" onclick="startIntervention(${patient.id})">➕ Démarrer une intervention</button>
                <button class="btn-secondary" onclick="navigateTo('dashboard')">← Retour</button>
            </div>
        `;
        
        // Charger l'historique des interventions
        await loadInterventionHistory(patientId);
        
    } catch (error) {
        loadingDiv.classList.add('hidden');
        contentDiv.innerHTML = `
            <div class="error-container">
                <p>Erreur lors du chargement du profil</p>
                <button class="btn-secondary" onclick="navigateTo('dashboard')">Retour</button>
            </div>
        `;
    }
}

// Charger l'historique des interventions d'un patient
async function loadInterventionHistory(patientId) {
    try {
        // Récupérer les interventions associées au patient
        const interventions = await apiGet(`/interventions?patientId=${patientId}`);
        const historyDiv = document.getElementById('interventionHistory');
        
        if (!interventions || interventions.length === 0) {
            historyDiv.innerHTML = '<p>Aucune intervention antérieure.</p>';
            return;
        }
        
        let historyHtml = '<div class="history-list">';
        interventions.forEach(interv => {
            historyHtml += `
                <div class="history-item" onclick="viewIntervention(${interv.id})">
                    <strong>${new Date(interv.createdAt).toLocaleDateString()}</strong> - 
                    ${interv.status === 'active' ? 'En cours' : 'Clôturée'}
                    ${interv.resolution ? `- ${interv.resolution}` : ''}
                </div>
            `;
        });
        historyHtml += '</div>';
        
        historyDiv.innerHTML = historyHtml;
    } catch (error) {
        console.error('Erreur chargement historique:', error);
    }
}

// Démarrer une intervention pour un patient
async function startIntervention(patientId) {
    try {
        const intervention = await apiPost('/interventions', {
            patientId: patientId,
            status: 'active',
            startedAt: new Date().toISOString()
        });
        
        showToast('Intervention démarrée', 'success');
        navigateTo('intervention', { id: intervention.id });
    } catch (error) {
        showToast('Erreur lors du démarrage', 'error');
    }
}