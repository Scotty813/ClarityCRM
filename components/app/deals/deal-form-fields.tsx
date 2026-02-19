"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEAL_STAGES, STAGE_LABELS } from "@/lib/deals";
import type { DealFormData } from "@/lib/types/database";

interface SelectOption {
  id: string;
  name: string;
}

interface DealFormFieldsProps {
  form: DealFormData;
  onChange: (field: keyof DealFormData, value: string) => void;
  contacts: SelectOption[];
  companies: SelectOption[];
  members: SelectOption[];
  hideOwner?: boolean;
}

export function DealFormFields({
  form,
  onChange,
  contacts,
  companies,
  members,
  hideOwner,
}: DealFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="deal-name">Deal name</Label>
        <Input
          id="deal-name"
          placeholder="Enterprise License — Acme Corp"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deal-value">Value</Label>
          <Input
            id="deal-value"
            type="number"
            min="0"
            step="0.01"
            placeholder="10000"
            value={form.value}
            onChange={(e) => onChange("value", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deal-stage">Stage</Label>
          <Select
            value={form.stage}
            onValueChange={(v) => onChange("stage", v)}
          >
            <SelectTrigger id="deal-stage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEAL_STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STAGE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={hideOwner ? "" : "grid grid-cols-2 gap-4"}>
        <div className="space-y-2">
          <Label htmlFor="deal-close-date">Expected close date</Label>
          <Input
            id="deal-close-date"
            type="date"
            value={form.expected_close_date}
            onChange={(e) => onChange("expected_close_date", e.target.value)}
          />
        </div>
        {!hideOwner && (
          <div className="space-y-2">
            <Label htmlFor="deal-owner">Owner</Label>
            <Select
              value={form.owner_id || "none"}
              onValueChange={(v) => onChange("owner_id", v === "none" ? "" : v)}
            >
              <SelectTrigger id="deal-owner">
                <SelectValue placeholder="Assign owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No owner</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deal-contact">Contact</Label>
          <Select
            value={form.contact_id || "none"}
            onValueChange={(v) => onChange("contact_id", v === "none" ? "" : v)}
          >
            <SelectTrigger id="deal-contact">
              <SelectValue placeholder="Link contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No contact</SelectItem>
              {contacts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deal-company">Company</Label>
          <Select
            value={form.company_id || "none"}
            onValueChange={(v) => onChange("company_id", v === "none" ? "" : v)}
          >
            <SelectTrigger id="deal-company">
              <SelectValue placeholder="Link company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No company</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deal-notes">Notes</Label>
        <Textarea
          id="deal-notes"
          placeholder="Any additional notes..."
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
