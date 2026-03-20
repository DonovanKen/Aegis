// Afficher une intervention en cours
async function renderIntervention(interventionId) {
    const contentDiv = document.getElementById('content');
    const loadingDiv = document.getElementById('loading');
    
    try {
        loadingDiv.classList.remove('hidden');
        
        const intervention = await apiGet(`/interventions/${interventionId}`);
        
        loadingDiv.classList.add('hidden');
        
        if (!intervention) {
            contentDiv.innerHTML = '<p>Intervention non trouvée</p>';
            return;
        }
        
        // Récupérer les infos du patient
        const patient = await apiGet(`/patients/${intervention.patientId}`);
        
        contentDiv.innerHTML = `
            <div class="intervention-container">
                <div class="intervention-header">
                    <h1>Intervention en cours</h1>
                    <div class="intervention-badge active">ACTIVE</div>
                </div>
                
                <div class="profile-section">
                    <h3>Patient : ${escapeHtml(patient.firstName)} ${escapeHtml(patient.lastName)}</h3>
                    ${patient.triggers ? `<p class="alert-trigger">⚠️ Déclencheurs : ${escapeHtml(patient.triggers)}</p>` : ''}
                    ${patient.deescalationStrategies ? `<p class="alert-strategy">✓ Stratégies : ${escapeHtml(patient.deescalationStrategies)}</p>` : ''}
                </div>
                
                <div class="profile-section">
                    <h3>📝 Notes d'intervention</h3>
                    <textarea id="interventionNotes" rows="4" placeholder="Notes de l'équipe terrain...">${intervention.notes || ''}</textarea>
                    <button class="btn-primary" onclick="saveInterventionNotes(${interventionId})">Enregistrer notes</button>
                </div>
                
                <div class="profile-section">
                    <h3>📍 Orientation</h3>
                    <div class="orientation-options">
                        <button class="btn-secondary" onclick="setOrientation(${interventionId}, 'domicile')">🏠 Domicile</button>
                        <button class="btn-secondary" onclick="setOrientation(${interventionId}, 'hopital')">🏥 Hôpital</button>
                        <button class="btn-secondary" onclick="setOrientation(${interventionId}, 'refuge')">🏢 Refuge</button>
                        <button class="btn-secondary" onclick="setOrientation(${interventionId}, 'centre_desintox')">💊 Centre de désintoxication</button>
                    </div>
                    ${intervention.orientation ? `<p class="orientation-result">Orientation choisie : <strong>${intervention.orientation}</strong></p>` : ''}
                </div>
                
                <div class="intervention-actions">
                    <button class="btn-danger" onclick="closeIntervention(${interventionId})">✓ Clôturer l'intervention</button>
                    <button class="btn-secondary" onclick="navigateTo('dashboard')">← Retour</button>
                </div>
            </div>
        `;
        
    } catch (error) {
        loadingDiv.classList.add('hidden');
        contentDiv.innerHTML = `
            <div class="error-container">
                <p>Erreur lors du chargement de l'intervention</p>
                <button class="btn-secondary" onclick="navigateTo('dashboard')">Retour</button>
            </div>
        `;
    }
}

// Sauvegarder les notes d'intervention
async function saveInterventionNotes(interventionId) {
    const notes = document.getElementById('interventionNotes').value;
    
    try {
        await apiPut(`/interventions/${interventionId}`, { notes });
        showToast('Notes enregistrées', 'success');
    } catch (error) {
        showToast('Erreur lors de l\'enregistrement', 'error');
    }
}

// Définir l'orientation
async function setOrientation(interventionId, orientation) {
    try {
        await apiPut(`/interventions/${interventionId}`, { orientation });
        showToast(`Orientation : ${orientation}`, 'success');
        renderIntervention(interventionId);
    } catch (error) {
        showToast('Erreur lors de l\'orientation', 'error');
    }
}

// Clôturer une intervention
async function closeIntervention(interventionId) {
    if (!confirm('Confirmez-vous la clôture de cette intervention ?')) return;
    
    try {
        await apiPut(`/interventions/${interventionId}`, {
            status: 'closed',
            closedAt: new Date().toISOString(),
            resolution: 'Intervention terminée'
        });
        
        showToast('Intervention clôturée', 'success');
        navigateTo('dashboard');
    } catch (error) {
        showToast('Erreur lors de la clôture', 'error');
    }
}

// Voir le détail d'une intervention passée
async function viewIntervention(interventionId) {
    navigateTo('intervention', { id: interventionId });
}