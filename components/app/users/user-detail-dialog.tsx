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
import type { MemberRole, OrgMember } from "@/lib/types/database";

const roleBadgeVariant: Record<MemberRole, "default" | "outline" | "secondary"> = {
  owner: "default",
  admin: "outline",
  member: "secondary",
};

interface UserDetailDialogProps {
  member: OrgMember | null;
  onClose: () => void;
}

export function UserDetailDialog({ member, onClose }: UserDetailDialogProps) {
  return (
    <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {member && (
          <>
            <DialogHeader className="flex-row items-center gap-4 space-y-0">
              <Avatar size="lg">
                <AvatarImage
                  src={member.avatar_url ?? undefined}
                  alt={member.full_name ?? "User"}
                />
                <AvatarFallback>
                  {getInitials(member.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate">
                  {member.full_name ?? "Unnamed User"}
                </DialogTitle>
                <DialogDescription className="truncate">
                  {member.email ?? "No email"}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge variant={roleBadgeVariant[member.role]}>
                  {member.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Joined
                </span>
                <span className="text-sm">
                  {new Date(member.created_at).toLocaleDateString("en-US", {
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
                disabled
                title="Coming soon"
                className="flex-1"
              >
                Edit Role
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled
                title="Coming soon"
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
