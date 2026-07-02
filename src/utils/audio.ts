let currentHtmlAudio: HTMLAudioElement | null = null;

/**
 * SpeechSynthesis Fallback for TTS (iframe-safe and crash-proof)
 */
const fallbackSpeech = (text: string) => {
  try {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      if (synth) {
        synth.cancel(); // Stop current speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.85; // slightly slower for second-graders
        synth.speak(utterance);
      }
    } else {
      console.warn("Speech synthesis not supported or restricted.");
    }
  } catch (e) {
    console.warn("Speech fallback restricted or failed:", e);
  }
};

/**
 * Main TTS Audio Player with safe volume scaling
 * @param text The text to speak
 * @param volume Current volume scaling factor (0.0 to 3.0)
 */
export const playAudio = (text: string, volume: number = 1.0) => {
  const cleanedText = text.replace(/[\/\$]/g, " ").trim();

  try {
    // 1. Clear previous playing audio source
    if (currentHtmlAudio) {
      try {
        currentHtmlAudio.pause();
        currentHtmlAudio.src = "";
      } catch (err) {
        // Safe check
      }
    }

    const ttsUrl = `/api/tts?audio=${encodeURIComponent(cleanedText)}&type=2`;
    const audio = new Audio();
    currentHtmlAudio = audio;

    // Set standard HTML5 Audio volume safely (0.0 to 1.0)
    // Scale 0.0 - 3.0 down to 0.0 - 1.0
    audio.volume = Math.max(0, Math.min(1, volume / 3.0));

    audio.src = ttsUrl;
    
    // Attempt play
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("TTS play promise rejected, falling back to Web Speech:", err);
        fallbackSpeech(cleanedText);
      });
    }
  } catch (e) {
    console.warn("Audio pipeline failed, falling back to Web Speech:", e);
    fallbackSpeech(cleanedText);
  }
};

