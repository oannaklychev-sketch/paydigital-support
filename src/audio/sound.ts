// Звук сайта целиком синтезируется в браузере (Web Audio): ни одного аудиофайла,
// поэтому страница не тяжелеет. Музыка — спокойный эмбиент «на связи»: мягкие аккорды,
// арпеджио с эхом и тихий бас. Эффекты — «дзынь» уведомления, «свуш» переезда, щелчок кнопки.

const BPM = 80
const EIGHTH = 60 / BPM / 2
const BAR = EIGHTH * 8

// Am9 → Fmaj7 → Cmaj7 → G6, по два такта на аккорд.
const CHORDS = [
  { root: 45, pad: [57, 60, 64, 67, 71], arp: [69, 72, 76, 79] },
  { root: 41, pad: [53, 57, 60, 64], arp: [65, 69, 72, 76] },
  { root: 48, pad: [55, 59, 60, 64], arp: [67, 71, 72, 76] },
  { root: 43, pad: [55, 59, 62, 69], arp: [67, 71, 74, 79] },
]
// Индексы нот арпеджио на восемь восьмых такта (null — пауза), чтобы звучало воздушно.
const ARP = [0, null, 2, 1, null, 3, 2, null]

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

type Listener = (on: boolean) => void

class Sound {
  private ctx: AudioContext | null = null
  private master!: GainNode
  private music!: GainNode
  private sfx!: GainNode
  private reverb!: ConvolverNode
  private delay!: DelayNode
  private noise!: AudioBuffer
  private timer = 0
  private step = 0
  private nextTime = 0
  private listeners = new Set<Listener>()
  on = false

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private emit() {
    for (const fn of this.listeners) fn(this.on)
  }

  private setup() {
    const ctx = new AudioContext()
    this.ctx = ctx

    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 3
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(comp).connect(ctx.destination)

    this.music = ctx.createGain()
    this.music.gain.value = 0.7
    this.music.connect(this.master)
    this.sfx = ctx.createGain()
    this.sfx.gain.value = 0.9
    this.sfx.connect(this.master)

    // Реверберация из сгенерированного затухающего шума — без файлов.
    const len = Math.round(ctx.sampleRate * 2.6)
    const ir = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6
    }
    this.reverb = ctx.createConvolver()
    this.reverb.buffer = ir
    const wet = ctx.createGain()
    wet.gain.value = 0.35
    this.reverb.connect(wet).connect(this.master)

    // Эхо для арпеджио (пунктирная восьмая) с затемнением повторов.
    this.delay = ctx.createDelay(2)
    this.delay.delayTime.value = EIGHTH * 1.5
    const fb = ctx.createGain()
    fb.gain.value = 0.32
    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 2400
    this.delay.connect(tone).connect(fb).connect(this.delay)
    tone.connect(this.music)

    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const n = this.noise.getChannelData(0)
    for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1

    document.addEventListener('visibilitychange', () => {
      if (!this.ctx || !this.on) return
      if (document.hidden) void this.ctx.suspend()
      else void this.ctx.resume()
    })
  }

  async enable() {
    if (!this.ctx) this.setup()
    const ctx = this.ctx!
    await ctx.resume()
    this.on = true
    this.master.gain.cancelScheduledValues(ctx.currentTime)
    this.master.gain.setTargetAtTime(0.75, ctx.currentTime, 0.6)
    this.nextTime = ctx.currentTime + 0.1
    window.clearInterval(this.timer)
    this.timer = window.setInterval(() => this.schedule(), 25)
    this.emit()
    this.blip([72, 79], 0.05)
  }

  disable() {
    if (!this.ctx) return
    const ctx = this.ctx
    this.on = false
    this.master.gain.cancelScheduledValues(ctx.currentTime)
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.25)
    window.clearInterval(this.timer)
    window.setTimeout(() => !this.on && void ctx.suspend(), 1200)
    this.emit()
  }

  toggle() {
    if (this.on) this.disable()
    else void this.enable()
  }

  // Планировщик с запасом вперёд: ноты ставятся точно по часам AudioContext.
  private schedule() {
    const ctx = this.ctx!
    while (this.nextTime < ctx.currentTime + 0.25) {
      this.playStep(this.step, this.nextTime)
      this.nextTime += EIGHTH
      this.step = (this.step + 1) % (CHORDS.length * 16)
    }
  }

  private playStep(step: number, t: number) {
    const chord = CHORDS[Math.floor(step / 16)]
    const inBar = step % 8
    if (step % 16 === 0) this.pad(chord.pad, t, BAR * 2)
    if (inBar === 0 || inBar === 4) this.bass(chord.root, t)
    const a = ARP[inBar]
    if (a !== null) this.pluck(chord.arp[a], t)
    if (inBar % 2 === 1) this.hat(t)
  }

  private pad(notes: number[], t: number, dur: number) {
    const ctx = this.ctx!
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(700, t)
    filter.frequency.linearRampToValueAtTime(1300, t + dur * 0.5)
    filter.frequency.linearRampToValueAtTime(800, t + dur)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(0.05, t + 1.4)
    env.gain.setValueAtTime(0.05, t + dur - 0.2)
    env.gain.linearRampToValueAtTime(0, t + dur + 1.6)
    filter.connect(env)
    env.connect(this.music)
    env.connect(this.reverb)
    for (const n of notes)
      for (const detune of [-7, 7]) {
        const o = ctx.createOscillator()
        o.type = 'sawtooth'
        o.frequency.value = hz(n)
        o.detune.value = detune
        o.connect(filter)
        o.start(t)
        o.stop(t + dur + 1.7)
      }
  }

  private pluck(note: number, t: number) {
    const ctx = this.ctx!
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.value = hz(note)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(0.06, t + 0.006)
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.45)
    o.connect(env)
    env.connect(this.music)
    env.connect(this.delay)
    o.start(t)
    o.stop(t + 0.5)
  }

  private bass(note: number, t: number) {
    const ctx = this.ctx!
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = hz(note - 12)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(0.16, t + 0.03)
    env.gain.exponentialRampToValueAtTime(0.0001, t + EIGHTH * 3.5)
    o.connect(env).connect(this.music)
    o.start(t)
    o.stop(t + EIGHTH * 4)
  }

  private hat(t: number) {
    const ctx = this.ctx!
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 7500
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.018, t)
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    src.connect(hp).connect(env).connect(this.music)
    src.start(t, Math.random() * 0.5, 0.06)
  }

  private blip(notes: number[], gap: number, level = 0.07) {
    if (!this.ctx || !this.on) return
    const ctx = this.ctx
    notes.forEach((n, i) => {
      const t = ctx.currentTime + i * gap
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = hz(n)
      const env = ctx.createGain()
      env.gain.setValueAtTime(0, t)
      env.gain.linearRampToValueAtTime(level, t + 0.005)
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
      o.connect(env)
      env.connect(this.sfx)
      env.connect(this.reverb)
      o.start(t)
      o.stop(t + 1)
    })
  }

  // Появился сотрудник — мягкий «дзынь», как уведомление о новом сообщении.
  chime() {
    this.blip([88, 95], 0.09, 0.08)
  }

  // Камера переезжает к следующей стойке — «свуш» из отфильтрованного шума.
  whoosh() {
    if (!this.ctx || !this.on) return
    const ctx = this.ctx
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
    src.connect(bp).connect(env).connect(this.sfx)
    src.start(t, 0, 0.95)
  }

  // Наведение на кнопку — тихий короткий щелчок.
  tick() {
    if (!this.ctx || !this.on) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(1800, t)
    o.frequency.exponentialRampToValueAtTime(1200, t + 0.03)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.03, t)
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    o.connect(env).connect(this.sfx)
    o.start(t)
    o.stop(t + 0.06)
  }
}

export const sound = new Sound()
