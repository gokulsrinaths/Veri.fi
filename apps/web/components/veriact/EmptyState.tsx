"use client";

import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <motion.div
            initial={{ y: 4 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Inbox className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          </motion.div>
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            {description}
          </p>
          {action}
        </CardContent>
      </Card>
    </motion.div>
  );
}
