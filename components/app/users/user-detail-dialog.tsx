"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import { usePermissions } from "@/lib/hooks/use-permissions";
import type { MemberRole, OrgUser } from "@/lib/types/database";

const roleBadgeVariant: Record<MemberRole, "default" | "outline" | "secondary"> = {
  owner: "default",
  admin: "outline",
  member: "secondary",
};

interface UserDetailDialogProps {
  user: OrgUser | null;
  onClose: () => void;
}

export function UserDetailDialog({ user, onClose }: UserDetailDialogProps) {
  const { can } = usePermissions();

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {user && (
          <>
            <DialogHeader className="flex-row items-center gap-4 space-y-0">
              <Avatar size="lg">
                <AvatarImage
                  src={user.avatar_url ?? undefined}
                  alt={user.full_name ?? "User"}
                />
                <AvatarFallback>
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate">
                  {user.full_name ?? "Unnamed User"}
                </DialogTitle>
                <DialogDescription className="truncate">
                  {user.email ?? "No email"}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge variant={roleBadgeVariant[user.role]}>
                  {user.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Joined
                </span>
                <span className="text-sm">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!can("member:edit-role")}
                title={can("member:edit-role") ? undefined : "Only owners can edit roles"}
                className="flex-1"
              >
                Edit Role
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!can("member:remove")}
                title={can("member:remove") ? undefined : "You don't have permission to remove users"}
                className="flex-1"
              >
                Remove User
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
