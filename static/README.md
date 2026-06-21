# Static Assets Structure

This directory contains all static assets for the NexusBot application, organized in a professional and maintainable way.

## Directory Structure

```
static/
├── css/                          # Stylesheets
│   ├── global.css               # Global styles (reset, typography, base)
│   ├── bot-builder.css          # Bot builder page specific styles
│   └── [other-page].css         # Page-specific stylesheets
│
├── js/                          # JavaScript files
│   ├── bot-builder.js           # Main bot builder script (entry point)
│   ├── modules/                 # Reusable modules
│   │   ├── data-processor.js    # CSV/JSON parsing and data handling
│   │   ├── response-generator.js # Chat response generation logic
│   │   ├── chart-handler.js     # Chart creation and visualization
│   │   └── ui-handler.js        # UI interactions and DOM updates
│   ├── utils/                   # Utility functions
│   │   ├── helpers.js           # Common helper functions
│   │   └── validators.js        # Input validation functions
│   └── firebase/                # Firebase related scripts
│       ├── firebase-config.js   # Firebase configuration
│       ├── firebase-auth.js     # Authentication logic
│       └── [other-firebase].js  # Other Firebase services
│
├── img/                         # Images and icons
│   ├── logos/                   # Logo images
│   ├── icons/                   # Icon files
│   └── [category]/              # Categorized images
│
└── README.md                    # This file
```

## CSS Files

### global.css
Contains global styles that apply across the entire application:
- CSS variables for colors and spacing
- Typography and font definitions
- Form elements styling
- Scrollbar customization
- Responsive container utilities

### Page-Specific CSS
Each page with custom styling should have its own CSS file:
- `bot-builder.css` - Styles for the data-driven bot builder page
- `customize_chatbot.css` - Customize chatbot page styles
- etc.

## JavaScript Files

### Entry Points
- `bot-builder.js` - Main script for the bot builder page
- Similar entry points for other pages

### Modules Organization

#### `/modules` - Reusable Functionality Modules
- **data-processor.js**: Handles CSV/JSON parsing, data display, search
- **response-generator.js**: Generates AI responses based on queries
- **chart-handler.js**: Creates bar charts, pie charts, handles visualizations
- **ui-handler.js**: Manages chat messages, notifications, UI state

#### `/utils` - Utility Functions
- **helpers.js**: Common utility functions used across modules
- **validators.js**: Input validation and sanitization

#### `/firebase` - Firebase Integration
- **firebase-config.js**: Initialize Firebase configuration
- **firebase-auth.js**: Authentication service
- **firebase-auth.js**: Authentication module

## Usage Guidelines

### Importing Modules
```javascript
import { parseCSV, displayDataPreview } from './modules/data-processor.js';
import { generateResponse } from './modules/response-generator.js';
import { addChatMessage } from './modules/ui-handler.js';
```

### CSS Organization
Link stylesheets in your HTML:
```html
<link rel="stylesheet" href="static/css/global.css">
<link rel="stylesheet" href="static/css/bot-builder.css">
```

## Best Practices

1. **Module Separation**: Keep related functionality together in modules
2. **Reusability**: Extract common functions into utility modules
3. **Naming Conventions**: Use descriptive names for files and functions
4. **Documentation**: Add JSDoc comments to all exported functions
5. **No Global Scope Pollution**: Use ES6 modules to avoid global variables
6. **Performance**: Lazy load non-critical assets when possible
7. **Accessibility**: Ensure CSS follows WCAG guidelines

## Adding New Files

When adding new functionality:

1. **For CSS**: Create a new file in `css/` if it's page-specific, otherwise add to `global.css`
2. **For JS Logic**: Create a new module in `js/modules/` if it's reusable, otherwise create an entry point
3. **For Utilities**: Add to `js/utils/` if it's a general helper function
4. **For Images**: Categorize in `img/` subdirectories

## File Size Optimization

- Minify CSS and JavaScript files in production
- Compress images (use WebP format where possible)
- Use lazy loading for images below the fold
- Implement code splitting for large applications

## Browser Compatibility

- All CSS uses modern features (CSS Grid, Flexbox, CSS Variables)
- JavaScript uses ES6 modules - ensure browser support or use build tool
- Fallbacks provided for older browsers where necessary

## Related Documentation

See the main README.md for project-wide information.
