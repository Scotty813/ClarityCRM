"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { getInitials } from "@/lib/utils";
import { usePermissions } from "@/lib/hooks/use-permissions";
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
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<OrgUser | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const query = search.toLowerCase();
  const filtered = users.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(query) ||
      m.email?.toLowerCase().includes(query)
  );

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
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedUser(user)}
                  >
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <UserDetailDialog
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
}
