"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Navbar,
  HeroSection,
  FeatureCards,
  HowItWorks,
  DashboardStats,
  DashboardStatsSkeleton,
} from "@/components/veriact";
import { dashboardApi } from "@/lib/veriact-api";

export default function HomePage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.stats(),
  });

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main id="main-content" className="max-w-6xl mx-auto">
        <HeroSection />
        <FeatureCards />
        <HowItWorks />
        {stats ? (
          <DashboardStats
            totalTasks={stats.totalTasks}
            verifiedSubmissions={stats.verifiedSubmissions}
            rewardsReleased={stats.rewardsReleased}
            recentActivity={stats.recentActivity as Array<{
              id: string;
              taskName: string;
              status: string;
              submittedAt: string;
              score?: number;
            }>}
          />
        ) : (
          <DashboardStatsSkeleton />
        )}
      </main>
    </div>
  );
}
