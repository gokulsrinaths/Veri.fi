"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LayoutDashboard, CheckCircle, Coins, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const spring = { type: "spring", stiffness: 320, damping: 28 };

export function DashboardStats({
  totalTasks,
  verifiedSubmissions,
  rewardsReleased,
  recentActivity,
}: {
  totalTasks: number;
  verifiedSubmissions: number;
  rewardsReleased: string;
  recentActivity: Array<{
    id: string;
    taskName: string;
    status: string;
    submittedAt: string;
    score?: number;
  }>;
}) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
      }}
      className="px-4 space-y-6"
    >
      <motion.h2
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
        transition={spring}
        className="text-xl font-bold text-foreground"
      >
        Dashboard
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: LayoutDashboard,
            value: totalTasks,
            label: "Total tasks",
          },
          {
            icon: CheckCircle,
            value: verifiedSubmissions,
            label: "Verified submissions",
          },
          {
            icon: Coins,
            value: `${rewardsReleased} CTC`,
            label: "Rewards released",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={spring}
          >
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Card>
                <CardContent className="p-5">
                  <stat.icon className="h-8 w-8 text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={spring}
      >
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Recent activity</h3>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="space-y-2">
                {recentActivity.map((a) => (
                  <li key={a.id}>
                    {a.id ? (
                      <Link
                        href={`/submissions/${a.id}`}
                        className={cn(
                          "flex items-center justify-between text-sm rounded-lg px-2 py-1.5 -mx-2",
                          "hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
                        )}
                      >
                        <span className="text-foreground/80">{a.taskName}</span>
                        <span className="text-muted-foreground">
                          {a.status}
                          {a.score != null ? ` · ${(a.score * 100).toFixed(0)}%` : ""}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground/80">{a.taskName}</span>
                        <span className="text-muted-foreground">
                          {a.status}
                          {a.score != null ? ` · ${(a.score * 100).toFixed(0)}%` : ""}
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.section>
  );
}
