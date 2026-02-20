"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateDealStage } from "@/lib/actions/deals";
import {
  zodResolverCompat,
  closeDealWonSchema,
  closeDealLostSchema,
  type CloseDealWonValues,
  type CloseDealLostValues,
} from "@/lib/validations/deal";

interface CloseDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string | null;
  variant: "won" | "lost";
}

function CloseWonForm({
  dealId,
  onSuccess,
}: {
  dealId: string;
  onSuccess: () => void;
}) {
  const form = useForm<CloseDealWonValues>({
    resolver: zodResolverCompat(closeDealWonSchema),
    defaultValues: { close_date: "" },
  });

  async function onSubmit(values: CloseDealWonValues) {
    const result = await updateDealStage(dealId, "won", {
      closeDate: values.close_date,
    });
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Deal marked as Won");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="close_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Close date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Confirm Won"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function CloseLostForm({
  dealId,
  onSuccess,
}: {
  dealId: string;
  onSuccess: () => void;
}) {
  const form = useForm<CloseDealLostValues>({
    resolver: zodResolverCompat(closeDealLostSchema),
    defaultValues: { lost_reason: "" },
  });

  async function onSubmit(values: CloseDealLostValues) {
    const result = await updateDealStage(dealId, "lost", {
      lostReason: values.lost_reason,
    });
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Deal marked as Lost");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="lost_reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Why was this deal lost?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g. Lost to competitor, budget cut..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button
            type="submit"
            variant="destructive"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Confirm Lost"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function CloseDealDialog({
  open,
  onOpenChange,
  dealId,
  variant,
}: CloseDealDialogProps) {
  if (!dealId) return null;

  const isWon = variant === "won";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isWon ? "Close Deal as Won" : "Close Deal as Lost"}
          </DialogTitle>
          <DialogDescription>
            {isWon
              ? "Confirm the close date for this deal."
              : "Provide a reason for losing this deal."}
          </DialogDescription>
        </DialogHeader>

        {isWon ? (
          <CloseWonForm
            dealId={dealId}
            onSuccess={() => onOpenChange(false)}
          />
        ) : (
          <CloseLostForm
            dealId={dealId}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
