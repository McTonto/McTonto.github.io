class AudioHandler {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.volume = 0;
        this.isInitialized = false;
        this.volumeMeter = document.getElementById('volume-meter');
        this.volumeValue = document.getElementById('volume-value');
    }

    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            
            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            source.connect(this.analyser);
            this.isInitialized = true;
            this.startAnalysis();
        } catch (error) {
            console.error('Error initializing audio:', error);
            throw error;
        }
    }

    startAnalysis() {
        if (!this.isInitialized) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Calculate average volume (0-1)
        const sum = this.dataArray.reduce((acc, val) => acc + val, 0);
        this.volume = sum / (this.dataArray.length * 255); // Normalize to 0-1
        
        // Update volume meter
        if (this.volumeMeter && this.volumeValue) {
            const percentage = Math.round(this.volume * 100);
            this.volumeMeter.style.width = `${percentage}%`;
            this.volumeValue.textContent = `Volume: ${percentage}%`;
        }
        
        requestAnimationFrame(() => this.startAnalysis());
    }

    getVolume() {
        return this.volume;
    }
} 