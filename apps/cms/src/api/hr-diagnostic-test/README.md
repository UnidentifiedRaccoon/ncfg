# HR Diagnostic Test

`hr-diagnostic-test` stores the editable HR questionnaire content for `/diagnostika/hr`.
There should be one production entry with `slug=hr`; the HR questionnaire is not versioned.

Key stability rules:

- Editors may change labels, titles, descriptions, item order in repeatable lists, CTA copy, and intro/completion text.
- Editors should not change existing `key` values after launch.
- Submissions store answer snapshots, but segmentation and CSV mapping depend on stable question and option keys.
- Keep only one entry for `slug=hr`.
