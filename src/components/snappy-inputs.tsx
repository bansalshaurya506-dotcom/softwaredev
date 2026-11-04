"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, CameraOff, Hand, Mic, MicOff, Sparkles, Volume2, VolumeX } from "lucide-react"
import type { HandLandmarker } from "@mediapipe/tasks-vision"

type RecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type RecognitionCtor = new () => RecognitionInstance

type Props = {
  onPoint: (x: number, y: number, visible: boolean) => void
  onPinch: () => void
  onSnap: () => void
  onVoice: (transcript: string) => void
  onCapture: (image: string) => void
}

export default function SnappyInputs({ onPoint, onPinch, onSnap, onVoice, onCapture }: Props) {
  const [cameraOn, setCameraOn] = useState(false)
  const [handSeen, setHandSeen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const [status, setStatus] = useState("Use the buttons above to enable your devices.")
  const [lastCommand, setLastCommand] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraRef = useRef<MediaStream | null>(null)
  const modelRef = useRef<HandLandmarker | null>(null)
  const cameraRaf = useRef<number | null>(null)
  const soundRaf = useRef<number | null>(null)
  const soundRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const recognitionRef = useRef<RecognitionInstance | null>(null)
  const pinchedRef = useRef(false)
  const lastPinchRef = useRef(0)
  const lastSoundRef = useRef(0)
  const callbacks = useRef({ onPoint, onPinch, onSnap, onVoice, onCapture })
  useEffect(() => { callbacks.current = { onPoint, onPinch, onSnap, onVoice, onCapture } }, [onPoint, onPinch, onSnap, onVoice, onCapture])

  const stopCamera = useCallback(() => {
    if (cameraRaf.current !== null) cancelAnimationFrame(cameraRaf.current)
    cameraRaf.current = null
    cameraRef.current?.getTracks().forEach((track) => track.stop())
    cameraRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    modelRef.current?.close()
    modelRef.current = null
    pinchedRef.current = false
    callbacks.current.onPoint(0, 0, false)
    setCameraOn(false)
    setHandSeen(false)
    setStatus("Camera off. Pointing and pinch gestures are paused.")
  }, [])

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("This browser does not support camera access. Mouse and touch controls still work.")
      return
    }
    setStatus("Asking for camera permission...")
    let stream: MediaStream | null = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false })
      cameraRef.current = stream
      const video = videoRef.current
      if (!video) throw new Error("Camera preview is unavailable.")
      video.srcObject = stream
      await video.play()
      setCameraOn(true)
      setStatus("Loading hand-tracking model on your device...")
      const { FilesetResolver, HandLandmarker: HandLandmarkerTask } = await import("@mediapipe/tasks-vision")
      const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm")
      if (!cameraRef.current) return
      const model = await HandLandmarkerTask.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.55,
        minTrackingConfidence: 0.5,
      })
      if (!cameraRef.current) { model.close(); return }
      modelRef.current = model
      setStatus("Hand tracking ready. Point at the lesson, then pinch thumb and finger to select.")
      let previousTime = -1
      let lastFrame = 0
      const loop = (timestamp: number) => {
        if (!cameraRef.current || !modelRef.current || !videoRef.current) return
        if (videoRef.current.readyState >= 2 && videoRef.current.currentTime !== previousTime && timestamp - lastFrame > 80) {
          previousTime = videoRef.current.currentTime
          lastFrame = timestamp
          try {
            const result = modelRef.current.detectForVideo(videoRef.current, timestamp)
            const landmarks = result.landmarks[0]
            if (landmarks && landmarks[8] && landmarks[4]) {
              const index = landmarks[8]
              const thumb = landmarks[4]
              // The preview is mirrored, so mirror the X position of the pointer too.
              const x = Math.min(1, Math.max(0, 1 - index.x))
              const y = Math.min(1, Math.max(0, index.y))
              callbacks.current.onPoint(x, y, true)
              setHandSeen(true)
              const distance = Math.hypot(index.x - thumb.x, index.y - thumb.y)
              const isPinch = distance < 0.065
              if (isPinch && !pinchedRef.current && timestamp - lastPinchRef.current > 900) {
                lastPinchRef.current = timestamp
                callbacks.current.onPinch()
              }
              pinchedRef.current = isPinch
            } else {
              callbacks.current.onPoint(0, 0, false)
              pinchedRef.current = false
              setHandSeen(false)
            }
          } catch {
            setStatus("Tracking paused. You can still tap or click the lesson.")
          }
        }
        cameraRaf.current = requestAnimationFrame(loop)
      }
      cameraRaf.current = requestAnimationFrame(loop)
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop())
      cameraRef.current = null
      setCameraOn(false)
      setStatus(error instanceof Error ? "Camera/tracking unavailable: " + error.message : "Could not start camera.")
    }
  }

  const stopSound = useCallback(() => {
    if (soundRaf.current !== null) cancelAnimationFrame(soundRaf.current)
    soundRaf.current = null
    soundRef.current?.getTracks().forEach((track) => track.stop())
    soundRef.current = null
    void audioRef.current?.close()
    audioRef.current = null
    setSoundOn(false)
  }, [])

  const startSound = async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setStatus("Microphone access is not supported here."); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true }, video: false })
      soundRef.current = stream
      const context = new AudioContext()
      audioRef.current = context
      const source = context.createMediaStreamSource(stream)
      const analyser = context.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      const data = new Uint8Array(analyser.fftSize)
      let previousRms = 0
      const listen = (timestamp: number) => {
        if (!soundRef.current) return
        analyser.getByteTimeDomainData(data)
        let energy = 0
        let peak = 0
        for (let i = 0; i < data.length; i += 1) {
          const sample = (data[i] - 128) / 128
          energy += sample * sample
          peak = Math.max(peak, Math.abs(sample))
        }
        const rms = Math.sqrt(energy / data.length)
        // A sharp transient is an approximate snap/clap cue, not true audio classification.
        if (peak > .36 && rms > .075 && rms - previousRms > .037 && timestamp - lastSoundRef.current > 1200) {
          lastSoundRef.current = timestamp
          callbacks.current.onSnap()
          setStatus("Sharp sound detected! Switched to the next concept.")
        }
        previousRms = previousRms * .35 + rms * .65
        soundRaf.current = requestAnimationFrame(listen)
      }
      setSoundOn(true)
      setStatus("Listening for sharp snaps or claps. Background noises can also trigger it.")
      soundRaf.current = requestAnimationFrame(listen)
    } catch {
      streamErrorCleanup()
      setStatus("Microphone permission was denied or the device is unavailable.")
    }
    function streamErrorCleanup() {
      soundRef.current?.getTracks().forEach((track) => track.stop())
      soundRef.current = null
      void audioRef.current?.close()
      audioRef.current = null
      setSoundOn(false)
    }
  }

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setVoiceOn(false)
  }, [])

  const startVoice = () => {
    const speechWindow = window as Window & { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!Recognition) {
      setStatus("Voice recognition is not supported in this browser. Try Chrome, or use the on-screen controls.")
      return
    }
    try {
      const recognizer = new Recognition()
      recognizer.lang = "en-US"
      recognizer.continuous = false
      recognizer.interimResults = false
      recognizer.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript || ""
        setLastCommand(transcript)
        callbacks.current.onVoice(transcript)
      }
      recognizer.onerror = (event) => setStatus("Voice recognition: " + event.error)
      recognizer.onend = () => { setVoiceOn(false); recognitionRef.current = null }
      recognitionRef.current = recognizer
      recognizer.start()
      setVoiceOn(true)
      setStatus("Listening for a command. Try 'next', 'explain', 'cell', 'space', or 'forces'.")
    } catch { setStatus("Could not start voice recognition."); setVoiceOn(false) }
  }

  const captureFrame = () => {
    const video = videoRef.current
    if (!video || !cameraOn || video.videoWidth === 0) { setStatus("Turn on the camera first."); return }
    const canvas = document.createElement("canvas")
    const scale = Math.min(1, 640 / video.videoWidth)
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
    const context = canvas.getContext("2d")
    if (!context) return
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    callbacks.current.onCapture(canvas.toDataURL("image/jpeg", .75))
    setStatus("One camera frame captured for your explicit AI explanation request.")
  }

  useEffect(() => () => {
    if (cameraRaf.current !== null) cancelAnimationFrame(cameraRaf.current)
    if (soundRaf.current !== null) cancelAnimationFrame(soundRaf.current)
    cameraRef.current?.getTracks().forEach((track) => track.stop())
    soundRef.current?.getTracks().forEach((track) => track.stop())
    modelRef.current?.close()
    void audioRef.current?.close()
    recognitionRef.current?.stop()
  }, [])

  return (
    <div className="sn-device-panel">
      <div className="sn-device-head"><span className="sn-eyebrow"><Sparkles size={13}/> LIVE CONTROLS</span><span className={"sn-status-tag " + (cameraOn && handSeen ? "sn-tag-live" : "")}>{cameraOn && handSeen ? "HAND FOUND" : cameraOn ? "CAMERA ON" : "DEVICES OFF"}</span></div>
      <div className="sn-device-buttons">
        <button type="button" className={"sn-device-button " + (cameraOn ? "sn-device-active" : "")} onClick={cameraOn ? stopCamera : () => void startCamera()}>
          {cameraOn ? <CameraOff size={18}/> : <Camera size={18}/>}<span>{cameraOn ? "Stop camera" : "Start camera"}</span>
        </button>
        <button type="button" className={"sn-device-button " + (soundOn ? "sn-device-active" : "")} onClick={soundOn ? stopSound : () => void startSound()}>
          {soundOn ? <VolumeX size={18}/> : <Volume2 size={18}/>}<span>{soundOn ? "Stop snaps" : "Listen for snaps"}</span>
        </button>
        <button type="button" className={"sn-device-button " + (voiceOn ? "sn-device-active" : "")} onClick={voiceOn ? stopVoice : startVoice}>
          {voiceOn ? <MicOff size={18}/> : <Mic size={18}/>}<span>{voiceOn ? "Stop listening" : "Voice command"}</span>
        </button>
      </div>
      <div className="sn-camera-preview">
        <video ref={videoRef} muted playsInline autoPlay aria-label="Live local camera preview" className={"sn-video " + (cameraOn ? "" : "sn-video-off")}/>
        {!cameraOn && <div className="sn-camera-idle"><Hand size={29}/><span>Camera preview appears here</span><small>Enabled only when you choose Start camera</small></div>}
        {cameraOn && <span className="sn-camera-corner sn-camera-corner-tl"/>}
        {cameraOn && <span className="sn-camera-corner sn-camera-corner-br"/>}
        {cameraOn && <span className="sn-camera-badge"><span className="sn-live-dot"/> LIVE • LOCAL</span>}
      </div>
      <p className="sn-device-feedback" role="status">{status}</p>
      {lastCommand && <p className="sn-last-command">Heard: “{lastCommand}”</p>}
      <button type="button" className="sn-capture-button" disabled={!cameraOn} onClick={captureFrame}><Sparkles size={15}/> Explain what the camera sees <span>AI key required</span></button>
      <p className="sn-device-footnote">Camera hand tracking runs locally after downloading the model. A frame is sent for AI analysis only if you press the explanation button. Browser voice recognition may use an external speech service.</p>
    </div>
  )
}
