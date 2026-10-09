# AGENTS.md
- Catalogue lives in src/data/catalog.ts as sample data until phase 2 moves it to Lovable Cloud; keep UI reading through its helpers so the swap is local.
- Cart lines are keyed by product+size+colour and capped by per-size stock; never add without a selected size and colour.
- Shop filters/sort/search are URL query params so collection links and age links are shareable.
- Keep the homepage New Arrivals editorial and product grid in its own component so its presentation stays isolated from other homepage sections.
