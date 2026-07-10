'use strict';

let examRules = [];
let examRulesLoadError = null;

const renderExamsWithoutRules = renderExams;

function ruleSourceLabel(rule) {
  const source = rule.source || {};
  const hash = source.sha256 ? `${source.sha256.slice(0, 12)}…` : 'kein Hash';
  return `${source.filename || 'Quelle'} · S. ${source.pages || '–'} · SHA-256 ${hash}`;
}

function ruleTopics(rule) {
  const written = rule.written || {};
  return (written.topics || []).map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('');
}

function ruleExclusions(rule) {
  const exclusions = rule.written?.exclusions || [];
  if (!exclusions.length) return '<span class="muted">Keine jahresspezifische Einschränkung dokumentiert.</span>';
  return `<ul class="evidence-list">${exclusions.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul>`;
}

function examRuleRow(rule) {
  const written = rule.written || {};
  const choice = written.tasks_offered && written.tasks_required
    ? `${written.tasks_required} von ${written.tasks_offered}`
    : '–';
  const units = written.assessment_units ? `${written.assessment_units} BE/Punkte` : 'nicht angegeben';
  const schools = Array.isArray(rule.school_types) ? rule.school_types.join(', ') : '';
  const basis = rule.basisfach
    ? `<details><summary>Basisfach</summary><p>${rule.basisfach.central_written === false ? 'Keine zentrale schriftliche Prüfung; mündliche Prüfung.' : ''}</p><div class="chip-list">${(rule.basisfach.topics || []).map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('')}</div></details>`
    : '';
  const oral = rule.oral?.note
    ? `<p class="muted"><strong>Mündlich:</strong> ${escapeHtml(rule.oral.note)}</p>`
    : '';

  return `<tr>
    <td><strong>${escapeHtml(rule.year)}</strong><br><span class="muted">${escapeHtml(rule.id)}</span></td>
    <td><strong>${escapeHtml(rule.system)}</strong><br>${escapeHtml(rule.variant)}${schools ? `<br><span class="muted">${escapeHtml(schools)}</span>` : ''}</td>
    <td>${escapeHtml(written.duration_minutes || '–')} Minuten<br><span class="muted">${escapeHtml(choice)} Aufgaben · ${escapeHtml(units)}</span>${basis}</td>
    <td><div class="chip-list">${ruleTopics(rule)}</div></td>
    <td>${ruleExclusions(rule)}${oral}</td>
    <td><span class="muted">${escapeHtml(ruleSourceLabel(rule))}</span></td>
  </tr>`;
}

function renderExamRules() {
  if (examRulesLoadError) {
    return `<div class="notice warning"><strong>Prüfungsvorgaben nicht geladen</strong>${escapeHtml(examRulesLoadError)}</div>`;
  }
  if (!examRules.length) {
    return '<div class="notice"><strong>Prüfungsvorgaben werden geladen</strong>Die Jahresreihe 2023–2025 wird vorbereitet.</div>';
  }

  const ordered = [...examRules].sort((a, b) => a.year - b.year || a.system.localeCompare(b.system));
  return `
    <div class="notice">
      <strong>Neue Belegreihe 2023–2025</strong>
      Die Tabelle trennt jährliche Prüfungsumfänge vom allgemeinen Curriculum. Eine jahresspezifische Ausnahme ist kein Beleg dafür, dass der Inhalt im Unterricht fehlt.
    </div>
    <div class="grid">
      <section class="panel">
        <h2>Was sich belastbar zeigt</h2>
        <p><strong>AG-Leistungsfach:</strong> zentrale schriftliche Prüfung mit vier Aufgaben, von denen drei gewählt werden; 270 Minuten in 2023/2024 und 300 Minuten in 2025.</p>
        <p><strong>Reguläres BG:</strong> 2023 noch nach altem Plan mit 210 Minuten und zwei von drei Aufgaben; seit 2024 nach Bildungsplan 2021 mit 255 Minuten und drei von vier Aufgaben.</p>
      </section>
      <section class="panel">
        <h2>Wichtige Grenze</h2>
        <p>Die 2025 beim BG genannten Ausschlüsse gelten ausdrücklich nur schriftlich. Die vollständigen BPE bleiben für die mündliche Prüfung relevant.</p>
        <p>Beim AG ist das Basisfach in diesen Erlassen als mündliches Prüfungsfach dokumentiert; die zentrale schriftliche Prüfung betrifft das Leistungsfach.</p>
      </section>
    </div>
    <div class="section-heading"><div><h2>Prüfungsvorgaben im Zeitvergleich</h2><p>Amtliche Jahresvorgaben, nicht geschätzte Unterrichtstiefe</p></div></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Jahr</th><th>Variante</th><th>Schriftlicher Rahmen</th><th>Themen</th><th>Einschränkungen</th><th>Quelle</th></tr></thead>
      <tbody>${ordered.map(examRuleRow).join('')}</tbody>
    </table></div>`;
}

renderExams = function renderExamsWithRules() {
  return `${renderExamRules()}${renderExamsWithoutRules()}`;
};

fetch('data/pruefungsvorgaben.json')
  .then(response => {
    if (!response.ok) throw new Error(`data/pruefungsvorgaben.json: HTTP ${response.status}`);
    return response.json();
  })
  .then(data => {
    examRules = Array.isArray(data) ? data : [];
    if (state.data && state.view === 'exams') renderCurrentView();
  })
  .catch(error => {
    examRulesLoadError = error.message;
    if (state.data && state.view === 'exams') renderCurrentView();
  });
