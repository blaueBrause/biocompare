'use strict';

const FINDING_CATEGORY_LABELS = {
  gemeinsamer_kern: 'Gemeinsamer Kern',
  ag_spezifisch: 'AG-spezifischer Belegstand',
  bg_spezifisch: 'BG-spezifischer Belegstand',
  hardy_weinberg: 'Hardy-Weinberg',
  methodik: 'Methodik',
  zusatzfach: 'Zusatzfach',
  pruefung: 'Prüfung',
  umsetzung: 'Schulische Umsetzung'
};

function findingReferenceButton(view, id, label, query = '') {
  return `<button type="button" class="reference-chip"
    data-target-view="${escapeHtml(view)}"
    data-target-query="${escapeHtml(query)}"
    title="${escapeHtml(label)}">
    <strong>${escapeHtml(id)}</strong>
    <span>${escapeHtml(label)}</span>
  </button>`;
}

function renderFindingReferences(item) {
  const groups = [];

  if (Array.isArray(item.competency_ids) && item.competency_ids.length) {
    const buttons = item.competency_ids.map(id => {
      const competency = state.data.competencies.find(entry => entry.id === id);
      return findingReferenceButton(
        'competencies',
        id,
        competency?.competency || 'Kompetenz',
        competency?.competency || id
      );
    }).join('');
    groups.push(`<div class="reference-group"><h4>Kompetenzbezug</h4><div class="reference-list">${buttons}</div></div>`);
  }

  if (Array.isArray(item.supplementary_ids) && item.supplementary_ids.length) {
    const buttons = item.supplementary_ids.map(id => {
      const supplement = state.data.supplementary.find(entry => entry.id === id);
      return findingReferenceButton('supplementary', id, supplement?.title || 'Zusatzfach');
    }).join('');
    groups.push(`<div class="reference-group"><h4>Zusatzfachbezug</h4><div class="reference-list">${buttons}</div></div>`);
  }

  if (Array.isArray(item.exam_ids) && item.exam_ids.length) {
    const buttons = item.exam_ids.map(id => {
      const exam = state.data.exams.find(entry => entry.id === id);
      return findingReferenceButton('exams', id, exam?.title || 'Prüfungsaufgabe');
    }).join('');
    groups.push(`<div class="reference-group"><h4>Prüfungsbezug</h4><div class="reference-list">${buttons}</div></div>`);
  }

  if (Array.isArray(item.question_ids) && item.question_ids.length) {
    const buttons = item.question_ids.map(id => {
      const question = state.data.questions.find(entry => (entry.id || entry.question_id) === id);
      return findingReferenceButton('questions', id, question?.question || question?.frage || 'Offene Frage');
    }).join('');
    groups.push(`<div class="reference-group"><h4>Noch zu klären</h4><div class="reference-list">${buttons}</div></div>`);
  }

  return groups.length ? `<div class="reference-groups">${groups.join('')}</div>` : '';
}

renderFindingCard = function renderStructuredFindingCard(item) {
  const category = FINDING_CATEGORY_LABELS[item.category] || item.category || 'Befund';
  return `<article class="card finding-card" data-category="${escapeHtml(item.category || '')}">
    <div class="card-header">
      <div>
        <div class="finding-meta">
          <span class="muted">${escapeHtml(item.id || item.finding_id)}</span>
          <span class="tag">${escapeHtml(category)}</span>
        </div>
        <h3>${escapeHtml(item.claim || item.aussage)}</h3>
      </div>
      ${statusBadge(item.status)}
    </div>
    ${item.interpretation ? `<section class="finding-meaning"><strong>Bedeutung für die Schulwahl</strong><p>${escapeHtml(item.interpretation)}</p></section>` : ''}
    ${renderFindingReferences(item)}
    <details class="finding-evidence">
      <summary>Quellen und Fundstellen</summary>
      ${evidenceList(item.evidence || item.fundstellen)}
    </details>
  </article>`;
};

renderFindings = function renderStructuredFindings() {
  const selectedStatus = state.filters.findingStatus || 'ALLE';
  const selectedCategory = state.filters.findingCategory || 'ALLE';
  const categories = [...new Set(state.data.findings.map(item => item.category).filter(Boolean))];
  const items = state.data.findings.filter(item =>
    (selectedStatus === 'ALLE' || normalizeStatus(item.status) === selectedStatus) &&
    (selectedCategory === 'ALLE' || item.category === selectedCategory)
  );

  return `
    <div class="notice">
      <strong>Befunde sind Synthesen, keine Einzelzitate</strong>
      Jeder Befund verweist auf die zugrunde liegenden Kompetenz-, Zusatzfach-, Prüfungs- oder Frageobjekte.
      Aussagen über nicht positiv belegte Inhalte werden ausdrücklich als offen oder teilweise belegt markiert.
    </div>
    <div class="controls">
      <div class="control"><label for="finding-status">Belegstatus</label><select id="finding-status">
        ${['ALLE', 'BELEGT', 'TEILWEISE BELEGT', 'OFFEN'].map(value => `<option ${selectedStatus === value ? 'selected' : ''}>${value}</option>`).join('')}
      </select></div>
      <div class="control"><label for="finding-category">Kategorie</label><select id="finding-category">
        <option value="ALLE">ALLE</option>
        ${categories.map(value => `<option value="${escapeHtml(value)}" ${selectedCategory === value ? 'selected' : ''}>${escapeHtml(FINDING_CATEGORY_LABELS[value] || value)}</option>`).join('')}
      </select></div>
    </div>
    <section class="stack">${items.length ? items.map(renderFindingCard).join('') : '<div class="empty">Keine Befunde für diese Filter.</div>'}</section>
  `;
};

document.addEventListener('change', event => {
  if (event.target?.id === 'finding-category') {
    state.filters.findingCategory = event.target.value;
    renderCurrentView();
  }
});

document.addEventListener('click', event => {
  const button = event.target.closest('.reference-chip[data-target-view]');
  if (!button) return;

  const view = button.dataset.targetView;
  const query = button.dataset.targetQuery || '';
  if (view === 'competencies') {
    state.filters.competencyQuery = query;
    state.filters.competencyTopic = 'ALLE';
  }
  activateView(view);
});
