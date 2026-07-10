'use strict';

const COMPETENCY_VARIANT_LABELS = {
  ag_basisfach: 'AG Basisfach',
  ag_leistungsfach: 'AG Leistungsfach',
  bg_regulaer: 'reguläres BG',
  bg_zusatzfach: 'BG Zusatzfach (optional)'
};

const COMPETENCY_FEATURES = {
  experiment: {
    label: 'Experiment',
    description: 'Eigenständiges Planen, Durchführen oder verbindlich vorgesehenes Schülerexperiment.'
  },
  datenauswertung: {
    label: 'Datenauswertung',
    description: 'Experimentelle Daten, Messwerte, Sequenzen oder andere Materialien werden ausdrücklich ausgewertet.'
  },
  modellierung: {
    label: 'Modellierung',
    description: 'Modelle werden ausdrücklich genutzt, entwickelt, erklärt oder bewertet.'
  },
  quantitativ: {
    label: 'Quantitativ',
    description: 'Berechnungen oder andere ausdrücklich quantitative Anforderungen sind dokumentiert.'
  },
  bewertung: {
    label: 'Bewertung',
    description: 'Sach- oder Werturteile, Chancen und Risiken oder ethische Fragen werden ausdrücklich beurteilt oder bewertet.'
  }
};

let supplementaryCompetencyMap = new Map();
let supplementaryCompetenciesLoaded = false;
let supplementaryCompetenciesError = null;

fetch('data/kompetenzen_zusatzfach.json')
  .then(response => {
    if (!response.ok) throw new Error(`data/kompetenzen_zusatzfach.json: HTTP ${response.status}`);
    return response.json();
  })
  .then(items => {
    supplementaryCompetencyMap = new Map(items.map(item => [item.id, item]));
    supplementaryCompetenciesLoaded = true;
    if (state.data) state.data.supplementaryCompetencies = items;
    if (state.data && state.view === 'competencies') renderCurrentView();
  })
  .catch(error => {
    console.error(error);
    supplementaryCompetenciesError = error;
    supplementaryCompetenciesLoaded = true;
    if (state.data && state.view === 'competencies') renderCurrentView();
  });

function competencyVariant(item, variantKey) {
  if (variantKey === 'bg_zusatzfach') {
    if (!supplementaryCompetenciesLoaded) {
      return {
        assessment: 'Zusatzfachdaten werden geladen …',
        status: 'OFFEN',
        evidence: []
      };
    }
    if (supplementaryCompetenciesError) {
      return {
        assessment: 'Die Zusatzfachdaten konnten nicht geladen werden.',
        status: 'OFFEN',
        evidence: []
      };
    }
    return supplementaryCompetencyMap.get(item.id) || {
      assessment: 'Für diese Kompetenz ist noch kein Zusatzfacheintrag vorhanden.',
      status: 'OFFEN',
      evidence: []
    };
  }
  return item.variants?.[variantKey];
}

function competencyCoverage(items, variantKey) {
  const counts = {
    BELEGT: 0,
    'TEILWEISE BELEGT': 0,
    OFFEN: 0
  };

  for (const item of items) {
    const status = normalizeStatus(competencyVariant(item, variantKey)?.status);
    counts[status] += 1;
  }
  return counts;
}

function renderCoverageSummary(items) {
  return `<section class="coverage-grid" aria-label="Beleglage nach Schulvariante">
    ${Object.entries(COMPETENCY_VARIANT_LABELS).map(([key, label]) => {
      const counts = competencyCoverage(items, key);
      const optional = key === 'bg_zusatzfach';
      return `<article class="coverage-card" ${optional ? 'data-optional="true"' : ''}>
        <strong>${escapeHtml(label)}</strong>
        ${optional ? '<small>nur bei tatsächlichem Schulangebot</small>' : ''}
        <span>${counts.BELEGT} belegt</span>
        <span>${counts['TEILWEISE BELEGT']} teilweise belegt</span>
        <span>${counts.OFFEN} offen</span>
      </article>`;
    }).join('')}
  </section>`;
}

function renderFeatureLegend() {
  return `<details class="feature-legend">
    <summary>Was bedeuten die Vergleichsmerkmale?</summary>
    <div class="feature-legend-grid">
      ${Object.values(COMPETENCY_FEATURES).map(feature => `<div>
        <strong>${escapeHtml(feature.label)}</strong>
        <span>${escapeHtml(feature.description)}</span>
      </div>`).join('')}
    </div>
    <p class="muted">Nicht angezeigte Merkmale gelten nicht als fehlend. Sie wurden für diese Kompetenzzelle lediglich nicht ausdrücklich belegt.</p>
  </details>`;
}

function renderFeatures(features) {
  if (!Array.isArray(features) || features.length === 0) return '';
  return `<div class="feature-list" aria-label="Explizit dokumentierte Vergleichsmerkmale">
    ${features.map(id => {
      const feature = COMPETENCY_FEATURES[id];
      return feature
        ? `<span class="feature-chip" title="${escapeHtml(feature.description)}">${escapeHtml(feature.label)}</span>`
        : '';
    }).join('')}
  </div>`;
}

function renderCompetencyVariant(variantKey, variant) {
  const data = variant || {
    assessment: 'noch nicht erfasst',
    status: 'OFFEN',
    evidence: []
  };
  const status = normalizeStatus(data.status);
  const optional = variantKey === 'bg_zusatzfach';

  return `<section class="variant-card" data-status="${status}" ${optional ? 'data-optional="true"' : ''}>
    <div class="variant-header">
      <div>
        <h4>${escapeHtml(COMPETENCY_VARIANT_LABELS[variantKey] || variantKey)}</h4>
        ${optional ? '<span class="optional-label">schulabhängig</span>' : ''}
      </div>
      ${statusBadge(status)}
    </div>
    <p>${escapeHtml(data.assessment || 'Keine Bewertung hinterlegt.')}</p>
    ${renderFeatures(data.features)}
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
        .map(key => renderCompetencyVariant(key, competencyVariant(item, key)))
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
      <strong>Vier getrennte Vergleichsspalten</strong>
      Basisfach, Leistungsfach, reguläres BG und das optionale BG-Zusatzfach besitzen jeweils eigene Bewertungen und Fundstellen.
      Das Zusatzfach wird nur als mögliche Erweiterung dargestellt und darf nicht dem regulären BG-Pflichtumfang zugerechnet werden.
    </div>
    ${renderCoverageSummary(state.data.competencies)}
    ${renderFeatureLegend()}
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
