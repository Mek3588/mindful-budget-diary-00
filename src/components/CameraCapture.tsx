
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Aperture, X } from "lucide-react";
import { toast } from "sonner";

interface CameraCaptureProps {
  onCapture: (imageFile: File) => void;
  onClose: () => void;
}

const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if browser supports camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      setIsLoading(false);
      toast.error("Camera is not supported in your browser");
      return;
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async (useFrontCamera = true) => {
    try {
      setIsLoading(true);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: useFrontCamera ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      
      setIsFrontCamera(useFrontCamera);
      setIsLoading(false);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsSupported(false);
      setIsLoading(false);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const switchCamera = () => {
    startCamera(!isFrontCamera);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Draw the current video frame
    ctx.drawImage(videoRef.current, 0, 0);
    
    // Convert to file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-capture-${Date.now()}.png`, { type: "image/png" });
        onCapture(file);
        toast.success("Photo captured successfully");
      }
    }, "image/png");
  };

  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Camera Not Available</h3>
          <p className="mb-4">Sorry, camera access is not supported or permission was denied.</p>
          <Button onClick={onClose} className="w-full">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Take a Photo</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-opacity-50"></div>
            </div>
          )}
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted
            className="w-full aspect-video object-cover"
            onCanPlay={() => setIsLoading(false)}
          />
        </div>
        
        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={switchCamera} disabled={isLoading}>
            <Aperture className="h-5 w-5 mr-2" />
            Switch Camera
          </Button>
          <Button onClick={capturePhoto} disabled={isLoading}>
            <Camera className="h-5 w-5 mr-2" />
            Take Photo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
