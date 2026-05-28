const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function validatePasswordOptions(options) {
  return Boolean(
    options.includeLowercase ||
    options.includeUppercase ||
    options.includeNumbers ||
    options.includeSymbols
  );
}

export function generatePassword(length, options) {
  const selectedCharacterSets = buildCharacterSets(options);
  const combinedCharacterSet = selectedCharacterSets.join('');

  if (!Number.isInteger(length) || length <= 0) {
    return '';
  }

  if (!combinedCharacterSet) {
    return '';
  }

  const passwordCharacters = [];

  /*
   * Guarantee one character from each selected type where possible.
   * If the password length is shorter than the number of selected sets,
   * the generator falls back to random selection from the combined pool.
   */
  if (length >= selectedCharacterSets.length) {
    selectedCharacterSets.forEach((characterSet) => {
      passwordCharacters.push(getSecureRandomCharacter(characterSet));
    });
  }

  while (passwordCharacters.length < length) {
    passwordCharacters.push(getSecureRandomCharacter(combinedCharacterSet));
  }

  return shuffleWithCrypto(passwordCharacters).join('');
}

export function calculateGeneratedPasswordEntropy(password, options) {
  const characterSetLength = buildCharacterSet(options).length;

  if (!password || characterSetLength === 0) {
    return 0;
  }

  return Math.round(password.length * Math.log2(characterSetLength));
}

export function buildCharacterSet(options) {
  return buildCharacterSets(options).join('');
}

function buildCharacterSets(options) {
  const characterSets = [];

  if (options.includeLowercase) {
    characterSets.push(LOWERCASE_CHARS);
  }

  if (options.includeUppercase) {
    characterSets.push(UPPERCASE_CHARS);
  }

  if (options.includeNumbers) {
    characterSets.push(NUMBER_CHARS);
  }

  if (options.includeSymbols) {
    characterSets.push(SYMBOL_CHARS);
  }

  return characterSets;
}

function getSecureRandomCharacter(characterSet) {
  return characterSet[getSecureRandomIndex(characterSet.length)];
}

function getSecureRandomIndex(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error('maxExclusive must be a positive integer.');
  }

  const randomValues = new Uint32Array(1);
  const maxUint32 = 0x100000000;
  const limit = Math.floor(maxUint32 / maxExclusive) * maxExclusive;

  let randomValue;

  do {
    window.crypto.getRandomValues(randomValues);
    randomValue = randomValues[0];
  } while (randomValue >= limit);

  return randomValue % maxExclusive;
}

function shuffleWithCrypto(values) {
  const shuffledValues = [...values];

  for (let i = shuffledValues.length - 1; i > 0; i -= 1) {
    const j = getSecureRandomIndex(i + 1);
    [shuffledValues[i], shuffledValues[j]] = [shuffledValues[j], shuffledValues[i]];
  }

  return shuffledValues;
}