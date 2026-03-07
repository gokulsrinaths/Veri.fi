"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Loader2 } from "lucide-react";
import { apiSubmissions, apiVerify, apiSettle } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Props = {
  taskId: string;
  taskTitle: string;
  expectedObject: string;
  radiusMeters: number;
  wallet: string;
};

export function OpenCameraButton({ taskId, taskTitle, expectedObject, radiusMeters, wallet }: Props) {
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"camera" | "preview" | "uploading" | "verifying" | "done" | "error">("camera");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<Record<string, number> | null>(null);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (e) {
      setError("Camera access denied or unavailable.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }, [stream]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedUrl(URL.createObjectURL(blob));
          setStep("preview");
          stopCamera();
        }
      },
      "image/jpeg",
      0.9
    );
  }, [stopCamera]);

  const getLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        reject,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  const submitProof = useCallback(async () => {
    if (!capturedBlob) return;
    setStep("uploading");
    setError(null);
    try {
      const c = await getLocation();
      setCoords(c);

      const filename = `capture-${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append("file", capturedBlob, filename);
      const uploadRes = await fetch(`${API_BASE}/submissions/upload?taskId=${taskId}`, {
        method: "POST",
        headers: { "x-wallet-address": wallet },
        body: formData,
      });
      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Upload failed");
      }
      const up = await uploadRes.json();
      let finalMediaUrl = (up as { mediaUrl: string }).mediaUrl;
      if (!finalMediaUrl.startsWith("http")) finalMediaUrl = `${API_BASE}${finalMediaUrl}`;

      const sessionToken = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const capturedAt = new Date().toISOString();
      const sub = await apiSubmissions.create(
        {
          taskId,
          mediaUrl: finalMediaUrl,
          mediaType: "image/jpeg",
          capturedLatitude: c.lat,
          capturedLongitude: c.lng,
          capturedAt,
          sessionToken,
        },
        wallet
      );
      const id = (sub as { id: string }).id;
      setSubmissionId(id);

      setStep("verifying");
      await apiVerify.run(id);
      const result = await apiSubmissions.getResult(id);
      setScoreBreakdown((result.scoreBreakdownJson as Record<string, number>) || null);
      setFinalStatus(result.verificationStatus);

      if (result.verificationStatus === "VERIFIED") {
        await apiSettle.run(id);
        const again = await apiSubmissions.getResult(id);
        setFinalStatus(again.verificationStatus);
      }

      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Submission failed");
      setStep("error");
    }
  }, [capturedBlob, taskId, wallet, getLocation]);

  const handleConfirmCapture = useCallback(async () => {
    try {
      await submitProof();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Submission failed");
      setStep("error");
    }
  }, [submitProof]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setStep("camera");
    setCapturedBlob(null);
    setCapturedUrl(null);
    setCoords(null);
    setError(null);
    setSubmissionId(null);
    setScoreBreakdown(null);
    setFinalStatus(null);
    startCamera();
  }, [startCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setOpen(false);
    if (step === "done" && submissionId) {
      router.push(`/submissions/${submissionId}`);
    }
  }, [stopCamera, capturedUrl, step, submissionId, router]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-electric text-black py-4 font-semibold hover:bg-electric/90 transition"
      >
        <Camera className="w-5 h-5" />
        Open Camera — Capture Proof
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <span className="font-medium">Proof: {taskTitle}</span>
              <button type="button" onClick={handleClose} className="p-2 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === "camera" && (
              <>
                <div className="flex-1 relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white/90 text-sm">
                    <p>Show: {expectedObject}</p>
                    <p>Stay within {radiusMeters}m of target location.</p>
                  </div>
                </div>
                {error && <p className="text-red-400 px-4 py-2 text-sm">{error}</p>}
                <div className="p-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-full py-4 rounded-xl bg-electric text-black font-semibold"
                  >
                    Capture Photo
                  </button>
                </div>
              </>
            )}

            {step === "preview" && capturedUrl && (
              <>
                <div className="flex-1 p-4">
                  <img src={capturedUrl} alt="Captured" className="w-full rounded-xl object-contain max-h-[60vh]" />
                  <p className="text-white/60 text-sm mt-2">Location will be recorded when you submit.</p>
                </div>
                <div className="p-4 space-y-2">
                  <button
                    type="button"
                    onClick={handleConfirmCapture}
                    className="w-full py-4 rounded-xl bg-electric text-black font-semibold"
                  >
                    Submit proof & verify
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep("camera"); setCapturedBlob(null); setCapturedUrl(null); startCamera(); }}
                    className="w-full py-3 rounded-xl border border-white/30 text-white/90"
                  >
                    Retake
                  </button>
                </div>
              </>
            )}

            {(step === "uploading" || step === "verifying") && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-electric animate-spin" />
                <p className="text-white/70">
                  {step === "uploading" ? "Uploading..." : "Verifying your proof..."}
                </p>
              </div>
            )}

            {step === "done" && (
              <div className="flex-1 p-6 flex flex-col justify-center">
                <p className="text-lg font-semibold text-electric mb-2">
                  {finalStatus === "VERIFIED" || finalStatus === "PAID" ? "Verified & paid" : finalStatus}
                </p>
                {scoreBreakdown && (
                  <div className="text-sm text-white/70 space-y-1 mb-6">
                    {Object.entries(scoreBreakdown).map(([k, v]) => (
                      <p key={k}>{k}: {(Number(v) * 100).toFixed(0)}%</p>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-4 rounded-xl bg-electric text-black font-semibold"
                >
                  View submission
                </button>
              </div>
            )}

            {step === "error" && (
              <div className="flex-1 p-6 flex flex-col justify-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-4 rounded-xl border border-white/30"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
