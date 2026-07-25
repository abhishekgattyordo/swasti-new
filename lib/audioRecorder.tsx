export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  durationSeconds: number;
  audioBlob: Blob | null;
  audioBase64: string | null;
  mimeType: string;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private timerInterval: any = null;
  
  public durationSeconds: number = 0;
  public onStateChange?: (state: Partial<RecordingState>) => void;
  public onAudioLevel?: (level: number) => void;

  public static getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return 'audio/webm';
  }

  public async start(): Promise<void> {
    this.audioChunks = [];
    this.durationSeconds = 0;

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Audio Context for level meter
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);
      this.startLevelMonitoring();
    }

    const mimeType = AudioRecorder.getSupportedMimeType();
    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.audioChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(250); // collect chunks every 250ms

    this.startTimer();
    if (this.onStateChange) {
      this.onStateChange({
        isRecording: true,
        isPaused: false,
        durationSeconds: 0,
        mimeType
      });
    }
  }

  private startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.durationSeconds += 1;
      if (this.onStateChange) {
        this.onStateChange({ durationSeconds: this.durationSeconds });
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private startLevelMonitoring() {
    const updateLevel = () => {
      if (!this.analyser || !this.mediaRecorder || this.mediaRecorder.state !== 'recording') return;
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      if (this.onAudioLevel) {
        this.onAudioLevel(avg / 255);
      }
      requestAnimationFrame(updateLevel);
    };
    requestAnimationFrame(updateLevel);
  }

  public pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.stopTimer();
      if (this.onStateChange) {
        this.onStateChange({ isPaused: true });
      }
    }
  }

  public resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.startTimer();
      if (this.onStateChange) {
        this.onStateChange({ isPaused: false });
      }
    }
  }

  public async stop(): Promise<{ blob: Blob; base64: string; mimeType: string; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error("MediaRecorder is not initialized"));
      }

      this.stopTimer();

      this.mediaRecorder.onstop = async () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        
        // Clean up stream tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
        }
        if (this.audioContext) {
          this.audioContext.close();
        }

        const base64 = await blobToBase64(blob);

        if (this.onStateChange) {
          this.onStateChange({
            isRecording: false,
            isPaused: false,
            audioBlob: blob,
            audioBase64: base64,
            mimeType,
            durationSeconds: this.durationSeconds
          });
        }

        resolve({
          blob,
          base64,
          mimeType,
          duration: this.durationSeconds
        });
      };

      this.mediaRecorder.stop();
    });
  }
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Generate an audio blob from synthesized dialogue script if needed for quick test
export function generateSyntheticConsultationWav(dialogue: { speaker: string; text: string }[]): Promise<{ blob: Blob; base64: string; mimeType: string }> {
  return new Promise((resolve) => {
    const sampleRate = 8000;
    const duration = Math.max( dialogue.length * 3, 5);
    const numSamples = sampleRate * duration;
    const dataSize = numSamples * 2;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // Write WAV Header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(36, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Audio pattern with speech-like modulation
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const turnIndex = Math.floor(t / 3) % dialogue.length;
      const speaker = dialogue[turnIndex]?.speaker || 'Doctor';
      
      const baseFreq = speaker === 'Doctor' ? 140 : 220; // Pitch difference for Doctor vs Patient
      const modulate = Math.sin(2 * Math.PI * 4 * t) * 30;
      const sample = Math.sin(2 * Math.PI * (baseFreq + modulate) * t) * (1000 + (i % 200) * 10);
      
      view.setInt16(44 + i * 2, Math.floor(sample), true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    blobToBase64(blob).then((base64) => {
      resolve({ blob, base64, mimeType: 'audio/wav' });
    });
  });
}