"use client";

import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  createDealTask,
  toggleDealTask,
  deleteDealTask,
} from "@/lib/actions/deal-tasks";
import { dealTaskSchema, type DealTaskFormValues } from "@/lib/validations/deal";
import { zodResolverCompat } from "@/lib/validations/deal";
import { cn } from "@/lib/utils";
import type { DealTask } from "@/lib/types/database";

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface DealTasksProps {
  tasks: DealTask[];
  dealId: string;
  onMutationSuccess?: () => void;
}

export function DealTasks({ tasks, dealId, onMutationSuccess }: DealTasksProps) {
  const form = useForm<DealTaskFormValues>({
    resolver: zodResolverCompat(dealTaskSchema),
    defaultValues: {
      title: "",
      due_date: getTodayString(),
    },
  });

  async function onSubmit(values: DealTaskFormValues) {
    try {
      const result = await createDealTask(dealId, {
        title: values.title.trim(),
        due_date: values.due_date,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      form.reset({ title: "", due_date: getTodayString() });
      onMutationSuccess?.();
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleToggle(taskId: string, completed: boolean) {
    const result = await toggleDealTask(taskId, completed);
    if (!result.success) {
      toast.error(result.error);
    } else {
      onMutationSuccess?.();
    }
  }

  async function handleDelete(taskId: string) {
    const result = await deleteDealTask(taskId, dealId);
    if (!result.success) {
      toast.error(result.error);
    } else {
      onMutationSuccess?.();
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Tasks</CardTitle>
          {tasks.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {completedCount}/{tasks.length} done
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 rounded-md border px-3 py-2"
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) =>
                handleToggle(task.id, checked === true)
              }
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm",
                  task.completed && "text-muted-foreground line-through"
                )}
              >
                {task.title}
              </p>
              {task.due_date && (
                <p className="text-xs text-muted-foreground">
                  Due{" "}
                  {new Date(task.due_date + "T00:00:00").toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => handleDelete(task.id)}
            >
              <Trash2 className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        ))}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-start gap-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Add a task..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="date"
                      className="w-[140px]"
                      min={getTodayString()}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="sm"
              disabled={form.formState.isSubmitting}
            >
              <Plus className="mr-1 size-3.5" />
              Add
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
