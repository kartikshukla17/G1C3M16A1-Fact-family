/* ===== FACT FAMILY COMPONENTS ===== */

/**
 * React components for Fact Family applet
 * Each component is a function that returns DOM elements
 */

// Ensure utils and other dependencies are available
if (typeof utils === 'undefined') {
    console.warn('utils not available, some features may not work');
}

if (typeof getText === 'undefined') {
    console.warn('getText not available, translations may not work');
}

if (typeof getCurrentLanguage === 'undefined') {
    console.warn('getCurrentLanguage not available, language features may not work');
}

// Fallback functions in case dependencies are not loaded
const fallbackGetText = (key, params, lang) => key;
const fallbackGetCurrentLanguage = () => 'en';
const fallbackUtils = {
    getProblemById: (id) => null,
    isNumberSelectionCorrect: () => false
};

// Use fallbacks if functions are not available
const safeGetText = typeof utils !== 'undefined' && utils.getText ? utils.getText : fallbackGetText;
const safeGetCurrentLanguage = typeof utils !== 'undefined' && utils.getCurrentLanguage ? utils.getCurrentLanguage : fallbackGetCurrentLanguage;
const safeUtils = typeof utils !== 'undefined' ? utils : fallbackUtils;

/**
 * Header component with instruction text
 * @param {object} props - Component properties
 * @returns {HTMLElement} Header element
 */
function Header(props) {
    const currentLang = safeGetCurrentLanguage();
    const headerText = safeGetText('content-ui.headers.main', {}, currentLang);

    const headerElement = React.createElement('header', { className: 'header' },
        React.createElement('div', { className: 'header-instruction' }, headerText)
    );
    
    return headerElement;
}

/**
 * Fact Family Panel component for addition or subtraction facts
 * @param {object} props - Component properties
 * @returns {HTMLElement} Fact panel element
 */
function FactPanel(props) {
    const { title, equations, onNumberSelect, currentEquation, filledNumbers, problemData, onEquationFocus } = props;
    const currentLang = safeGetCurrentLanguage();
    
    // Check if any equation box is highlighted
    const hasHighlightedEquation = equations.some(equation => 
        currentEquation && currentEquation.equation === equation.equation
    );
    
    const equationElements = equations.map((equation, index) => {
        const isHighlighted = currentEquation && currentEquation.equation === equation.equation;
        const isFilled = equation.filled;
        
        // Parse equation text to color-code numbers
        const equationParts = equation.equation.split(' ');
        const equationText = equationParts.map((part, partIndex) => {
            if (part === '+' || part === '-' || part === '=') {
                return React.createElement('span', { 
                    key: partIndex,
                    className: 'equation-number',
                    style: { color: '#FFFFFF' }
                }, part);
            } else if (!isNaN(part)) {
                // Color-code numbers based on the number bond structure
                let colorClass = 'pink'; // default
                if (problemData) {
                    const number = parseInt(part);
                    colorClass = safeUtils.getNumberColorClass ? 
                        safeUtils.getNumberColorClass(number, problemData.whole, problemData.parts) : 'pink';
                }
                
                return React.createElement('span', { 
                    key: partIndex,
                    className: `equation-number ${colorClass}`
                }, part);
            } else {
                return React.createElement('span', { 
                    key: partIndex,
                    className: 'equation-number',
                    style: { color: '#FFFFFF' }
                }, part);
            }
        });
        
        // Determine feedback state for the equation box
        let feedbackClass = '';
        if (equation.answer !== undefined && equation.answer !== '') {
            if (isFilled) {
                feedbackClass = 'correct';
            } else {
                // Check if the answer is wrong (not filled but has a value)
                feedbackClass = 'wrong';
            }
        }

        return React.createElement('div', { 
            key: index,
            className: 'equation-row'
        },
            React.createElement('div', { className: 'equation-text' }, equationText),
            React.createElement('div', { 
                className: `equation-box ${isHighlighted ? 'highlighted' : ''} ${isFilled ? 'filled' : ''} ${feedbackClass}`,
                tabIndex: isFilled ? -1 : 0, // Make focusable only if not filled
                onFocus: () => {
                    if (!isFilled && onEquationFocus) {
                        onEquationFocus(equation);
                    }
                },
                onBlur: () => {
                    if (onEquationFocus) {
                        onEquationFocus(null); // Clear focus
                    }
                },
                onClick: () => {
                    if (!isFilled && onEquationFocus) {
                        onEquationFocus(equation);
                    }
                }
            }, equation.answer || '')
        );
    });

    return React.createElement('div', { 
        className: 'fact-panel'
    },
        React.createElement('div', { className: 'fact-panel-title' }, title),
        React.createElement('div', { className: 'equations-container' }, equationElements)
    );
}

/**
 * Number Bond component with highlighting when equation box is selected
 * @param {object} props - Component properties
 * @returns {HTMLElement} Number bond element
 */
function NumberBond(props) {
    const { whole, parts, onNumberSelect, currentEquation, visualCueMode = 'pulse' } = props;
    const currentLang = safeGetCurrentLanguage();
    
    const [part1, part2] = parts;
    
    // Determine if the number bond container should be highlighted
    const isHighlighted = currentEquation && !currentEquation.filled;
    
    // Determine which specific number should be highlighted based on current equation
    const targetNumber = isHighlighted && safeUtils.getTargetNumberForHighlight ? 
        safeUtils.getTargetNumberForHighlight(currentEquation, whole, parts) : null;
    
    const startFingerTapSequence = () => {
        if (!targetNumber) return; // Only show visual cue if there's a specific target
        
        // Determine which element to target based on the target number
        let targetSelector = '';
        if (targetNumber === whole) {
            targetSelector = '.number-bond-whole';
        } else if (targetNumber === part1) {
            targetSelector = '.number-bond-part.blue';
        } else if (targetNumber === part2) {
            targetSelector = '.number-bond-part.purple';
        }
        
        if (!targetSelector) return;
        
        const showFingerTap = () => {
            // Remove any existing finger tap guides
            document.querySelectorAll('.finger-tap-guide').forEach(guide => guide.remove());
            
            const targetElement = document.querySelector(targetSelector);
            if (targetElement) {
                const guide = createFingerTapGuide();
                positionFingerTap(guide, targetElement);
                document.body.appendChild(guide);
                
                // Activate the animation
                setTimeout(() => guide.classList.add('active'), 50);
                
                // Remove after animation
                setTimeout(() => {
                    if (guide.parentNode) guide.remove();
                }, 1500);
            }
        };
        
        // Start immediately and repeat every 3 seconds for single target
        showFingerTap();
        window.visualCueInterval = setInterval(showFingerTap, 3000);
    };
    
    const startPulseSequence = () => {
        if (!targetNumber) {
            // If no target number, ensure all animations are completely removed
            document.querySelectorAll('.number-bond-whole, .number-bond-part').forEach(element => {
                element.classList.remove('pulse-guide');
            });
            return;
        }
        
        // Determine which element to target based on the target number
        let targetSelector = '';
        if (targetNumber === whole) {
            targetSelector = '.number-bond-whole';
        } else if (targetNumber === part1) {
            targetSelector = '.number-bond-part.blue';
        } else if (targetNumber === part2) {
            targetSelector = '.number-bond-part.purple';
        }
        
        if (!targetSelector) {
            // If no valid target selector, ensure all animations are removed
            document.querySelectorAll('.number-bond-whole, .number-bond-part').forEach(element => {
                element.classList.remove('pulse-guide');
            });
            return;
        }
        
        const showPulse = () => {
            // CRITICAL: Remove pulse class from ALL elements first to ensure exclusivity
            document.querySelectorAll('.number-bond-whole, .number-bond-part').forEach(element => {
                element.classList.remove('pulse-guide');
            });
            
            // Wait a frame to ensure class removal is processed
            requestAnimationFrame(() => {
                // Add pulse class ONLY to the target element
                const targetElement = document.querySelector(targetSelector);
                if (targetElement) {
                    targetElement.classList.add('pulse-guide');
                    
                    // Remove pulse class after animation completes
                    setTimeout(() => {
                        if (targetElement) {
                            targetElement.classList.remove('pulse-guide');
                        }
                    }, 1800);
                }
            });
        };
        
        // Start immediately and repeat every 2.5 seconds for single target
        showPulse();
        window.visualCueInterval = setInterval(showPulse, 2500);
    };
    
    const createFingerTapGuide = () => {
        const guide = document.createElement('div');
        guide.className = 'finger-tap-guide';
        guide.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1C13 0.447715 12.5523 0 12 0C11.4477 0 11 0.447715 11 1V7H9C8.44772 7 8 7.44772 8 8V12C8 12.5523 8.44772 13 9 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H15C15.5523 13 16 12.5523 16 12V8C16 7.44772 15.5523 7 15 7H13V1Z" fill="#FFD700"/>
                <circle cx="12" cy="22" r="2" fill="#FFD700"/>
            </svg>
        `;
        return guide;
    };
    
    const positionFingerTap = (guide, targetElement) => {
        const rect = targetElement.getBoundingClientRect();
        const containerRect = document.querySelector('.number-bond-container').getBoundingClientRect();
        
        guide.style.left = `${rect.left + rect.width/2 - 20}px`;
        guide.style.top = `${rect.top - 50}px`;
        guide.style.position = 'fixed';
    };

    // Visual cue management
    React.useEffect(() => {
        // Always clear any existing animations first
        clearTimeout(window.visualCueTimeout);
        clearInterval(window.visualCueInterval);
        
        // Remove all pulse classes from all elements to ensure clean state
        document.querySelectorAll('.number-bond-whole, .number-bond-part').forEach(element => {
            element.classList.remove('pulse-guide');
        });
        
        // Remove any existing finger tap guides
        document.querySelectorAll('.finger-tap-guide').forEach(guide => guide.remove());
        
        if (!isHighlighted) return;
        
        if (visualCueMode === 'finger') {
            startFingerTapSequence();
        } else if (visualCueMode === 'pulse') {
            startPulseSequence();
        }
        
        return () => {
            clearTimeout(window.visualCueTimeout);
            clearInterval(window.visualCueInterval);
            // Ensure complete cleanup on unmount
            document.querySelectorAll('.number-bond-whole, .number-bond-part').forEach(element => {
                element.classList.remove('pulse-guide');
            });
            document.querySelectorAll('.finger-tap-guide').forEach(guide => guide.remove());
        };
    }, [isHighlighted, visualCueMode, targetNumber]); // Added targetNumber as dependency

    return React.createElement('div', { 
        className: `number-bond-container ${isHighlighted ? 'highlighted' : ''}`,
        'aria-label': safeGetText('accessibility.numberBond', { 
            whole: whole, 
            part1: part1, 
            part2: part2 
        }, currentLang)
    },
        React.createElement('div', { 
            className: `number-bond-whole ${safeUtils.getNumberColorClass ? safeUtils.getNumberColorClass(whole, whole, parts) : 'orange'}`,
            onClick: () => onNumberSelect && onNumberSelect(whole),
            'aria-label': safeGetText('accessibility.numberButton', { number: whole }, currentLang)
        }, whole),
        React.createElement('div', { className: 'number-bond-parts' },
            React.createElement('div', { 
                className: `number-bond-part ${safeUtils.getNumberColorClass ? safeUtils.getNumberColorClass(part1, whole, parts) : 'blue'}`,
                onClick: () => onNumberSelect && onNumberSelect(part1),
                'aria-label': safeGetText('accessibility.numberButton', { number: part1 }, currentLang)
            }, part1),
            React.createElement('div', { 
                className: `number-bond-part ${safeUtils.getNumberColorClass ? safeUtils.getNumberColorClass(part2, whole, parts) : 'purple'}`,
                onClick: () => onNumberSelect && onNumberSelect(part2),
                'aria-label': safeGetText('accessibility.numberButton', { number: part2 }, currentLang)
            }, part2)
        ),
        // SVG connecting lines with draw-in animation and labels
        React.createElement('svg', { 
            className: 'number-bond-lines',
            style: { 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                pointerEvents: 'none',
                zIndex: 1
            }
        },
            // Line from whole number to first part
            React.createElement('line', {
                className: 'bond-line bond-line-1',
                x1: 'calc(25% + 52px)', // Right edge of whole circle (responsive)
                y1: '50%', // Center of container height
                x2: 'calc(75% - 40px)', // Left edge of first part circle (responsive)
                y2: 'calc(50% - 50px)', // Top part position (responsive)
                stroke: 'rgba(255, 255, 255, 0.8)',
                strokeWidth: '3',
                strokeLinecap: 'round',
                strokeDasharray: '200',
                strokeDashoffset: '200'
            }),
            // Label for first connection (text removed)
            React.createElement('text', {
                className: 'bond-label bond-label-1',
                x: 'calc(50% - 10px)', // Midpoint between circles (responsive)
                y: 'calc(50% - 25px)', // Slightly above the line (responsive)
                fill: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: 'bold',
                textAnchor: 'middle',
                dominantBaseline: 'middle',
                style: { opacity: 0 }
            }, ''),
            // Line from whole number to second part
            React.createElement('line', {
                className: 'bond-line bond-line-2',
                x1: 'calc(25% + 52px)', // Right edge of whole circle (responsive)
                y1: '50%', // Center of container height
                x2: 'calc(75% - 40px)', // Left edge of second part circle (responsive)
                y2: 'calc(50% + 50px)', // Bottom part position (responsive)
                stroke: 'rgba(255, 255, 255, 0.8)',
                strokeWidth: '3',
                strokeLinecap: 'round',
                strokeDasharray: '200',
                strokeDashoffset: '200'
            }),
            // Label for second connection (text removed)
            React.createElement('text', {
                className: 'bond-label bond-label-2',
                x: 'calc(50% - 10px)', // Midpoint between circles (responsive)
                y: 'calc(50% + 35px)', // Slightly below the line (responsive)
                fill: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: 'bold',
                textAnchor: 'middle',
                dominantBaseline: 'middle',
                style: { opacity: 0 }
            }, '')
        )
    );
}

/**
 * Feedback Panel component (renamed from Instruction Panel)
 * @param {object} props - Component properties
 * @returns {HTMLElement} Feedback panel element
 */
function FeedbackPanel(props) {
    const { numberBond, onNumberSelect, selectedNumbers, feedbackText, feedbackState } = props;
    const currentLang = safeGetCurrentLanguage();
    
    console.log('FeedbackPanel render - feedbackText:', feedbackText, 'feedbackState:', feedbackState);
    
    // Determine feedback box styling based on state
    let feedbackClassName = 'feedback-bottom';
    if (feedbackState === 'correct') {
        feedbackClassName += ' feedback-correct';
    } else if (feedbackState === 'wrong') {
        feedbackClassName += ' feedback-wrong';
    }
    
    return React.createElement('div', { className: 'feedback-panel' },
        React.createElement('div', { className: feedbackClassName },
            feedbackText || safeGetText('content-ui.feedback.instruction', {}, currentLang)
        ),
        NumberBond({
            whole: numberBond.whole,
            parts: numberBond.parts,
            onNumberSelect: onNumberSelect,
            selectedNumbers: selectedNumbers,
            currentEquation: props.currentEquation,
            visualCueMode: props.visualCueMode || 'pulse'
        })
    );
}

/**
 * Footer component with navigation and progress dots
 * @param {object} props - Component properties
 * @returns {HTMLElement} Footer element
 */
function Footer(props) {
    const { 
        onPrevious, 
        onNext, 
        canGoNext, 
        progressDots 
    } = props;
    const currentLang = safeGetCurrentLanguage();
    
    // Create Previous button
    const leftButton = React.createElement('button', {
        className: 'nav-btn',
        onClick: onPrevious,
        'aria-label': safeGetText('accessibility.navigationButton', {}, currentLang)
    }, '◀');

    // Create Next button
    console.log('🔘 FOOTER COMPONENT - canGoNext received:', canGoNext);
    console.log('🔘 Button will be:', canGoNext ? 'ENABLED' : 'DISABLED');
    
    const rightButton = React.createElement('button', {
        className: `nav-btn ${canGoNext ? 'glow enabled' : 'disabled'}`,
        onClick: () => {
            if (canGoNext) {
                console.log('🎯 Next button clicked! Calling onNext...');
                onNext();
            } else {
                console.log('🚫 Next button clicked but disabled!');
            }
        },
        'aria-label': safeGetText('accessibility.navigationButton', {}, currentLang),
        onMouseDown: () => console.log('Button mouse down'),
        onMouseUp: () => console.log('Button mouse up')
    }, '►');
    
    console.log('Right button created - canGoNext:', canGoNext, 'disabled:', !canGoNext);

    // Create progress dots
    const progressDotsElement = React.createElement('div', { className: 'progress-dots' },
        progressDots.map((dot, index) => 
            React.createElement('div', { 
                key: index,
                className: `progress-dot ${dot.active ? 'active' : ''}`
            })
        )
    );

    const footerElement = React.createElement('footer', { className: 'footer' },
        React.createElement('div', { className: 'footer-left' }, leftButton),
        React.createElement('div', { className: 'footer-center' }, progressDotsElement),
        React.createElement('div', { className: 'footer-right' }, rightButton)
    );
    
    return footerElement;
}

/**
 * Main Fact Family Screen component
 * @param {object} props - Component properties
 * @returns {HTMLElement} Main screen element
 */
function FactFamilyScreen(props) {
    const { 
        problemData, 
        currentEquation, 
        filledNumbers, 
        onNumberSelect, 
        onPrevious, 
        onNext, 
        canGoNext,
        progressDots,
        instructionText,
        feedbackText,
        feedbackState,
        onEquationFocus
    } = props;
    
    const currentLang = safeGetCurrentLanguage();
    const additionTitle = safeGetText('content-ui.sections.addition_facts', {}, currentLang);
    const subtractionTitle = safeGetText('content-ui.sections.subtraction_facts', {}, currentLang);
    
    return React.createElement('div', {},
        Header({}),
        React.createElement('main', { className: 'main-content' },
            FactPanel({
                title: additionTitle,
                equations: problemData.factFamily.addition,
                onNumberSelect: onNumberSelect,
                currentEquation: currentEquation,
                filledNumbers: filledNumbers,
                problemData: problemData,
                onEquationFocus: onEquationFocus
            }),
            FactPanel({
                title: subtractionTitle,
                equations: problemData.factFamily.subtraction,
                onNumberSelect: onNumberSelect,
                currentEquation: currentEquation,
                filledNumbers: filledNumbers,
                problemData: problemData,
                onEquationFocus: onEquationFocus
            }),
            FeedbackPanel({
                numberBond: {
                    whole: problemData.whole,
                    parts: problemData.parts
                },
                onNumberSelect: onNumberSelect,
                selectedNumbers: filledNumbers,
                feedbackText: feedbackText,
                feedbackState: feedbackState,
                currentEquation: currentEquation,
                visualCueMode: props.visualCueMode || 'pulse'
            })
        ),
        React.createElement('div', { className: 'instruction-container' },
            React.createElement('div', { className: 'instruction-box' }, instructionText)
        ),
        Footer({
            onPrevious: onPrevious,
            onNext: onNext,
            canGoNext: canGoNext,
            progressDots: progressDots
        })
    );
}

/**
 * Main App component that orchestrates all other components
 * @param {object} props - Component properties
 * @returns {HTMLElement} Main app element
 */
function App(props) {
    const { state, actions } = props;

    // Show fact family screen
    if (state.currentProblem) {
        const problemData = safeUtils.getProblemById(state.currentProblem);
        if (problemData) {
            console.log('App render - feedbackText:', state.feedbackText, 'feedbackState:', state.feedbackState);
            return FactFamilyScreen({
                problemData: problemData,
                currentEquation: state.currentEquation,
                filledNumbers: state.filledNumbers,
                onNumberSelect: actions.selectNumber,
                onPrevious: actions.previousProblem,
                onNext: actions.nextProblem,
                canGoNext: state.canGoNext,
                progressDots: state.progressDots,
                instructionText: state.instructionText,
                feedbackText: state.feedbackText,
                feedbackState: state.feedbackState,
                onEquationFocus: actions.onEquationFocus
            });
        }
    }

    // Fallback - show loading or error state
    return React.createElement('div', { className: 'loading-screen' },
        React.createElement('div', { className: 'loading-text' }, 'Loading...')
    );
}

// Export components for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Header,
        FactPanel,
        NumberBond,
        FeedbackPanel,
        Footer,
        FactFamilyScreen,
        App
    };
}
