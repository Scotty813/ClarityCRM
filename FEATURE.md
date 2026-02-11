# Description
I need to augment the onboarding path. Once a user successfully authenticates, they need to create an organization.

1. Account created → “Welcome” + choose a path

Screen: “What are you here to do?”
	•	Track leads
	•	Manage customers
	•	Manage deals/pipeline
	•	Just exploring

This lets you tailor defaults (pipeline stages, sample data, tips) without asking for a bunch of info.

2. Organization creation (minimal)

Goal: establish tenancy + permissions, but keep it lightweight.

Form fields (suggested minimal):
	•	Organization name (required)
	•	Team size (optional, helps suggestions)
	•	Industry (optional)
	•	Invite teammates (optional, skippable - leave as a TODO)

If the user is solo, they can skip invites and still land in the product.

3. First “aha” setup (guided, but skippable)

Screen: “Let’s set you up in 60 seconds”
	•	Add first contact (or import)
	•	Create first pipeline (or use a template)
	•	Connect email/calendar (optional, “do later”)

4. Land in the app with a guided empty state

Dashboard should immediately show:
	•	A primary CTA: “Add a lead” / “Import contacts”
	•	A checklist (3–5 steps) with progress
	•	Option to add sample data (great for evaluation)