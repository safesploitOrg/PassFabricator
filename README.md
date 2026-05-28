
# PassFabricator

**PassFabricator** is a lightweight, client-side password utility built with HTML, CSS, and JavaScript. This tool allows users to generate secure, random passwords based on customizable criteria, and analyze the strength of existing passwords. All functionality runs locally in your browser with no backend required.

## Features:

### Generate
-   **Customizable Password Options**: Choose the length (from 4 to 32 characters) and character types (lowercase, uppercase, numbers, and symbols).
-   **Password Strength Meter**: Visual feedback on the strength of the generated password based on length and character variety.
-   **Entropy Calculation**: Displays the entropy (in bits) of the generated password, providing insight into the randomness and security of the password.
-   **Clipboard Functionality**: Easily copy the generated password to your clipboard for secure use.

### Analyse
-   **Password Strength Analysis**: Evaluate the strength of any password with detailed metrics.
-   **Entropy Evaluation**: Understand the security level of existing passwords.
-   **Visual Feedback**: Clear visual indicators of password strength.

### General
-   **Responsive Design**: Fully functional on both desktop and mobile devices.
-   **Modular Architecture**: Clean separation of concerns with ES6 modules for maintainability and testing.

## Demo

![PassFabricator Demo - Password Generator](https://raw.githubusercontent.com/safesploitOrg/assets/main/repo/PassFabricator/media/PassFabricator-demo-password-generator-2160.gif)

## Why Use PassFabricator?

PassFabricator helps users create secure passwords quickly and easily, ensuring strong, unpredictable passwords that enhance online security. Whether for personal use or integrating into security practices, this tool ensures that your passwords are up to modern standards of cryptographic randomness.

## Installation:

PassFabricator uses ES6 modules, which require a local development server to run. Simply opening `index.html` in a browser will not work.

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/PassFabricator.git
   cd PassFabricator
   ```

2. **Install dependencies** (optional, only needed for testing):
   ```bash
   npm install
   ```

3. **Start a local development server**:
   
   **Option A: Using Node.js**
   ```bash
   npx http-server public
   ```
   Then open `http://localhost:8080` in your browser.
   
   **Option B: Using Python 3**
   ```bash
   cd public
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.

The application will run entirely in your browser with no backend services required.

## Architecture:

PassFabricator is built with modular ES6 modules for clean separation of concerns:

- **`generate_password.js`**: Core password generation logic, entropy calculation, and validation
- **`analyse_password.js`**: Password strength analysis and metrics
- **`storage.js`**: User preferences and local storage management
- **`ui.js`**: User interface interactions and DOM manipulation

## Development & Testing:

### Running Tests

Tests are written with Vitest:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run coverage
```

Tests are located in the `tests/` directory and cover core modules:
- `analyse_password.test.js`
- `generate_password.test.js`
- `storage.test.js`

## Contribution:

Feel free to fork this repository and contribute! We welcome issues, bug reports, and pull requests.

## License:

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
