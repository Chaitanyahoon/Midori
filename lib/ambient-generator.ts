/**
 * Web Audio API Ambient Soundscape Generator
 * Synthesizes relaxing focus sounds completely client-side.
 * 100% offline, lightweight, and bypasses browser autoplay/iframe blocking.
 */

export class AmbientSoundscapeGenerator {
  private ctx: AudioContext | null = null
  private activeSounds: {
    [key: string]: {
      gainNode: GainNode
      sources: any[]
      intervals: any[]
      volume: number
    }
  } = {}

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        this.ctx = new AudioCtx()
      } catch (e) {
        console.error("Web Audio API is not supported in this browser:", e)
        return null
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  // Pre-generates sound buffers for white/pink/brown noise
  private createNoiseBuffer(type: "white" | "pink" | "brown"): AudioBuffer | null {
    const context = this.getContext()
    if (!context) return null

    const bufferSize = 2 * context.sampleRate // 2 seconds of audio
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
    const data = buffer.getChannelData(0)

    if (type === "white") {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
    } else if (type === "pink") {
      // Paul Kellet's refined pink noise method
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
        data[i] *= 0.11 // approximation to scale down
        b6 = white * 0.115926
      }
    } else if (type === "brown") {
      let lastOut = 0.0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        data[i] = (lastOut + (0.02 * white)) / 1.02
        lastOut = data[i]
        data[i] *= 3.5 // compensation
      }
    }

    return buffer
  }

  /**
   * Starts synthesizing a soundscape
   * @param type "rain" | "ocean" | "fireplace" | "forest" | "meditation"
   * @param targetVolume 0 to 100
   */
  public start(type: string, targetVolume: number) {
    const context = this.getContext()
    if (!context) return

    // Stop if already playing
    this.stop(type)

    const gainNode = context.createGain()
    const vol = Math.max(0, Math.min(1, targetVolume / 100))
    gainNode.gain.setValueAtTime(0, context.currentTime)
    gainNode.gain.linearRampToValueAtTime(vol, context.currentTime + 1.5) // Smooth fade in
    gainNode.connect(context.destination)

    const sources: any[] = []
    const intervals: any[] = []

    if (type.includes("rain") || type === "Rain Sounds") {
      this.setupRain(context, gainNode, sources, intervals)
    } else if (type.includes("ocean") || type === "Ocean Waves") {
      this.setupOcean(context, gainNode, sources)
    } else if (type.includes("fireplace") || type === "Fireplace Sounds") {
      this.setupFireplace(context, gainNode, sources, intervals)
    } else if (type.includes("forest") || type === "Forest Sounds") {
      this.setupForest(context, gainNode, sources, intervals)
    } else if (type.includes("zen") || type.includes("meditation") || type === "Zen Temple Ambient") {
      this.setupMeditation(context, gainNode, sources, intervals)
    } else {
      // Default fallback: Brown noise
      this.setupBrownNoise(context, gainNode, sources)
    }

    this.activeSounds[type] = {
      gainNode,
      sources,
      intervals,
      volume: targetVolume
    }
  }

  /**
   * Stops a specific soundscape
   */
  public stop(type: string) {
    const active = this.activeSounds[type]
    if (!active) return

    const context = this.getContext()
    if (context) {
      try {
        // Smooth fade out
        active.gainNode.gain.setValueAtTime(active.gainNode.gain.value, context.currentTime)
        active.gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.0)
      } catch (e) {}
    }

    // Stop all source nodes after fade out
    setTimeout(() => {
      active.sources.forEach(src => {
        try {
          src.stop()
        } catch (e) {
          // Source may not support stop()
        }
        try {
          src.disconnect()
        } catch (e) {}
      })

      active.intervals.forEach(timer => {
        clearInterval(timer)
      })
    }, 1100)

    delete this.activeSounds[type]
  }

  /**
   * Adjusts volume of a running soundscape
   * @param type sound name
   * @param targetVolume 0 to 100
   */
  public setVolume(type: string, targetVolume: number) {
    const active = this.activeSounds[type]
    if (!active) return

    active.volume = targetVolume
    const context = this.getContext()
    if (context) {
      const vol = Math.max(0, Math.min(1, targetVolume / 100))
      active.gainNode.gain.setValueAtTime(active.gainNode.gain.value, context.currentTime)
      active.gainNode.gain.linearRampToValueAtTime(vol, context.currentTime + 0.3)
    }
  }

  /**
   * Stops all active soundscapes
   */
  public stopAll() {
    Object.keys(this.activeSounds).forEach(type => {
      this.stop(type)
    })
  }

  // --- SYNTHESIS SETUP METHODS ---

  private setupBrownNoise(ctx: AudioContext, dest: AudioNode, sources: any[]) {
    const buffer = this.createNoiseBuffer("brown")
    if (!buffer) return

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = buffer
    noiseSource.loop = true

    noiseSource.connect(dest)
    noiseSource.start()
    sources.push(noiseSource)
  }

  private setupRain(ctx: AudioContext, dest: AudioNode, sources: any[], intervals: any[]) {
    // 1. Constant Rain Patter (Pink Noise + Lowpass + Highpass filters)
    const pinkBuffer = this.createNoiseBuffer("pink")
    if (!pinkBuffer) return

    const rainSource = ctx.createBufferSource()
    rainSource.buffer = pinkBuffer
    rainSource.loop = true

    const bandpass = ctx.createBiquadFilter()
    bandpass.type = "bandpass"
    bandpass.frequency.value = 1000
    bandpass.Q.value = 1.0

    const lowpass = ctx.createBiquadFilter()
    lowpass.type = "lowpass"
    lowpass.frequency.value = 1500

    rainSource.connect(bandpass)
    bandpass.connect(lowpass)
    lowpass.connect(dest)

    rainSource.start()
    sources.push(rainSource)

    // 2. Random individual raindrop chimes
    const dropTimer = setInterval(() => {
      if (Math.random() > 0.5) return // 50% chance each interval

      const time = ctx.currentTime
      const osc = ctx.createOscillator()
      const dropGain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(1000 + Math.random() * 800, time)
      
      // Fast pitch drop to simulate splat
      osc.frequency.exponentialRampToValueAtTime(400, time + 0.08)

      dropGain.gain.setValueAtTime(0, time)
      dropGain.gain.linearRampToValueAtTime(0.04 * Math.random(), time + 0.005)
      dropGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08)

      osc.connect(dropGain)
      dropGain.connect(dest)

      osc.start(time)
      osc.stop(time + 0.1)

      // Keep references to clean up if stopped
      sources.push(osc)
    }, 200)

    intervals.push(dropTimer)
  }

  private setupOcean(ctx: AudioContext, dest: AudioNode, sources: any[]) {
    // Pink noise source
    const pinkBuffer = this.createNoiseBuffer("pink")
    if (!pinkBuffer) return

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = pinkBuffer
    noiseSource.loop = true

    // Lowpass filter whose frequency we will modulate
    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.setValueAtTime(300, ctx.currentTime)
    filter.Q.value = 1.0

    // Modulating LFO (Sine wave oscillating at 0.08 Hz = ~12.5 seconds per wave)
    const lfo = ctx.createOscillator()
    lfo.type = "sine"
    lfo.frequency.value = 0.08

    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 180 // Modulate cutoff frequency by +- 180Hz

    // Connect LFO modulation to filter frequency parameter
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    // Route audio path
    noiseSource.connect(filter)
    filter.connect(dest)

    lfo.start()
    noiseSource.start()

    sources.push(noiseSource)
    sources.push(lfo)
  }

  private setupFireplace(ctx: AudioContext, dest: AudioNode, sources: any[], intervals: any[]) {
    // 1. Deep rumble (Lowpass filtered brown noise)
    const brownBuffer = this.createNoiseBuffer("brown")
    if (!brownBuffer) return

    const rumbleSource = ctx.createBufferSource()
    rumbleSource.buffer = brownBuffer
    rumbleSource.loop = true

    const lp = ctx.createBiquadFilter()
    lp.type = "lowpass"
    lp.frequency.value = 150

    rumbleSource.connect(lp)
    lp.connect(dest)

    rumbleSource.start()
    sources.push(rumbleSource)

    // 2. High frequency crackling snaps
    const crackleTimer = setInterval(() => {
      if (Math.random() > 0.35) return // 35% chance of crackle

      const time = ctx.currentTime
      const osc = ctx.createOscillator()
      const crackleGain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      filter.type = "bandpass"
      filter.frequency.setValueAtTime(2000 + Math.random() * 1500, time)
      filter.Q.setValueAtTime(6, time)

      osc.type = "sawtooth"
      osc.frequency.setValueAtTime(100 + Math.random() * 100, time)

      crackleGain.gain.setValueAtTime(0, time)
      crackleGain.gain.linearRampToValueAtTime(0.25 * Math.random(), time + 0.002)
      crackleGain.gain.exponentialRampToValueAtTime(0.001, time + 0.01 + Math.random() * 0.02)

      osc.connect(filter)
      filter.connect(crackleGain)
      crackleGain.connect(dest)

      osc.start(time)
      osc.stop(time + 0.06)

      sources.push(osc)
    }, 120)

    intervals.push(crackleTimer)
  }

  private setupForest(ctx: AudioContext, dest: AudioNode, sources: any[], intervals: any[]) {
    // 1. Rustling breeze (Bandpass filtered pink noise modulated by LFO)
    const pinkBuffer = this.createNoiseBuffer("pink")
    if (!pinkBuffer) return

    const breezeSource = ctx.createBufferSource()
    breezeSource.buffer = pinkBuffer
    breezeSource.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.setValueAtTime(800, ctx.currentTime)
    filter.Q.value = 2.0

    const lfo = ctx.createOscillator()
    lfo.type = "sine"
    lfo.frequency.value = 0.04 // Very slow oscillation (25s cycle)

    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 250 // Modulate by +- 250Hz

    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    breezeSource.connect(filter)
    filter.connect(dest)

    lfo.start()
    breezeSource.start()

    sources.push(breezeSource)
    sources.push(lfo)

    // 2. Synthesized bird chirps
    const birdTimer = setInterval(() => {
      if (Math.random() > 0.4) return // 40% chance of chirp

      const time = ctx.currentTime
      const baseChirpCount = Math.floor(Math.random() * 3) + 1 // 1-3 chirps in a row

      for (let j = 0; j < baseChirpCount; j++) {
        const offset = j * 0.2
        const osc = ctx.createOscillator()
        const birdGain = ctx.createGain()

        osc.type = "sine"
        const startFreq = 2900 + Math.random() * 600
        osc.frequency.setValueAtTime(startFreq, time + offset)
        osc.frequency.exponentialRampToValueAtTime(startFreq + 1000, time + offset + 0.09)

        birdGain.gain.setValueAtTime(0, time + offset)
        birdGain.gain.linearRampToValueAtTime(0.08 * Math.random(), time + offset + 0.01)
        birdGain.gain.exponentialRampToValueAtTime(0.001, time + offset + 0.12)

        osc.connect(birdGain)
        birdGain.connect(dest)

        osc.start(time + offset)
        osc.stop(time + offset + 0.15)

        sources.push(osc)
      }
    }, 4000)

    intervals.push(birdTimer)
  }

  private setupMeditation(ctx: AudioContext, dest: AudioNode, sources: any[], intervals: any[]) {
    // Create a rich, soothing, resonant harmonic chord drone
    // Notes: A2 (110Hz), E3 (164.81Hz), A3 (220Hz), C#4 (277.18Hz - Major Third)
    const baseFreqs = [110, 164.81, 220, 277.18]
    const filters: BiquadFilterNode[] = []

    baseFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const oscGain = ctx.createGain()

      osc.type = "sine"
      // Slight detune for chorus thickness
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), ctx.currentTime)

      // Swelling volume LFO for each node
      const volLfo = ctx.createOscillator()
      volLfo.type = "sine"
      volLfo.frequency.value = 0.05 + idx * 0.015 // Distinct rate per note

      const volLfoGain = ctx.createGain()
      volLfoGain.gain.value = 0.06 // Modulate gain by +- 0.06

      // Base volume of each voice
      oscGain.gain.setValueAtTime(0.08, ctx.currentTime)

      volLfo.connect(volLfoGain)
      volLfoGain.connect(oscGain.gain)

      const lowpass = ctx.createBiquadFilter()
      lowpass.type = "lowpass"
      lowpass.frequency.setValueAtTime(350, ctx.currentTime)

      osc.connect(lowpass)
      lowpass.connect(oscGain)
      oscGain.connect(dest)

      osc.start()
      volLfo.start()

      sources.push(osc)
      sources.push(volLfo)
    })
  }
}

// Global singleton instance for app-wide use
export const ambientGenerator = new AmbientSoundscapeGenerator()
