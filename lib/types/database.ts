import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface UserOrganization {
  id: string;
  name: string;
  role: Database["public"]["Tables"]["organization_members"]["Row"]["role"];
}
