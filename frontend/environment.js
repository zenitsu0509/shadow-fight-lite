// Base path for environment images - VERIFY THIS PATH
const IMAGE_PATH = 'frontend/assets/images/';

// --- Constants ---
// Default dimensions - only used if specific type dimensions aren't set
const DEFAULT_SPRITE_WIDTH = 94;
const DEFAULT_SPRITE_HEIGHT = 94;

const ENVIRONMENT_CONSTANTS = {
  GRAVITY: 0.8, // Positive value makes particles fall DOWN. Adjust speed as needed.

  // --- VERIFY THESE SPRITE COUNTS ---
  // Count the actual number of frames in each sprite sheet image
  SAKURA_SPRITES: 3,
  SNOWFLAKE_SPRITES: 8,     // If using the 8-snowflake image you provided
  THUNDER_SPRITES: 4,       // Example - VERIFY COUNT IN thunder.png/jpg
  RED_THUNDER_SPRITES: 6,   // Example - VERIFY COUNT IN red-thunder.png/jpg
  WATER_SPRITES: 6,         // Example - VERIFY COUNT IN water.png/jpg

  // Size to draw the particle on the canvas
  ENVIRONMENT_RESIZE: 35 // Adjust as needed
};

export default class Environment {
  constructor(ctx, dimensions, type) {
    this.ctx = ctx;
    this.dimensions = dimensions;
    this.type = type;

    // Particle properties
    this.pos = {
      x: Math.random() * this.dimensions.width,
      y: -ENVIRONMENT_CONSTANTS.ENVIRONMENT_RESIZE // Start just above the screen
    };
    this.deltax = Math.random() * 0.8 - 0.4; // Horizontal drift speed

    // Drawing properties - initialized before _initializeByType
    this.img = new Image();
    this.isLoaded = false;
    this.randSpriteIndex = 0; // Which frame index from the sheet to draw
    this.spriteSourceWidth = DEFAULT_SPRITE_WIDTH;  // Will be overridden by _initializeByType
    this.spriteSourceHeight = DEFAULT_SPRITE_HEIGHT; // Will be overridden by _initializeByType
    this.drawWidth = ENVIRONMENT_CONSTANTS.ENVIRONMENT_RESIZE;
    this.drawHeight = ENVIRONMENT_CONSTANTS.ENVIRONMENT_RESIZE;
    this.totalSprites = 1; // Default

    // Set type-specific properties (image source, dimensions, sprite count)
    this._initializeByType();

    // Image loading handlers
    this.img.onload = () => {
      this.isLoaded = true;
      // Optional: If spriteSourceHeight wasn't set manually, derive from loaded image
      if (this.spriteSourceHeight === DEFAULT_SPRITE_HEIGHT && this.img.naturalHeight > 0){
           this.spriteSourceHeight = this.img.naturalHeight; // Assume sheet is 1 frame high
      }
      console.log(`Environment image loaded: ${this.img.src}, Frame Dim: ${this.spriteSourceWidth}x${this.spriteSourceHeight}`);
    };
    this.img.onerror = () => {
      console.error(`Failed to load environment image: ${this.img.src}`);
      this.isLoaded = false; // Don't try to draw a broken image
    };
  }

  // Helper to set type-specific properties
  _initializeByType() {
    let spriteCount = 1;
    // Default image source in case of unknown type
    this.img.src = `${IMAGE_PATH}sakura.png`; // Default to sakura? Or make it null?

    switch (this.type) {
      case 'sakura':
        spriteCount = ENVIRONMENT_CONSTANTS.SAKURA_SPRITES;
        this.img.src = `${IMAGE_PATH}sakura.png`;
        // --- Set ACTUAL dimensions for sakura frame ---
        this.spriteSourceWidth = 94;  // Replace with actual measured width if not 94
        this.spriteSourceHeight = 94; // Replace with actual measured height if not 94
        break;

      case 'snowflake':
        spriteCount = ENVIRONMENT_CONSTANTS.SNOWFLAKE_SPRITES;
        this.img.src = `${IMAGE_PATH}snowflake.png`; // Assumes snowflake.png is the sprite sheet
        // --- Set ACTUAL dimensions for snowflake frame ---
        this.spriteSourceWidth = 94;  // Replace with actual measured width if not 94
        this.spriteSourceHeight = 94; // Replace with actual measured height if not 94
        break;

      case 'thunder':
        spriteCount = ENVIRONMENT_CONSTANTS.THUNDER_SPRITES; // Make sure this count is correct!
        // ** USE PNG for transparency if possible! **
        this.img.src = `${IMAGE_PATH}thunder.jpg`; // Update to thunder.png if you convert it
        // --- !! CRITICAL: Set ACTUAL dimensions for ONE thunder frame !! ---
        this.spriteSourceWidth = 100; // <<--- REPLACE with ACTUAL thunder frame width
        this.spriteSourceHeight = 150; // <<--- REPLACE with ACTUAL thunder frame height
        break;

      case 'red_thunder':
        spriteCount = ENVIRONMENT_CONSTANTS.RED_THUNDER_SPRITES; // Make sure this count is correct!
         // ** USE PNG for transparency if possible! **
        this.img.src = `${IMAGE_PATH}red-thunder.jpg`; // Update to red-thunder.png if you convert it
        // --- !! CRITICAL: Set ACTUAL dimensions for ONE red_thunder frame !! ---
        this.spriteSourceWidth = 110; // <<--- REPLACE with ACTUAL red thunder frame width
        this.spriteSourceHeight = 160; // <<--- REPLACE with ACTUAL red thunder frame height
        break;

      case 'water':
        spriteCount = ENVIRONMENT_CONSTANTS.WATER_SPRITES; // Make sure this count is correct!
        // ** USE PNG for transparency if possible! **
        this.img.src = `${IMAGE_PATH}water.jpg`; // Update to water.png if you convert it
        // --- !! CRITICAL: Set ACTUAL dimensions for ONE water frame !! ---
        this.spriteSourceWidth = 80; // <<--- REPLACE with ACTUAL water frame width
        this.spriteSourceHeight = 80; // <<--- REPLACE with ACTUAL water frame height
        break;

      default:
        console.warn(`Unknown environment type: ${this.type}. Using default sakura.`);
        spriteCount = ENVIRONMENT_CONSTANTS.SAKURA_SPRITES;
        this.img.src = `${IMAGE_PATH}sakura.png`;
        this.spriteSourceWidth = DEFAULT_SPRITE_WIDTH;
        this.spriteSourceHeight = DEFAULT_SPRITE_HEIGHT;
        break;
    }

    // Choose a random sprite frame index from the sheet
    if (spriteCount > 0) {
      this.randSpriteIndex = Math.floor(Math.random() * spriteCount);
    } else {
      this.randSpriteIndex = 0; // Safety fallback
      spriteCount = 1;
    }
    this.totalSprites = spriteCount; // Store total number of sprites
  }

  // Main update called by Level's animation loop
  animate() {
    this.move();
    this.drawEnvironment();
  }

  // Update particle position
  move() {
    // Apply gravity (move down)
    this.pos.y += ENVIRONMENT_CONSTANTS.GRAVITY;
    // Apply horizontal drift
    this.pos.x += this.deltax;

    // Optional: Screen wrapping for horizontal movement
    if (this.pos.x > this.dimensions.width) {
      this.pos.x = -this.drawWidth; // Wrap from right to left
    } else if (this.pos.x < -this.drawWidth) {
      this.pos.x = this.dimensions.width; // Wrap from left to right
    }
  }

  // Draw the particle onto the canvas
  drawEnvironment() {
    // Only draw if the image has successfully loaded and has dimensions
    if (!this.isLoaded || !this.img.complete || this.img.naturalWidth === 0) {
      return; // Skip drawing if image isn't ready
    }

    // Calculate the X position of the frame to draw from the sprite sheet
    const sourceX = this.spriteSourceWidth * this.randSpriteIndex;
    const sourceY = 0; // Assuming all frames are in a single horizontal row

    try {
      this.ctx.drawImage(
        this.img,                 // The image object (sprite sheet)
        sourceX,                  // Source X on sprite sheet
        sourceY,                  // Source Y on sprite sheet (usually 0)
        this.spriteSourceWidth,   // Width of ONE frame on sprite sheet (CRITICAL)
        this.spriteSourceHeight,  // Height of ONE frame on sprite sheet (CRITICAL)
        this.pos.x,               // Destination X on canvas
        this.pos.y,               // Destination Y on canvas
        this.drawWidth,           // Destination width on canvas (resized)
        this.drawHeight           // Destination height on canvas (resized)
      );
    } catch (e) {
      // Log error and prevent further drawing attempts for this particle if error occurs
      console.error(`Error drawing environment image (${this.type}) src: ${this.img.src}`, e);
      console.error(`Draw Params: sx=${sourceX}, sy=${sourceY}, sw=${this.spriteSourceWidth}, sh=${this.spriteSourceHeight}, dx=${this.pos.x}, dy=${this.pos.y}, dw=${this.drawWidth}, dh=${this.drawHeight}`);
      this.isLoaded = false; // Stop trying to draw this broken particle
    }
  }
}