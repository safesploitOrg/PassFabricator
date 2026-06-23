import {
  generatePassword,
  calculateGeneratedPasswordEntropy,
  validatePasswordOptions,
  parseWordList,
  generatePassphrase,
  calculatePassphraseEntropy
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
  normalisePassphraseWordCountInput,
  getGeneratorTypeFromDom,
  getGeneratorOptionsFromDom,
  applyGeneratorOptionsToDom,
  displayGeneratedPassword,
  updateMetricsDisplay,
  updateFeedbackDisplay,
  setAppMode,
  setGeneratorType,
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
const PASSPHRASE_WORDLIST_URL = 'assets/wordlist/eff_large_wordlist.txt';

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

const PASSPHRASE_CASE_IDS = [
  'passphraseCaseLowercase',
  'passphraseCaseUppercase',
  'passphraseCaseCapitalise'
];

let passphraseWordListPromise = null;

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

  if (getGeneratorTypeFromDom() === 'memorable') {
    void loadPassphraseWordList().catch(() => {});
  }

  if (initialMode === 'generate') {
    generateAndDisplayPassword();
  } else {
    analyseProvidedPassword();
  }
}

function bindGeneratorEvents() {
  bindClickEvent('randomGeneratorTab', () => {
    selectGeneratorType('random');
  });

  bindClickEvent('memorableGeneratorTab', () => {
    void loadPassphraseWordList().catch(() => {});
    selectGeneratorType('memorable');
  });

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

  bindInputEvent('passphraseWordCount', () => {
    normalisePassphraseWordCountInput();
    persistCurrentGeneratorPreferences();
    generateAndDisplayPassword();
  });

  bindInputEvent('passphraseDelimiter', () => {
    persistCurrentGeneratorPreferences();
    generateAndDisplayPassword();
  });

  PASSPHRASE_CASE_IDS.forEach((id) => {
    bindChangeEvent(id, () => {
      persistCurrentGeneratorPreferences();
      generateAndDisplayPassword();
    });
  });

  bindChangeEvent('passphraseUseNumbers', () => {
    persistCurrentGeneratorPreferences();
    generateAndDisplayPassword();
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

function selectGeneratorType(generatorType) {
  setGeneratorType(generatorType);
  persistCurrentGeneratorPreferences();
  generateAndDisplayPassword();
}

function generateAndDisplayPassword() {
  normaliseLengthInput();
  normalisePassphraseWordCountInput();

  const length = getPasswordLengthFromDom();
  const options = getGeneratorOptionsFromDom();

  showLoadingSpinner();

  window.setTimeout(async () => {
    try {
      if (options.generatorType === 'memorable') {
        const wordList = await loadPassphraseWordList();
        const password = generatePassphrase(wordList, {
          wordCount: options.passphraseWordCount,
          delimiter: options.passphraseDelimiter,
          caseMode: options.passphraseCase,
          substituteNumbers: options.passphraseUseNumbers
        });
        const entropyBits = calculatePassphraseEntropy(
          options.passphraseWordCount,
          wordList.length
        );
        const analysis = analysePassword(password);

        displayGeneratedPassword(password);

        updateMetricsDisplay({
          password,
          strengthScore: analysis.strengthScore,
          entropyBits,
          entropyLabel: 'Entropy'
        });

        updateFeedbackDisplay([]);
        return;
      }

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
    } catch (error) {
      console.error('Unable to generate password:', error);
      updateFeedbackDisplay([
        'Unable to generate a password. Check that the passphrase wordlist can be loaded.'
      ]);
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

async function loadPassphraseWordList() {
  if (!passphraseWordListPromise) {
    passphraseWordListPromise = fetch(PASSPHRASE_WORDLIST_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Wordlist request failed with status ${response.status}.`);
        }

        return response.text();
      })
      .then((rawWordList) => {
        const wordList = parseWordList(rawWordList);

        if (wordList.length === 0) {
          throw new Error('Passphrase wordlist is empty.');
        }

        return wordList;
      })
      .catch((error) => {
        passphraseWordListPromise = null;
        throw error;
      });
  }

  return passphraseWordListPromise;
}
