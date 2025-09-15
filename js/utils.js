/* ===== UTILITY FUNCTIONS ===== */

/**
 * Determine which number should be highlighted in the number bond based on current equation
 */
function getTargetNumberForHighlight(currentEquation, whole, parts) {
    if (!currentEquation || currentEquation.filled) return null;
    
    const equation = currentEquation.equation;
    const [part1, part2] = parts;
    
    // Parse equation to determine type and target
    if (equation.includes('+')) {
        // Addition equations: highlight the sum (whole number)
        // Examples: "3 + 2 = " or "2 + 3 = " -> highlight 5
        return whole;
    } else if (equation.includes('-')) {
        // Subtraction equations: highlight the difference
        // Parse to find which part is being subtracted
        const equationParts = equation.split(' ');
        const minuend = parseInt(equationParts[0]); // First number (what we subtract from)
        const subtrahend = parseInt(equationParts[2]); // Second number (what we subtract)
        
        if (minuend === whole) {
            // Examples: "5 - 3 = " -> highlight 2, "5 - 2 = " -> highlight 3
            if (subtrahend === part1) {
                return part2; // If subtracting part1, answer is part2
            } else if (subtrahend === part2) {
                return part1; // If subtracting part2, answer is part1
            }
        }
    }
    
    return null; // No specific target found
}

/**
 * Responsive scaling system for 16:9 aspect ratio maintenance
 * Identical to reference implementation
 */
function initializeResponsiveScaling() {
    function updateScaleFactor() {
        const scaleW = window.innerWidth / 1920;
        const scaleH = window.innerHeight / 1080;
        const scale = Math.min(scaleW, scaleH);
        document.documentElement.style.setProperty('--scaleFactor', scale);
    }
    
    // Set initial scale
    updateScaleFactor();
    
    // Update on resize with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateScaleFactor, 100);
    });
    
    // Update on orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(updateScaleFactor, 100);
    });
}

/**
 * Check if device supports touch
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get current language from various sources
 */
function getCurrentLanguage() {
    // Check HTML lang attribute first
    const htmlLang = document.documentElement.lang;
    if (htmlLang && ['en', 'es', 'id'].includes(htmlLang)) {
        return htmlLang;
    }
    
    // Check window.currentLanguage
    if (window.currentLanguage && ['en', 'es', 'id'].includes(window.currentLanguage)) {
        return window.currentLanguage;
    }
    
    // Default to English
    return 'en';
}

/**
 * Set current language
 */
function setCurrentLanguage(lang) {
    if (['en', 'es', 'id'].includes(lang)) {
        window.currentLanguage = lang;
        document.documentElement.lang = lang;
        
        // Clear problems cache since language changed
        clearProblemsCache();
        
        // Dispatch language change event
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang }
        }));
    }
}

/**
 * Get text from translation data with fallback
 */
function getText(key, params = {}, lang = null) {
    const currentLang = lang || getCurrentLanguage();
    
    try {
        // Navigate through the key path (e.g., 'content-ui.headers.main')
        const keyParts = key.split('.');
        let text = window.appData[currentLang];
        
        for (const part of keyParts) {
            if (text && typeof text === 'object' && part in text) {
                text = text[part];
            } else {
                // Fallback to English
                text = window.appData.en;
                for (const part of keyParts) {
                    if (text && typeof text === 'object' && part in text) {
                        text = text[part];
                    } else {
                        return key; // Return key if not found
                    }
                }
                break;
            }
        }
        
        // Handle ICU message format with parameters
        if (typeof text === 'string' && params) {
            return text.replace(/\{(\w+)\}/g, (match, param) => {
                return params[param] || match;
            });
        }
        
        return text || key;
    } catch (error) {
        console.warn('Translation error:', error);
        return key;
    }
}

/**
 * Generate fact family equations from number bond data
 */
function generateFactFamily(whole, part1, part2) {
    return {
        addition: [
            { equation: `${part1} + ${part2} = `, answer: '', correctAnswer: whole, expected: [part1, part2, whole], filled: false },
            { equation: `${part2} + ${part1} = `, answer: '', correctAnswer: whole, expected: [part2, part1, whole], filled: false }
        ],
        subtraction: [
            { equation: `${whole} - ${part1} = `, answer: '', correctAnswer: part2, expected: [whole, part1, part2], filled: false },
            { equation: `${whole} - ${part2} = `, answer: '', correctAnswer: part1, expected: [whole, part2, part1], filled: false }
        ]
    };
}

/**
 * Cache for problems to ensure consistent object references
 */
let problemsCache = null;

/**
 * Clear the problems cache (useful for language changes)
 */
function clearProblemsCache() {
    problemsCache = null;
}

/**
 * Get all fact family problems
 */
function getAllProblems() {
    // Return cached problems if available
    if (problemsCache) {
        return problemsCache;
    }
    
    const problems = [];
    const problemKeys = ['p1', 'p2', 'p3'];
    
    problemKeys.forEach(key => {
        const problemData = getText(`content-ui.problems.${key}`, {}, getCurrentLanguage());
        if (problemData && typeof problemData === 'object') {
            problems.push({
                id: key,
                whole: problemData.whole,
                parts: problemData.parts,
                description: problemData.description,
                factFamily: generateFactFamily(problemData.whole, problemData.parts[0], problemData.parts[1])
            });
        }
    });
    
    // Cache the problems
    problemsCache = problems;
    return problems;
}

/**
 * Get problem by ID
 */
function getProblemById(problemId) {
    const problems = getAllProblems();
    return problems.find(p => p.id === problemId);
}

/**
 * Get next problem
 */
function getNextProblem(currentProblemId) {
    const problems = getAllProblems();
    const currentIndex = problems.findIndex(p => p.id === currentProblemId);
    return currentIndex < problems.length - 1 ? problems[currentIndex + 1] : null;
}

/**
 * Get previous problem
 */
function getPreviousProblem(currentProblemId) {
    const problems = getAllProblems();
    const currentIndex = problems.findIndex(p => p.id === currentProblemId);
    return currentIndex > 0 ? problems[currentIndex - 1] : null;
}

/**
 * Check if a number selection is correct for the current equation
 */
function isNumberSelectionCorrect(selectedNumber, currentEquation, problemData) {
    if (!currentEquation || !problemData) return false;
    
    // Check if the selected number matches the correct answer
    return selectedNumber === currentEquation.correctAnswer;
}

/**
 * Check if a number is already used in the current equation
 */
function isNumberAlreadyUsed(selectedNumber, currentEquation, filledNumbers) {
    if (!currentEquation) return false;
    
    // For fact families, check if the equation already has a different answer
    // This prevents changing the answer once it's set, unless it's the same number
    // Note: The same numbers can be used across different equations in a fact family
    return currentEquation.answer !== '' && currentEquation.answer !== selectedNumber;
}

/**
 * Get the next empty equation box in specific order: 3+2, 2+3, 5-3, 5-2
 */
function getNextEmptyEquation(equations, currentIndex = 0) {
    // Define the specific order: 3+2, 2+3, 5-3, 5-2
    const orderedEquations = [
        equations.addition[0], // 3+2
        equations.addition[1], // 2+3
        equations.subtraction[0], // 5-3
        equations.subtraction[1]  // 5-2
    ];
    
    for (let i = currentIndex; i < orderedEquations.length; i++) {
        if (!orderedEquations[i].filled) {
            return { equation: orderedEquations[i], index: i };
        }
    }
    
    return null; // All equations filled
}

/**
 * Check if all equations are completed in specific order
 */
function areAllEquationsCompleted(equations) {
    // Define the specific order: 3+2, 2+3, 5-3, 5-2
    const orderedEquations = [
        equations.addition[0], // 3+2
        equations.addition[1], // 2+3
        equations.subtraction[0], // 5-3
        equations.subtraction[1]  // 5-2
    ];
    
    const allFilled = orderedEquations.every(eq => eq.filled);
    console.log('Checking equation completion:');
    orderedEquations.forEach((eq, index) => {
        console.log(`Equation ${index + 1}: ${eq.equation} - filled: ${eq.filled}`);
    });
    console.log('All filled:', allFilled);
    
    return allFilled;
}

/**
 * Get number color class based on position in number bond
 */
function getNumberColorClass(number, whole, parts) {
    if (number === whole) return 'orange';
    if (number === parts[0]) return 'blue';
    if (number === parts[1]) return 'purple';
    return 'pink';
}

/**
 * Generate progress dots data
 */
function generateProgressDots(currentIndex, totalCount) {
    const dots = [];
    for (let i = 0; i < totalCount; i++) {
        dots.push({
            index: i,
            active: i === currentIndex
        });
    }
    return dots;
}

/**
 * Validate equation completion
 */
function validateEquationCompletion(equation, selectedNumbers) {
    if (!equation || !selectedNumbers) return false;
    
    // Check if all required numbers are present
    const requiredNumbers = equation.expected;
    return requiredNumbers.every(num => selectedNumbers.includes(num));
}

/**
 * Get equation feedback message
 */
function getEquationFeedback(equation, isCorrect, isAlreadyUsed) {
    if (isAlreadyUsed) {
        return getText('content-ui.feedback.wrong', {}, getCurrentLanguage());
    }
    
    if (isCorrect) {
        return getText('content-ui.feedback.correct', { equation: equation.equation + equation.answer }, getCurrentLanguage());
    }
    
    return '';
}

// Export functions for use in other modules
window.utils = {
    initializeResponsiveScaling,
    isTouchDevice,
    prefersReducedMotion,
    getCurrentLanguage,
    setCurrentLanguage,
    getText,
    generateFactFamily,
    getAllProblems,
    getProblemById,
    getNextProblem,
    getPreviousProblem,
    isNumberSelectionCorrect,
    isNumberAlreadyUsed,
    getNextEmptyEquation,
    areAllEquationsCompleted,
    getNumberColorClass,
    generateProgressDots,
    validateEquationCompletion,
    getEquationFeedback,
    getTargetNumberForHighlight,
    clearProblemsCache
};
