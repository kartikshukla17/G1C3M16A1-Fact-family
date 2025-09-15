# Fact Family Applet - Number Bonds

A responsive, offline educational applet for teaching fact families using number bonds. Built with vanilla JavaScript and a custom mini-React implementation.

## Features

- **Responsive 16:9 Design**: Scales perfectly across all 16:9 aspect ratios (960×540, 1920×1080, 3840×2160)
- **Interactive Number Bonds**: Visual number bond representation with clickable numbers
- **Fact Family Equations**: Dynamic generation of addition and subtraction equations
- **Multi-language Support**: English, Spanish, and Indonesian translations
- **Audio Feedback**: Sound effects for interactions and feedback
- **Offline Functionality**: Works completely offline without external dependencies
- **Accessibility**: Keyboard navigation and screen reader support

## File Structure

```
G1C3M16A1 Fact family/
├── index.html              # Main entry point
├── data.js                 # Translation data and content
├── css/
│   └── main.css           # Responsive styling and layout
├── js/
│   ├── mini-react.js      # Custom React implementation
│   ├── utils.js           # Utility functions and fact family logic
│   ├── components.js      # React components
│   ├── app.js            # Main application logic
│   └── sound.js          # Audio feedback system
├── assets/                # Audio and image assets
└── README.md             # This file
```

## How to Use

1. Open `index.html` in any modern web browser
2. The applet will automatically start with the first problem
3. Click on numbers in the number bond to fill the highlighted equation box
4. Complete all 4 equations (2 addition, 2 subtraction) for each problem
5. Use navigation arrows to move between problems
6. Progress dots show current problem position

## Technical Implementation

### Responsive Scaling
- Base design: 1920×1080 pixels
- CSS transform scaling maintains 16:9 aspect ratio
- No viewport units inside the wrapper to prevent double-scaling
- Dynamic scale factor calculation based on window dimensions

### Component Architecture
- Custom mini-React implementation for component-based development
- No external dependencies or build process required
- Offline-first design with embedded assets

### Design System Compliance
- Arial font family throughout
- Mandatory color palette from design system rules
- Proper text shadows and pointer event handling
- Smooth animations and transitions

## Problem Structure

The applet includes 3 fact family problems:

1. **Problem 1**: 5 split into 3 + 2
2. **Problem 2**: 6 split into 1 + 5  
3. **Problem 3**: 7 split into 4 + 3

Each problem generates 4 equations:
- 2 addition facts (a + b = c, b + a = c)
- 2 subtraction facts (c - a = b, c - b = a)

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers with touch support

## Development

The applet follows the established design system rules:
- Mandatory file structure (index.html, data.js, assets/)
- Responsive 16:9 scaling with CSS transforms
- Component-based architecture with mini-React
- Multi-language support with fallback chains
- Audio feedback for all interactions
- Accessibility features and keyboard navigation

## License

Educational use only. Part of the BYJUS Applets project.
