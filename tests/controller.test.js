import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Minimal DOM adapter: the real controller and UI modules run unchanged.
// Native DOM, accessibility and layout are covered by tests/browser/.
function createElement() {
  const ATTRIBUTES = new Map();
  const EVENTS = new Map();
  return {
    value: '', checked: false, hidden: false, type: 'password', textContent: '', innerHTML: '', style: {},
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute: (name, value) => ATTRIBUTES.set(name, value),
    getAttribute: (name) => ATTRIBUTES.get(name),
    addEventListener: (name, handler) => EVENTS.set(name, handler),
    fire: (name) => EVENTS.get(name)?.(),
    appendChild() {}
  };
}

let ELEMENTS;
let DOCUMENT_EVENTS;

async function initialise() {
  await import('../public/assets/js/main.js');
  DOCUMENT_EVENTS.get('DOMContentLoaded')();
}

function analyseInput(password) {
  ELEMENTS.get('analyseModeButton').fire('click');
  ELEMENTS.get('analysisPassword').value = password;
  ELEMENTS.get('analysisPassword').fire('input');
}

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  ELEMENTS = new Map();
  DOCUMENT_EVENTS = new Map();
  vi.stubGlobal('document', {
    getElementById(id) {
      if (!ELEMENTS.has(id)) ELEMENTS.set(id, createElement());
      return ELEMENTS.get(id);
    },
    querySelector(selector) {
      if (selector.includes(':checked')) {
        return ['passphraseCaseUppercase', 'passphraseCaseCapitalise', 'passphraseCaseLowercase']
          .map((id) => ELEMENTS.get(id)).find((element) => element?.checked) || null;
      }
      const VALUE = selector.match(/value="([^"]+)"/)?.[1];
      const IDS = { lowercase: 'passphraseCaseLowercase', uppercase: 'passphraseCaseUppercase', capitalise: 'passphraseCaseCapitalise' };
      const ID = IDS[VALUE];
      if (!ID) return null;
      if (!ELEMENTS.has(ID)) ELEMENTS.set(ID, createElement());
      ELEMENTS.get(ID).value = VALUE;
      return ELEMENTS.get(ID);
    },
    addEventListener: (name, handler) => DOCUMENT_EVENTS.set(name, handler),
    createElement
  });
  const LOCATION = { hash: '' };
  vi.stubGlobal('window', {
    location: LOCATION,
    history: { replaceState(_state, _unused, hash) { LOCATION.hash = hash; } },
    setTimeout: (...args) => setTimeout(...args),
    addEventListener() {}
  });
  vi.stubGlobal('localStorage', { getItem: () => null, setItem() {} });
  vi.stubGlobal('crypto', { getRandomValues: (array) => { array.fill(0); return array; } });
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => '11111 door\n11112 abacus\n' })));
  vi.stubGlobal('alert', vi.fn());
});

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('real controller entropy integration', () => {
  test('generated random output displays the same estimate when analysed', async () => {
    await initialise();
    await vi.runAllTimersAsync();
    const PASSWORD = ELEMENTS.get('password').value;
    const GENERATED_BITS = ELEMENTS.get('entropyValue').textContent;
    expect(PASSWORD).toHaveLength(20);
    analyseInput(PASSWORD);
    expect(ELEMENTS.get('entropyValue').textContent).toBe(GENERATED_BITS);
  });

  test('generated memorable output displays the same estimate when analysed', async () => {
    await initialise();
    await vi.runAllTimersAsync();
    ELEMENTS.get('memorableGeneratorTab').fire('click');
    await vi.runAllTimersAsync();
    const PASSWORD = ELEMENTS.get('password').value;
    const GENERATED_BITS = ELEMENTS.get('entropyValue').textContent;
    expect(PASSWORD).toBe('door-door-door-door');
    analyseInput(PASSWORD);
    expect(ELEMENTS.get('entropyValue').textContent).toBe(GENERATED_BITS);
    expect(fetch).toHaveBeenCalledWith('assets/wordlist/eff_large_wordlist.txt');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('pending generation cannot overwrite Analyse metrics after switching tabs', async () => {
    await initialise();
    analyseInput('aA');
    expect(ELEMENTS.get('entropyValue').textContent).toBe('11 bits');
    await vi.runAllTimersAsync();
    expect(ELEMENTS.get('entropyValue').textContent).toBe('11 bits');
  });

  test('a pending generation error cannot overwrite Analyse feedback', async () => {
    vi.stubGlobal('crypto', undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await initialise();
    analyseInput('aA');
    const FEEDBACK_RENDER = vi.spyOn(ELEMENTS.get('feedbackList'), 'appendChild');
    await vi.runAllTimersAsync();
    expect(FEEDBACK_RENDER).not.toHaveBeenCalled();
    expect(ELEMENTS.get('entropyValue').textContent).toBe('11 bits');
  });
});
