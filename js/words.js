class Word {
    constructor(word, canvas) {
        this.word = word;
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.velocityX = (Math.random() - 0.5) * 0.5;
        this.velocityY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.size = Math.random() * 10 + 14;
        this.sinOffset = Math.random() * Math.PI * 2;
    }

    update(volume = 0) {
        // Basic movement
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Add wavy movement
        this.x += Math.sin(this.y * 0.01 + this.sinOffset) * 0.3;
        
        // Audio reactivity
        if (volume > 0.1) {
            const audioEffect = volume * 2;
            this.velocityX += (Math.random() - 0.5) * audioEffect;
            this.velocityY += (Math.random() - 0.5) * audioEffect;
        }
        
        // Dampen velocities for smooth movement
        this.velocityX *= 0.99;
        this.velocityY *= 0.99;

        // Wrap around screen edges
        if (this.x < -50) this.x = this.canvas.width + 50;
        if (this.x > this.canvas.width + 50) this.x = -50;
        if (this.y < -50) this.y = this.canvas.height + 50;
        if (this.y > this.canvas.height + 50) this.y = -50;
    }

    draw(ctx) {
        ctx.font = `${this.size}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 0, ${this.opacity})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.word, this.x, this.y);
    }
}

class WordsAnimation {
    constructor(audioHandler) {
        this.canvas = document.getElementById('words-layer');
        this.ctx = this.canvas.getContext('2d');
        this.words = [];
        this.isAnimating = false;
        this.audioHandler = audioHandler;
    }

    async initialize() {
        try {
            const text = await this.loadText();
            console.log('Raw text loaded:', text);

            // Split into words and clean up
            const words = text
                .split(/[\s\n]+/)
                .map(word => word.trim())
                .filter(word => word.length > 0)
                .filter(word => !/^\d+$/.test(word))
                .filter(word => word !== 'Version');

            console.log('Available words for animation:', words);

            // Clear any existing words
            this.words = [];

            // Create word objects
            const numberOfWords = Math.min(words.length, 30);
            for (let i = 0; i < numberOfWords; i++) {
                const word = words[i % words.length];
                this.words.push(new Word(word, this.canvas));
            }

            this.startAnimation();
        } catch (error) {
            console.error('Error in initialize:', error);
            throw error;
        }
    }

    async loadText() {
        try {
            console.log('Attempting to load lyrics.txt...');
            const response = await fetch('/data/lyrics.txt');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            console.log('Text file loaded successfully, first 50 chars:', text.substring(0, 50));
            return text;
        } catch (error) {
            console.error('Error loading lyrics.txt:', error);
            console.log('Falling back to default text');
            return 'Error Loading Text';
        }
    }

    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.animate();
    }

    stopAnimation() {
        this.isAnimating = false;
    }

    animate() {
        if (!this.isAnimating) return;

        // Replace the trail effect with a complete clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const volume = this.audioHandler.getVolume();

        this.words.forEach(word => {
            word.update(volume);
            word.draw(this.ctx);
        });

        requestAnimationFrame(() => this.animate());
    }
} 