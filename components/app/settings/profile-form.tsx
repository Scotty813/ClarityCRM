"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolverCompat } from "@/lib/validations/resolver";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile";
import { updateProfile } from "@/lib/actions/profiles";

interface ProfileFormProps {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

function getInitials(firstName: string, lastName: string) {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName.charAt(0).toUpperCase();
  return first + last || first || "?";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function ProfileForm({
  firstName,
  lastName,
  email,
  avatarUrl,
  createdAt,
}: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolverCompat(profileFormSchema),
    defaultValues: {
      first_name: firstName,
      last_name: lastName,
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    const result = await updateProfile(values);

    if (result.success) {
      toast.success("Profile updated");
      form.reset(values);
    } else {
      toast.error(result.error ?? "Failed to update profile");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-8">
            <Avatar className="size-16 text-lg">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile photo" />}
              <AvatarFallback>
                {getInitials(
                  form.watch("first_name"),
                  form.watch("last_name"),
                )}
              </AvatarFallback>
            </Avatar>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex-1 space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          First name{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
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

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      !form.formState.isDirty || form.formState.isSubmitting
                    }
                  >
                    {form.formState.isSubmitting ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4 text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{email}</dd>
            <dt className="text-muted-foreground">Member since</dt>
            <dd>{formatDate(createdAt)}</dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
