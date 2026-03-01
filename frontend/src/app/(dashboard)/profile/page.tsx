"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Mail, LogOut, Pencil, Check, X, Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api-client";
import { logoutAction } from "@/actions/auth";
import type { User as UserType } from "@/types";

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiClient
      .fetch<{ user: UserType }>("/auth/me")
      .then((res) => setUser(res.user))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  function handleStartEdit() {
    setEditName(user?.name || "");
    setIsEditingName(true);
  }

  function handleCancelEdit() {
    setIsEditingName(false);
    setEditName("");
  }

  async function handleSaveName() {
    if (!editName.trim() || editName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiClient.fetch<{ user: UserType }>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name: editName.trim() }),
      });
      setUser(res.user);
      setIsEditingName(false);
      toast.success("Name updated");
    } catch {
      toast.error("Failed to update name");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    toast.success("Logged out successfully");
    await logoutAction();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full max-w-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-md border-border bg-card p-6 space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal/10 text-teal text-xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground shrink-0">Name:</span>
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  disabled={isSaving}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-emerald-500 hover:text-emerald-400"
                  onClick={handleSaveName}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-red-400 hover:text-red-300"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{user?.name}</span>
                <button
                  onClick={handleStartEdit}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span>{user?.email}</span>
          </div>
        </div>

        <Separator className="bg-border" />

        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full border-border"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
