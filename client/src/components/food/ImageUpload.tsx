import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, FileUp, HelpCircle, X, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";
// import CameraCapture from "./CameraCapture";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onSwitch: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, onSwitch }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      toast({
        title: t("imageUpload.invalidType"),
        description: t("imageUpload.invalidTypeDesc"),
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("imageUpload.tooLarge"),
        description: t("imageUpload.tooLargeDesc"),
        variant: "destructive"
      });
      return;
    }

    onImageSelect(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };



  const captureImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex-1 text-center">
      <h3 className="text-xl font-bold mb-3">{t("imageUpload.title")}</h3>

      <div
        className={`border-2 border-dashed rounded-lg p-8 mb-4 cursor-pointer hover:border-primary transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-neutral-medium dark:border-gray-600"
        }`}
        role="button"
        tabIndex={0}
        aria-label={t("imageUpload.dragDropArea")}
        onClick={triggerFileInput}
        onKeyDown={(e) => e.key === "Enter" && triggerFileInput()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <FileUp className="h-16 w-16 text-neutral-dark dark:text-gray-400" />
          <p className="text-lg">
            {t("imageUpload.dragDrop")} <span className="text-primary font-medium">{t("imageUpload.browse")}</span>
          </p>
          <p className="text-neutral-dark text-sm">{t("imageUpload.supportedFormats")}</p>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileInput}
            ref={fileInputRef}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-2">
        <Button 
          className="flex-1 flex items-center justify-center accessibility-focus"
          onClick={captureImage}
        >
          <Camera className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
          {t("imageUpload.capturePhoto")}
        </Button>
        <Button 
          variant="outline"
          className="flex-1 flex items-center justify-center accessibility-focus"
          onClick={triggerFileInput}
        >
          <FileUp className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
          {t("imageUpload.uploadFile")}
        </Button>
      </div>
      
      <div className="text-sm text-neutral-dark mt-2">
        <Button 
          variant="link" 
          className="accessibility-focus text-primary hover:underline p-1 rounded flex items-center"
          onClick={onSwitch}
        >
          <HelpCircle className="h-4 w-4 rtl:ml-1 ltr:mr-1" />
          {t("imageUpload.troubleManualEntry")}
        </Button>
      </div>
    </div>
  );
};

export default ImageUpload;
