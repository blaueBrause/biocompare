'use strict';

const COMPETENCY_VARIANT_LABELS = {
  ag_basisfach: 'AG Basisfach',
  ag_leistungsfach: 'AG Leistungsfach',
  bg_regulaer: 'reguläres BG'
};

function renderCompetencyVariant(variantKey, variant) {
  const data = variant || {
    assessment: 'noch nicht erfasst',
    status: 'OFFEN',
    evidence: []
  };
  const status = normalizeStatus(data.status);

  return `<section class="variant-card" data-status="${status}">
    <div class="variant-header">
      <h4>${escapeHtml(COMPETENCY_VARIANT_LABELS[variantKey] || variantKey)}</h4>
      ${statusBadge(status)}
    </div>
    <p>${escapeHtml(data.assessment || 'Keine Bewertung hinterlegt.')}</p>
    ${evidenceList(data.evidence)}
  </section>`;
}

function renderCompetencyEvidenceCard(item) {
  return `<article class="card competency-card">
    <div class="card-header">
      <div>
        <span class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.topic)}</span>
        <h3>${escapeHtml(item.competency)}</h3>
      </div>
    </div>
    <div class="variant-grid">
      ${Object.keys(COMPETENCY_VARIANT_LABELS)
        .map(key => renderCompetencyVariant(key, item.variants?.[key]))
        .join('')}
    </div>
  </article>`;
}

renderCompetencies = function renderCompetenciesWithSeparateEvidence() {
  const topics = [...new Set(state.data.competencies.map(item => item.topic))].sort();
  const selectedTopic = state.filters.competencyTopic || 'ALLE';
  const query = (state.filters.competencyQuery || '').toLowerCase();
  const items = state.data.competencies.filter(item =>
    (selectedTopic === 'ALLE' || item.topic === selectedTopic) &&
    (!query || `${item.competency} ${item.topic}`.toLowerCase().includes(query))
  );

  return `
    <div class="notice">
      <strong>Zellenweise Beleglogik</strong>
      Basisfach, Leistungsfach und reguläres BG besitzen jeweils eine eigene Bewertung,
      einen eigenen Status und eigene Fundstellen. Eine Quelle belegt niemals automatisch
      die anderen Varianten.
    </div>
    <div class="controls">
      <div class="control">
        <label for="competency-query">Suche</label>
        <input id="competency-query" type="search"
          value="${escapeHtml(state.filters.competencyQuery || '')}"
          placeholder="Kompetenz oder Thema">
      </div>
      <div class="control">
        <label for="competency-topic">Thema</label>
        <select id="competency-topic">
          <option>ALLE</option>
          ${topics.map(value => `<option ${selectedTopic === value ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('')}
        </select>
      </div>
    </div>
    <section class="stack">
      ${items.length
        ? items.map(renderCompetencyEvidenceCard).join('')
        : '<div class="empty">Keine Kompetenzen für diese Filter.</div>'}
    </section>`;
};
