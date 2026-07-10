'use strict';

function examCard(item) {
  const source = sourceById(item.source);
  const context = [
    item.pages ? `S. ${item.pages}` : '',
    item.duration_minutes ? `${item.duration_minutes} Minuten Gesamtprüfung` : '',
    item.selection || ''
  ].filter(Boolean).join(' · ');
  const schools = Array.isArray(item.school_types) ? item.school_types.join(', ') : '';
  const afb = item.afb
    ? `<div class="afb"><div><strong>${escapeHtml(item.afb.I ?? '–')}</strong><span>AFB I</span></div><div><strong>${escapeHtml(item.afb.II ?? '–')}</strong><span>AFB II</span></div><div><strong>${escapeHtml(item.afb.III ?? '–')}</strong><span>AFB III</span></div></div>`
    : '<p class="muted">Keine belastbare AFB-Verteilung hinterlegt; dafür wäre ein Erwartungshorizont nötig.</p>';

  return `<article class="card">
    <div class="card-header"><div><span class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.level)}</span><h3>${escapeHtml(item.title)}</h3></div><span class="badge">${escapeHtml(item.be)} BE</span></div>
    <p class="muted">Quelle: ${source ? sourceLink(source) : escapeHtml(item.source)}</p>
    ${schools ? `<p><strong>Geltung:</strong> ${escapeHtml(schools)}</p>` : ''}
    ${context ? `<p class="muted">${escapeHtml(context)}</p>` : ''}
    ${afb}
    <h4>Themen</h4><div class="chip-list">${(item.topics || []).map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('')}</div>
    <h4>Operatoren</h4><div class="chip-list">${(item.operators || []).map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('')}</div>
    <h4>Materialien</h4><div class="chip-list">${(item.materials || []).map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('')}</div>
  </article>`;
}

renderExams = function renderExamsWithBgCorpus() {
  const bg = state.data.exams.filter(item => item.system === 'BG');
  const iqb = state.data.exams.filter(item => item.system !== 'BG');

  return `
    <div class="notice"><strong>Amtlicher BG-Aufgabensatz vorhanden</strong>Der Haupttermin 2025 belegt eine schriftliche Biologieprüfung für EG, SGGS, TG und WG. Vier Aufgaben mit je 30 BE wurden vorgelegt; drei waren in 255 Minuten zu bearbeiten.</div>
    <div class="notice warning"><strong>Grenze der Auswertung</strong>Ein Erwartungshorizont liegt noch nicht vor. Deshalb werden für die BG-Aufgaben keine AFB-Anteile geschätzt.</div>
    <div class="section-heading"><div><h2>Berufliches Gymnasium</h2><p>Haupttermin 2025 · amtlicher Aufgabensatz</p></div></div>
    <section class="grid">${bg.map(examCard).join('')}</section>
    <div class="section-heading"><div><h2>IQB-Aufgaben</h2><p>Referenzmaterial für grundlegendes und erhöhtes Niveau</p></div></div>
    <section class="grid">${iqb.map(examCard).join('')}</section>`;
};

renderQuestions = function renderQuestionsWithStatus() {
  const priorityOrder = { hoch: 0, mittel: 1, niedrig: 2 };
  const items = [...state.data.questions].sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9));
  return `<div class="notice warning"><strong>Offene Fragen bleiben sichtbar</strong>Teilantworten werden dokumentiert, ohne die verbleibende Lücke zu verdecken.</div>
    <section class="stack">${items.map(item => `<article class="card">
      <div class="card-header"><div><span class="muted">${escapeHtml(item.id || item.question_id)}</span><h3>${escapeHtml(item.question || item.frage)}</h3></div><span class="tag">Priorität ${escapeHtml(item.priority || item.prioritaet || 'offen')}</span></div>
      ${item.status ? `<p><strong>Status:</strong> ${escapeHtml(item.status)}</p>` : ''}
      ${item.note ? `<p class="muted">${escapeHtml(item.note)}</p>` : ''}
    </article>`).join('')}</section>`;
};
