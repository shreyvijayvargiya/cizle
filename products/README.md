# products/

cizle keeps what it knows about each SaaS product here, as plain markdown. One folder per product:

```
products/<slug>/
├── product.md     what the product is: positioning, features, pricing, tone (edit freely)
├── changes.md     what shipped since each sync, newest first
├── ideas.md       video ideas: suggested → created / dismissed
├── sources.json   sync state (last commit per repo, page hashes)
└── assets/        screenshots kept at onboarding
```

Everything except `example/` is git-ignored, so your product notes stay on your machine.
Add a product from the dashboard (sidebar → product menu → Add product) and cizle writes these files for you.
