class Sentence {
    constructor(text, canvas, yPosition) {
        this.text = text;
        this.canvas = canvas;
        this.x = canvas.width / 2;
        this.y = yPosition;
        this.opacity = 0.6;
        this.baseOpacity = this.opacity;
        this.size = 16;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    update(volume = 0) {
        if (volume > 0.1) {
            const intensity = volume * 2;
            this.offsetX = (Math.random() - 0.5) * intensity * 5;
            this.offsetY = (Math.random() - 0.5) * intensity * 2;
            this.opacity = Math.min(1, this.baseOpacity + (volume * 0.4));
        } else {
            this.offsetX *= 0.9;
            this.offsetY *= 0.9;
            this.opacity = this.baseOpacity;
        }
    }

    draw(ctx) {
        ctx.font = `${this.size}px Arial`;
        ctx.fillStyle = `rgba(0, 255, 255, ${this.opacity})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.offsetX, this.y + this.offsetY);
    }
}

class SentencesAnimation {
    constructor(audioHandler) {
        this.canvas = document.getElementById('sentences-layer');
        this.ctx = this.canvas.getContext('2d');
        this.sentences = [];
        this.isAnimating = false;
        this.audioHandler = audioHandler;
    }

    async initialize() {
        try {
            const text = await this.loadText();
            
            const sentences = text
                .split('\n')
                .filter(line => line.trim().length > 0)
                .filter(line => !line.includes('Versio'));

            console.log('Processed sentences:', sentences);

            sentences.forEach((text, index) => {
                if (index === 0) return;
                const yPosition = 100 + ((index - 1) * 30);
                this.sentences.push(new Sentence(text, this.canvas, yPosition));
            });

            this.startAnimation();
        } catch (error) {
            console.error('Error in initialize:', error);
            throw error;
        }
    }

    async loadText() {
        try {
            const response = await fetch('./data/lyrics.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            console.log('Successfully loaded text for sentences:', text.substring(0, 50) + '...');
            return text;
        } catch (error) {
            console.error('Detailed error loading text file:', error);
            return 'Error loading sentences. Please check the connection.';
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

        this.sentences.forEach(sentence => {
            sentence.update(volume);
            sentence.draw(this.ctx);
        });

        requestAnimationFrame(() => this.animate());
    }
} 