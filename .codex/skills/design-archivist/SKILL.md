---
name: design-archivist
description: Large-sample design research and pattern mining (300-1000 examples): collect real-world references, extract visual DNA (color, type, layout, interactions), checkpoint progress, and synthesize dominant/emerging patterns with recommendations. Use for competitive visual research and design language discovery.
---

# Design Archivist

## Inputs I Need

- Domain and audience (e.g., fintech for Gen Z, B2B SaaS for CTOs)
- Target sample size (default: 300; up to 1000 for broad domains)
- Sources allowed (search queries, seed brands, directories)
- Output depth: quick pattern report vs full database
- Time/cost constraints and any rate-limit requirements

## Outputs I Will Produce

- A structured archive (JSON) containing:
  - meta (domain, count, date range, method)
  - examples (url + notes + extracted signals)
  - patterns (dominant, emerging, deprecated, outliers)
  - insights (color/type/layout/interaction/technical)
  - recommendations (safe choices, differentiators, avoid)
- A short executive summary (what to copy, what to avoid, where to differentiate)
- Checkpoints every 10 examples (progress you can resume)

## Workflow

1. Define scope and success criteria (what decisions this research must enable).
2. Build the seed set (brands, categories, search queries).
3. Crawl/analyze in batches of 10:
   - capture snapshot/notes
   - extract visual DNA fields
   - tag and classify
   - write a checkpoint
4. After enough examples:
   - cluster patterns and count prevalence
   - separate dominant vs emerging vs deprecated vs outliers
5. Produce recommendations tied to the user's positioning goals.
6. Validate the final archive with `scripts/validate_archive.sh`.

## Quality Bar

- Sample is diverse (leaders + mid-tier + geo diversity).
- Checkpoints exist and are consistent (resume-friendly).
- Patterns are backed by counts/examples, not vibes.
- Recommendations include actionable do/don't guidance.

## References

| File | Use when |
| --- | --- |
| `references/data_structures.md` | Need the exact JSON/TS structures for the archive |
| `references/domain_guides.md` | Need domain-specific seed strategies and focus areas |
