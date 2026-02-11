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
import { UserDetailDialog } from "./user-detail-dialog";
import type { MemberRole, OrgMember } from "@/lib/types/database";

const roleBadgeVariant: Record<MemberRole, "default" | "outline" | "secondary"> = {
  owner: "default",
  admin: "outline",
  member: "secondary",
};

interface UsersTableProps {
  members: OrgMember[];
  orgName: string;
}

export function UsersTable({ members, orgName }: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);

  const query = search.toLowerCase();
  const filtered = members.filter(
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
            <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
            <p className="text-sm text-muted-foreground">
              {members.length} {members.length === 1 ? "user" : "users"} in{" "}
              {orgName}
            </p>
          </div>
          <Button disabled title="Coming soon">
            <UserPlus className="mr-1.5 size-4" />
            Invite User
          </Button>
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
                {filtered.map((member) => (
                  <TableRow
                    key={member.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedMember(member)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="default">
                          <AvatarImage
                            src={member.avatar_url ?? undefined}
                            alt={member.full_name ?? "User"}
                          />
                          <AvatarFallback>
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {member.full_name ?? "Unnamed User"}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {member.email ?? "No email"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant[member.role]}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(member.created_at).toLocaleDateString(
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
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
}
