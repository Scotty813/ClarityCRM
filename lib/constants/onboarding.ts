import { Target, Users, BarChart3, Compass } from "lucide-react";

export const pathOptions = [
  {
    value: "leads" as const,
    label: "Track leads",
    description: "Capture and nurture potential customers from first contact to conversion.",
    icon: Target,
  },
  {
    value: "customers" as const,
    label: "Manage customers",
    description: "Keep track of your existing customers, interactions, and account details.",
    icon: Users,
  },
  {
    value: "pipeline" as const,
    label: "Manage deals",
    description: "Visualize your sales pipeline and move deals through every stage.",
    icon: BarChart3,
  },
  {
    value: "exploring" as const,
    label: "Just exploring",
    description: "Take a look around and see what ClarityCRM can do for your team.",
    icon: Compass,
  },
] as const;

export type SelectedPath = (typeof pathOptions)[number]["value"];

export const teamSizeOptions = [
  "Just me",
  "2–5",
  "6–20",
  "21–50",
  "51–200",
  "200+",
] as const;

export const industryOptions = [
  "Technology",
  "Healthcare",
  "Finance",
  "Real Estate",
  "Marketing / Agency",
  "Consulting",
  "E-commerce",
  "Education",
  "Non-profit",
  "Other",
] as const;

export const onboardingSteps = [
  { step: 1, label: "Your goal" },
  { step: 2, label: "Workspace" },
  { step: 3, label: "Setup" },
  { step: 4, label: "Dashboard" },
] as const;
