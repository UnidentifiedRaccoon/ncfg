# HR Diagnostic Test

`hr-diagnostic-test` stores the editable HR questionnaire content for `/diagnostika/hr`.

Key stability rules:

- Editors may change labels, titles, descriptions, order, CTA copy, and intro/completion text.
- Editors should not change existing `key` values after launch.
- If questions or options materially change, create a new `version` and make only that version active.
- Submissions store answer snapshots, but segmentation and CSV mapping depend on stable question and option keys.
- Keep only one active entry for `slug=hr`.
