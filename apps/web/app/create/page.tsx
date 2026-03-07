"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/tasks/create");
  }, [router]);
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white/50">
      Redirecting to Create Task...
    </div>
  );
}
