# SILAPOR-SAMPAH Development Guidelines (Ponytail Enforced)

This project strictly adheres to **Ponytail (Ultra Mode)** principles for all development work.

## Guiding Principles
- **Minimalist & Clean**: Avoid premature abstractions, redundant wrappers, or unused utility functions.
- **Next.js & Supabase Native First**:
  - Prefer Next.js App Router built-in features (Server Components, Server Actions) over bloated client state stores.
  - Rely on Supabase native PostgreSQL features (RLS, generated columns, triggers, constraints) rather than heavy custom backend logic.
- **Shortest Working Diff**: Make direct, precise edits. Delete dead code instead of commenting it out.
- **Explain Less, Deliver More**: Present working code immediately. Keep explanatory text under 3 concise lines unless detailed documentation is explicitly requested.
