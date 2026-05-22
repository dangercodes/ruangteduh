<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto"
    >
      <!-- Premium Soothing Modal Frame -->
      <div
        class="animate-scale-in relative w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-float overflow-hidden text-white flex flex-col max-h-[90vh] sm:max-h-[85vh]"
      >
        <!-- Modal Glowing Atmosphere Orbs -->
        <div class="absolute -right-24 -top-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div class="absolute -left-24 -bottom-24 w-48 h-48 bg-calm-500/10 rounded-full blur-3xl pointer-events-none" />

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 relative z-10">
          <div class="space-y-0.5">
            <h3 class="text-lg font-extrabold text-white flex items-center gap-2">
              <span>🧘‍♂️</span> {{ $t('calming.title') }}
            </h3>
            <p class="text-[11px] text-slate-300/80 font-medium">
              {{ $t('calming.subtitle') }}
            </p>
          </div>
          <button
            @click="handleClose"
            class="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-inner"
          >
            ✕
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-white/5 px-6 relative z-10 bg-white/2">
          <button
            @click="activeTab = 'breathing'"
            class="px-5 py-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'breathing' ? 'border-primary-400 text-primary-300' : 'border-transparent text-slate-400 hover:text-white'"
          >
            <span>🫁</span> {{ $t('calming.tabs.breathing') }}
          </button>
          <button
            @click="activeTab = 'sounds'"
            class="px-5 py-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'sounds' ? 'border-primary-400 text-primary-300' : 'border-transparent text-slate-400 hover:text-white'"
          >
            <span>🎧</span> {{ $t('calming.sounds.title') }}
          </button>
        </div>

        <!-- Scrollable Modal Body Content -->
        <div class="flex-1 overflow-y-auto p-6 relative z-10">
          
          <!-- Tab 1: Breathing Exercise -->
          <div v-show="activeTab === 'breathing'" class="flex flex-col items-center justify-center space-y-8 py-6">
            <!-- Breathing Visualizer Ball -->
            <div class="relative w-64 h-64 flex items-center justify-center">
              
              <!-- External Ring Countdown Timer -->
              <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                <!-- Static background ring -->
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.05)"
                  stroke-width="4"
                />
                <!-- Dynamic active ring -->
                <circle
                  v-if="breathingState !== 'idle'"
                  cx="128"
                  cy="128"
                  r="112"
                  fill="transparent"
                  :stroke="stateColors[breathingState]"
                  stroke-width="5"
                  :stroke-dasharray="strokeDashArray"
                  :stroke-dashoffset="strokeDashOffset"
                  class="transition-all duration-1000 ease-linear"
                />
              </svg>

              <!-- Central glowing expanding circle -->
              <div
                class="w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all ease-calm text-center select-none"
                :style="{
                  transform: `scale(${circleScale})`,
                  backgroundColor: stateBgColors[breathingState],
                  boxShadow: `0 0 50px ${stateGlowColors[breathingState]}`,
                  transitionDuration: breathingState === 'inhale' || breathingState === 'exhale' ? '4000ms' : '500ms'
                }"
              >
                <!-- Seconds text overlay -->
                <span 
                  v-if="breathingState !== 'idle'" 
                  class="text-3xl font-black font-sans leading-none drop-shadow-md text-white"
                >
                  {{ secondsRemaining }}
                </span>
              </div>
            </div>

            <!-- Dynamic State Text -->
            <div class="text-center space-y-2 h-14">
              <h4 
                class="text-lg font-black tracking-wide transition-all duration-300"
                :style="{ color: stateTextColors[breathingState] }"
              >
                {{ getBreathingStateLabel() }}
              </h4>
              <p class="text-xs text-slate-400 font-medium">
                {{ getBreathingInstructions() }}
              </p>
            </div>

            <!-- Breathing Playback Control -->
            <div class="flex justify-center">
              <SoftButton
                :variant="breathingState === 'idle' ? 'primary' : 'outline'"
                size="md"
                class="shadow-glow-primary border-white/10 text-white font-extrabold cursor-pointer"
                @click="toggleBreathing"
              >
                <span class="mr-1.5">{{ breathingState === 'idle' ? '▶️' : '⏸️' }}</span>
                <span>{{ breathingState === 'idle' ? $t('calming.breathing.start') : $t('calming.breathing.pause') }}</span>
              </SoftButton>
            </div>
          </div>

          <!-- Tab 2: Calming Sounds -->
          <div v-show="activeTab === 'sounds'" class="space-y-6">
            <div class="space-y-1.5">
              <h4 class="text-sm font-extrabold text-slate-200">
                {{ $t('calming.sounds.title') }}
              </h4>
              <p class="text-xs text-slate-400 leading-relaxed font-medium">
                {{ $t('calming.sounds.description') }}
              </p>
            </div>

            <div class="space-y-4 pt-2">
              <!-- Sound Channel 1: Rain -->
              <div class="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-white/8">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-lg border border-blue-500/20">
                    🌧️
                  </div>
                  <div>
                    <h5 class="text-xs font-bold text-white">{{ $t('calming.sounds.rain') }}</h5>
                    <p class="text-[10px] text-slate-400">Synthesized Organic Rainfall</p>
                  </div>
                </div>

                <div class="flex items-center gap-4 flex-1 md:max-w-xs justify-end">
                  <div class="flex items-center gap-2 flex-1">
                    <span class="text-[10px] text-slate-400">🔈</span>
                    <input
                      v-model.number="volumes.rain"
                      type="range"
                      min="0"
                      max="100"
                      class="flex-1 accent-primary-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                      @input="updateVolume('rain')"
                    />
                    <span class="text-[10px] text-slate-400">🔊</span>
                  </div>
                  <button
                    @click="toggleSound('rain')"
                    class="px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all uppercase tracking-wider"
                    :class="activeSounds.rain ? 'bg-primary-500 text-white shadow-glow-primary' : 'bg-white/10 text-slate-400 hover:text-white'"
                  >
                    {{ activeSounds.rain ? 'Active' : 'Muted' }}
                  </button>
                </div>
              </div>

              <!-- Sound Channel 2: Forest & Wind Ambient -->
              <div class="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-white/8">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg border border-emerald-500/20">
                    🌲
                  </div>
                  <div>
                    <h5 class="text-xs font-bold text-white">{{ $t('calming.sounds.ambient') }}</h5>
                    <p class="text-[10px] text-slate-400">Harmonized Warm Forest Drone</p>
                  </div>
                </div>

                <div class="flex items-center gap-4 flex-1 md:max-w-xs justify-end">
                  <div class="flex items-center gap-2 flex-1">
                    <span class="text-[10px] text-slate-400">🔈</span>
                    <input
                      v-model.number="volumes.ambient"
                      type="range"
                      min="0"
                      max="100"
                      class="flex-1 accent-primary-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                      @input="updateVolume('ambient')"
                    />
                    <span class="text-[10px] text-slate-400">🔊</span>
                  </div>
                  <button
                    @click="toggleSound('ambient')"
                    class="px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all uppercase tracking-wider"
                    :class="activeSounds.ambient ? 'bg-primary-500 text-white shadow-glow-primary' : 'bg-white/10 text-slate-400 hover:text-white'"
                  >
                    {{ activeSounds.ambient ? 'Active' : 'Muted' }}
                  </button>
                </div>
              </div>

              <!-- Sound Channel 3: Generative Calm Melody -->
              <div class="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-white/8">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-lg border border-purple-500/20">
                    🎹
                  </div>
                  <div>
                    <h5 class="text-xs font-bold text-white">{{ $t('calming.sounds.piano') }}</h5>
                    <p class="text-[10px] text-slate-400">Generative Pentatonic Chimes</p>
                  </div>
                </div>

                <div class="flex items-center gap-4 flex-1 md:max-w-xs justify-end">
                  <div class="flex items-center gap-2 flex-1">
                    <span class="text-[10px] text-slate-400">🔈</span>
                    <input
                      v-model.number="volumes.piano"
                      type="range"
                      min="0"
                      max="100"
                      class="flex-1 accent-primary-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                      @input="updateVolume('piano')"
                    />
                    <span class="text-[10px] text-slate-400">🔊</span>
                  </div>
                  <button
                    @click="toggleSound('piano')"
                    class="px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all uppercase tracking-wider"
                    :class="activeSounds.piano ? 'bg-primary-500 text-white shadow-glow-primary' : 'bg-white/10 text-slate-400 hover:text-white'"
                  >
                    {{ activeSounds.piano ? 'Active' : 'Muted' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Global Action Panel -->
            <div class="flex justify-end pt-4 border-t border-white/5">
              <button
                v-if="isAnySoundPlaying"
                @click="stopAllAudio"
                class="px-4 py-2 border border-danger/30 hover:bg-danger/10 text-danger hover:text-red-300 font-extrabold rounded-2xl text-xs cursor-pointer transition-all duration-300 flex items-center gap-1.5"
              >
                🛑 {{ $t('calming.sounds.stopAll') }}
              </button>
            </div>
          </div>

        </div>

        <!-- Footer / Closing Tip -->
        <div class="px-6 py-4 border-t border-white/10 bg-white/2 text-center text-[10px] text-slate-400 font-medium relative z-10 flex items-center justify-center gap-1">
          <span>🍃</span>
          <span>{{ locale === 'id' ? 'Tenang, kamu aman di sini. Semuanya akan baik-baik saja.' : 'Relax, you are safe here. Everything will be okay.' }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import SoftButton from '~/components/ui/SoftButton.vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { locale, t } = useI18n()

const activeTab = ref<'breathing' | 'sounds'>('breathing')

// --- guided breathing state ---
type BreathingState = 'idle' | 'inhale' | 'hold_in' | 'exhale' | 'hold_out'

const breathingState = ref<BreathingState>('idle')
const secondsRemaining = ref(0)
const circleScale = ref(1.0)
let breathingInterval: NodeJS.Timeout | null = null

// Box breathing constant timing durations (4s each)
const PHASE_DURATION = 4
const totalCircumference = 2 * Math.PI * 112 // Radius is 112

const strokeDashArray = computed(() => `${totalCircumference} ${totalCircumference}`)
const strokeDashOffset = computed(() => {
  if (breathingState.value === 'idle') return totalCircumference
  const progress = (PHASE_DURATION - secondsRemaining.value) / PHASE_DURATION
  return totalCircumference * progress
})

const stateColors: Record<BreathingState, string> = {
  idle: 'rgba(255,255,255,0.1)',
  inhale: '#10b981',   // Emerald
  hold_in: '#06b6d4',  // Cyan
  exhale: '#8b5cf6',   // Purple/Lavender
  hold_out: '#64748b'  // Slate
}

const stateBgColors: Record<BreathingState, string> = {
  idle: 'rgba(255, 255, 255, 0.05)',
  inhale: 'rgba(16, 185, 129, 0.25)',
  hold_in: 'rgba(6, 182, 212, 0.25)',
  exhale: 'rgba(139, 92, 246, 0.25)',
  hold_out: 'rgba(100, 116, 139, 0.25)'
}

const stateGlowColors: Record<BreathingState, string> = {
  idle: 'rgba(255, 255, 255, 0.05)',
  inhale: 'rgba(16, 185, 129, 0.65)',
  hold_in: 'rgba(6, 182, 212, 0.65)',
  exhale: 'rgba(139, 92, 246, 0.65)',
  hold_out: 'rgba(100, 116, 139, 0.35)'
}

const stateTextColors: Record<BreathingState, string> = {
  idle: '#94a3b8',
  inhale: '#34d399',
  hold_in: '#22d3ee',
  exhale: '#a78bfa',
  hold_out: '#94a3b8'
}

const getBreathingStateLabel = () => {
  switch (breathingState.value) {
    case 'inhale': return t('calming.breathing.inhale')
    case 'hold_in': return t('calming.breathing.hold')
    case 'exhale': return t('calming.breathing.exhale')
    case 'hold_out': return t('calming.breathing.hold')
    default: return t('calming.breathing.ready')
  }
}

const getBreathingInstructions = () => {
  const isId = locale.value === 'id'
  switch (breathingState.value) {
    case 'inhale': return isId ? 'Tarik napas secara perlahan dan rasakan energi positif masuk.' : 'Inhale slowly and feel positive energy entering.'
    case 'hold_in': return isId ? 'Tahan napas, biarkan tubuhmu menyerap ketenangan ini.' : 'Hold your breath, let your body absorb this calm.'
    case 'exhale': return isId ? 'Hembuskan beban, lepaskan seluruh pikiran negatif keluar.' : 'Exhale tension, let all negative thoughts go.'
    case 'hold_out': return isId ? 'Tahan sejenak sebelum bersiap memulai siklus baru.' : 'Hold for a moment before preparing to start a new cycle.'
    default: return isId ? 'Klik tombol di bawah untuk memulai sesi box breathing 4-4-4-4.' : 'Click the button below to start box breathing 4-4-4-4.'
  }
}

const toggleBreathing = () => {
  if (breathingState.value === 'idle') {
    startBreathing()
  } else {
    stopBreathing()
  }
}

const startBreathing = () => {
  breathingState.value = 'inhale'
  secondsRemaining.value = PHASE_DURATION
  circleScale.value = 1.8 // Expand!
  
  breathingInterval = setInterval(() => {
    secondsRemaining.value--
    if (secondsRemaining.value <= 0) {
      advanceBreathingState()
    }
  }, 1000)
}

const advanceBreathingState = () => {
  secondsRemaining.value = PHASE_DURATION
  
  if (breathingState.value === 'inhale') {
    breathingState.value = 'hold_in'
    circleScale.value = 1.8 // Keep expanded
  } else if (breathingState.value === 'hold_in') {
    breathingState.value = 'exhale'
    circleScale.value = 1.0 // Shrink!
  } else if (breathingState.value === 'exhale') {
    breathingState.value = 'hold_out'
    circleScale.value = 1.0 // Keep shrunk
  } else if (breathingState.value === 'hold_out') {
    breathingState.value = 'inhale'
    circleScale.value = 1.8 // Expand again!
  }
}

const stopBreathing = () => {
  if (breathingInterval) {
    clearInterval(breathingInterval)
    breathingInterval = null
  }
  breathingState.value = 'idle'
  secondsRemaining.value = 0
  circleScale.value = 1.0
}


// --- WEB AUDIO API SOOTHING SYNTHESIZERS ---
const activeSounds = ref({
  rain: false,
  ambient: false,
  piano: false
})

const volumes = ref({
  rain: 45,
  ambient: 35,
  piano: 30
})

let audioContext: AudioContext | null = null
const synthNodes: Record<string, any> = {}
let pianoTimer: any = null

const isAnySoundPlaying = computed(() => {
  return activeSounds.value.rain || activeSounds.value.ambient || activeSounds.value.piano
})

// Initialize standard AudioContext securely
const initAudioContext = () => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    audioContext = new AudioContextClass()
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume()
  }
}

// Update volumes reactively for each node
const updateVolume = (type: 'rain' | 'ambient' | 'piano') => {
  const gainNode = synthNodes[`${type}Gain`]
  if (gainNode && audioContext) {
    const targetGain = volumes.value[type] / 100
    gainNode.gain.setValueAtTime(targetGain, audioContext.currentTime)
  }
}

const toggleSound = (type: 'rain' | 'ambient' | 'piano') => {
  initAudioContext()
  
  if (activeSounds.value[type]) {
    muteChannel(type)
  } else {
    unmuteChannel(type)
  }
}

const unmuteChannel = (type: 'rain' | 'ambient' | 'piano') => {
  if (!audioContext) return
  
  activeSounds.value[type] = true
  
  // If the synth hasn't been instantiated yet, start it!
  if (!synthNodes[`${type}Gain`]) {
    createChannelSynth(type)
  } else {
    // Just unmute
    const channelGain = synthNodes[`${type}Gain`]
    if (channelGain) {
      channelGain.gain.setValueAtTime(volumes.value[type] / 100, audioContext.currentTime)
    }
  }
}

const muteChannel = (type: 'rain' | 'ambient' | 'piano') => {
  activeSounds.value[type] = false
  const channelGain = synthNodes[`${type}Gain`]
  if (channelGain && audioContext) {
    channelGain.gain.setValueAtTime(0, audioContext.currentTime)
  }
}

const createChannelSynth = (type: 'rain' | 'ambient' | 'piano') => {
  if (!audioContext) return

  // 1. Create a gain node for this specific channel
  const channelGain = audioContext.createGain()
  channelGain.gain.setValueAtTime(volumes.value[type] / 100, audioContext.currentTime)
  channelGain.connect(audioContext.destination)
  synthNodes[`${type}Gain`] = channelGain

  if (type === 'rain') {
    // Generate synthetic rain using white noise buffer
    const bufferSize = audioContext.sampleRate * 2 // 2 seconds of looping noise
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const noiseSource = audioContext.createBufferSource()
    noiseSource.buffer = noiseBuffer
    noiseSource.loop = true

    // Filter to shape white noise into soft rainfall
    const rainFilter = audioContext.createBiquadFilter()
    rainFilter.type = 'lowpass'
    rainFilter.frequency.setValueAtTime(650, audioContext.currentTime)
    rainFilter.Q.setValueAtTime(1.0, audioContext.currentTime)

    // slow LFO to modulate filter frequency (creates shifting wind gusts)
    const lfo = audioContext.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(0.06, audioContext.currentTime) // 0.06 Hz
    
    const lfoGain = audioContext.createGain()
    lfoGain.gain.setValueAtTime(200, audioContext.currentTime) // swing by +/- 200 Hz
    
    lfo.connect(lfoGain)
    lfoGain.connect(rainFilter.frequency)
    lfo.start()

    noiseSource.connect(rainFilter)
    rainFilter.connect(channelGain)
    noiseSource.start()

    synthNodes.rainSource = noiseSource
    synthNodes.rainLfo = lfo
  } 
  else if (type === 'ambient') {
    // Soothing Forest Drone Synth
    // We detune 3 warm oscillators (Triangle & Sine waves in A Major / Minor)
    const freqs = [110, 165, 220] // A2, E3, A3
    const oscs: OscillatorNode[] = []
    const gains: GainNode[] = []

    freqs.forEach((freq, idx) => {
      const osc = audioContext!.createOscillator()
      osc.type = idx === 1 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, audioContext!.currentTime)

      const individualGain = audioContext!.createGain()
      individualGain.gain.setValueAtTime(0.2, audioContext!.currentTime)

      // Modulate individual volumes to make them shimmer/evolve organically
      const lfo = audioContext!.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.setValueAtTime(0.04 + idx * 0.02, audioContext!.currentTime)

      const lfoGain = audioContext!.createGain()
      lfoGain.gain.setValueAtTime(0.12, audioContext!.currentTime)

      lfo.connect(lfoGain)
      lfoGain.connect(individualGain.gain)
      lfo.start()

      osc.connect(individualGain)
      individualGain.connect(channelGain)
      osc.start()

      oscs.push(osc)
      gains.push(individualGain)
      synthNodes[`ambientLfo_${idx}`] = lfo
    })

    // Lowpass filter to keep drone warm & deep
    const lowpass = audioContext.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.setValueAtTime(250, audioContext.currentTime)

    synthNodes.ambientOscs = oscs
    synthNodes.ambientGains = gains
  } 
  else if (type === 'piano') {
    // Generative calm piano
    // Schedule a beautiful pentatonic note strike recursively
    const notes = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25, 783.99] // A minor pentatonic scale
    
    // Create a beautiful Hall Delay effect for piano keys
    const delay = audioContext.createDelay(1.0)
    delay.delayTime.setValueAtTime(0.5, audioContext.currentTime) // 500ms delay

    const delayFeedback = audioContext.createGain()
    delayFeedback.gain.setValueAtTime(0.35, audioContext.currentTime) // Feedback volume

    delay.connect(delayFeedback)
    delayFeedback.connect(delay) // Feedback loop

    delay.connect(channelGain)
    synthNodes.pianoDelay = delay

    const playRandomNote = () => {
      if (!activeSounds.value.piano || !audioContext) return

      // Random scale pick
      const targetFreq = notes[Math.floor(Math.random() * notes.length)]

      const osc = audioContext.createOscillator()
      osc.type = 'triangle' // Soft round timbre
      osc.frequency.setValueAtTime(targetFreq, audioContext.currentTime)

      const envelope = audioContext.createGain()
      envelope.gain.setValueAtTime(0, audioContext.currentTime)
      // Soft Piano Attack
      envelope.gain.linearRampToValueAtTime(0.35, audioContext.currentTime + 0.05)
      // Long fading Release
      envelope.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 4.5)

      osc.connect(envelope)
      envelope.connect(channelGain) // Direct signal
      envelope.connect(delay) // Reverb signal
      
      osc.start()
      osc.stop(audioContext.currentTime + 5.0)

      // Schedule next note randomly between 4s and 7s
      const nextTime = 4000 + Math.random() * 3000
      pianoTimer = setTimeout(playRandomNote, nextTime)
    }

    // Trigger the initial melody loop
    playRandomNote()
  }
}

const stopAllAudio = () => {
  activeSounds.value.rain = false
  activeSounds.value.ambient = false
  activeSounds.value.piano = false

  Object.keys(activeSounds.value).forEach(type => {
    const channelGain = synthNodes[`${type}Gain`]
    if (channelGain && audioContext) {
      channelGain.gain.setValueAtTime(0, audioContext.currentTime)
    }
  })

  if (pianoTimer) {
    clearTimeout(pianoTimer)
    pianoTimer = null
  }
}

const cleanupAudio = () => {
  stopAllAudio()
  
  if (pianoTimer) {
    clearTimeout(pianoTimer)
    pianoTimer = null
  }

  // Terminate and disconnect all nodes
  Object.keys(synthNodes).forEach(key => {
    try {
      const node = synthNodes[key]
      if (node) {
        if (Array.isArray(node)) {
          node.forEach(n => {
            n.stop?.()
            n.disconnect?.()
          })
        } else {
          node.stop?.()
          node.disconnect?.()
        }
      }
      delete synthNodes[key]
    } catch (e) {
      console.warn('Error clearing audio nodes:', e)
    }
  })

  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
}

const handleClose = () => {
  stopBreathing()
  emit('close')
}

// Clean up completely when unmounted to prevent leaks
onBeforeUnmount(() => {
  cleanupAudio()
})

// Keep listening to modal visibility changes
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    stopBreathing()
    stopAllAudio()
  }
})
</script>

<style scoped>
/* Guided circle expansion and contraction smooth cubic transition */
.ease-calm {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
