const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const DEFAULT_PASSPHRASE_DELIMITER = '-';
const PASSPHRASE_CASE_MODES = new Set(['lowercase', 'uppercase', 'capitalise']);

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

export function parseWordList(rawWordList) {
  const seenWords = new Set();

  return String(rawWordList ?? '')
    .split(/\r?\n/)
    .map((line) => extractWordListEntry(line))
    .filter((word) => {
      if (!word || seenWords.has(word)) {
        return false;
      }

      seenWords.add(word);
      return true;
    });
}

export function generatePassphrase(wordList, options = {}) {
  const usableWordList = normaliseWordList(wordList);
  const wordCount = Number.parseInt(options.wordCount, 10);

  if (!Number.isInteger(wordCount) || wordCount <= 0 || usableWordList.length === 0) {
    return '';
  }

  const delimiter = normalisePassphraseDelimiter(options.delimiter);
  const passphraseWords = [];

  while (passphraseWords.length < wordCount) {
    const word = usableWordList[getSecureRandomIndex(usableWordList.length)];
    passphraseWords.push(formatPassphraseWord(word, options));
  }

  return passphraseWords.join(delimiter);
}

export function formatPassphraseWord(word, options = {}) {
  const caseMode = normalisePassphraseCaseMode(options.caseMode);
  const lowerWord = String(word ?? '').toLowerCase();
  let formattedWord;

  if (caseMode === 'uppercase') {
    formattedWord = lowerWord.toUpperCase();
  } else if (caseMode === 'capitalise') {
    formattedWord = lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
  } else {
    formattedWord = lowerWord;
  }

  if (options.substituteNumbers) {
    return formattedWord.replace(/[io]/gi, (character) => (
      character.toLowerCase() === 'i' ? '1' : '0'
    ));
  }

  return formattedWord;
}

export function calculatePassphraseEntropy(wordCount, wordListLength) {
  const parsedWordCount = Number.parseInt(wordCount, 10);
  const parsedWordListLength = Number.parseInt(wordListLength, 10);

  if (
    !Number.isInteger(parsedWordCount) ||
    !Number.isInteger(parsedWordListLength) ||
    parsedWordCount <= 0 ||
    parsedWordListLength <= 0
  ) {
    return 0;
  }

  return Math.round(parsedWordCount * Math.log2(parsedWordListLength));
}

export function buildCharacterSet(options) {
  return buildCharacterSets(options).join('');
}

function extractWordListEntry(line) {
  const trimmedLine = String(line ?? '').trim();

  if (!trimmedLine) {
    return '';
  }

  const parts = trimmedLine.split(/\s+/);
  const word = /^\d+$/.test(parts[0]) && parts.length > 1 ? parts[1] : parts[0];
  const normalisedWord = word.toLowerCase();

  return /^[a-z]+$/.test(normalisedWord) ? normalisedWord : '';
}

function normaliseWordList(wordList) {
  if (!Array.isArray(wordList)) {
    return [];
  }

  return wordList
    .map((word) => String(word ?? '').toLowerCase())
    .filter((word) => /^[a-z]+$/.test(word));
}

function normalisePassphraseDelimiter(delimiter) {
  return typeof delimiter === 'string' ? delimiter : DEFAULT_PASSPHRASE_DELIMITER;
}

function normalisePassphraseCaseMode(caseMode) {
  return PASSPHRASE_CASE_MODES.has(caseMode) ? caseMode : 'lowercase';
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

  const cryptoProvider = globalThis.crypto;

  if (!cryptoProvider || typeof cryptoProvider.getRandomValues !== 'function') {
    throw new Error('Web Crypto API is not available.');
  }

  const randomValues = new Uint32Array(1);
  const maxUint32 = 0x100000000;
  const limit = Math.floor(maxUint32 / maxExclusive) * maxExclusive;

  let randomValue;

  do {
    cryptoProvider.getRandomValues(randomValues);
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
