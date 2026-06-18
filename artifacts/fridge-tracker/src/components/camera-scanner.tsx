import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Loader2, CameraOff } from "lucide-react";

interface CameraScannerProps {
  onResult: (text: string) => void;
  label?: string;
}

export function CameraScanner({ onResult, label = "Richt de camera op een streepjescode of QR-code" }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [status, setStatus] = useState<"loading" | "scanning" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const calledBack = useRef(false);

  useEffect(() => {
    calledBack.current = false;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result, err, controls) => {
        if (calledBack.current) return;
        if (controls) controlsRef.current = controls;

        if (result) {
          calledBack.current = true;
          controls?.stop();
          onResult(result.getText());
        }

        if (status === "loading" && !result) setStatus("scanning");
      })
      .then((controls) => {
        controlsRef.current = controls;
        setStatus("scanning");
      })
      .catch((err: Error) => {
        console.error(err);
        setErrorMsg(err.message?.includes("permission") ? "Geen cameratoegang verleend." : "Camera kon niet worden gestart.");
        setStatus("error");
      });

    return () => {
      calledBack.current = true;
      controlsRef.current?.stop();
      BrowserMultiFormatReader.releaseAllStreams();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />

        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 p-6 text-center">
            <CameraOff className="w-10 h-10 text-white/70" />
            <p className="text-white text-sm">{errorMsg}</p>
          </div>
        )}

        {status === "scanning" && (
          <>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-white/70 rounded-xl relative">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-white rounded-tl-md" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-white rounded-tr-md" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-white rounded-bl-md" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-white rounded-br-md" />
                <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-0.5 bg-primary/80 animate-pulse" />
              </div>
            </div>
          </>
        )}
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-[260px]">{label}</p>
    </div>
  );
}
