'use strict';

const COMPETENCY_VARIANT_LABELS = {
  ag_basisfach: 'AG Basisfach',
  ag_leistungsfach: 'AG Leistungsfach',
  bg_regulaer: 'reguläres BG'
};

function competencyCoverage(items, variantKey) {
  const counts = {
    BELEGT: 0,
    'TEILWEISE BELEGT': 0,
    OFFEN: 0
  };

  for (const item of items) {
    const status = normalizeStatus(item.variants?.[variantKey]?.status);
    counts[status] += 1;
  }
  return counts;
}

function renderCoverageSummary(items) {
  return `<section class="coverage-grid" aria-label="Beleglage nach Schulvariante">
    ${Object.entries(COMPETENCY_VARIANT_LABELS).map(([key, label]) => {
      const counts = competencyCoverage(items, key);
      return `<article class="coverage-card">
        <strong>${escapeHtml(label)}</strong>
        <span>${counts.BELEGT} belegt</span>
        <span>${counts['TEILWEISE BELEGT']} teilweise belegt</span>
        <span>${counts.OFFEN} offen</span>
      </article>`;
    }).join('')}
  </section>`;
}

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
  const related = Array.isArray(item.related_supplementary) && item.related_supplementary.length
    ? `<p class="related-note"><strong>Getrennte optionale Ergänzung:</strong> ${item.related_supplementary.map(escapeHtml).join(', ')} – siehe Ansicht „Zusatzfach“.</p>`
    : '';

  return `<article class="card competency-card">
    <div class="card-header">
      <div>
        <span class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.topic)}</span>
        <h3>${escapeHtml(item.competency)}</h3>
      </div>
    </div>
    ${related}
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
    ${renderCoverageSummary(state.data.competencies)}
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
