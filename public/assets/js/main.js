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

  setAppMode('generate');
  generateAndDisplayPassword();
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
    setAppMode('generate');
    generateAndDisplayPassword();
  });

  bindClickEvent('analyseModeButton', () => {
    setAppMode('analyse');
    analyseProvidedPassword();
  });
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

      displayGeneratedPassword(password);

      updateMetricsDisplay({
        password,
        strengthScore: analysePassword(password).strengthScore,
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