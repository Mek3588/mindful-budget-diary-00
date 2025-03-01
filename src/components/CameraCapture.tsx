
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, RotateCcw } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (image: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CameraCapture = ({ onCapture, open, onOpenChange }: CameraCaptureProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      startCamera();
      setCapturedImage(null);
    } else {
      stopCamera();
    }
    onOpenChange(newOpen);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmImage = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Take a Photo</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {!capturedImage ? (
            <>
              <div className="relative w-full h-64 bg-black rounded-md overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              </div>
              <Button onClick={captureImage}>
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
            </>
          ) : (
            <>
              <div className="relative w-full h-64 bg-black rounded-md overflow-hidden">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={retakePhoto}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button onClick={confirmImage}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Use Photo
                </Button>
              </div>
            </>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraCapture;
