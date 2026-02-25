"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { removeMember, removeMembers } from "@/lib/actions/members";
import { useRowSelection } from "@/lib/hooks/use-row-selection";
import { BulkActionBar } from "@/components/app/shared/bulk-action-bar";
import { UserDetailDialog } from "./user-detail-dialog";
import { InviteUserDialog } from "./invite-user-dialog";
import type { MemberRole, OrgUser } from "@/lib/types/database";

const roleBadgeVariant: Record<MemberRole, "default" | "outline" | "secondary"> = {
  owner: "default",
  admin: "outline",
  member: "secondary",
};

interface UsersTableProps {
  users: OrgUser[];
  orgName: string;
}

export function UsersTable({ users, orgName }: UsersTableProps) {
  const { can } = usePermissions();
  const canRemove = can("member:remove");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<OrgUser | null>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleRemove(e: React.MouseEvent, user: OrgUser) {
    e.stopPropagation();
    if (!confirm(`Remove "${user.full_name ?? "this member"}" from the organization? This cannot be undone.`)) return;

    const result = await removeMember(user.id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Member removed");
    }
  }

  const query = search.toLowerCase();
  const filtered = users.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(query) ||
      m.email?.toLowerCase().includes(query)
  );

  const filteredIds = useMemo(() => filtered.map((u) => u.id), [filtered]);
  const selection = useRowSelection(filteredIds);

  async function handleBulkRemove() {
    if (!confirm(`Remove ${selection.count} member${selection.count === 1 ? "" : "s"} from the organization? This cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const result = await removeMembers(selection.selectedIds);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(`${result.deleted} member${result.deleted === 1 ? "" : "s"} removed`);
        selection.clear();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Team members</h1>
            <p className="text-sm text-muted-foreground">
              {users.length} {users.length === 1 ? "member" : "members"} in{" "}
              {orgName}
            </p>
          </div>
          {can("member:invite") && (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-1.5 size-4" />
              Invite User
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <p className="text-sm text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {canRemove && (
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selection.isAllSelected ? true : selection.isSomeSelected ? "indeterminate" : false}
                        onCheckedChange={() => selection.toggleAll()}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedUser(user);
                      setUserDetailOpen(true);
                    }}
                  >
                    {canRemove && (
                      <TableCell>
                        <Checkbox
                          checked={selection.selectedIds.includes(user.id)}
                          onCheckedChange={() => selection.toggle(user.id)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select ${user.full_name ?? "member"}`}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="default">
                          <AvatarImage
                            src={user.avatar_url ?? undefined}
                            alt={user.full_name ?? "User"}
                          />
                          <AvatarFallback>
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {user.full_name ?? "Unnamed User"}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {user.email ?? "No email"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant[user.role]}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </TableCell>
                    <TableCell>
                      {(can("member:edit") || can("member:remove")) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {can("member:edit") && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(user);
                                  setUserDetailOpen(true);
                                }}
                              >
                                <Pencil className="mr-2 size-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {can("member:remove") && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => handleRemove(e, user)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Remove
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <UserDetailDialog
        open={userDetailOpen}
        onOpenChange={setUserDetailOpen}
        user={selectedUser}
      />

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      {canRemove && (
        <BulkActionBar
          count={selection.count}
          onDelete={handleBulkRemove}
          onClear={selection.clear}
          isDeleting={isDeleting}
          entityName="member"
        />
      )}
    </>
  );
}
