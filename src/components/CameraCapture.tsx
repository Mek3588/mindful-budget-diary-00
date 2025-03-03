
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, RotateCcw, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CameraCaptureProps {
  onCapture: (image: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel?: () => void; // Added optional onCancel prop
}

const CameraCapture = ({ onCapture, open, onOpenChange, onCancel }: CameraCaptureProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clean up function to stop camera when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      // Try to get access to the camera with environment facing mode first (rear camera on mobile)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      }).catch(async () => {
        // If environment mode fails, try with user facing camera (front camera)
        return await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Make sure we wait for the video to be loaded before allowing capture
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error("Error playing video:", err);
              setCameraError("Failed to start video stream. Please try again or use file upload.");
            });
          }
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Could not access camera. Please check permissions or use file upload.");
      toast.error("Camera access error. Try uploading an image instead.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      startCamera();
      setCapturedImage(null);
      setCameraError(null);
    } else {
      stopCamera();
      if (!newOpen && onCancel) {
        onCancel(); // Call onCancel when dialog is closed if provided
      }
    }
    onOpenChange(newOpen);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      try {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        // Make sure video is actually playing and has dimensions
        if (video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) {
          toast.error("Video stream not ready. Please wait or try again.");
          return;
        }
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          try {
            const imageDataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageDataUrl);
            stopCamera();
          } catch (err) {
            console.error("Error creating image data URL:", err);
            toast.error("Failed to capture image. Please try again.");
          }
        }
      } catch (err) {
        console.error("Error capturing image:", err);
        toast.error("Failed to capture image. Please try again.");
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setCapturedImage(imageDataUrl);
        stopCamera(); // Stop camera when uploading an image
      };
      
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-white">Add an Image</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {!capturedImage ? (
            <>
              <div className="relative w-full h-64 bg-black rounded-md overflow-hidden">
                {cameraError ? (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
                    <p className="text-sm text-red-300">{cameraError}</p>
                  </div>
                ) : (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 w-full justify-center">
                <Button 
                  onClick={captureImage}
                  disabled={!!cameraError}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={triggerFileInput}
                  className="border-purple-500/30 hover:bg-purple-500/10 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </Button>
              </div>
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
                <Button 
                  variant="outline" 
                  onClick={retakePhoto}
                  className="border-purple-500/30 hover:bg-purple-500/10 text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={confirmImage}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Use Image
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
