import {
  Contact,
  BarChart3,
  LineChart,
  Mail,
  Zap,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
};

export const navLinks: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const features: Feature[] = [
  {
    title: "Contact Management",
    description:
      "Organize and track every customer interaction in one place. Smart tagging, custom fields, and instant search make finding anyone effortless.",
    icon: Contact,
  },
  {
    title: "Pipeline Tracking",
    description:
      "Visualize your sales pipeline from lead to close. Drag-and-drop deals between stages and never lose sight of revenue targets.",
    icon: BarChart3,
  },
  {
    title: "Analytics",
    description:
      "Real-time dashboards and reports that turn raw data into actionable insights. Know exactly where your business stands at a glance.",
    icon: LineChart,
  },
  {
    title: "Email Integration",
    description:
      "Sync your inbox directly with ClarityCRM. Log emails, schedule follow-ups, and use templates — all without leaving the CRM.",
    icon: Mail,
  },
  {
    title: "Task Automation",
    description:
      "Automate repetitive workflows with simple rules. From lead assignment to follow-up reminders, let ClarityCRM handle the busywork.",
    icon: Zap,
  },
  {
    title: "Team Collaboration",
    description:
      "Share notes, assign tasks, and keep your entire team aligned. Role-based permissions ensure everyone sees exactly what they need.",
    icon: Users,
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  avatarFallback: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "ClarityCRM replaced three tools for us overnight. Our sales team onboarded in under an hour and closed 20% more deals in the first quarter.",
    name: "Sarah Chen",
    role: "VP of Sales",
    company: "Luminary Tech",
    avatarFallback: "SC",
    rating: 5,
  },
  {
    quote:
      "The pipeline view is exactly what we needed. We went from spreadsheet chaos to a clear, visual process that the whole team actually uses.",
    name: "Marcus Rivera",
    role: "Founder & CEO",
    company: "BrightPath Agency",
    avatarFallback: "MR",
    rating: 5,
  },
  {
    quote:
      "We evaluated a dozen CRMs and ClarityCRM was the only one that didn't require a consultant to set up. Clean, fast, and genuinely intuitive.",
    name: "Aisha Patel",
    role: "Head of Operations",
    company: "Vertex Solutions",
    avatarFallback: "AP",
    rating: 5,
  },
];

export type FooterSection = {
  title: string;
  links: { label: string; href: string }[];
};

export const footerSections: FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Integrations", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "Community", href: "#" },
      { label: "API Reference", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "GDPR", href: "#" },
    ],
  },
];
