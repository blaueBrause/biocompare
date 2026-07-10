'use strict';

(function applyAg2022EvidenceLayer() {
  const SOURCE_PATH = 'data/quellen_ergaenzungen.json';
  const OVERRIDE_PATH = 'data/kompetenzen_ag_2022.json';
  const FINDINGS_PATH = 'data/befunde_ag_2022.json';

  function mergeById(base, additions) {
    const map = new Map((base || []).map(item => [item.id || item.source_id, item]));
    for (const item of additions || []) map.set(item.id || item.source_id, item);
    return [...map.values()];
  }

  function applyWhenReady(additionalSources, overrides, findingOverrides) {
    if (!state.data) {
      window.setTimeout(() => applyWhenReady(additionalSources, overrides, findingOverrides), 40);
      return;
    }

    state.data.sources = mergeById(state.data.sources, additionalSources);
    state.data.sourceMap = new Map(state.data.sources.map(source => [source.id || source.source_id, source]));

    const overrideMap = new Map((overrides || []).map(item => [item.id, item]));
    state.data.competencies = state.data.competencies.map(item => {
      const override = overrideMap.get(item.id);
      if (!override) return item;
      return {
        ...item,
        variants: {
          ...item.variants,
          ag_basisfach: override.ag_basisfach,
          ag_leistungsfach: override.ag_leistungsfach
        }
      };
    });

    state.data.findings = mergeById(state.data.findings, findingOverrides);
    loadState.textContent = `${state.data.sources.length} Quellen · ${state.data.findings.length} Befunde`;
    renderCurrentView();
  }

  Promise.all([SOURCE_PATH, OVERRIDE_PATH, FINDINGS_PATH].map(async path => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
  }))
    .then(([additionalSources, overrides, findingOverrides]) => {
      applyWhenReady(additionalSources, overrides, findingOverrides);
    })
    .catch(error => {
      console.error('AG-2022-Evidenz konnte nicht geladen werden:', error);
    });
})();
