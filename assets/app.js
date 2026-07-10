'use strict';

const DATA_PATHS = {
  sources: 'data/quellen.json',
  topics: 'data/themen.json',
  competencies: 'data/kompetenzen.json',
  supplementary: 'data/sondergebiete.json',
  exams: 'data/pruefungen.json',
  findings: 'data/befunde.json',
  questions: 'data/offene_fragen.json',
  glossary: 'docs/GLOSSAR.md'
};

const VIEW_TITLES = {
  dashboard: 'Überblick',
  findings: 'Befunde',
  competencies: 'Kompetenzen',
  topics: 'Themen',
  supplementary: 'Zusatzfach',
  exams: 'Prüfungen',
  sources: 'Quellen',
  questions: 'Offene Fragen',
  glossary: 'Glossar'
};

const state = {
  data: null,
  view: 'dashboard',
  filters: {}
};

const content = document.querySelector('#content');
const title = document.querySelector('#view-title');
const loadState = document.querySelector('#load-state');
const nav = document.querySelector('#main-nav');
const menuToggle = document.querySelector('#menu-toggle');

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const normalizeStatus = value => {
  const status = String(value ?? 'OFFEN').toUpperCase();
  if (status.includes('TEILWEISE')) return 'TEILWEISE BELEGT';
  if (status.includes('BELEGT')) return 'BELEGT';
  return 'OFFEN';
};

const statusBadge = value => {
  const status = normalizeStatus(value);
  return `<span class="status-badge" data-status="${status}">${status}</span>`;
};

const sourceById = id => state.data.sourceMap.get(id);

const sourceLink = source => {
  if (!source) return '';
  const href = source.file || source.original_url;
  if (!href) return escapeHtml(source.title || source.id);
  return `<a href="${escapeHtml(encodeURI(href))}" target="_blank" rel="noopener">${escapeHtml(source.title || source.id)}</a>`;
};

const evidenceList = evidence => {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    return '<p class="muted">Keine Fundstelle hinterlegt.</p>';
  }
  return `<ul class="evidence-list">${evidence.map(item => {
    const source = sourceById(item.source || item.source_id);
    const sourceId = item.source || item.source_id || '?';
    const label = source ? sourceLink(source) : escapeHtml(sourceId);
    const location = item.location || item.fundstelle || 'Fundstelle nicht präzisiert';
    return `<li><span class="source-id">${escapeHtml(sourceId)}</span> · ${label}<br><span class="muted">${escapeHtml(location)}</span></li>`;
  }).join('')}</ul>`;
};

async function loadProjectData() {
  const entries = await Promise.all(Object.entries(DATA_PATHS).map(async ([key, path]) => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return [key, key === 'glossary' ? await response.text() : await response.json()];
  }));
  const data = Object.fromEntries(entries);
  data.sourceMap = new Map(data.sources.map(source => [source.id || source.source_id, source]));
  return data;
}

function metric(label, value) {
  return `<article class="metric"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></article>`;
}

function renderFindingCard(item) {
  return `<article class="card">
    <div class="card-header">
      <div><span class="muted">${escapeHtml(item.id || item.finding_id)}</span><h3>${escapeHtml(item.claim || item.aussage)}</h3></div>
      ${statusBadge(item.status)}
    </div>
    ${item.begruendung ? `<p>${escapeHtml(item.begruendung)}</p>` : ''}
    ${evidenceList(item.evidence || item.fundstellen)}
  </article>`;
}

function renderDashboard() {
  const { findings, competencies, sources, questions, supplementary } = state.data;
  const counts = findings.reduce((acc, item) => {
    const key = normalizeStatus(item.status);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const hardy = supplementary.find(item => item.kind === 'comparison');

  return `
    <section class="hero">
      <span class="badge">Quellenbasierter Zwischenstand</span>
      <h2>Ist SGG Soziales fachlich ein Nachteil gegenüber dem Biologie-Leistungsfach?</h2>
      <p>Das Projekt stellt vorhandene Befunde, Kompetenzen, Prüfungsdaten, das optionale Zusatzfach und offene Fragen transparent nebeneinander. Eine abschließende Gesamtantwort wird nicht vorgetäuscht.</p>
      <div class="hero-meta">
        ${statusBadge('BELEGT')}
        ${statusBadge('TEILWEISE BELEGT')}
        ${statusBadge('OFFEN')}
      </div>
    </section>

    <section class="metrics" aria-label="Projektumfang">
      ${metric('Quellen', sources.length)}
      ${metric('Befunde', findings.length)}
      ${metric('Kompetenzen', competencies.length)}
      ${metric('Offene Fragen', questions.length)}
    </section>

    <div class="grid">
      <section class="panel">
        <div class="section-heading"><div><h2>Befundlage</h2><p>Status der derzeit dokumentierten Befunde</p></div></div>
        <div class="stack">
          <div class="card-header"><span>${statusBadge('BELEGT')}</span><strong>${counts['BELEGT'] || 0}</strong></div>
          <div class="card-header"><span>${statusBadge('TEILWEISE BELEGT')}</span><strong>${counts['TEILWEISE BELEGT'] || 0}</strong></div>
          <div class="card-header"><span>${statusBadge('OFFEN')}</span><strong>${counts['OFFEN'] || 0}</strong></div>
        </div>
      </section>

      <section class="panel">
        <h2>Optionale BG-Erweiterung</h2>
        <p><strong>Sondergebiete der Biowissenschaften</strong> besitzt einen eigenen amtlichen Fachplan, ist aber nicht dem regulären BG-Pflichtcurriculum zuzurechnen.</p>
        ${hardy ? `<p>${escapeHtml(hardy.statement)}</p>${evidenceList(hardy.evidence)}` : ''}
        <p class="muted">Ob die konkrete Zielschule das Fach anbietet, bleibt offen.</p>
      </section>
    </div>

    <div class="section-heading"><div><h2>Aktuelle Befunde</h2><p>Direkt mit den hinterlegten Fundstellen</p></div></div>
    <section class="grid">${findings.map(renderFindingCard).join('')}</section>
  `;
}

function renderFindings() {
  const selected = state.filters.findingStatus || 'ALLE';
  const items = state.data.findings.filter(item => selected === 'ALLE' || normalizeStatus(item.status) === selected);
  return `
    <div class="controls">
      <div class="control"><label for="finding-status">Belegstatus</label><select id="finding-status">
        ${['ALLE', 'BELEGT', 'TEILWEISE BELEGT', 'OFFEN'].map(value => `<option ${selected === value ? 'selected' : ''}>${value}</option>`).join('')}
      </select></div>
    </div>
    <section class="stack">${items.length ? items.map(renderFindingCard).join('') : '<div class="empty">Keine Befunde für diesen Filter.</div>'}</section>
  `;
}

function renderCompetencies() {
  const topics = [...new Set(state.data.competencies.map(item => item.topic))].sort();
  const topic = state.filters.competencyTopic || 'ALLE';
  const query = (state.filters.competencyQuery || '').toLowerCase();
  const items = state.data.competencies.filter(item =>
    (topic === 'ALLE' || item.topic === topic) &&
    (!query || `${item.competency} ${item.topic}`.toLowerCase().includes(query))
  );

  return `
    <div class="notice"><strong>Vergleichsmaßstab: Kompetenzen</strong>Die Tabelle vergleicht das reguläre Fachangebot. Optionale Inhalte des Zusatzfaches werden bewusst in einer eigenen Ansicht geführt.</div>
    <div class="controls">
      <div class="control"><label for="competency-query">Suche</label><input id="competency-query" type="search" value="${escapeHtml(state.filters.competencyQuery || '')}" placeholder="Kompetenz oder Thema"></div>
      <div class="control"><label for="competency-topic">Thema</label><select id="competency-topic"><option>ALLE</option>${topics.map(value => `<option ${topic === value ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('')}</select></div>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Kompetenz</th><th>Basisfach</th><th>Leistungsfach</th><th>reguläres BG</th><th>Status</th></tr></thead>
      <tbody>${items.map(item => `<tr>
        <td><strong>${escapeHtml(item.competency)}</strong><br><span class="muted">${escapeHtml(item.topic)} · ${escapeHtml(item.id)}</span>${evidenceList(item.evidence)}</td>
        <td>${escapeHtml(item.basisfach || item.ag_basisfach)}</td>
        <td>${escapeHtml(item.leistungsfach || item.ag_leistungsfach)}</td>
        <td>${escapeHtml(item.bg)}</td>
        <td>${statusBadge(item.status)}</td>
      </tr>`).join('')}</tbody>
    </table></div>
  `;
}

function renderTopics() {
  return `<div class="notice"><strong>Orientierung, keine Rangliste</strong>Die Themenübersicht beschreibt das reguläre Fach. Das optionale Zusatzfach wird getrennt dargestellt.</div>
    <div class="table-wrap"><table>
      <thead><tr><th>Thema</th><th>Basisfach</th><th>Leistungsfach</th><th>reguläres BG</th><th>Status</th></tr></thead>
      <tbody>${state.data.topics.map(item => `<tr>
        <td><strong>${escapeHtml(item.topic)}</strong><br><span class="muted">${escapeHtml(item.id)}</span>${evidenceList(item.evidence)}</td>
        <td>${escapeHtml(item.basisfach || item.ag)}</td>
        <td>${escapeHtml(item.leistungsfach || item.lf)}</td>
        <td>${escapeHtml(item.bg)}</td>
        <td>${statusBadge(item.status)}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

function renderSupplementary() {
  const items = state.data.supplementary;
  const overview = items.find(item => item.kind === 'overview');
  const themes = items.find(item => item.kind === 'themes');
  const methods = items.find(item => item.kind === 'methods');
  const comparison = items.find(item => item.kind === 'comparison');
  const availability = items.find(item => item.kind === 'availability');

  return `
    <div class="notice warning"><strong>Optional und schulabhängig</strong>„Sondergebiete der Biowissenschaften“ ist eine eigenständige BG-Erweiterung. Die Inhalte dürfen nicht so dargestellt werden, als gehörten sie automatisch zum regulären Biologieunterricht des SGG Soziales.</div>

    <section class="grid">
      ${overview ? `<article class="card"><div class="card-header"><div><span class="muted">${escapeHtml(overview.id)}</span><h3>${escapeHtml(overview.title)}</h3></div>${statusBadge(overview.status)}</div><p>${escapeHtml(overview.statement)}</p>${evidenceList(overview.evidence)}</article>` : ''}
      ${themes ? `<article class="card"><div class="card-header"><div><span class="muted">${escapeHtml(themes.id)}</span><h3>${escapeHtml(themes.title)}</h3></div>${statusBadge(themes.status)}</div><p>${escapeHtml(themes.statement)}</p><div class="chip-list">${(themes.items || []).map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('')}</div>${evidenceList(themes.evidence)}</article>` : ''}
      ${methods ? `<article class="card"><div class="card-header"><div><span class="muted">${escapeHtml(methods.id)}</span><h3>${escapeHtml(methods.title)}</h3></div>${statusBadge(methods.status)}</div><p>${escapeHtml(methods.statement)}</p>${evidenceList(methods.evidence)}</article>` : ''}
      ${availability ? `<article class="card"><div class="card-header"><div><span class="muted">${escapeHtml(availability.id)}</span><h3>${escapeHtml(availability.title)}</h3></div>${statusBadge(availability.status)}</div><p>${escapeHtml(availability.statement)}</p>${evidenceList(availability.evidence)}</article>` : ''}
    </section>

    ${comparison ? `<section class="panel">
      <div class="section-heading"><div><h2>${escapeHtml(comparison.title)}</h2><p>${escapeHtml(comparison.statement)}</p></div>${statusBadge(comparison.status)}</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Variante</th><th>Dokumentierter Stand</th></tr></thead>
        <tbody>
          <tr><td><strong>reguläres BG-Biologie</strong></td><td>${escapeHtml(comparison.regular_bg)}</td></tr>
          <tr><td><strong>BG-Zusatzfach</strong></td><td>${escapeHtml(comparison.supplement)}</td></tr>
          <tr><td><strong>AG-Leistungsfach</strong></td><td>${escapeHtml(comparison.ag_lf)}</td></tr>
        </tbody>
      </table></div>
      ${evidenceList(comparison.evidence)}
    </section>` : ''}
  `;
}

function renderExams() {
  return `
    <div class="notice warning"><strong>Quellenlage beachten</strong>Das vorhandene Korpus enthält derzeit IQB-Aufgaben. Ein vergleichbares öffentliches BG-Korpus ist weiterhin als offene Frage zu prüfen.</div>
    <section class="grid">${state.data.exams.map(item => {
      const source = sourceById(item.source);
      return `<article class="card">
        <div class="card-header"><div><span class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.level)}</span><h3>${escapeHtml(item.title)}</h3></div><span class="badge">${escapeHtml(item.be)} BE</span></div>
        <p class="muted">Quelle: ${source ? sourceLink(source) : escapeHtml(item.source)}</p>
        <div class="afb">
          <div><strong>${escapeHtml(item.afb?.I ?? '–')}</strong><span>AFB I</span></div>
          <div><strong>${escapeHtml(item.afb?.II ?? '–')}</strong><span>AFB II</span></div>
          <div><strong>${escapeHtml(item.afb?.III ?? '–')}</strong><span>AFB III</span></div>
        </div>
        <h4>Themen</h4><div class="chip-list">${(item.topics || []).map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('')}</div>
        <h4>Operatoren</h4><div class="chip-list">${(item.operators || []).map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('')}</div>
        <h4>Materialien</h4><div class="chip-list">${(item.materials || []).map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('')}</div>
      </article>`;
    }).join('')}</section>`;
}

function renderSources() {
  const query = (state.filters.sourceQuery || '').toLowerCase();
  const type = state.filters.sourceType || 'ALLE';
  const types = [...new Set(state.data.sources.map(item => item.type))].sort();
  const items = state.data.sources.filter(item =>
    (type === 'ALLE' || item.type === type) &&
    (!query || `${item.id} ${item.title} ${item.publisher} ${item.scope}`.toLowerCase().includes(query))
  );

  return `
    <div class="controls">
      <div class="control"><label for="source-query">Suche</label><input id="source-query" type="search" value="${escapeHtml(state.filters.sourceQuery || '')}" placeholder="Titel, ID, Herausgeber"></div>
      <div class="control"><label for="source-type">Quellentyp</label><select id="source-type"><option>ALLE</option>${types.map(value => `<option ${type === value ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('')}</select></div>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Quelle</th><th>Typ / Geltung</th><th>Nachweis</th><th>Zugriff</th></tr></thead>
      <tbody>${items.map(item => `<tr>
        <td><strong>${escapeHtml(item.title)}</strong><br><span class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.publisher || '')}</span></td>
        <td>${escapeHtml(item.type)}<br><span class="muted">${escapeHtml(item.scope || '')}</span></td>
        <td><span class="muted">SHA-256</span><br><code title="${escapeHtml(item.sha256 || '')}">${escapeHtml((item.sha256 || '').slice(0, 14))}${item.sha256 ? '…' : '–'}</code><br><span class="muted">${escapeHtml(item.license_status || '')}</span></td>
        <td>${item.file ? `<a href="${escapeHtml(encodeURI(item.file))}" target="_blank" rel="noopener">Repository-Datei</a><br>` : ''}${item.original_url ? `<a href="${escapeHtml(item.original_url)}" target="_blank" rel="noopener">Originalquelle</a>` : ''}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

function renderQuestions() {
  const priorityOrder = { hoch: 0, mittel: 1, niedrig: 2 };
  const items = [...state.data.questions].sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9));
  return `<div class="notice warning"><strong>Offene Fragen bleiben sichtbar</strong>Sie markieren Grenzen der Quellenlage und werden nicht durch Vermutungen geschlossen.</div>
    <section class="stack">${items.map(item => `<article class="card">
      <div class="card-header"><div><span class="muted">${escapeHtml(item.id || item.question_id)}</span><h3>${escapeHtml(item.question || item.frage)}</h3></div><span class="tag">Priorität ${escapeHtml(item.priority || item.prioritaet || 'offen')}</span></div>
    </article>`).join('')}</section>`;
}

function parseGlossary(markdown) {
  const lines = markdown.split(/\r?\n/);
  const entries = [];
  let current = null;
  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      if (current) entries.push(current);
      current = { term: heading[1].trim(), body: [] };
    } else if (current && line.trim()) {
      current.body.push(line.replace(/^[-*]\s*/, '').trim());
    }
  }
  if (current) entries.push(current);
  return entries;
}

function renderGlossary() {
  const entries = parseGlossary(state.data.glossary);
  return `<section class="grid">${entries.map(item => `<article class="card"><h3>${escapeHtml(item.term)}</h3><p>${escapeHtml(item.body.join(' '))}</p></article>`).join('')}</section>`;
}

function renderCurrentView() {
  const renderers = {
    dashboard: renderDashboard,
    findings: renderFindings,
    competencies: renderCompetencies,
    topics: renderTopics,
    supplementary: renderSupplementary,
    exams: renderExams,
    sources: renderSources,
    questions: renderQuestions,
    glossary: renderGlossary
  };
  title.textContent = VIEW_TITLES[state.view];
  content.innerHTML = renderers[state.view]();
  bindViewControls();
}

function bindViewControls() {
  const bind = (selector, event, callback) => {
    const element = document.querySelector(selector);
    if (element) element.addEventListener(event, callback);
  };
  bind('#finding-status', 'change', event => { state.filters.findingStatus = event.target.value; renderCurrentView(); });
  bind('#competency-topic', 'change', event => { state.filters.competencyTopic = event.target.value; renderCurrentView(); });
  bind('#competency-query', 'input', event => { state.filters.competencyQuery = event.target.value; renderCurrentView(); document.querySelector('#competency-query')?.focus(); });
  bind('#source-type', 'change', event => { state.filters.sourceType = event.target.value; renderCurrentView(); });
  bind('#source-query', 'input', event => { state.filters.sourceQuery = event.target.value; renderCurrentView(); document.querySelector('#source-query')?.focus(); });
}

function activateView(view) {
  if (!state.data || !VIEW_TITLES[view]) return;
  state.view = view;
  document.querySelectorAll('[data-view]').forEach(button => button.classList.toggle('is-active', button.dataset.view === view));
  document.body.classList.remove('nav-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  renderCurrentView();
  content.focus({ preventScroll: true });
}

nav.addEventListener('click', event => {
  const button = event.target.closest('[data-view]');
  if (button) activateView(button.dataset.view);
});

menuToggle.addEventListener('click', () => {
  const open = document.body.classList.toggle('nav-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

document.addEventListener('click', event => {
  if (document.body.classList.contains('nav-open') && !event.target.closest('.sidebar') && !event.target.closest('#menu-toggle')) {
    document.body.classList.remove('nav-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

loadProjectData()
  .then(data => {
    state.data = data;
    loadState.textContent = `${data.sources.length} Quellen · ${data.findings.length} Befunde`;
    renderCurrentView();
  })
  .catch(error => {
    console.error(error);
    loadState.textContent = 'Daten konnten nicht geladen werden';
    loadState.classList.add('is-error');
    content.innerHTML = `<section class="error-panel"><h2>Die Projektdaten konnten nicht geladen werden.</h2><p>Öffne die Anwendung über GitHub Pages oder starte im Repository einen lokalen Webserver:</p><p><code>python -m http.server 8000</code></p><p>Danach: <a href="http://localhost:8000">http://localhost:8000</a></p><p class="muted">Technischer Hinweis: ${escapeHtml(error.message)}</p></section>`;
  });
