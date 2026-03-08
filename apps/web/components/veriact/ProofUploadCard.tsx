"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, Loader2, AlertTriangle, X, Wallet } from "lucide-react";
import { submissionsApi } from "@/lib/veriact-api";
import { connectWallet } from "@/lib/creditcoin";
import { useWallet } from "@/components/WalletContext";
import { VerificationStepper } from "./VerificationStepper";
import type { Task } from "@/types/veriact";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export function ProofUploadCard({ task }: { task: Task }) {
  const router = useRouter();
  const { address: connectedAddress } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [noExifBanner, setNoExifBanner] = useState(false);
  const [participantAddress, setParticipantAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [verifyingStep, setVerifyingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputId = "proof-image-input";

  // When user is logged in with a wallet, use it for rewards (so different wallets can receive payouts)
  useEffect(() => {
    if (connectedAddress && task.onchainTaskId != null) {
      setParticipantAddress(connectedAddress);
    } else if (!connectedAddress) {
      setParticipantAddress("");
    }
  }, [connectedAddress, task.onchainTaskId]);

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
      if (participantAddress.trim())
        formData.append("participantAddress", participantAddress.trim());
      if (manualLat.trim()) formData.append("manualLat", manualLat.trim());
      if (manualLng.trim()) formData.append("manualLng", manualLng.trim());
      setVerifyingStep(2);
      const result = (await submissionsApi.create(formData)) as {
        id: string;
        status: string;
        exifData?: { latitude?: number; longitude?: number } | null;
      };
      if (
        !result.exifData?.latitude &&
        !result.exifData?.longitude &&
        !manualLat.trim() &&
        !manualLng.trim()
      ) {
        setNoExifBanner(true);
      }
      setVerifyingStep(5);
      router.push(`/submissions/${result.id}`);
      return;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Submission failed"
      );
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
      >
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-foreground mb-4">
              Verifying your proof…
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Upload received. Running verification (metadata, visual check,
              location, score).
            </p>
            <VerificationStepper currentStep={verifyingStep} />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-foreground mb-4">Submit proof</h3>
          {noExifBanner && (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription>
                No GPS in photo. Using manual location.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor={inputId}>Image</Label>
              <input
                id={inputId}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
                aria-describedby="proof-image-desc"
              />
              <span id="proof-image-desc" className="sr-only">
                Choose a photo to upload as proof. You can change or remove it
                before submitting.
              </span>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full mt-2 py-8 border-dashed min-h-[120px] flex flex-col gap-2"
                )}
                onClick={() => document.getElementById(inputId)?.click()}
                aria-label="Choose image file"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                {file ? file.name : "Choose image"}
              </Button>
              {preview && (
                <div className="mt-3 relative">
                  <img
                    src={preview}
                    alt="Preview of your proof photo"
                    className="rounded-lg max-h-48 w-full object-contain bg-muted/30"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removePhoto}
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof-note">Note (optional)</Label>
              <Textarea
                id="proof-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Optional context"
              />
            </div>
            <div className="space-y-2">
              <Label id="proof-location-label">
                Location (if your photo doesn&apos;t include GPS)
              </Label>
              <p className="text-xs text-muted-foreground">
                Enter latitude and longitude if the image has no location
                metadata.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="proof-lat"
                  type="number"
                  step="any"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  placeholder="Latitude"
                  aria-labelledby="proof-location-label"
                />
                <Input
                  id="proof-lng"
                  type="number"
                  step="any"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  placeholder="Longitude"
                  aria-labelledby="proof-location-label"
                />
              </div>
            </div>
            {task.onchainTaskId != null && (
              <Alert variant="success" className="border-primary/30 bg-primary/10">
                <AlertDescription>
                  <p className="text-xs text-muted-foreground mb-2">
                    Optional: use your wallet address to receive CTC rewards on Creditcoin testnet.
                  </p>
                  <p className="text-sm text-foreground/90 mb-2">
                    {connectedAddress
                      ? "Rewards will be sent to your connected wallet."
                      : "Receive reward on-chain (Creditcoin testnet)"}
                  </p>
                  {participantAddress ? (
                    <p
                      className="text-xs text-primary truncate"
                      title={participantAddress}
                    >
                      Wallet: {participantAddress.slice(0, 6)}…
                      {participantAddress.slice(-4)}
                    </p>
                  ) : (
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-primary font-medium"
                      onClick={async () => {
                        try {
                          const { address } = await connectWallet();
                          setParticipantAddress(address);
                        } catch (e) {
                          setError(
                            e instanceof Error
                              ? e.message
                              : "Could not connect wallet"
                          );
                        }
                      }}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Use my wallet for reward
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              disabled={!file || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Submitting…
                </>
              ) : (
                "Submit proof"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
