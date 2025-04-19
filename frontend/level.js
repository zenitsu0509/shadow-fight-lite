import Environment from './environment';

const COLOR_PALETTE = {
  PRIMARY: '#00070A',
  SECONDARY: '#294552',
  TERTIARY: '#597884',
  QUATERNARY: '#9EB9B3',
  QUINTERNARY: '#ACC4CE'
};

const LEVEL_CONSTANTS = {
  MAX_TIME: 60 * 120,
  TIMER_TEXT_HEIGHT: 75,
  TIMER_RADIUS: 45,
  MAX_HEALTH: 200,
  HEALTH_BAR: {
    width: 400,
    height: 20
  },
  OFFSET: 20,
  ENVIRONMENT_PROBABILITY: 45, // Lower this number for less frequent effects (e.g., 60 or 80)
  // Updated list of possible environment effect types
  ENVIRONMENTS: [
      'sakura',
      'snowflake',
      'thunder',
      'red_thunder', // Using consistent snake_case
      'water'
    ]
};

// Default background if nothing is selected in localStorage
const DEFAULT_BACKGROUND = 'china-bg.jpg';
// Path to your background images
const BACKGROUND_IMAGE_PATH = 'frontend/assets/images/'; // Verify this path!

export default class Level {
  constructor(ctx, dimensions) {
    this.dimensions = dimensions;
    this.time = LEVEL_CONSTANTS.MAX_TIME;
    this.ctx = ctx;

    // --- Background Initialization ---
    this.backgroundImage = new Image();
    const selectedBackgroundFile = localStorage.getItem('selectedBackground') || DEFAULT_BACKGROUND;
    this.backgroundImage.src = `${BACKGROUND_IMAGE_PATH}${selectedBackgroundFile}`;
    this.backgroundImage.onerror = () => {
        console.error(`Failed to load background image: ${this.backgroundImage.src}`);
        this.backgroundImage.src = `${BACKGROUND_IMAGE_PATH}${DEFAULT_BACKGROUND}`;
    };
    // --- End Background Initialization ---

    this.playerHpPos = {
      x: this.dimensions.width / 2 - LEVEL_CONSTANTS.TIMER_RADIUS,
      y: LEVEL_CONSTANTS.TIMER_RADIUS - LEVEL_CONSTANTS.HEALTH_BAR.height + 5
    };

    this.botHpPos = {
      x: this.dimensions.width / 2 + LEVEL_CONSTANTS.TIMER_RADIUS,
      y: LEVEL_CONSTANTS.TIMER_RADIUS - LEVEL_CONSTANTS.HEALTH_BAR.height + 5
    };

    this.paused = false;
    this.environment = []; // Holds active environment particles

    // Randomly select ONE environment type for the duration of this level instance
    let environmentIndex = Math.floor(Math.random() * LEVEL_CONSTANTS.ENVIRONMENTS.length);
    this.environmentType = LEVEL_CONSTANTS.ENVIRONMENTS[environmentIndex];
    console.log("Selected Environment Type for this Level:", this.environmentType); // For debugging

    // Binding methods
    this.drawTimerCircle = this.drawTimerCircle.bind(this);
    this.drawTimerDisplay = this.drawTimerDisplay.bind(this);
    this.drawTimerText = this.drawTimerText.bind(this);
    this.drawHealthBars = this.drawHealthBars.bind(this);
    this.drawCurrentHealthBars = this.drawCurrentHealthBars.bind(this); // Added missing bind
    this.drawNames = this.drawNames.bind(this);
    this.drawPause = this.drawPause.bind(this);
    this.drawBackground = this.drawBackground.bind(this);
    this.drawFloor = this.drawFloor.bind(this);
  }

  animate(playerHealth, botHealth, paused) {
    let time;
    let winner;

    // Draw background first
    this.drawBackground();

    // Generate new environment particles randomly based on probability
    // Probability is 1 / ENVIRONMENT_PROBABILITY per frame
    let environmentGeneration = Math.floor(Math.random() * LEVEL_CONSTANTS.ENVIRONMENT_PROBABILITY);
    if (environmentGeneration === 0) { // Check for 0 for 1/N probability
      // Create a particle of the type selected for this level
      let newEnvironment = new Environment(this.ctx, this.dimensions, this.environmentType);
      this.environment.push(newEnvironment);
    }

    // Animate and remove off-screen particles (Iterate backwards for safe splice)
    for (let i = this.environment.length - 1; i >= 0; i--) {
        const particle = this.environment[i];
        particle.animate();
        // Remove if particle has fallen below the screen bottom edge + its height
        if (particle.pos.y > this.dimensions.height + particle.drawHeight + 10) {
            this.environment.splice(i, 1);
        }
    }

    // Draw UI elements
    time = this.drawTimer();
    this.drawHealthBars();
    winner = this.drawCurrentHealthBars(playerHealth, botHealth);
    this.drawNames();

    // Handle pause state
    paused ? this.paused = true : this.paused = false;
    this.drawPause(); // Draw pause icon/overlay

    // Check game end conditions
    if (time === 0) {
      this.environment = []; // Clear effects on game end
      return 'timeUp';
    } else if (winner) {
      this.environment = []; // Clear effects on game end
      return winner;
    } else if (this.paused) {
      return 'paused';
    }
    // Otherwise, continue game (return undefined implicitly)
  }

  // --- drawBackground Method ---
  drawBackground() {
    if (this.backgroundImage.complete && this.backgroundImage.naturalWidth !== 0) {
         this.ctx.drawImage(
             this.backgroundImage,
             0, 0, this.dimensions.width, this.dimensions.height
        );
    } else {
        this.ctx.fillStyle = COLOR_PALETTE.SECONDARY || '#294552';
        this.ctx.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
    }
  }

  // --- Other Drawing Methods ---
  drawTimer() {
    this.drawTimerCircle();
    this.drawTimerDisplay();
    this.drawTimerText();
    this.time = this.time - 1;
    if (this.time <= 0) { // Use <= 0 for safety
      let returnTime = 0;
      this.time = LEVEL_CONSTANTS.MAX_TIME; // Reset for potential next round
      return returnTime; // Indicate time is up
    }
  }

  drawTimerText() { /* ... No Changes Needed ... */ }
  drawTimerCircle() { /* ... No Changes Needed ... */ }
  drawTimerDisplay() { /* ... No Changes Needed ... */ }
  drawHealthBars() { /* ... No Changes Needed ... */ }
  drawCurrentHealthBars(playerHealth, botHealth) { /* ... No Changes Needed ... */ }
  drawNames() { /* ... No Changes Needed ... */ }
  drawPause() { /* ... No Changes Needed ... */ }
  drawFloor() { /* ... No Changes Needed ... */ }
}