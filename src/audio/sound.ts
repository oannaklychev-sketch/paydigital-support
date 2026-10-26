const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

class Sound {
  private ctx: AudioContext | null = null
  private out!: GainNode
  private reverb!: ConvolverNode
  private noise!: AudioBuffer

  constructor() {
    if (typeof window === 'undefined') return
    const unlock = () => {
      this.ensure()
      void this.ctx?.resume()
    }
    for (const type of ['pointerdown', 'keydown', 'touchend'])
      window.addEventListener(type, unlock, { passive: true, capture: true })
  }

  private ensure() {
    if (this.ctx) return
    const ctx = new AudioContext()
    this.ctx = ctx

    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 3
    this.out = ctx.createGain()
    this.out.gain.value = 0.9
    this.out.connect(comp).connect(ctx.destination)

    const len = Math.round(ctx.sampleRate * 1.8)
    const ir = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3
    }
    this.reverb = ctx.createConvolver()
    this.reverb.buffer = ir
    const wet = ctx.createGain()
    wet.gain.value = 0.3
    this.reverb.connect(wet).connect(this.out)

    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const n = this.noise.getChannelData(0)
    for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1
  }

  private get ready() {
    return this.ctx?.state === 'running'
  }

  private notes(midi: number[], gap: number, level: number) {
    if (!this.ready) return
    const ctx = this.ctx!
    midi.forEach((m, i) => {
      const t = ctx.currentTime + i * gap
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = hz(m)
      const env = ctx.createGain()
      env.gain.setValueAtTime(0, t)
      env.gain.linearRampToValueAtTime(level, t + 0.005)
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
      o.connect(env)
      env.connect(this.out)
      env.connect(this.reverb)
      o.start(t)
      o.stop(t + 1)
    })
  }

  chime() {
    this.notes([88, 95], 0.09, 0.08)
  }

  chimeBack() {
    this.notes([95, 88], 0.09, 0.055)
  }

  whoosh() {
    if (!this.ready) return
    const ctx = this.ctx!
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 1.4
    bp.frequency.setValueAtTime(350, t)
    bp.frequency.exponentialRampToValueAtTime(2200, t + 0.45)
    bp.frequency.exponentialRampToValueAtTime(500, t + 0.9)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(0.09, t + 0.35)
    env.gain.linearRampToValueAtTime(0, t + 0.9)
    src.connect(bp).connect(env).connect(this.out)
    src.start(t, 0, 0.95)
  }

  tick() {
    if (!this.ready) return
    const ctx = this.ctx!
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(1800, t)
    o.frequency.exponentialRampToValueAtTime(1200, t + 0.03)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.03, t)
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    o.connect(env).connect(this.out)
    o.start(t)
    o.stop(t + 0.06)
  }
}

export const sound = new Sound()
