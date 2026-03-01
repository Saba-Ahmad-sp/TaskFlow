"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from "@/lib/constants";
import { toggleTaskAction } from "@/actions/tasks";
import { TaskFormDialog } from "./task-form-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: () => toggleTaskAction(task.id),
    onSuccess: (result) => {
      if (result.success) {
        const newStatus = result.task!.status;
        toast.success(
          newStatus === "COMPLETED" ? "Task completed" : "Task reopened"
        );
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else {
        toast.error(result.error);
      }
    },
  });

  const isCompleted = task.status === "COMPLETED";

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formattedStartDate = task.startDate ? formatDate(task.startDate) : null;
  const formattedEndDate = task.endDate ? formatDate(task.endDate) : null;

  const isOverdue =
    task.endDate && !isCompleted && new Date(task.endDate) < new Date();

  return (
    <>
      <Card className="group border-border bg-card p-4 transition-colors hover:bg-white/[0.04]">
        <div className="flex items-start gap-3">
          {/* Toggle button */}
          <button
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-teal"
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`font-medium leading-snug ${
                  isCompleted
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {task.title}
              </h3>

              {/* Actions menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEdit(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDelete(true)}
                    className="text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Meta info */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${STATUS_COLORS[task.status]}`}
              >
                {STATUS_LABELS[task.status]}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${PRIORITY_COLORS[task.priority]}`}
              >
                {PRIORITY_LABELS[task.priority]}
              </Badge>
              {isOverdue && (
                <Badge
                  variant="outline"
                  className="text-xs bg-red-500/10 text-red-400 border-red-500/20"
                >
                  Overdue
                </Badge>
              )}
              {(formattedStartDate || formattedEndDate) && (
                <span
                  className={`flex items-center gap-1 text-xs ${
                    isOverdue ? "text-red-400" : "text-muted-foreground"
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  {formattedStartDate && formattedEndDate
                    ? `${formattedStartDate} — ${formattedEndDate}`
                    : formattedStartDate
                      ? `Starts ${formattedStartDate}`
                      : `Due ${formattedEndDate}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <TaskFormDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        mode="edit"
        task={task}
      />

      <DeleteTaskDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        taskId={task.id}
        taskTitle={task.title}
      />
    </>
  );
}
