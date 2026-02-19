"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createDealTask,
  toggleDealTask,
  deleteDealTask,
} from "@/lib/actions/deal-tasks";
import { cn } from "@/lib/utils";
import type { DealTask } from "@/lib/types/database";

interface DealTasksProps {
  tasks: DealTask[];
  dealId: string;
}

export function DealTasks({ tasks, dealId }: DealTasksProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setAdding(true);
    try {
      const result = await createDealTask(dealId, {
        title: title.trim(),
        due_date: dueDate,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setTitle("");
      setDueDate("");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(taskId: string, completed: boolean) {
    const result = await toggleDealTask(taskId, completed);
    if (!result.success) {
      toast.error(result.error);
    }
  }

  async function handleDelete(taskId: string) {
    const result = await deleteDealTask(taskId, dealId);
    if (!result.success) {
      toast.error(result.error);
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
            <div className="flex-1 min-w-0">
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

        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <Input
            placeholder="Add a task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-[140px]"
          />
          <Button type="submit" size="sm" disabled={adding || !title.trim()}>
            <Plus className="mr-1 size-3.5" />
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
