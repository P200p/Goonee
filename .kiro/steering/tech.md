# Technology Stack

## Frontend Technologies
- **HTML5**: Semantic markup with PWA manifest support
- **CSS3**: Custom styling with Fira Code monospace font, matrix animations, responsive grid layouts
- **Vanilla JavaScript**: ES2021 standard, no frameworks - pure DOM manipulation and modern APIs
- **Service Workers**: PWA functionality, offline caching, API simulation for labs

## Build System & Tools
- **Node.js**: Development environment and package management
- **npm**: Package manager for development dependencies
- **ESLint**: JavaScript linting with custom rules for browser/service worker contexts
- **HTMLHint**: HTML validation and best practices
- **Stylelint**: CSS linting with standard configuration

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Run all linting checks
npm run lint

# Individual linting
npm run lint:js        # JavaScript files
npm run lint:html      # HTML files  
npm run lint:css       # CSS files

# Auto-fix JavaScript issues
npm run lint:js:fix

# Quick check (alias for lint)
npm run check
```

### Local Development Server
```bash
# PowerShell script for LAB module
.\LAB\serve-lab.ps1

# Or use any static server like:
# python -m http.server 8000
# npx serve .
```

## Code Standards
- **ES2021** syntax with browser compatibility
- **No external frameworks** - vanilla JavaScript only
- **Service Worker** support for PWA features
- **Responsive design** with mobile-first approach
- **Accessibility** considerations for terminal interfaces
- **CSP-friendly** code that works with Content Security Policies

## Browser Support
- Modern browsers with ES2021 support
- PWA-capable browsers (Chrome, Edge, Firefox, Safari)
- Mobile browsers including Kiwi Browser for Android
- Service Worker support required for full functionality

## Deployment
- **Netlify**: Primary hosting platform with automatic deployments
- **Static hosting**: No server-side requirements, pure client-side application
- **CDN-friendly**: All assets can be cached and served from CDN