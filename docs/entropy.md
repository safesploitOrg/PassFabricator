# 🔢 Entropy display contract

## Decision

For any identical password string, Generate (random or memorable) and Analyse display the same integer bit estimate from `analysePassword(password).entropyBits`. Both label it **Estimated entropy**. Results do not depend on generation settings, saved preferences, the current wordlist size or the mode used to enter the string.

This is a compatibility fix to the display contract, not a new entropy or password-cracking model. The existing Analyse algorithm remains the shared implementation, including its existing limitations. No passwords are cached, fingerprinted, saved or sent to a service to achieve consistency.

## Why the previous values differed

| Previous path | Calculation | Why it disagreed |
| --- | --- | --- |
| Random Generate | Rounded `length × log₂(selected pool size)` | Used selected options, without analysis penalties; generator symbol pool contains 26 symbols while Analyse approximates symbols as 32 |
| Memorable Generate | Rounded `word count × log₂(parsed wordlist size)` | Described a word-choice model, while Analyse inspected the visible characters |
| Analyse | Character-pool estimate minus pattern penalties | Had no knowledge of original generation method |

The production analyser detects pools of 26 lowercase, 26 uppercase, 10 digits and an approximate 32 symbols. It subtracts fixed penalties for repeats, sequences, keyboard walks, common terms and predictable substitutions, then rounds and floors at zero. Its strength score and feedback are separate heuristics. They have not been redesigned.

## What the displayed number means

A visible password cannot prove the distribution that produced it. In particular, the shared character heuristic can **substantially overestimate word-based passphrases**, repeated words, non-ASCII strings and other predictable construction rules. It is not an estimate of an attacker's optimal number of guesses, a breached-password check, a crack-time guarantee or measured cryptographic entropy.

The analyser also uses JavaScript UTF-16 string length and approximates all non-ASCII content as symbols. Randomly generated strings may receive a penalty for a coincidental pattern. These inherited model limitations are disclosed, not fixed or waived by this patch. Future replacement with a word/pattern-aware estimator needs a separately scoped decision and independent reference tests.

## Generator-model helpers

`calculateGeneratedPasswordEntropy(password, options)` and `calculatePassphraseEntropy(wordCount, wordListLength)` are retained as public module exports and tested, but not displayed. They are idealised uniform-choice calculations; they must not be confused with the shared heuristic or a proof of actual output entropy.

- `6 × log₂(7,776)` rounds to **78 bits** under independent uniform word choices. EFF describes this as about 2⁷⁷ alternatives.
- The supplied file has 7,776 entries. The existing ASCII-only parser excludes `drop-down`, `felt-tip`, `t-shirt` and `yo-yo`, leaving **7,772 usable words**.
- Fixed separators, casing and i/o substitutions add no fresh random choices. Concatenation or non-injective transformations can also merge outcomes. The model helpers do not account for those collisions.
- The random generator guarantees selected character classes before shuffling where length permits. That process is not uniform over all strings in the combined pool; `length × log₂(pool size)` is an upper-bound model, not its exact entropy.

References: [EFF passphrase method](https://www.eff.org/dice), [Web Crypto getRandomValues](https://www.w3.org/TR/WebCryptoAPI/#Crypto-method-getRandomValues). Regression tests exercise the real controller, both browser generation paths and the same password pasted into Analyse.
