import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Check, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Data: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Prefer back camera on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        currentStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setError('Unable to access camera. Please check camera permissions or try uploading a photo.');
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleTakeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      // Strip prefix for base64 payload
      const base64 = dataUrl.split(',')[1];
      setCapturedImage(base64);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      onCapture(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Camera className="w-5 h-5 text-amber-400" />
            <span>Scan Receipt with Camera</span>
          </div>
          <button
            onClick={() => {
              if (stream) stream.getTracks().forEach((track) => track.stop());
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder or Preview */}
        <div className="relative aspect-[3/4] sm:aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-rose-400 flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10" />
              <p className="text-sm">{error}</p>
            </div>
          ) : capturedImage ? (
            <img
              src={`data:image/jpeg;base64,${capturedImage}`}
              alt="Captured receipt"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Receipt framing guide overlay */}
              <div className="absolute inset-8 border-2 border-dashed border-amber-400/60 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] bg-black/60 text-amber-300 font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                  Align receipt edges inside the frame
                </span>
              </div>
            </>
          )}

          {/* Hidden Canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4">
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium flex items-center gap-2 border border-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Use This Photo
              </button>
            </>
          ) : (
            <button
              onClick={handleTakeSnapshot}
              disabled={!!error}
              className="w-16 h-16 rounded-full border-4 border-amber-400/40 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
            >
              <div className="w-full h-full bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40">
                <Camera className="w-6 h-6 text-slate-950" />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
