/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Leaf, Info, Loader2, Sparkles, ChevronRight, X, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { identifyPlant } from './services/geminiService';

export default function App() {
  const [showScanner, setShowScanner] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (showScanner && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showScanner, capturedImage]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera access denied. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        handleIdentify(imageData);
      }
    }
  };

  const handleIdentify = async (image: string) => {
    setIsIdentifying(true);
    setResult(null);
    setError(null);
    try {
      const identification = await identifyPlant(image);
      setResult(identification || "Could not identify the plant. Please try again.");
    } catch (err: any) {
      setError(err.message || "Failed to identify plant. Check your connection or try again.");
    } finally {
      setIsIdentifying(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
  };

  const closeScanner = () => {
    setShowScanner(false);
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#050a05] text-white">
      {/* Landing Page Content */}
      <div className="w-full max-w-4xl px-6 py-12 flex flex-col items-center text-center gap-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-3xl bg-neon-green/10 border border-neon-green/20"
        >
          <Leaf className="w-16 h-16 text-neon-green" />
        </motion.div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter neon-glow"
          >
            VERDANT <br /> <span className="text-neon-green">VISION</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg max-w-md mx-auto"
          >
            Identify any plant instantly with the power of Gemini AI. 
            Modern, fast, and precise flora recognition.
          </motion.p>
        </div>

        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setShowScanner(true)}
          className="group relative px-8 py-4 bg-neon-green text-black font-bold rounded-2xl overflow-hidden active:scale-95 transition-all"
        >
          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative flex items-center gap-2 group-hover:text-black">
            <Scan className="w-5 h-5" />
            START SCANNING
          </span>
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
          {[
            { icon: Sparkles, title: "AI Powered", desc: "Advanced Gemini 3.1 recognition" },
            { icon: Camera, title: "Instant", desc: "Real-time camera identification" },
            { icon: Info, title: "Detailed", desc: "Care guides and scientific data" }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="glass-morphism p-6 rounded-3xl text-left border border-white/5"
            >
              <feature.icon className="w-8 h-8 text-neon-green mb-4" />
              <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
              <p className="text-white/40 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scanner Popup Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md glass-morphism rounded-[2.5rem] overflow-hidden relative flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Scan className="w-5 h-5 text-neon-green" />
                  <span className="font-bold tracking-widest text-xs uppercase">Plant Scanner</span>
                </div>
                <button 
                  onClick={closeScanner}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Camera Viewport */}
              <div className="relative aspect-[3/4] bg-black">
                <AnimatePresence mode="wait">
                  {!capturedImage ? (
                    <motion.div 
                      key="camera"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full relative"
                    >
                      <video 
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {/* Scanning Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-neon-green/30 rounded-full animate-pulse" />
                        <motion.div 
                          animate={{ y: [-100, 100, -100] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-[2px] bg-neon-green shadow-[0_0_15px_rgba(57,255,20,0.8)]"
                        />
                      </div>
                      
                      {/* Capture Button */}
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                        <button 
                          onClick={capturePhoto}
                          className="w-20 h-20 rounded-full border-4 border-white/20 p-1 group active:scale-95 transition-transform"
                        >
                          <div className="w-full h-full rounded-full bg-white group-hover:bg-neon-green transition-colors flex items-center justify-center">
                            <Camera className="w-8 h-8 text-black" />
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full relative overflow-y-auto custom-scrollbar"
                    >
                      <div className="sticky top-0 w-full aspect-[3/4] z-10">
                        <img 
                          src={capturedImage} 
                          alt="Captured" 
                          className="w-full h-full object-cover"
                        />
                        {isIdentifying && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
                            <p className="text-neon-green font-medium animate-pulse">Analyzing Flora...</p>
                          </div>
                        )}
                      </div>

                      {/* Results Section */}
                      <div className="p-6 bg-dark-glass">
                        {error ? (
                          <div className="flex flex-col items-center gap-4 text-center">
                            <Info className="w-10 h-10 text-red-400" />
                            <p className="text-red-400">{error}</p>
                            <button 
                              onClick={reset}
                              className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                            >
                              Try Again
                            </button>
                          </div>
                        ) : result && (
                          <div className="space-y-6">
                            <div className="flex items-center gap-2 text-neon-green">
                              <Sparkles className="w-5 h-5" />
                              <h2 className="font-semibold uppercase tracking-widest text-xs">Identification Complete</h2>
                            </div>
                            <div className="space-y-4">
                              {result.split('\n').map((line, i) => (
                                <p key={i} className="text-white/80 leading-relaxed">
                                  {line.startsWith('**') ? (
                                    <span className="text-neon-green font-bold block mt-4 mb-1 uppercase tracking-wider text-xs">
                                      {line.replace(/\*\*/g, '')}
                                    </span>
                                  ) : line}
                                </p>
                              ))}
                            </div>
                            <button 
                              onClick={reset}
                              className="w-full mt-8 py-4 rounded-2xl bg-neon-green text-black font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors"
                            >
                              Scan Another <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Footer Info */}
      <footer className="mt-auto py-12 text-center opacity-30">
        <p className="text-xs uppercase tracking-[0.4em]">Verdant Vision × Gemini AI</p>
      </footer>
    </div>
  );
}
