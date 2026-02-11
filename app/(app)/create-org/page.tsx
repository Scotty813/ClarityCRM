import { CreateOrgForm } from "@/components/app/create-org-form";

export default function CreateOrgPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Create a new organization
      </h1>
      <p className="mt-2 text-muted-foreground">
        Set up an additional workspace for a different team or project.
      </p>
      <div className="mt-8">
        <CreateOrgForm />
      </div>
    </div>
  );
}
