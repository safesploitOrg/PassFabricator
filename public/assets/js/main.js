import {
  generatePassword,
  calculateGeneratedPasswordEntropy,
  validatePasswordOptions
} from './modules/generate_password.js';

import {
  analysePassword
} from './modules/analyse_password.js';

import {
  loadPreferences,
  savePreferences
} from './modules/storage.js';

import {
  GENERATOR_DEFAULTS,
  setCurrentYear,
  getPasswordLengthFromDom,
  normaliseLengthInput,
  getGeneratorOptionsFromDom,
  applyGeneratorOptionsToDom,
  displayGeneratedPassword,
  updateMetricsDisplay,
  updateFeedbackDisplay,
  setAppMode,
  showLoadingSpinner,
  hideLoadingSpinner,
  copyGeneratedPasswordToClipboard,
  toggleGeneratedPasswordVisibility,
  toggleAnalysisPasswordVisibility,
  clearAnalysisPasswordInput,
  getAnalysisPasswordFromDom,
  setCopyButtonTemporaryText,
  bindInputEvent,
  bindClickEvent,
  bindChangeEvent
} from './modules/ui.js';

const DEFAULT_APP_MODE = 'generate';

const HASH_TO_MODE = {
  '#generate': 'generate',
  '#analyse': 'analyse',
  '#analyze': 'analyse',
  '#analyise': 'analyse'
};

const MODE_TO_HASH = {
  generate: '#generate',
  analyse: '#analyse'
};

const CHECKBOX_IDS = [
  'includeLowercase',
  'includeUppercase',
  'includeNumbers',
  'includeSymbols'
];

document.addEventListener('DOMContentLoaded', initialiseApp);

function initialiseApp() {
  setCurrentYear();

  const savedPreferences = loadPreferences();

  if (savedPreferences) {
    applyGeneratorOptionsToDom(savedPreferences);
  } else {
    applyGeneratorOptionsToDom(GENERATOR_DEFAULTS);
  }

  bindGeneratorEvents();
  bindAnalyserEvents();
  bindModeEvents();

  const initialMode = getModeFromHash();

  setAppMode(initialMode);

  if (initialMode === 'generate') {
    generateAndDisplayPassword();
  } else {
    analyseProvidedPassword();
  }
}

function bindGeneratorEvents() {
  bindInputEvent('length', () => {
    normaliseLengthInput();
    persistCurrentGeneratorPreferences();
    generateAndDisplayPassword();
  });

  CHECKBOX_IDS.forEach((id) => {
    bindChangeEvent(id, () => {
      persistCurrentGeneratorPreferences();
      generateAndDisplayPassword();
    });
  });

  bindClickEvent('copy', async () => {
    const copied = await copyGeneratedPasswordToClipboard();

    if (copied) {
      setCopyButtonTemporaryText('Copied!', 1400);
    }
  });

  bindClickEvent('togglePassword', toggleGeneratedPasswordVisibility);
}

function bindAnalyserEvents() {
  bindInputEvent('analysisPassword', analyseProvidedPassword);
  bindClickEvent('toggleAnalysisPassword', toggleAnalysisPasswordVisibility);

  bindClickEvent('clearAnalysisPassword', () => {
    clearAnalysisPasswordInput();
    analyseProvidedPassword();
  });
}

function bindModeEvents() {
  bindClickEvent('generateModeButton', () => {
    updateHashForMode('generate');
    setAppMode('generate');
    generateAndDisplayPassword();
  });

  bindClickEvent('analyseModeButton', () => {
    updateHashForMode('analyse');
    setAppMode('analyse');
    analyseProvidedPassword();
  });

  window.addEventListener('hashchange', handleHashChange);
}

function persistCurrentGeneratorPreferences() {
  const preferences = {
    length: getPasswordLengthFromDom(),
    ...getGeneratorOptionsFromDom()
  };

  savePreferences(preferences);
}

function generateAndDisplayPassword() {
  normaliseLengthInput();

  const length = getPasswordLengthFromDom();
  const options = getGeneratorOptionsFromDom();

  showLoadingSpinner();

  window.setTimeout(() => {
    try {
      if (!validatePasswordOptions(options)) {
        alert('You must select at least one character type!');
        return;
      }

      const password = generatePassword(length, options);
      const entropyBits = calculateGeneratedPasswordEntropy(password, options);
      const analysis = analysePassword(password);

      displayGeneratedPassword(password);

      updateMetricsDisplay({
        password,
        strengthScore: analysis.strengthScore,
        entropyBits,
        entropyLabel: 'Entropy'
      });

      updateFeedbackDisplay([]);
    } finally {
      hideLoadingSpinner();
    }
  }, 300);
}

function analyseProvidedPassword() {
  const password = getAnalysisPasswordFromDom();
  const analysis = analysePassword(password);

  updateMetricsDisplay({
    password,
    strengthScore: analysis.strengthScore,
    entropyBits: analysis.entropyBits,
    entropyLabel: 'Estimated entropy'
  });

  updateFeedbackDisplay(analysis.feedback);
}

function getModeFromHash() {
  const hash = window.location.hash.toLowerCase();

  return HASH_TO_MODE[hash] ?? DEFAULT_APP_MODE;
}

function updateHashForMode(mode) {
  const targetHash = MODE_TO_HASH[mode] ?? MODE_TO_HASH[DEFAULT_APP_MODE];

  if (window.location.hash !== targetHash) {
    window.history.replaceState(null, '', targetHash);
  }
}

function handleHashChange() {
  const mode = getModeFromHash();

  setAppMode(mode);

  if (mode === 'generate') {
    generateAndDisplayPassword();
  } else {
    analyseProvidedPassword();
  }
}