"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, Loader2, AlertTriangle, X } from "lucide-react";
import { submissionsApi } from "@/lib/veriact-api";
import { VerificationStepper } from "./VerificationStepper";
import type { Task } from "@/types/veriact";

export function ProofUploadCard({ task }: { task: Task }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [noExifBanner, setNoExifBanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingStep, setVerifyingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputId = "proof-image-input";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(f));
      setError(null);
    }
  };

  const removePhoto = () => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setNoExifBanner(false);
    setVerifyingStep(1);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", task.id);
      if (note) formData.append("note", note);
      if (manualLat.trim()) formData.append("manualLat", manualLat.trim());
      if (manualLng.trim()) formData.append("manualLng", manualLng.trim());
      setVerifyingStep(2);
      const result = await submissionsApi.create(formData) as {
        id: string;
        status: string;
        exifData?: { latitude?: number; longitude?: number } | null;
      };
      if (!result.exifData?.latitude && !result.exifData?.longitude && !manualLat.trim() && !manualLng.trim()) {
        setNoExifBanner(true);
      }
      setVerifyingStep(5);
      router.push(`/submissions/${result.id}`);
      return;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
      setVerifyingStep(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading && verifyingStep > 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <h3 className="font-semibold text-white mb-4">Verifying your proof…</h3>
        <p className="text-white/60 text-sm mb-4">
          Upload received. Running verification (metadata, visual check, location, score).
        </p>
        <VerificationStepper currentStep={verifyingStep} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-6"
    >
      <h3 className="font-semibold text-white mb-4">Submit proof</h3>
      {noExifBanner && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-500/20 border border-amber-500/30 p-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden />
          <p className="text-sm text-amber-200">No GPS in photo. Using manual location.</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={inputId} className="block text-sm text-white/70 mb-2">
            Image
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
            aria-describedby="proof-image-desc"
          />
          <div id="proof-image-desc" className="sr-only">
            Choose a photo to upload as proof. You can change or remove it before submitting.
          </div>
          <button
            type="button"
            onClick={() => document.getElementById(inputId)?.click()}
            className="w-full rounded-xl border border-dashed border-white/30 bg-white/5 py-8 flex flex-col items-center gap-2 text-white/60 hover:bg-white/10 hover:text-white/80 transition focus-ring min-h-[120px]"
            aria-label="Choose image file"
          >
            <Upload className="w-8 h-8" aria-hidden />
            {file ? file.name : "Choose image"}
          </button>
          {preview && (
            <div className="mt-3 relative">
              <img
                src={preview}
                alt="Preview of your proof photo"
                className="rounded-xl max-h-48 w-full object-contain bg-black/20"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 rounded-lg bg-black/70 p-2 text-white hover:bg-black/90 focus-ring"
                aria-label="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="proof-note" className="block text-sm text-white/70 mb-1.5">
            Note (optional)
          </label>
          <textarea
            id="proof-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 resize-none text-sm focus-ring"
            placeholder="Optional context"
          />
        </div>
        <div>
          <label id="proof-location-label" className="block text-sm text-white/70 mb-1.5">
            Location (if your photo doesn&apos;t include GPS)
          </label>
          <p className="text-xs text-white/50 mb-2">
            Enter latitude and longitude if the image has no location metadata.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="proof-lat"
              type="number"
              step="any"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              placeholder="Latitude"
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 text-sm focus-ring min-h-[44px]"
              aria-labelledby="proof-location-label"
            />
            <input
              id="proof-lng"
              type="number"
              step="any"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              placeholder="Longitude"
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 text-sm focus-ring min-h-[44px]"
              aria-labelledby="proof-location-label"
            />
          </div>
        </div>
        {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={!file || loading}
          className="w-full py-3.5 rounded-xl bg-emerald-500 text-black font-semibold flex items-center justify-center gap-2 hover:bg-emerald-400 transition disabled:opacity-50 focus-ring min-h-[48px]"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : "Submit proof"}
        </button>
      </form>
    </motion.div>
  );
}
