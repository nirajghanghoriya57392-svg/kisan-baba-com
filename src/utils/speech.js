/**
 * Speech Utilities for KisanBaba
 * Uses Browser Native Web Speech API (FREE)
 */

// Text to Speech
export const speakText = (text, lang = 'hi-IN') => {
  if (!window.speechSynthesis) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1;
  
  window.speechSynthesis.speak(utterance);
};

// Voice Recognition
export const startVoiceRecognition = (onResult, onEnd, lang = 'hi-IN') => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Voice recognition not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  recognition.onerror = (event) => {
    console.error("Speech error", event.error);
    if (onEnd) onEnd();
  };

  recognition.start();
  return recognition;
};
