"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getInitials } from "@/lib/utils";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { updateMember } from "@/lib/actions/members";
import { zodResolverCompat } from "@/lib/validations/resolver";
import {
  editMemberSchema,
  type EditMemberFormValues,
} from "@/lib/validations/member";
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
  const router = useRouter();
  const canEdit = can("member:edit");
  const canEditRole = can("member:edit-role");

  const form = useForm<EditMemberFormValues>({
    resolver: zodResolverCompat(editMemberSchema),
    defaultValues: {
      organization_user_id: "",
      first_name: "",
      last_name: "",
      role: "member",
    },
  });

  // Reset form when a different user is selected
  useEffect(() => {
    if (user) {
      form.reset({
        organization_user_id: user.id,
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        role: user.role,
      });
    }
  }, [user, form]);

  async function onSubmit(values: EditMemberFormValues) {
    try {
      const result = await updateMember(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Member updated successfully");
      router.refresh();
      onClose();
    } catch {
      toast.error("Something went wrong");
    }
  }

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

            {canEdit ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Jane" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!canEditRole}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            {canEditRole && (
                              <SelectItem value="owner">Owner</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {!canEditRole && (
                          <p className="text-xs text-muted-foreground">
                            Only owners can change roles
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Joined</span>
                    <span className="text-sm">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <Separator />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!form.formState.isDirty || form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            ) : (
              <>
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

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!can("member:remove")}
                  title={can("member:remove") ? undefined : "You don't have permission to remove users"}
                  className="w-full"
                >
                  Remove User
                </Button>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
