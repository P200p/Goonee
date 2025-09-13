# Project Structure

## Root Level Files
- `index.html` - Main terminal interface and PWA entry point
- `manifest.json` - PWA configuration with icons and theme settings
- `sw.js` - Service worker for PWA functionality and caching
- `style.css` - Global styles for the terminal interface
- `main.js` - Core JavaScript functionality
- `loader.js` - Dynamic script loading utilities
- `package.json` - Node.js dependencies and npm scripts

## Configuration Files
- `.eslintrc.json` - JavaScript linting rules with service worker overrides
- `.stylelintrc.json` - CSS linting configuration
- `.htmlhintrc` - HTML validation rules
- `.gitignore` - Version control exclusions
- `config.json` - Application configuration (currently empty)

## Core Directories

### `/LAB/` - Educational Cybersecurity Labs
Interactive learning modules with simulated environments:
- `lab.html` - Main lab interface
- `GamblingAPI_lab.html` - API interaction exercise
- `gambling-lab.js` - Frontend lab logic
- `sw-gamble.js` - Service worker API simulation
- `ClassicalCiphers.html` - Cryptography exercises
- `NetworkForensics.html` - Network analysis labs
- `FirewallConfig.html` - Security configuration exercises
- `README_GamblingLAB.md` - Lab documentation
- `WORKSHEET_GamblingLAB.md` - Student exercises

### `/sharktool/` - Browser Extension Toolkit
Modular browser tools for web analysis:
- `loader.js` - Tool loader and UI manager
- `manifest.json` - Available tools registry
- `*.js` files - Individual tools (monitor.js, Theme.js, etc.)
- `panel-theme.css` - UI styling for tool panels
- `DEV_GUIDE.md` - Developer documentation

### `/scan/` - Automated Scanning Tools
Web scanning and analysis utilities:
- `scan.html` - Scanning interface
- `autogenerate.js` - Automated content generation
- `embed_generator.js` - Embed code generation
- `/embed_pages/` - Generated embed templates
- `/web/` - Web-specific scanning tools

### `/icon/` - Application Icons
PWA icons in multiple formats and sizes:
- Standard web icons (16x16, 48x48, 128x128, 192x192, 512x512)
- `/android/` - Android-specific icons
- `/ios/` - iOS-specific icons
- `/watchkit/` - Apple Watch icons

### `/tools/` - Development Utilities
- `install-hooks.ps1` - Git hooks installation
- `precommit-check.sh` - Pre-commit validation script

### `/.netlify/` - Deployment Configuration
- `netlify.toml` - Netlify build and deploy settings
- `state.json` - Deployment state
- `/plugins/` - Netlify plugins

## File Naming Conventions
- **HTML files**: Descriptive names in English (e.g., `NetworkForensics.html`)
- **JavaScript files**: camelCase for utilities, kebab-case for standalone tools
- **CSS files**: kebab-case with descriptive suffixes (e.g., `panel-theme.css`)
- **Documentation**: ALL_CAPS for important docs, README prefix for module docs

## Module Organization
Each major component (LAB, sharktool, scan) is self-contained with:
- Main HTML entry point
- Associated JavaScript and CSS files
- Documentation (README, DEV_GUIDE)
- Configuration files where needed

## Asset Management
- Icons centralized in `/icon/` with platform-specific subdirectories
- Images at root level for easy reference
- No external dependencies - all assets self-hosted

## Development Workflow
1. Root level for main application
2. Module directories for specific functionality
3. Configuration files for linting and build processes
4. Documentation co-located with relevant modules