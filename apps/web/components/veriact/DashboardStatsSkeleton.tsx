"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStatsSkeleton() {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
      }}
      className="px-4 space-y-6"
      aria-busy="true"
      aria-label="Dashboard loading"
    >
      <motion.h2
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        className="text-xl font-bold text-foreground"
      >
        Dashboard
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-5">
                <Skeleton className="h-8 w-8 mb-2 rounded" />
                <Skeleton className="h-8 w-12 mb-2" />
                <p className="text-sm text-muted-foreground">Loading…</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <p className="text-sm text-muted-foreground">Loading…</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.section>
  );
}
