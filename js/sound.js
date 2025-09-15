/* ===== SOUND SYSTEM ===== */

/**
 * Audio feedback system for Fact Family applet
 * Uses HTML5 Audio for offline compatibility
 */

// Sound objects for each audio file
let sounds = {};

/**
 * Initialize sound system with HTML5 Audio
 */
function initializeSoundSystem() {
    // Create audio objects for each sound
    sounds = {
        click: new Audio('assets/click.mp3'),
        correct: new Audio('assets/correct.mp3'),
        wrong: new Audio('assets/wrong.mp3'),
        confetti: new Audio('assets/confetti.mp3')
    };
    
    // Set volume levels
    sounds.click.volume = 0.3;
    sounds.correct.volume = 0.5;
    sounds.wrong.volume = 0.4;
    sounds.confetti.volume = 0.6;
    
    // Preload sounds
    Object.values(sounds).forEach(audio => {
        audio.preload = 'auto';
        audio.load();
    });
    
    console.log('Sound system initialized with HTML5 Audio');
}

/**
 * Play sound by name
 */
function playSound(soundName) {
    if (sounds[soundName]) {
        try {
            // Reset to beginning and play
            sounds[soundName].currentTime = 0;
            sounds[soundName].play().catch(error => {
                console.warn('Failed to play sound:', soundName, error);
            });
        } catch (error) {
            console.warn('Error playing sound:', soundName, error);
        }
    } else {
        console.warn('Sound not found:', soundName);
    }
}

/**
 * Play click sound
 */
function playClickSound() {
    playSound('click');
}

/**
 * Play correct answer sound
 */
function playCorrectSound() {
    playSound('correct');
}

/**
 * Play wrong answer sound
 */
function playWrongSound() {
    playSound('wrong');
}

/**
 * Play completion sound
 */
function playConfettiSound() {
    playSound('confetti');
}

// Export sound functions
window.sound = {
    initializeSoundSystem,
    playClickSound,
    playCorrectSound,
    playWrongSound,
    playConfettiSound
};

// Initialize sound system when script loads
initializeSoundSystem();
