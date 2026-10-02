'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Music, Waves, Flame, CloudRain, SunMedium } from 'lucide-react';

type SoundscapePreset = 'fireside' | 'rain' | 'calm';

export const AmbientSoundscape: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState<SoundscapePreset>('fireside');
  const [volume, setVolume] = useState(0.4);
  const [isExpanded, setIsExpanded] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize or clean Web Audio synthesis
  const stopAudio = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  const startAudio = (preset: SoundscapePreset) => {
    stopAudio();

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // 1. Brown noise base buffer (gentle organic warmth)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise filter formula
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5; // Gain compensation
      }

      const whiteNoiseNode = ctx.createBufferSource();
      whiteNoiseNode.buffer = noiseBuffer;
      whiteNoiseNode.loop = true;

      if (preset === 'fireside') {
        // Lowpass filter for warm room ambience
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        whiteNoiseNode.connect(filter);
        filter.connect(masterGain);
        whiteNoiseNode.start();

        // Procedural Fire Cracks using periodic impulse clicks
        timerRef.current = window.setInterval(() => {
          if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
          if (Math.random() > 0.4) {
            const crackGain = ctx.createGain();
            crackGain.gain.setValueAtTime(Math.random() * 0.15 * volume, ctx.currentTime);
            crackGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800 + Math.random() * 2200, ctx.currentTime);
            osc.connect(crackGain);
            crackGain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.05);
          }
        }, 120);

      } else if (preset === 'rain') {
        // Bandpass filter for soft rain on glass
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100, ctx.currentTime);
        filter.Q.setValueAtTime(0.7, ctx.currentTime);

        whiteNoiseNode.connect(filter);
        filter.connect(masterGain);
        whiteNoiseNode.start();

      } else {
        // Nordic Morning Calm: Harmonic warm drone chords
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);
        whiteNoiseNode.connect(filter);
        filter.connect(masterGain);
        whiteNoiseNode.start();

        // Warm sine chord oscillators (A major pentatonic: A, C#, E)
        const frequencies = [220, 277.18, 329.63];
        frequencies.forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const oscGain = ctx.createGain();
          oscGain.gain.setValueAtTime(0.04 * volume, ctx.currentTime);

          osc.connect(oscGain);
          oscGain.connect(masterGain);
          osc.start();
        });
      }

      noiseSourceRef.current = whiteNoiseNode;
      setIsPlaying(true);
    } catch (e) {
      console.error('Audio context initiation error:', e);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio(activePreset);
    }
  };

  const handlePresetChange = (preset: SoundscapePreset) => {
    setActivePreset(preset);
    if (isPlaying) {
      startAudio(preset);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol * 0.35, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Expanded Control Box */}
      {isExpanded && (
        <div className="mb-3 bg-white/95 backdrop-blur-xl border border-[#4A2C1A]/15 rounded-2xl p-4 shadow-soft-xl text-[#211E1B] w-72 sm:w-80 animate-fadeIn space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#EEE9E1] pb-2.5">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-[#8B5A2B]" />
              <span className="font-display font-semibold text-sm text-[#4A2C1A]">
                Veloura Architectural Soundscapes
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs text-[#9C9287] hover:text-[#4A2C1A] px-1.5 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Sound Presets */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'fireside', name: 'Walnut Fireside', icon: Flame, desc: 'Warm crackle' },
              { id: 'rain', name: 'Kyoto Rain', icon: CloudRain, desc: 'Flax & glass' },
              { id: 'calm', name: 'Nordic Calm', icon: SunMedium, desc: 'Gentle drone' }
            ].map((p) => {
              const Icon = p.icon;
              const isSelected = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePresetChange(p.id as SoundscapePreset)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-[#4A2C1A] text-[#F5E6D3] border-[#4A2C1A] shadow-sm'
                      : 'bg-[#FCFAF7] border-[#EEE9E1] text-[#746B61] hover:bg-white hover:text-[#211E1B]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C49A6C]' : 'text-[#8B5A2B]'}`} />
                  <span className="text-[10px] font-bold leading-tight">{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Volume Control */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-[#746B61]">
              <span>Ambient Volume</span>
              <span className="font-mono">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#EEE9E1] rounded-lg appearance-none cursor-pointer accent-[#8B5A2B]"
            />
          </div>
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold shadow-soft-lg transition-all duration-300 border cursor-pointer ${
            isPlaying
              ? 'bg-[#4A2C1A] text-[#F5E6D3] border-[#8B5A2B]/40 ring-2 ring-[#8B5A2B]/30'
              : 'bg-white/90 backdrop-blur-md text-[#4A2C1A] hover:bg-white border-[#4A2C1A]/12'
          }`}
          title="Toggle Room Atmosphere Soundscape"
        >
          {isPlaying ? (
            <>
              <div className="flex items-center gap-0.5 h-3.5">
                <span className="w-0.5 bg-[#C49A6C] rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-3.5" />
                <span className="w-0.5 bg-[#C49A6C] rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-2" />
                <span className="w-0.5 bg-[#C49A6C] rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-3" />
              </div>
              <span className="font-display tracking-wide capitalize">{activePreset}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-[#8B5A2B]" />
              <span className="hidden sm:inline">Room Atmosphere</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-[#4A2C1A]/12 flex items-center justify-center text-[#4A2C1A] shadow-soft-sm text-xs cursor-pointer"
          title="Adjust Soundscape"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
};
