/* ===== MAIN APP LOGIC ===== */

/**
 * Main application logic for Fact Family applet
 * Manages state, user interactions, and app flow
 */

// App State
let appState = {
    currentLanguage: 'en',
    screen: 'start',
    currentProblem: null,
    problemIndex: 0,
    currentEquation: null,
    currentEquationIndex: 0,
    filledNumbers: [],
    instructionText: '',
    feedbackText: '',
    feedbackState: '', // 'correct', 'wrong', or ''
    canGoNext: false,
    progressDots: [],
    totalProblems: 0
};

// App Actions
const appActions = {
    /**
     * Start the activity - Transition from start screen to game screen
     */
    startActivity: () => {
        console.log('Starting Fact Family activity');
        if (window.sound && window.sound.playClickSound) {
            window.sound.playClickSound();
        }
        
        // Transition to game screen
        appState.screen = 'game';
        
        const problems = utils.getAllProblems();
        console.log('Problems found:', problems.length);
        if (problems.length > 0) {
            appState.currentProblem = problems[0].id;
            appState.problemIndex = 0;
            appState.currentEquation = null;
            appState.currentEquationIndex = 0;
            appState.filledNumbers = [];
            appState.totalProblems = problems.length;
            appState.canGoNext = false; // Always start with disabled Next button
            
            // Initialize first equation
            const problemData = utils.getProblemById(appState.currentProblem);
            if (problemData) {
                // Ensure all equations start as unfilled
                problemData.factFamily.addition.forEach(eq => eq.filled = false);
                problemData.factFamily.subtraction.forEach(eq => eq.filled = false);
                
                const nextEmpty = utils.getNextEmptyEquation(problemData.factFamily, 0);
                if (nextEmpty) {
                    appState.currentEquation = nextEmpty.equation;
                    appState.currentEquationIndex = nextEmpty.index;
                }
                appState.instructionText = utils.getText('content-ui.instructions.equation', {}, appState.currentLanguage);
                appState.feedbackText = '';
                appState.feedbackState = '';
            }
            
            // Initialize progress dots
            appState.progressDots = utils.generateProgressDots(0, appState.totalProblems);
            
            console.log('✅ Activity started with problem:', appState.currentProblem);
        }
        
        renderApp();
    },

    /**
     * Check if current problem is complete and update Next button state
     */
    checkProblemCompletion: () => {
        const problemData = utils.getProblemById(appState.currentProblem);
        if (!problemData) {
            console.log('❌ No problem data found');
            return;
        }
        
        console.log('🔍 CHECKING COMPLETION for problem:', appState.currentProblem);
        
        // Log current equation states
        console.log('Addition equations:', problemData.factFamily.addition.map(eq => ({
            equation: eq.equation,
            filled: eq.filled,
            answer: eq.answer
        })));
        console.log('Subtraction equations:', problemData.factFamily.subtraction.map(eq => ({
            equation: eq.equation,
            filled: eq.filled,
            answer: eq.answer
        })));
        
        // Check if all equations in both addition and subtraction are filled
        const additionComplete = problemData.factFamily.addition.every(eq => eq.filled);
        const subtractionComplete = problemData.factFamily.subtraction.every(eq => eq.filled);
        const allComplete = additionComplete && subtractionComplete;
        
        console.log('📊 COMPLETION STATUS:', {
            additionComplete,
            subtractionComplete,
            allComplete,
            currentCanGoNext: appState.canGoNext,
            shouldChange: allComplete !== appState.canGoNext
        });
        
        if (allComplete && !appState.canGoNext) {
            appState.canGoNext = true;
            appState.instructionText = utils.getText('content-ui.instructions.continue', {}, appState.currentLanguage);
            console.log('✅ All equations completed! Enabling Next button');
            
            if (window.sound && window.sound.playConfettiSound) {
                window.sound.playConfettiSound();
            }
            renderApp();
        } else if (!allComplete && appState.canGoNext) {
            appState.canGoNext = false;
            console.log('❌ Not all equations completed! Disabling Next button');
            renderApp();
        } else {
            console.log('⚡ No state change needed');
        }
    },

    /**
     * Select a number from the number bond
     */
    selectNumber: (selectedNumber) => {
        if (!appState.currentEquation) return;
        
        console.log('Number selected:', selectedNumber);
        if (window.sound && window.sound.playClickSound) {
            window.sound.playClickSound();
        }
        
        const problemData = utils.getProblemById(appState.currentProblem);
        if (!problemData) return;
        
        // Always display the number in the highlighted box first
        appState.currentEquation.answer = selectedNumber;
        
        // Check if number is already used in the current equation
        const isAlreadyUsed = utils.isNumberAlreadyUsed(selectedNumber, appState.currentEquation, appState.filledNumbers);
        if (isAlreadyUsed) {
            // Show error feedback for already used number
            appState.feedbackText = utils.getText('content-ui.feedback.wrong', {}, appState.currentLanguage);
            appState.feedbackState = 'wrong';
            console.log('Setting wrong feedback:', appState.feedbackText, appState.feedbackState);
            if (window.sound && window.sound.playWrongSound) {
                window.sound.playWrongSound();
            }
            renderApp();
            return;
        }
        
        // If this equation was already filled and we're trying a different number, clear the filled status
        if (appState.currentEquation.filled && appState.currentEquation.answer !== selectedNumber) {
            appState.currentEquation.filled = false;
            // Remove from filled numbers if it was there
            const index = appState.filledNumbers.indexOf(appState.currentEquation.answer);
            if (index > -1) {
                appState.filledNumbers.splice(index, 1);
            }
        }
        
        // Check if number is correct
        const isCorrect = utils.isNumberSelectionCorrect(selectedNumber, appState.currentEquation, problemData);
        if (isCorrect) {
            // Mark equation as filled
            appState.currentEquation.filled = true;
            appState.filledNumbers.push(selectedNumber);
            
            // Show success feedback
            appState.feedbackText = utils.getText('content-ui.feedback.correct', { 
                equation: appState.currentEquation.equation + selectedNumber 
            }, appState.currentLanguage);
            appState.feedbackState = 'correct';
            console.log('Setting correct feedback:', appState.feedbackText, appState.feedbackState);
            
            if (window.sound && window.sound.playCorrectSound) {
                window.sound.playCorrectSound();
            }
            
            // Check if all equations are completed
            const allCompleted = utils.areAllEquationsCompleted(problemData.factFamily);
            if (allCompleted) {
                appState.instructionText = utils.getText('content-ui.instructions.continue', {}, appState.currentLanguage);
                appState.canGoNext = true;
                console.log('All equations completed! Setting canGoNext to true');
                if (window.sound && window.sound.playConfettiSound) {
                    window.sound.playConfettiSound();
                }
            } else {
                // Move to next empty equation
                const nextEmpty = utils.getNextEmptyEquation(problemData.factFamily, appState.currentEquationIndex + 1);
                if (nextEmpty) {
                    appState.currentEquation = nextEmpty.equation;
                    appState.currentEquationIndex = nextEmpty.index;
                    appState.instructionText = utils.getText('content-ui.instructions.equation', {}, appState.currentLanguage);
                    // Don't clear feedback here - let user see the success message
                }
            }
        } else {
            // Show error feedback but keep the number displayed
            appState.feedbackText = utils.getText('content-ui.feedback.wrong', {}, appState.currentLanguage);
            appState.feedbackState = 'wrong';
            console.log('Setting wrong feedback (incorrect answer):', appState.feedbackText, appState.feedbackState);
            if (window.sound && window.sound.playWrongSound) {
                window.sound.playWrongSound();
            }
        }
        
        renderApp();
    },

    /**
     * Move to next problem
     */
    nextProblem: () => {
        if (!appState.canGoNext) {
            console.log('Cannot go to next - button disabled');
            return;
        }
        
        console.log('Moving to next problem');
        if (window.sound && window.sound.playClickSound) {
            window.sound.playClickSound();
        }
        
        const nextProblem = utils.getNextProblem(appState.currentProblem);
        
        if (nextProblem) {
            // Reset state for new problem
            appState.currentProblem = nextProblem.id;
            appState.problemIndex++;
            appState.currentEquation = null;
            appState.currentEquationIndex = 0;
            appState.filledNumbers = [];
            appState.canGoNext = false; // Always start with disabled Next button
            appState.feedbackText = '';
            appState.feedbackState = '';
            
            // Initialize first equation of new problem
            const problemData = utils.getProblemById(appState.currentProblem);
            if (problemData) {
                // Reset all equation filled states
                problemData.factFamily.addition.forEach(eq => eq.filled = false);
                problemData.factFamily.subtraction.forEach(eq => eq.filled = false);
                
                const nextEmpty = utils.getNextEmptyEquation(problemData.factFamily, 0);
                if (nextEmpty) {
                    appState.currentEquation = nextEmpty.equation;
                    appState.currentEquationIndex = nextEmpty.index;
                }
                appState.instructionText = utils.getText('content-ui.instructions.equation', {}, appState.currentLanguage);
                appState.feedbackText = '';
                appState.feedbackState = '';
            }
            
            // Update progress dots
            appState.progressDots = utils.generateProgressDots(appState.problemIndex, appState.totalProblems);
            
            console.log('✅ Moved to next problem:', nextProblem.id);
        } else {
            // All problems completed
            console.log('🎉 All problems completed!');
            appState.currentProblem = null;
            appState.canGoNext = false;
            appState.instructionText = utils.getText('content-ui.feedback.completion', {}, appState.currentLanguage);
            if (window.sound && window.sound.playConfettiSound) {
                window.sound.playConfettiSound();
            }
        }
        
        renderApp();
    },

    /**
     * Move to previous problem
     */
    previousProblem: () => {
        console.log('Moving to previous problem');
        if (window.sound && window.sound.playClickSound) {
            window.sound.playClickSound();
        }
        
        const prevProblem = utils.getPreviousProblem(appState.currentProblem);
        
        if (prevProblem) {
            appState.currentProblem = prevProblem.id;
            appState.problemIndex--;
            appState.currentEquation = null;
            appState.currentEquationIndex = 0;
            appState.filledNumbers = [];
            appState.canGoNext = false;
            appState.feedbackText = '';
            appState.feedbackState = '';
            
            // Initialize first equation of previous problem
            const problemData = utils.getProblemById(appState.currentProblem);
            if (problemData) {
                const nextEmpty = utils.getNextEmptyEquation(problemData.factFamily, 0);
                if (nextEmpty) {
                    appState.currentEquation = nextEmpty.equation;
                    appState.currentEquationIndex = nextEmpty.index;
                }
                appState.instructionText = utils.getText('content-ui.instructions.equation', {}, appState.currentLanguage);
                appState.feedbackText = '';
                appState.feedbackState = '';
            }
            
            // Update progress dots
            appState.progressDots = utils.generateProgressDots(appState.problemIndex, appState.totalProblems);
        } else {
            // Go back to start
            appState.currentProblem = null;
            appState.problemIndex = 0;
            appState.instructionText = utils.getText('content-ui.instructions.start', {}, appState.currentLanguage);
        }
        
        renderApp();
    },

    /**
     * Restart the app
     */
    restart: () => {
        console.log('Restarting app');
        if (window.sound && window.sound.playClickSound) {
            window.sound.playClickSound();
        }
        
        appState.currentProblem = null;
        appState.problemIndex = 0;
        appState.currentEquation = null;
        appState.currentEquationIndex = 0;
        appState.filledNumbers = [];
        appState.canGoNext = false;
        appState.instructionText = utils.getText('content-ui.instructions.start', {}, appState.currentLanguage);
        appState.feedbackText = '';
        appState.feedbackState = '';
        appState.progressDots = [];
        
        renderApp();
    },

    /**
     * Toggle language
     */
    toggleLanguage: () => {
        const currentLang = utils.getCurrentLanguage();
        const languages = ['en', 'es', 'id'];
        const currentIndex = languages.indexOf(currentLang);
        const nextIndex = (currentIndex + 1) % languages.length;
        const newLang = languages[nextIndex];
        
        utils.setCurrentLanguage(newLang);
        appState.currentLanguage = newLang;
        renderApp();
    },

    /**
     * Handle equation focus for targeted highlighting
     * @param {object} equation - The focused equation or null to clear focus
     */
    onEquationFocus: (equation) => {
        console.log('🎯 Equation focus changed:', equation);
        
        if (equation) {
            // Set the focused equation as current for highlighting
            appState.currentEquation = equation;
        } else {
            // Clear focus - only if no equation is actually selected
            if (appState.currentEquation && !appState.currentEquation.filled) {
                appState.currentEquation = null;
            }
        }
        
        renderApp();
    }
};

/**
 * Render the app with current state
 */
function renderApp() {
    console.log('🔄 RENDERING APP - Current State:', {
        canGoNext: appState.canGoNext,
        currentProblem: appState.currentProblem,
        currentEquation: appState.currentEquation ? appState.currentEquation.equation : null,
        filledNumbers: appState.filledNumbers,
        instructionText: appState.instructionText
    });
    
    const appContainer = document.getElementById('app');
    if (appContainer) {
        // Clear previous content
        appContainer.innerHTML = '';
        
        // Call the App function directly since it returns a DOM element
        const appElement = App({
            state: appState,
            actions: appActions
        });
        
        appContainer.appendChild(appElement);
    }
}

/**
 * Initialize the application
 */
function initializeApp() {
    // Set initial language
    const initialLang = utils.getCurrentLanguage();
    appState.currentLanguage = initialLang;
    appState.instructionText = utils.getText('content-ui.instructions.start', {}, initialLang);
    
    // Initialize sound system
    if (window.sound && window.sound.initializeSoundSystem) {
        window.sound.initializeSoundSystem();
    }
    
    // Render the app (will show start screen by default)
    renderApp();
    
    // Set up responsive scaling system
    utils.initializeResponsiveScaling();
    
    // Add event listeners
    setupEventListeners();
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
    // Language change events
    window.addEventListener('languageChanged', (event) => {
        appState.currentLanguage = event.detail.language;
        renderApp();
    });
    
    // Scale factor change events
    window.addEventListener('scaleFactorChanged', (event) => {
        // Could trigger additional layout adjustments here if needed
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Touch device optimizations
    if (utils.isTouchDevice()) {
        document.body.classList.add('touch-device');
    }
    
    // Reduced motion preference
    if (utils.prefersReducedMotion()) {
        document.body.classList.add('reduced-motion');
    }
}

/**
 * Handle keyboard navigation
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardNavigation(event) {
    // Escape key for going back
    if (event.key === 'Escape' && appState.currentProblem) {
        appActions.previousProblem();
    }
    
    // Enter key for next action
    if (event.key === 'Enter') {
        if (appState.canGoNext) {
            appActions.nextProblem();
        }
    }
    
    // Number keys for number selection (2, 3, 5, etc.)
    if (appState.currentProblem && appState.currentEquation) {
        const number = parseInt(event.key);
        if (!isNaN(number) && number > 0) {
            appActions.selectNumber(number);
        }
    }
}

/**
 * Initialize app when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Make debugging functions available globally
window.debugApp = {
    getState: () => appState,
    checkCompletion: () => appActions.checkProblemCompletion(),
    forceEnableNext: () => {
        appState.canGoNext = true;
        console.log('🔧 FORCE ENABLED Next button');
        renderApp();
    },
    getProblemData: () => utils.getProblemById(appState.currentProblem),
    renderApp: renderApp
};

// Make renderApp available globally for debugging
window.renderApp = renderApp;

// Export for testing/debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        appState,
        appActions,
        initializeApp,
        renderApp
    };
}
