const LOWERCASE_PATTERN = /[a-z]/;
const UPPERCASE_PATTERN = /[A-Z]/;
const NUMBER_PATTERN = /[0-9]/;
const SYMBOL_PATTERN = /[^a-zA-Z0-9]/;

const COMMON_PASSWORD_TERMS = [
  'password',
  'passw0rd',
  'admin',
  'administrator',
  'welcome',
  'letmein',
  'qwerty',
  'abc123',
  'iloveyou',
  'football',
  'monkey',
  'dragon',
  'login',
  'secret',
  'changeme',
  'default'
];

const KEYBOARD_PATTERNS = [
  'qwerty',
  'asdf',
  'zxcv',
  '1234',
  '2345',
  '3456',
  '4567',
  '5678',
  '6789',
  '9876',
  '8765',
  '7654',
  '6543',
  '5432',
  '4321'
];

export function analysePassword(password) {
  const normalisedPassword = String(password ?? '');

  if (!normalisedPassword) {
    return {
      strengthScore: 0,
      entropyBits: 0,
      detectedPoolSize: 0,
      feedback: ['Paste or type a password to analyse it.']
    };
  }

  const detectedPoolSize = getDetectedCharacterPoolSize(normalisedPassword);
  const rawEntropyBits = estimatePasswordEntropy(normalisedPassword, detectedPoolSize);
  const penalty = calculateEntropyPenalty(normalisedPassword);
  const entropyBits = Math.max(Math.round(rawEntropyBits - penalty), 0);
  const strengthScore = calculatePasswordStrength(normalisedPassword, entropyBits);
  const feedback = getPasswordFeedback(normalisedPassword, entropyBits, strengthScore);

  return {
    strengthScore,
    entropyBits,
    detectedPoolSize,
    feedback
  };
}

function getDetectedCharacterPoolSize(password) {
  let poolSize = 0;

  if (LOWERCASE_PATTERN.test(password)) {
    poolSize += 26;
  }

  if (UPPERCASE_PATTERN.test(password)) {
    poolSize += 26;
  }

  if (NUMBER_PATTERN.test(password)) {
    poolSize += 10;
  }

  if (SYMBOL_PATTERN.test(password)) {
    /*
     * Approximation based on the printable symbol space commonly used by
     * password generators. This is an estimate, not true entropy.
     */
    poolSize += 32;
  }

  return poolSize;
}

function estimatePasswordEntropy(password, detectedPoolSize) {
  if (!password || detectedPoolSize <= 0) {
    return 0;
  }

  return password.length * Math.log2(detectedPoolSize);
}

function calculateEntropyPenalty(password) {
  let penalty = 0;

  if (hasRepeatedCharacters(password)) {
    penalty += 10;
  }

  if (hasLongRepeatedRun(password)) {
    penalty += 15;
  }

  if (hasSequentialPattern(password)) {
    penalty += 15;
  }

  if (hasKeyboardPattern(password)) {
    penalty += 15;
  }

  if (hasCommonPasswordTerm(password)) {
    penalty += 25;
  }

  if (hasPredictableSubstitution(password)) {
    penalty += 10;
  }

  return penalty;
}

function calculatePasswordStrength(password, entropyBits) {
  let score = 0;

  if (password.length >= 8) {
    score += 15;
  }

  if (password.length >= 12) {
    score += 15;
  }

  if (password.length >= 16) {
    score += 15;
  }

  if (password.length >= 24) {
    score += 10;
  }

  if (LOWERCASE_PATTERN.test(password)) {
    score += 10;
  }

  if (UPPERCASE_PATTERN.test(password)) {
    score += 10;
  }

  if (NUMBER_PATTERN.test(password)) {
    score += 10;
  }

  if (SYMBOL_PATTERN.test(password)) {
    score += 10;
  }

  if (entropyBits >= 80) {
    score += 10;
  } else if (entropyBits >= 60) {
    score += 7;
  } else if (entropyBits >= 40) {
    score += 4;
  }

  if (hasCommonPasswordTerm(password)) {
    score -= 30;
  }

  if (hasSequentialPattern(password)) {
    score -= 15;
  }

  if (hasKeyboardPattern(password)) {
    score -= 15;
  }

  if (hasLongRepeatedRun(password)) {
    score -= 15;
  }

  return clamp(score, 0, 100);
}

function getPasswordFeedback(password, entropyBits, strengthScore) {
  const feedback = [];

  if (password.length < 12) {
    feedback.push('Use at least 12 characters. Longer passwords are usually stronger.');
  } else if (password.length >= 16) {
    feedback.push('Good length. Longer passwords are harder to brute force.');
  }

  if (!LOWERCASE_PATTERN.test(password)) {
    feedback.push('Consider adding lowercase letters.');
  }

  if (!UPPERCASE_PATTERN.test(password)) {
    feedback.push('Consider adding uppercase letters.');
  }

  if (!NUMBER_PATTERN.test(password)) {
    feedback.push('Consider adding numbers.');
  }

  if (!SYMBOL_PATTERN.test(password)) {
    feedback.push('Consider adding symbols.');
  }

  if (hasCommonPasswordTerm(password)) {
    feedback.push('Avoid common words such as password, admin, welcome, or qwerty.');
  }

  if (hasSequentialPattern(password)) {
    feedback.push('Avoid predictable sequences such as 1234, abcd, or 9876.');
  }

  if (hasKeyboardPattern(password)) {
    feedback.push('Avoid keyboard-walk patterns such as qwerty or asdf.');
  }

  if (hasLongRepeatedRun(password)) {
    feedback.push('Avoid long repeated runs such as aaaa or 1111.');
  }

  if (hasPredictableSubstitution(password)) {
    feedback.push('Avoid relying on predictable substitutions such as @ for a, 0 for o, or 1 for i.');
  }

  if (entropyBits < 40) {
    feedback.push('Estimated entropy is low. Use a longer and less predictable password.');
  } else if (entropyBits >= 80) {
    feedback.push('Estimated entropy is strong, assuming the password was generated randomly.');
  }

  if (strengthScore >= 85 && feedback.length === 0) {
    feedback.push('Strong password shape. Keep it unique and do not reuse it across services.');
  }

  return dedupeFeedback(feedback);
}

function hasRepeatedCharacters(password) {
  return /(.)\1{2,}/.test(password);
}

function hasLongRepeatedRun(password) {
  return /(.)\1{3,}/.test(password);
}

function hasSequentialPattern(password) {
  const lowerPassword = password.toLowerCase();

  return (
    containsSequentialCharacters(lowerPassword, 'abcdefghijklmnopqrstuvwxyz') ||
    containsSequentialCharacters(lowerPassword, 'zyxwvutsrqponmlkjihgfedcba') ||
    containsSequentialCharacters(lowerPassword, '0123456789') ||
    containsSequentialCharacters(lowerPassword, '9876543210')
  );
}

function containsSequentialCharacters(password, sequence) {
  const minimumSequenceLength = 4;

  for (let i = 0; i <= sequence.length - minimumSequenceLength; i += 1) {
    const fragment = sequence.slice(i, i + minimumSequenceLength);

    if (password.includes(fragment)) {
      return true;
    }
  }

  return false;
}

function hasKeyboardPattern(password) {
  const lowerPassword = password.toLowerCase();

  return KEYBOARD_PATTERNS.some((pattern) => lowerPassword.includes(pattern));
}

function hasCommonPasswordTerm(password) {
  const simplifiedPassword = simplifyLeetspeak(password.toLowerCase());

  return COMMON_PASSWORD_TERMS.some((term) => simplifiedPassword.includes(term));
}

function hasPredictableSubstitution(password) {
  const lowerPassword = password.toLowerCase();

  return (
    /[@4]/.test(lowerPassword) ||
    /[0]/.test(lowerPassword) ||
    /[1!]/.test(lowerPassword) ||
    /[3]/.test(lowerPassword) ||
    /[5$]/.test(lowerPassword) ||
    /[7]/.test(lowerPassword)
  );
}

function simplifyLeetspeak(value) {
  return value
    .replaceAll('@', 'a')
    .replaceAll('4', 'a')
    .replaceAll('0', 'o')
    .replaceAll('1', 'i')
    .replaceAll('!', 'i')
    .replaceAll('3', 'e')
    .replaceAll('5', 's')
    .replaceAll('$', 's')
    .replaceAll('7', 't');
}

function dedupeFeedback(feedback) {
  return [...new Set(feedback)];
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}