export const GENERATOR_DEFAULTS = {
  length: 20,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true
};

const MIN_PASSWORD_LENGTH = 1;
const MAX_PASSWORD_LENGTH = 128;

export function setCurrentYear() {
  const currentYearElement = getElement('currentYear');

  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
}

export function getPasswordLengthFromDom() {
  const lengthInput = getElement('length');

  if (!lengthInput) {
    return GENERATOR_DEFAULTS.length;
  }

  const parsedLength = Number.parseInt(lengthInput.value, 10);

  if (!Number.isInteger(parsedLength)) {
    return GENERATOR_DEFAULTS.length;
  }

  return clamp(parsedLength, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH);
}

export function normaliseLengthInput() {
  const lengthInput = getElement('length');

  if (lengthInput) {
    lengthInput.value = getPasswordLengthFromDom();
  }
}

export function getGeneratorOptionsFromDom() {
  return {
    includeLowercase: getCheckboxValue('includeLowercase', true),
    includeUppercase: getCheckboxValue('includeUppercase', true),
    includeNumbers: getCheckboxValue('includeNumbers', true),
    includeSymbols: getCheckboxValue('includeSymbols', true)
  };
}

export function applyGeneratorOptionsToDom(options) {
  const safeOptions = {
    ...GENERATOR_DEFAULTS,
    ...options
  };

  setInputValue('length', clamp(
    Number.parseInt(safeOptions.length, 10) || GENERATOR_DEFAULTS.length,
    MIN_PASSWORD_LENGTH,
    MAX_PASSWORD_LENGTH
  ));

  setCheckboxValue('includeLowercase', safeOptions.includeLowercase);
  setCheckboxValue('includeUppercase', safeOptions.includeUppercase);
  setCheckboxValue('includeNumbers', safeOptions.includeNumbers);
  setCheckboxValue('includeSymbols', safeOptions.includeSymbols);
}

export function displayGeneratedPassword(password) {
  setInputValue('password', password);
}

export function getAnalysisPasswordFromDom() {
  const analysisPasswordInput = getElement('analysisPassword');
  return analysisPasswordInput?.value ?? '';
}

export function updateMetricsDisplay({
  password,
  strengthScore,
  entropyBits,
  entropyLabel = 'Entropy'
}) {
  updatePasswordStrengthDisplay(strengthScore);
  updateEntropyDisplay(entropyBits, entropyLabel);

  const hasPassword = Boolean(password);
  setMetricEmptyState(!hasPassword);
}

export function updateFeedbackDisplay(feedback) {
  const feedbackContainer = getElement('feedbackContainer');
  const feedbackList = getElement('feedbackList');

  if (!feedbackContainer || !feedbackList) {
    return;
  }

  feedbackList.innerHTML = '';

  if (!feedback || feedback.length === 0) {
    feedbackContainer.hidden = true;
    return;
  }

  feedback.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    feedbackList.appendChild(listItem);
  });

  feedbackContainer.hidden = false;
}

export function setAppMode(mode) {
  const isGenerateMode = mode === 'generate';
  const isAnalyseMode = mode === 'analyse';

  setHidden('generatePanel', !isGenerateMode);
  setHidden('analysePanel', !isAnalyseMode);

  setPressedState('generateModeButton', isGenerateMode);
  setPressedState('analyseModeButton', isAnalyseMode);

  setActiveClass('generateModeButton', isGenerateMode);
  setActiveClass('analyseModeButton', isAnalyseMode);
}

export function showLoadingSpinner() {
  const spinner = getElement('loading-spinner');

  if (spinner) {
    spinner.style.display = 'block';
  }
}

export function hideLoadingSpinner() {
  const spinner = getElement('loading-spinner');

  if (spinner) {
    spinner.style.display = 'none';
  }
}

export async function copyGeneratedPasswordToClipboard() {
  const passwordField = getElement('password');
  const password = passwordField?.value ?? '';

  if (!password) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(password);
    return true;
  } catch (error) {
    alert('Failed to copy password to clipboard.');
    return false;
  }
}

export function setCopyButtonTemporaryText(text, durationMs = 1400) {
  const copyButton = getElement('copy');

  if (!copyButton) {
    return;
  }

  const originalText = copyButton.textContent;
  copyButton.textContent = text;

  window.setTimeout(() => {
    copyButton.textContent = originalText;
  }, durationMs);
}

export function toggleGeneratedPasswordVisibility() {
  togglePasswordFieldVisibility({
    inputId: 'password',
    buttonId: 'togglePassword'
  });
}

export function toggleAnalysisPasswordVisibility() {
  togglePasswordFieldVisibility({
    inputId: 'analysisPassword',
    buttonId: 'toggleAnalysisPassword'
  });
}

export function clearAnalysisPasswordInput() {
  setInputValue('analysisPassword', '');
}

export function bindInputEvent(id, handler) {
  bindEvent(id, 'input', handler);
}

export function bindClickEvent(id, handler) {
  bindEvent(id, 'click', handler);
}

export function bindChangeEvent(id, handler) {
  bindEvent(id, 'change', handler);
}

function updatePasswordStrengthDisplay(strengthScore) {
  const strengthMeter = getElement('strength');

  if (!strengthMeter) {
    return;
  }

  strengthMeter.value = clamp(strengthScore, 0, 100);
  strengthMeter.classList.remove('strength-weak', 'strength-medium', 'strength-strong');

  if (strengthScore < 40) {
    strengthMeter.classList.add('strength-weak');
  } else if (strengthScore < 75) {
    strengthMeter.classList.add('strength-medium');
  } else {
    strengthMeter.classList.add('strength-strong');
  }
}

function updateEntropyDisplay(entropyBits, entropyLabel) {
  const entropyValue = getElement('entropyValue');
  const entropyLabelElement = getElement('entropyLabel');

  if (entropyValue) {
    entropyValue.textContent = `${entropyBits} bits`;
  }

  if (entropyLabelElement) {
    entropyLabelElement.textContent = entropyLabel;
  }
}

function setMetricEmptyState(isEmpty) {
  const metricsContainer = getElement('strengthEntropy');

  if (!metricsContainer) {
    return;
  }

  metricsContainer.classList.toggle('is-empty', isEmpty);
}

function togglePasswordFieldVisibility({ inputId, buttonId }) {
  const passwordField = getElement(inputId);
  const toggleButton = getElement(buttonId);

  if (!passwordField || !toggleButton) {
    return;
  }

  const isPasswordHidden = passwordField.type === 'password';

  passwordField.type = isPasswordHidden ? 'text' : 'password';
  toggleButton.textContent = isPasswordHidden ? 'Hide' : 'Show';
}

function getElement(id) {
  return document.getElementById(id);
}

function getCheckboxValue(id, fallback) {
  const checkbox = getElement(id);

  if (!checkbox) {
    return fallback;
  }

  return checkbox.checked;
}

function setCheckboxValue(id, value) {
  const checkbox = getElement(id);

  if (checkbox) {
    checkbox.checked = Boolean(value);
  }
}

function setInputValue(id, value) {
  const input = getElement(id);

  if (input) {
    input.value = value;
  }
}

function setHidden(id, hidden) {
  const element = getElement(id);

  if (element) {
    element.hidden = hidden;
  }
}

function setPressedState(id, pressed) {
  const button = getElement(id);

  if (button) {
    button.setAttribute('aria-pressed', String(pressed));
  }
}

function setActiveClass(id, isActive) {
  const element = getElement(id);

  if (element) {
    element.classList.toggle('is-active', isActive);
  }
}

function bindEvent(id, eventName, handler) {
  const element = getElement(id);

  if (element) {
    element.addEventListener(eventName, handler);
  }
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}