"use client";

import { useState, useCallback } from "react";
import {
  Globe,
  Factory,
  Phone,
  MapPin,
  Users,
  DollarSign,
  Briefcase,
  Clock,
  FileText,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InlineEditField } from "@/components/app/shared/inline-edit-field";
import { EntityPicker } from "@/components/app/shared/entity-picker";
import {
  LIFECYCLE_STAGES,
  LIFECYCLE_LABELS,
  LIFECYCLE_BADGE_COLORS,
  TAG_COLOR_CLASSES,
  type TagColor,
} from "@/lib/companies";
import { formatCompactCurrency, formatCurrency, formatRelativeTime } from "@/lib/format";
import { updateCompanyField } from "@/lib/actions/companies";
import { createTag, addCompanyTag, removeCompanyTag } from "@/lib/actions/tags";
import { cn } from "@/lib/utils";
import type {
  CompanyWithRelations,
  CompanyUpdatableField,
  SelectOption,
} from "@/lib/types/database";

interface CompanyOverviewTabProps {
  company: CompanyWithRelations;
  fieldOptions: {
    members: SelectOption[];
    tags: { id: string; name: string; color: string }[];
  };
  onMutationSuccess: () => void;
}

export function CompanyOverviewTab({
  company,
  fieldOptions,
  onMutationSuccess,
}: CompanyOverviewTabProps) {
  const [newTagName, setNewTagName] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  const handleFieldUpdate = useCallback(
    async (field: CompanyUpdatableField, value: string | null) => {
      const result = await updateCompanyField(company.id, field, value);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update field");
      } else {
        onMutationSuccess();
      }
    },
    [company.id, onMutationSuccess]
  );

  const handleOwnerUpdate = useCallback(
    async (option: SelectOption | null) => {
      await handleFieldUpdate("owner_id", option?.id ?? null);
    },
    [handleFieldUpdate]
  );

  const handleLifecycleChange = useCallback(
    async (stage: string) => {
      await handleFieldUpdate("lifecycle_stage", stage);
    },
    [handleFieldUpdate]
  );

  const handleAddTag = useCallback(
    async (tagId: string) => {
      const result = await addCompanyTag(company.id, tagId);
      if (!result.success) {
        toast.error(result.error ?? "Failed to add tag");
      } else {
        onMutationSuccess();
      }
    },
    [company.id, onMutationSuccess]
  );

  const handleRemoveTag = useCallback(
    async (tagId: string) => {
      const result = await removeCompanyTag(company.id, tagId);
      if (!result.success) {
        toast.error(result.error ?? "Failed to remove tag");
      } else {
        onMutationSuccess();
      }
    },
    [company.id, onMutationSuccess]
  );

  const handleCreateTag = useCallback(async () => {
    const name = newTagName.trim();
    if (!name) return;
    const result = await createTag(name);
    if (result.success) {
      setNewTagName("");
      setShowTagInput(false);
      await addCompanyTag(company.id, result.tag.id);
      onMutationSuccess();
    } else {
      toast.error(result.error ?? "Failed to create tag");
    }
  }, [newTagName, company.id, onMutationSuccess]);

  const address = [
    company.address_line1,
    company.address_line2,
    company.city,
    company.state,
    company.postal_code,
    company.country,
  ]
    .filter(Boolean)
    .join(", ");

  // Tags not yet assigned to this company
  const availableTags = fieldOptions.tags.filter(
    (t) => !company.tags.some((ct) => ct.id === t.id)
  );

  return (
    <div className="space-y-6 px-6 py-4">
      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border p-3">
          <DollarSign className="mb-1 size-4 text-muted-foreground" />
          <p className="text-lg font-semibold tabular-nums">
            {formatCompactCurrency(company.pipeline_value || null)}
          </p>
          <p className="text-[11px] text-muted-foreground">Pipeline</p>
        </div>
        <div className="rounded-lg border p-3">
          <Briefcase className="mb-1 size-4 text-muted-foreground" />
          <p className="text-lg font-semibold tabular-nums">
            {company.open_deals_count}
          </p>
          <p className="text-[11px] text-muted-foreground">Active deals</p>
        </div>
        <div className="rounded-lg border p-3">
          <Users className="mb-1 size-4 text-muted-foreground" />
          <p className="text-lg font-semibold tabular-nums">
            {company.contact_count}
          </p>
          <p className="text-[11px] text-muted-foreground">Contacts</p>
        </div>
        <div className="rounded-lg border p-3">
          <Clock className="mb-1 size-4 text-muted-foreground" />
          <p className="text-lg font-semibold tabular-nums">
            {formatRelativeTime(company.last_activity_at)}
          </p>
          <p className="text-[11px] text-muted-foreground">Last touch</p>
        </div>
      </div>

      <Separator />

      {/* Editable fields */}
      <div className="space-y-4">
        <InlineEditField
          icon={Globe}
          label="Website"
          value={company.domain}
          placeholder="Add website"
          type="text"
          onSave={(val) => handleFieldUpdate("domain", val)}
        />
        <InlineEditField
          icon={Factory}
          label="Industry"
          value={company.industry}
          placeholder="Add industry"
          type="text"
          onSave={(val) => handleFieldUpdate("industry", val)}
        />
        <InlineEditField
          icon={Phone}
          label="Phone"
          value={company.phone}
          placeholder="Add phone"
          type="text"
          onSave={(val) => handleFieldUpdate("phone", val)}
        />
        <EntityPicker
          icon={Users}
          label="Owner"
          value={company.owner_name}
          placeholder="Assign owner..."
          options={fieldOptions.members}
          onSelect={handleOwnerUpdate}
        />
      </div>

      <Separator />

      {/* Lifecycle stage */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Lifecycle Stage
        </p>
        <Select
          value={company.lifecycle_stage}
          onValueChange={handleLifecycleChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIFECYCLE_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {LIFECYCLE_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Tags */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Tags</p>
        <div className="flex flex-wrap gap-1.5">
          {company.tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className={cn(
                "gap-1 text-xs",
                TAG_COLOR_CLASSES[tag.color as TagColor] ??
                  TAG_COLOR_CLASSES.gray
              )}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {showTagInput ? (
            <div className="flex items-center gap-1">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name"
                className="h-6 w-24 px-1.5 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateTag();
                  if (e.key === "Escape") {
                    setShowTagInput(false);
                    setNewTagName("");
                  }
                }}
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Select
                value=""
                onValueChange={(tagId) => handleAddTag(tagId)}
              >
                <SelectTrigger className="h-6 w-auto gap-1 border-dashed px-2 text-xs">
                  <Plus className="size-3" />
                  Add
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {availableTags.length > 0 ? (
                    availableTags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))
                  ) : (
                    <p className="px-2 py-1.5 text-xs text-muted-foreground">
                      No more tags
                    </p>
                  )}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setShowTagInput(true)}
              >
                <Plus className="mr-1 size-3" />
                New
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      {address && (
        <>
          <Separator />
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="text-sm">{address}</p>
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      {company.notes && (
        <>
          <Separator />
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {company.notes}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
