/**
 * Sound Effects Manager using Web Audio API
 * Generates procedural sounds for game events
 */

class SoundEffects {
	private audioContext: AudioContext | null = null;
	private enabled: boolean = true;

	private getContext(): AudioContext {
		if (!this.audioContext) {
			this.audioContext = new (window.AudioContext ||
				(window as any).webkitAudioContext)();
		}
		return this.audioContext;
	}

	private playTone(
		frequency: number,
		duration: number,
		type: OscillatorType = 'sine',
		volume: number = 0.3
	) {
		if (!this.enabled) return;

		try {
			const ctx = this.getContext();
			const oscillator = ctx.createOscillator();
			const gainNode = ctx.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(ctx.destination);

			oscillator.type = type;
			oscillator.frequency.value = frequency;

			gainNode.gain.setValueAtTime(volume, ctx.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(
				0.01,
				ctx.currentTime + duration
			);

			oscillator.start(ctx.currentTime);
			oscillator.stop(ctx.currentTime + duration);
		} catch (error) {
			console.error('Error playing sound:', error);
		}
	}

	private playSequence(
		frequencies: number[],
		duration: number,
		type: OscillatorType = 'sine',
		volume: number = 0.3
	) {
		if (!this.enabled) return;

		frequencies.forEach((freq, index) => {
			setTimeout(
				() => {
					this.playTone(freq, duration, type, volume);
				},
				index * duration * 1000
			);
		});
	}

	play(soundName: string) {
		switch (soundName) {
			case 'trap-activated':
				// Low ominous tone
				this.playTone(150, 0.3, 'sawtooth', 0.25);
				setTimeout(() => this.playTone(120, 0.4, 'sawtooth', 0.25), 150);
				break;

			case 'correct-answer':
				// Happy ascending tones
				this.playSequence([523, 659, 784, 1047], 0.15, 'sine', 0.3);
				break;

			case 'incorrect-answer':
				// Descending buzzer
				this.playTone(200, 0.2, 'sawtooth', 0.25);
				setTimeout(() => this.playTone(150, 0.3, 'sawtooth', 0.25), 200);
				break;

			case 'timer-warning':
				// Urgent beep
				this.playTone(880, 0.1, 'square', 0.4);
				setTimeout(() => this.playTone(880, 0.1, 'square', 0.4), 150);
				break;

			case 'game-start':
				// Triumphant scale
				this.playSequence([262, 330, 392, 523, 659], 0.12, 'sine', 0.3);
				break;

			case 'vote-cast':
				// Quick click
				this.playTone(600, 0.05, 'sine', 0.2);
				break;

			case 'powerup-activated':
				// Rising tone
				this.playSequence([400, 500, 600, 700, 800], 0.08, 'sine', 0.3);
				break;

			case 'countdown-tick':
				// Short tick
				this.playTone(440, 0.05, 'square', 0.15);
				break;

			default:
				console.warn(`Unknown sound: ${soundName}`);
		}
	}

	toggle() {
		this.enabled = !this.enabled;
	}

	setEnabled(enabled: boolean) {
		this.enabled = enabled;
	}
}

export const soundEffects = new SoundEffects();
