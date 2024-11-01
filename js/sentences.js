class SentencesAnimation {
    constructor(audioHandler) {
        this.canvas = document.getElementById('sentences-layer');
        this.ctx = this.canvas.getContext('2d');
        this.audioHandler = audioHandler;
        this.sentences = [];
        this.isAnimating = false;
        this.textElement = document.getElementById('text-source');
    }

    async initialize() {
        try {
            const response = await fetch(this.textElement.dataset.file);
            const text = await response.text();
            
            console.log('Loaded text:', text); // Debug log
            
            // Find all text between [ and ]
            const matches = text.match(/\[(.*?)\]/g) || [];
            console.log('Found matches:', matches); // Debug log
            
            this.sentences = matches.map(match => {
                const sentence = {
                    text: match.slice(1, -1), // Remove [ and ]
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    speed: 0.3 + Math.random() * 0.7,
                    angle: Math.random() * Math.PI * 2,
                    size: 30 // Made size larger and fixed
                };
                console.log('Created sentence object:', sentence); // Debug log
                return sentence;
            });

            console.log('Total sentences:', this.sentences.length); // Debug log
            this.startAnimation();
        } catch (error) {
            console.error('Error in initialize:', error);
        }
    }

    startAnimation() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.animate();
        }
    }

    stopAnimation() {
        this.isAnimating = false;
    }

    animate() {
        if (!this.isAnimating) return;

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Get current volume
        const volume = this.audioHandler.getVolume();
        
        // Update and draw sentences
        this.sentences.forEach(sentence => {
            // Update position
            sentence.x += Math.cos(sentence.angle) * sentence.speed * (volume * 0.5 + 0.1);
            sentence.y += Math.sin(sentence.angle) * sentence.speed * (volume * 0.5 + 0.1);

            // Wrap around screen
            if (sentence.x > this.canvas.width) sentence.x = 0;
            if (sentence.x < 0) sentence.x = this.canvas.width;
            if (sentence.y > this.canvas.height) sentence.y = 0;
            if (sentence.y < 0) sentence.y = this.canvas.height;

            // Draw sentence with higher opacity
            this.ctx.font = `${sentence.size * (1 + volume)}px 'Bebas Neue'`;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + volume * 0.4})`; // Increased base opacity
            this.ctx.textAlign = 'center';
            this.ctx.fillText(sentence.text, sentence.x, sentence.y);
        });

        requestAnimationFrame(() => this.animate());
    }
} 