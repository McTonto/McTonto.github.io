class AudioHandler {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.volume = 0;
        
        // BPM detection properties
        this.bpm = 0;
        this.peaks = [];
        this.threshold = 0.25;
        this.minPeakDistance = 250; // Minimum ms between peaks
        this.lastPeakTime = 0;
        this.peakHistory = [];
        this.maxPeakHistory = 10; // Number of peaks to average
    }

    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);
            
            this.analyser.fftSize = 2048;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            this.startBPMDetection();
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            return false;
        }
    }

    startBPMDetection() {
        const detectBeats = () => {
            this.analyser.getByteFrequencyData(this.dataArray);
            
            // Calculate current volume
            let sum = 0;
            for (let i = 0; i < this.dataArray.length; i++) {
                sum += this.dataArray[i];
            }
            this.volume = sum / this.dataArray.length / 255;

            // Detect peaks for BPM
            const currentTime = Date.now();
            if (this.volume > this.threshold) {
                if (currentTime - this.lastPeakTime >= this.minPeakDistance) {
                    this.peakHistory.push(currentTime - this.lastPeakTime);
                    if (this.peakHistory.length > this.maxPeakHistory) {
                        this.peakHistory.shift();
                    }
                    this.lastPeakTime = currentTime;
                    
                    // Calculate BPM
                    if (this.peakHistory.length >= 2) {
                        const averageInterval = this.peakHistory.reduce((a, b) => a + b, 0) / this.peakHistory.length;
                        this.bpm = Math.round(60000 / averageInterval); // Convert ms to BPM
                        
                        // Clamp BPM to reasonable range
                        this.bpm = Math.min(Math.max(this.bpm, 60), 200);
                        
                        // Update DOM if you want to display the BPM
                        const volumeValue = document.getElementById('volume-value');
                        volumeValue.textContent = `Volume: ${Math.round(this.volume * 100)} | BPM: ${this.bpm}`;
                    }
                }
            }

            requestAnimationFrame(detectBeats);
        };

        detectBeats();
    }

    getVolume() {
        return this.volume;
    }

    getBPM() {
        return this.bpm;
    }
} 