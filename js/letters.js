class Letter {
    constructor(char, x, canvas) {
        this.char = char;
        this.x = x;
        this.y = -20;
        this.speed = (Math.random() * 2 + 0.5);
        this.opacity = Math.random() * 0.8 + 0.2;
        this.baseOpacity = this.opacity;
        this.amplitude = Math.random() * 2;
        this.offset = Math.random() * Math.PI * 2;
        this.canvas = canvas;
        this.opacitySpeed = 0.03 + Math.random() * 0.02;
        this.opacityOffset = Math.random() * Math.PI * 2;
        this.direction = Math.random() < 0.5 ? -1 : 1; // Random initial direction
    }

    update(volume) {
        this.y += this.speed;
        
        // Base movement
        let horizontalMovement = Math.sin(this.y * 0.01 + this.offset) * this.amplitude * 0.1;
        
        // Add audio-reactive movement
        if (volume > 0.2) { // Threshold for noise reaction
            const audioEffect = (volume - 0.2) * 10; // Scale the effect
            horizontalMovement += this.direction * audioEffect;
            
            // Randomly change direction on loud sounds
            if (volume > 0.4 && Math.random() < 0.1) {
                this.direction *= -1;
            }
        }
        
        this.x += horizontalMovement;
        
        // Keep letters within canvas bounds
        if (this.x < 0) {
            this.x = 0;
            this.direction = 1;
        } else if (this.x > this.canvas.width) {
            this.x = this.canvas.width;
            this.direction = -1;
        }
        
        this.opacity = this.baseOpacity * (0.7 + Math.sin(this.y * this.opacitySpeed + this.opacityOffset) * 0.3);
        
        if (this.y > this.canvas.height) {
            this.y = -20;
            this.x = Math.random() * this.canvas.width;
            this.baseOpacity = Math.random() * 0.8 + 0.2;
            this.opacity = this.baseOpacity;
            this.direction = Math.random() < 0.5 ? -1 : 1;
        }
    }

    draw(ctx) {
        ctx.font = '16px Arial';
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fillText(this.char, this.x, this.y);
    }
}

class LettersAnimation {
    constructor(audioHandler) {
        this.canvas = document.getElementById('letters-layer');
        this.ctx = this.canvas.getContext('2d');
        this.letters = [];
        this.text = '';
        this.isAnimating = false;
        this.audioHandler = audioHandler; // Use shared audio handler
    }

    async loadText() {
        try {
            const response = await fetch('./data/lyrics.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            console.log('Successfully loaded text for letters:', text.substring(0, 50) + '...'); // Debug log
            return text;
        } catch (error) {
            console.error('Detailed error loading text file:', error);
            // Return a default text if loading fails
            return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
    }

    async initialize() {
        try {
            // Remove audio initialization since we're using shared handler
            this.text = await this.loadText();
            console.log('Loaded text:', this.text);
            
            const chars = this.text.replace(/[^a-zA-Z]/g, '').split('');
            console.log('Processed chars:', chars);
            
            if (chars.length === 0) {
                throw new Error('No valid characters found in text file');
            }

            const numberOfLetters = 100;
            for (let i = 0; i < numberOfLetters; i++) {
                const randomChar = chars[Math.floor(Math.random() * chars.length)];
                const x = Math.random() * this.canvas.width;
                this.letters.push(new Letter(randomChar, x, this.canvas));
            }

            this.startAnimation();
        } catch (error) {
            console.error('Error in initialize:', error);
            throw error;
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

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const volume = this.audioHandler.getVolume();
        
        this.letters.forEach(letter => {
            letter.update(volume);
            letter.draw(this.ctx);
        });

        requestAnimationFrame(() => this.animate());
    }
} 