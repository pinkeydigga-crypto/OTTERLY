"use client";

const AUDIO_SRC =
  "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/audio.mp3";

const LOW_VOLUME = 0.15;

class MinimalBgMusicController {
  private audio: HTMLAudioElement | null = null;
  private muted = false;
  private enabled = false;

  private getAudio(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;

    if (!this.audio) {
      const el = new Audio(AUDIO_SRC);
      el.loop = true;
      el.preload = "auto";
      el.volume = LOW_VOLUME;
      this.audio = el;
    }

    this.audio.loop = true;
    this.audio.volume = LOW_VOLUME;
    this.audio.muted = this.muted;
    return this.audio;
  }

  private playNow() {
    const audio = this.getAudio();
    if (!audio) return;

    if (!this.enabled || this.muted) {
      audio.pause();
      return;
    }

    if (audio.paused) {
      audio.play().catch(() => {});
    }
  }

  public unlock() {
    this.playNow();
  }

  public setEnabled(isEnabled: boolean) {
    this.enabled = isEnabled;
    this.playNow();
  }

  public setMuted(isMuted: boolean) {
    this.muted = isMuted;
    this.playNow();
  }

  public isMuted() {
    return this.muted;
  }
}

export const minimalBgMusic = new MinimalBgMusicController();