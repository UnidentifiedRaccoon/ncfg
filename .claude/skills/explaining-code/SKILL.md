---
name: explaining-code
description: Explains code with visual Mermaid/ASCII diagrams and analogies. Use when explaining how code works or mapping a codebase.
---

When explaining code, always include (in this order):

1. **Start with an analogy**: 1–2 sentences from everyday life.
2. **Draw a diagram**: Mermaid by default; ASCII only if ≤8 nodes/steps.
   - **Pick type**: flowchart (logic), sequenceDiagram (async), classDiagram (OOP), erDiagram (DB), stateDiagram-v2 (states), C4 (architecture).
   - **Keep it small**: 8–15 nodes max; if bigger → Overview + Zoom.
3. **Walk through the code**: Numbered “happy path” (inputs → steps → outputs).
4. **Highlight gotchas**: 3–7 bullets (errors, edge cases, state, async ordering, perf).

Also follow these rules:
- **Don’t invent symbols**: if unseen, write “not visible in snippet”.
- **Scope tightly**: diagram only what answers the question; mention what you skipped.
- **Be readable**: short sentences; define terms once on first use.
- If correctness depends on missing info, ask **one** clarifying question; otherwise proceed.
- Prefer accuracy over completeness.
