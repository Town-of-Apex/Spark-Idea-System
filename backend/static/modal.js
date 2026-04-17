// modal.js — IdeaModal overlay component for the Spark Idea System
// Requires: auth.js loaded first (uses apiFetch, escapeHtml, getUser, formatDate)

let _modalIdeaId = null;
let _modalUpdateCallback = null;

// ─── Open / Close ─────────────────────────────────────────────────────────────

function openModal(ideaId, onUpdateCallback) {
    _modalIdeaId = ideaId;
    _modalUpdateCallback = onUpdateCallback || null;

    const backdrop = document.getElementById('modal-backdrop');
    if (!backdrop) return;
    backdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    _renderModalLoading();
    _loadModalData(ideaId);
}

function closeModal() {
    const backdrop = document.getElementById('modal-backdrop');
    if (!backdrop) return;
    backdrop.classList.add('hidden');
    document.body.style.overflow = '';
    _modalIdeaId = null;
}

function handleBackdropClick(event) {
    if (event.target === document.getElementById('modal-backdrop')) {
        closeModal();
    }
}

// ─── Loading State ────────────────────────────────────────────────────────────

function _renderModalLoading() {
    document.getElementById('modal-body').innerHTML = `
        <div class="modal-loading">
            <div class="spinner"></div>
        </div>`;
}

// ─── Data Loading ─────────────────────────────────────────────────────────────

async function _loadModalData(ideaId) {
    try {
        const [ideaRes, similarRes, tagsRes] = await Promise.all([
            apiFetch(`/ideas/${ideaId}`),
            apiFetch(`/ideas/${ideaId}/similar`),
            apiFetch('/tags/')
        ]);
        const idea    = await ideaRes.json();
        const similar = await similarRes.json();
        const tags    = await tagsRes.json();
        const user    = getUser();
        _renderModal(idea, similar, tags, user);
    } catch (e) {
        console.error('Modal data load failed:', e);
        document.getElementById('modal-body').innerHTML =
            `<div class="modal-loading"><p class="text-rosy">Failed to load idea. Please try again.</p></div>`;
    }
}

// ─── Render ───────────────────────────────────────────────────────────────────

function _renderModal(idea, similar, allTags, user) {
    const isAdmin = user && user.role === 'admin';

    // Tag pills in header
    const tagPillsHtml = idea.tags.map(t =>
        `<span class="tag-pill" style="background:${t.color}">${escapeHtml(t.name)}</span>`
    ).join('');

    // Similar sparks grid
    const similarHtml = similar.length === 0
        ? `<p class="modal-empty-note">No closely related ideas found yet.</p>`
        : similar.map(s => `
            <div class="similar-card" onclick="openModal(${s.id}, _modalUpdateCallback)" role="button" tabindex="0">
                <span class="similar-text">${escapeHtml(s.text)}</span>
                <span class="similar-link">View Connection</span>
            </div>`).join('');

    // AI score sections (only rendered if data exists)
    const aiImpact     = idea.ai_metadata && idea.ai_metadata['Public Impact'];
    const aiDifficulty = idea.ai_metadata && idea.ai_metadata['Implementation Difficulty'];
    const aiHtml = (aiImpact || aiDifficulty) ? `
        <section class="modal-ai-section">
            ${aiImpact ? `
            <div class="ai-score-card ai-impact">
                <p class="ai-score-label">AI Public Impact</p>
                <div class="ai-score-row">
                    <span class="ai-score-num">${escapeHtml(aiImpact)}</span>
                    <span class="ai-score-sublabel">Impact Score</span>
                </div>
                <p class="ai-score-note">"High confidence mapping relative to Town priorities."</p>
            </div>` : ''}
            ${aiDifficulty ? `
            <div class="ai-score-card ai-difficulty">
                <p class="ai-score-label">Implementation Difficulty</p>
                <div class="ai-score-row">
                    <span class="ai-score-num">${escapeHtml(aiDifficulty)}</span>
                    <span class="ai-score-sublabel">Difficulty</span>
                </div>
            </div>` : ''}
        </section>` : '';

    // Priority score bar
    const priorityPct = Math.min(100, (idea.vote_count / 10) * 100);

    // Tag toggles — admin only
    const tagTogglesHtml = isAdmin ? `
        <section class="modal-sidebar-section">
            <h3 class="modal-sidebar-label">Categorization</h3>
            <div class="tag-toggle-grid">
                ${allTags.map(tag => {
                    const selected = idea.tags.some(t => t.id === tag.id);
                    return `<button
                        class="tag-toggle-btn ${selected ? 'selected' : ''}"
                        onclick="toggleModalTag(${tag.id})"
                        data-tag-id="${tag.id}">
                        ${escapeHtml(tag.name)}
                    </button>`;
                }).join('')}
            </div>
        </section>` : '';

    // Admin: status change selector
    const statusStatuses = ['New', 'In Progress', 'Implemented', 'Archived'];
    const statusSelectorHtml = isAdmin ? `
        <section class="modal-sidebar-section">
            <h3 class="modal-sidebar-label">Status</h3>
            <select class="status-select" onchange="updateIdeaStatus(this.value)">
                ${statusStatuses.map(s =>
                    `<option value="${s}" ${s === idea.status ? 'selected' : ''}>${s}</option>`
                ).join('')}
            </select>
        </section>` : '';

    // Admin: embedding status + reprocess
    const embeddingBadgeHtml = isAdmin ? `
        <div class="embedding-status-row">
            <span class="embedding-badge ${idea.has_embedding ? 'ready' : 'pending'}">
                ${idea.has_embedding ? 'AI READY' : 'AI PENDING'}
            </span>
            <button class="reprocess-btn" onclick="reprocessIdea()" title="Manually trigger AI Embedding/Analysis">
                REPROCESS
            </button>
        </div>` : '';

    // Description section
    const descHtml = `
        <div id="modal-desc-display">
            <div class="modal-desc-content">
                <p>${escapeHtml(idea.description || 'No detailed description added yet. Add context to help others understand the impact of this spark.')}</p>
            </div>
            ${isAdmin ? `<button class="btn btn-secondary modal-edit-btn" onclick="startDescEdit()">Edit Details</button>` : ''}
        </div>
        <div id="modal-desc-edit" class="hidden">
            <textarea id="modal-desc-textarea" class="modal-textarea">${escapeHtml(idea.description || '')}</textarea>
            <div class="modal-edit-actions">
                <button class="btn btn-primary" onclick="saveDescription()">Save Updates</button>
                <button class="btn btn-secondary" onclick="cancelDescEdit()">Cancel</button>
            </div>
        </div>`;

    document.getElementById('modal-body').innerHTML = `
        <div class="modal-inner">

            <!-- Main panel (left) -->
            <div class="modal-main">
                <div class="modal-header">
                    <div class="modal-header-left">
                        <div class="modal-header-meta-row">
                            ${idea.is_new ? `<span class="status-tag status-new">New</span>` : ''}
                            ${embeddingBadgeHtml}
                            <span class="modal-idea-id">#${idea.id}</span>
                        </div>
                        <h2 class="modal-title">${escapeHtml(idea.text)}</h2>
                        <div class="modal-tag-pills">${tagPillsHtml}</div>
                    </div>
                    <button class="modal-close-btn" onclick="closeModal()" aria-label="Close">
                        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div class="modal-body-scroll">
                    <section class="modal-section">
                        <h3 class="modal-section-label">Implementation Analysis</h3>
                        ${descHtml}
                    </section>

                    <section class="modal-section">
                        <h3 class="modal-section-label">Semantic Neighbors</h3>
                        <div class="similar-grid">${similarHtml}</div>
                    </section>
                </div>
            </div>

            <!-- Sidebar (right) -->
            <div class="modal-sidebar">
                <section class="modal-sidebar-section">
                    <h3 class="modal-sidebar-label">Metadata</h3>
                    <div class="modal-meta-card">
                        <div class="modal-meta-row">
                            <p class="modal-meta-key">Submitted By</p>
                            <p class="modal-meta-val teal">${escapeHtml(idea.username)}</p>
                        </div>
                        <div class="modal-meta-row">
                            <p class="modal-meta-key">Department</p>
                            <p class="modal-meta-val">${escapeHtml(idea.department || 'Unspecified')}</p>
                        </div>
                        <div class="modal-meta-row">
                            <p class="modal-meta-key">Submitted</p>
                            <p class="modal-meta-val">${formatDate(idea.created_at)}</p>
                        </div>
                        <div class="modal-meta-priority">
                            <p class="modal-meta-key">Priority Score</p>
                            <div class="priority-bar-row">
                                <div class="priority-bar-track">
                                    <div class="priority-bar-fill" style="width:${priorityPct}%"></div>
                                </div>
                                <span class="priority-score">${idea.vote_count}</span>
                            </div>
                        </div>
                    </div>
                </section>

                ${statusSelectorHtml}
                ${tagTogglesHtml}
                ${aiHtml}
            </div>

        </div>`;

    // Cache current tag IDs for toggle operations
    window._modalCurrentTagIds = idea.tags.map(t => t.id);
    window._modalCurrentStatus = idea.status;
}

// ─── Description Editing ──────────────────────────────────────────────────────

function startDescEdit() {
    document.getElementById('modal-desc-display').classList.add('hidden');
    document.getElementById('modal-desc-edit').classList.remove('hidden');
}

function cancelDescEdit() {
    document.getElementById('modal-desc-display').classList.remove('hidden');
    document.getElementById('modal-desc-edit').classList.add('hidden');
}

async function saveDescription() {
    const newDesc = document.getElementById('modal-desc-textarea').value;
    try {
        await apiFetch(`/ideas/${_modalIdeaId}`, {
            method: 'PATCH',
            body: JSON.stringify({ description: newDesc })
        });
        if (_modalUpdateCallback) _modalUpdateCallback();
        _loadModalData(_modalIdeaId);
    } catch (e) {
        console.error('Save description failed:', e);
    }
}

// ─── Status Update ────────────────────────────────────────────────────────────

async function updateIdeaStatus(newStatus) {
    try {
        await apiFetch(`/ideas/${_modalIdeaId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        if (_modalUpdateCallback) _modalUpdateCallback();
    } catch (e) {
        console.error('Status update failed:', e);
    }
}

// ─── Tag Toggle ───────────────────────────────────────────────────────────────

async function toggleModalTag(tagId) {
    const currentIds = window._modalCurrentTagIds || [];
    const newIds = currentIds.includes(tagId)
        ? currentIds.filter(id => id !== tagId)
        : [...currentIds, tagId];

    try {
        await apiFetch(`/ideas/${_modalIdeaId}`, {
            method: 'PATCH',
            body: JSON.stringify({ tag_ids: newIds })
        });
        if (_modalUpdateCallback) _modalUpdateCallback();
        _loadModalData(_modalIdeaId);
    } catch (e) {
        console.error('Tag toggle failed:', e);
    }
}

// ─── AI Reprocess ─────────────────────────────────────────────────────────────

async function reprocessIdea() {
    try {
        await apiFetch(`/ideas/${_modalIdeaId}/process`, { method: 'POST' });
        if (_modalUpdateCallback) _modalUpdateCallback();
        showToast('AI reprocessing queued.');
        _loadModalData(_modalIdeaId);
    } catch (e) {
        console.error('Reprocess failed:', e);
    }
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});
