/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Leaf, Info, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { identifyPlant } from './services/geminiService';

export default function App() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

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
    } catch (err) {
      setError("Failed to identify plant. Check your connection or try again.");
    } finally {
      setIsIdentifying(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
    startCamera();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 md:p-8">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-neon-green/20 border border-neon-green/30">
            <Leaf className="w-6 h-6 text-neon-green" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight neon-glow">Verdant Vision</h1>
        </div>
        <button 
          onClick={reset}
          className="p-2 rounded-full glass-morphism hover:bg-neon-green/10 transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-neon-green" />
        </button>
      </motion.header>

      <main className="w-full max-w-md flex flex-col gap-6">
        {/* Camera Viewport */}
        <motion.div 
          layout
          className="relative aspect-[3/4] rounded-3xl overflow-hidden glass-morphism neon-border-glow"
        >
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
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-neon-green/20 rounded-full animate-ping" />
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
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full relative"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {(result || error) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-morphism rounded-3xl p-6 flex flex-col gap-4"
            >
              {error ? (
                <div className="flex items-center gap-3 text-red-400">
                  <Info className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-neon-green">
                    <Sparkles className="w-5 h-5" />
                    <h2 className="font-semibold uppercase tracking-widest text-xs">Identification Complete</h2>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    {result?.split('\n').map((line, i) => (
                      <p key={i} className="text-white/80 leading-relaxed mb-2">
                        {line.startsWith('**') ? (
                          <span className="text-neon-green font-bold">{line.replace(/\*\*/g, '')}</span>
                        ) : line}
                      </p>
                    ))}
                  </div>
                  <button 
                    onClick={reset}
                    className="w-full mt-4 py-4 rounded-2xl bg-neon-green text-black font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors"
                  >
                    Scan Another <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden Canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </main>

      {/* Footer Info */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-auto py-8 text-center"
      >
        <p className="text-white/30 text-xs uppercase tracking-[0.2em]">Powered by Gemini AI</p>
      </motion.footer>
    </div>
  );
}
