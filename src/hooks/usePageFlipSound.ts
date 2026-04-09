'use client';

import { useRef, useCallback, useEffect } from 'react';

export function usePageFlipSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Prefetch and decode the MP3 file on component mount
    fetch('/page-flip.mp3')
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
      .then((decodedAudio) => {
        audioBufferRef.current = decodedAudio;
      })
      .catch((e) => console.error("Error decoding page-flip audio:", e));

    return () => {
      // Clean up the context when unmounted
      ctx.close().catch(() => {});
    };
  }, []);

  const playFlip = useCallback(() => {
    if (!audioCtxRef.current || !audioBufferRef.current) return;
    
    const ctx = audioCtxRef.current;
    
    // Autoplay policy: resume the context if it was in suspended state
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Create a new source node for instantaneous playback
    const source = ctx.createBufferSource();
    source.buffer = audioBufferRef.current;
    
    // Control volume
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.8;
    
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    source.start(0);
  }, []);

  return { playFlip };
}
