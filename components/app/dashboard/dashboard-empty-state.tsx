import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <BarChart3 className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No deals yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create your first deal to see pipeline metrics, activity feeds, and
        task tracking on your dashboard.
      </p>
      <Button asChild className="mt-6">
        <Link href="/deals">Go to Deals</Link>
      </Button>
    </div>
  );
}
