// Define the character sets globally to avoid repetition
const CHAR_SETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+[]{}|;:,.<>?'
};

// Set the current year dynamically
document.addEventListener("DOMContentLoaded", function () {
    const currentYear = new Date().getFullYear();
    document.getElementById('currentYear').textContent = currentYear;
});

// Event listener to handle password generation
document.getElementById('generate').addEventListener('click', function () {
    const length = getPasswordLength();
    const options = getPasswordOptions();

    if (!validatePasswordOptions(options)) {
        alert("You must select at least one character type!");
        return;
    }

    const password = generatePassword(length, options);
    displayPassword(password);
    updatePasswordStrength(password);
    calculateEntropy(password, options);
});

// Get password length
function getPasswordLength() {
    const lengthInput = document.getElementById('length');
    return parseInt(lengthInput.value, 10) || 12;  // Default to 12 if invalid input
}

// Get selected options for password
function getPasswordOptions() {
    return {
        lowercase: document.getElementById('includeLowercase').checked,
        uppercase: document.getElementById('includeUppercase').checked,
        numbers: document.getElementById('includeNumbers').checked,
        symbols: document.getElementById('includeSymbols').checked
    };
}

// Validate if at least one character type is selected
function validatePasswordOptions(options) {
    return Object.values(options).some(value => value);  // Checks if any option is true
}

// Generate password based on selected options
function generatePassword(length, options) {
    let characters = buildCharacterSet(options);
    let password = '';

    const cryptoArray = new Uint32Array(length);
    window.crypto.getRandomValues(cryptoArray);

    for (let i = 0; i < length; i++) {
        const randomIndex = cryptoArray[i] % characters.length;
        password += characters[randomIndex];
    }

    return password;
}

// Build the character set based on selected options
function buildCharacterSet(options) {
    let characters = '';
    for (const [type, isSelected] of Object.entries(options)) {
        if (isSelected) {
            characters += CHAR_SETS[type];
        }
    }
    return characters;
}

// Display the generated password in the UI
function displayPassword(password) {
    document.getElementById('password').value = password;
}

// Update the strength meter based on the password composition
function updatePasswordStrength(password) {
    const strength = calculatePasswordStrength(password);
    document.getElementById('strength').value = strength;
}

// Calculate password strength based on its composition
function calculatePasswordStrength(password) {
    let strength = 0;

    // Length-based strength
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (password.length >= 16) strength += 20;

    // Character variety-based strength
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

    return strength;
}

// Calculate and update the entropy (in bits) of the generated password
function calculateEntropy(password, options) {
    const characters = buildCharacterSet(options);
    const N = characters.length;  // Number of possible characters in the set
    const L = password.length;    // Password length

    const entropy = L * Math.log2(N); // Entropy in bits
    updateEntropyUI(entropy);
}

// Update the entropy progress bar and display value in the UI
function updateEntropyUI(entropy) {
    const maxEntropy = 95 * 32;  // Maximum entropy with 95 characters and a 32-character password
    const entropyPercentage = Math.min((entropy / maxEntropy) * 100, 100);  // Normalize to 100%
    
    document.getElementById('entropy').value = entropyPercentage;
    document.getElementById('entropyValue').textContent = `${Math.round(entropy)} bits`;
}

// Copy the generated password to the clipboard
document.getElementById('copy').addEventListener('click', function () {
    const password = document.getElementById('password').value;

    if (password) {
        navigator.clipboard.writeText(password)
            .then(() => alert("Password copied to clipboard!"))
            .catch(err => alert("Failed to copy password: " + err));
    } else {
        alert("Generate a password first!");
    }
});
