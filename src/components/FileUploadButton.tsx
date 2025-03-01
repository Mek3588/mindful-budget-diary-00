
import { useState } from "react";
import { Button } from "./ui/button";
import { Upload, Camera } from "lucide-react";
import CameraCapture from "./CameraCapture";

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
}

export function FileUploadButton({
  onFileSelect,
  accept = "image/*",
  className = "",
}: FileUploadButtonProps) {
  const [showCamera, setShowCamera] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset the input value so the same file can be uploaded again if needed
    e.target.value = "";
  };

  const handleCameraCapture = (file: File) => {
    onFileSelect(file);
    setShowCamera(false);
  };

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("file-upload")?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          <span>Upload</span>
          <input
            id="file-upload"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCamera(true)}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          <span>Camera</span>
        </Button>
      </div>
      
      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}
    </>
  );
}
