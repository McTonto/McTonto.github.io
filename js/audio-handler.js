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
        this.threshold = 0.1;
        this.minPeakDistance = 150;
        this.lastPeakTime = 0;
        this.peakHistory = [];
        this.maxPeakHistory = 6;
        this.lastVolume = 0;
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
            
            // Calculate current volume with enhanced bass emphasis
            let sum = 0;
            let bassSum = 0;
            for (let i = 0; i < this.dataArray.length; i++) {
                if (i < 20) { // Extended bass range
                    bassSum += this.dataArray[i] * 3; // Increased bass weight
                }
                sum += this.dataArray[i];
            }
            const currentVolume = (sum / this.dataArray.length + bassSum) / (255 * 4);
            
            // Detect peaks using volume derivative
            const volumeDerivative = currentVolume - this.lastVolume;
            this.lastVolume = currentVolume;
            
            // Smooth volume for display
            this.volume = this.volume * 0.9 + currentVolume * 0.1;

            // Update volume meter
            const volumeMeter = document.getElementById('volume-meter');
            const volumeValue = document.getElementById('volume-value');
            if (volumeMeter && volumeValue) {
                volumeMeter.style.width = `${this.volume * 100}%`;
                volumeValue.textContent = `Volume: ${Math.round(this.volume * 100)}`;
            }

            // Detect peaks for BPM using volume derivative
            const currentTime = Date.now();
            if (volumeDerivative > this.threshold && currentTime - this.lastPeakTime >= this.minPeakDistance) {
                this.peakHistory.push(currentTime - this.lastPeakTime);
                if (this.peakHistory.length > this.maxPeakHistory) {
                    this.peakHistory.shift();
                }
                this.lastPeakTime = currentTime;
                
                // Calculate BPM with weighted average
                if (this.peakHistory.length >= 2) {
                    // Give more weight to recent intervals
                    let weightedSum = 0;
                    let weightSum = 0;
                    this.peakHistory.forEach((interval, index) => {
                        const weight = index + 1;
                        weightedSum += interval * weight;
                        weightSum += weight;
                    });
                    const averageInterval = weightedSum / weightSum;
                    const newBPM = Math.round(60000 / averageInterval);
                    
                    // Smooth BPM changes
                    this.bpm = this.bpm ? Math.round(this.bpm * 0.7 + newBPM * 0.3) : newBPM;
                    
                    // Clamp BPM to reasonable range
                    this.bpm = Math.min(Math.max(this.bpm, 60), 200);
                    
                    // Update BPM meter
                    const bpmMeter = document.getElementById('bpm-meter');
                    const bpmValue = document.getElementById('bpm-value');
                    if (bpmMeter && bpmValue) {
                        const bpmPercentage = ((this.bpm - 60) / (200 - 60)) * 100;
                        bpmMeter.style.width = `${bpmPercentage}%`;
                        bpmValue.textContent = `BPM: ${this.bpm}`;
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