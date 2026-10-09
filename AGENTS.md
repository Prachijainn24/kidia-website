# AGENTS.md
- Catalogue lives in src/data/catalog.ts as sample data until phase 2 moves it to Lovable Cloud; keep UI reading through its helpers so the swap is local.
- Cart lines are keyed by product+size+colour and capped by per-size stock; never add without a selected size and colour.
- Shop filters/sort/search are URL query params so collection links and age links are shareable.
- Keep the homepage New Arrivals editorial and product grid in its own component so its presentation stays isolated from other homepage sections.
- Give homepage editorial sections independent compositions while reusing shopping controls, so visual variety does not duplicate cart or catalogue logic.
- Centralize account state in the auth provider and validate users with getUser; profile access is enforced by ownership policies, not browser state.
- Auto-create customer profiles with an auth lifecycle trigger so email and social registrations share the same profile flow.
