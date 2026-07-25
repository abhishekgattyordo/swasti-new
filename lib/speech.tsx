export function mapMicLocale(language: string): string {
  switch (language) {
    case 'kn-IN':
      return 'kn-IN';
    case 'hi-IN':
      return 'hi-IN';
    case 'en-IN':
    default:
      return 'en-IN';
  }
}

export interface LiveTranscriptionState {
  fullText: string;
  finalLines: string[];
  interimText: string;
}

export class LiveTranscriptionSession {
  private recognition: any = null;
  private isCancelled = false;
  private finalLines: string[] = [];
  private fullText = '';
  private interimText = '';

  public async start(
    onStateChange: (state: LiveTranscriptionState) => void,
    options: { language: string }
  ): Promise<void> {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error(
        'Browser Speech Recognition API is not supported in this browser. Please use Chrome or Edge.'
      );
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = options.language || 'en-IN';

    this.recognition.onresult = (event: any) => {
      if (this.isCancelled) return;

      let currentFinal = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript + ' ';
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (currentFinal.trim()) {
        this.finalLines.push(currentFinal.trim());
      }

      this.interimText = currentInterim;
      this.fullText = [...this.finalLines, this.interimText].filter(Boolean).join(' ');

      onStateChange({
        fullText: this.fullText,
        finalLines: [...this.finalLines],
        interimText: this.interimText,
      });
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition warning:', event.error);
    };

    this.recognition.onend = () => {
      // Auto-restart if continuous recording was not explicitly stopped or cancelled
      if (!this.isCancelled && this.recognition) {
        try {
          this.recognition.start();
        } catch (e) {
          // ignore already started error
        }
      }
    };

    this.recognition.start();
  }

  public async stop(): Promise<LiveTranscriptionState> {
    this.isCancelled = true;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Recognition stop error:', e);
      }
    }

    const state: LiveTranscriptionState = {
      fullText: this.fullText,
      finalLines: [...this.finalLines],
      interimText: '',
    };

    return state;
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
    }
  }
}