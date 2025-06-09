import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw, Zap, ZapOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [hasFlash, setHasFlash] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Check if device has flash
      const tracks = stream.getVideoTracks();
      if (tracks.length > 0) {
        const capabilities = tracks[0].getCapabilities();
        setHasFlash(!!capabilities.torch);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(t("camera.accessError"));
      setIsLoading(false);
      toast({
        title: t("camera.error"),
        description: t("camera.accessError"),
        variant: "destructive"
      });
    }
  }, [facingMode, toast, t]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const toggleFlash = useCallback(async () => {
    if (!streamRef.current || !hasFlash) return;

    try {
      const tracks = streamRef.current.getVideoTracks();
      if (tracks.length > 0) {
        await tracks[0].applyConstraints({
          advanced: [{ torch: !flashEnabled }]
        });
        setFlashEnabled(!flashEnabled);
      }
    } catch (err) {
      console.error("Error toggling flash:", err);
    }
  }, [flashEnabled, hasFlash]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `meal-photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now()
        });
        onCapture(file);
      }
    }, "image/jpeg", 0.9);
  }, [onCapture]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">{t("camera.notSupported")}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t("camera.notSupportedDesc")}
          </p>
          <Button onClick={handleClose} className="w-full">
            {t("common.close")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
      <div className="relative w-full h-full max-w-2xl max-h-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 text-white">
          <h3 className="text-lg font-semibold">{t("camera.title")}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Camera View */}
        <div className="flex-1 relative bg-black rounded-lg overflow-hidden mx-4">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>{t("camera.starting")}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <p className="mb-4">{error}</p>
                <Button onClick={startCamera} variant="outline">
                  {t("common.retry")}
                </Button>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            style={{ display: isLoading || error ? "none" : "block" }}
          />

          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Controls Overlay */}
          {!isLoading && !error && (
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center justify-center space-x-4">
                {/* Flash Toggle */}
                {hasFlash && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={toggleFlash}
                    className="text-white hover:bg-white/20 p-3"
                  >
                    {flashEnabled ? (
                      <Zap className="h-6 w-6" />
                    ) : (
                      <ZapOff className="h-6 w-6" />
                    )}
                  </Button>
                )}

                {/* Capture Button */}
                <Button
                  onClick={capturePhoto}
                  className="bg-white hover:bg-gray-200 text-black rounded-full p-4 w-16 h-16"
                >
                  <Camera className="h-8 w-8" />
                </Button>

                {/* Switch Camera */}
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={switchCamera}
                  className="text-white hover:bg-white/20 p-3"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 text-center text-white">
          <p className="text-sm opacity-75">{t("camera.instructions")}</p>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;