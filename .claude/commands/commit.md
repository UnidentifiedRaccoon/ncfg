Create a git commit for the current changes.

## Process

1. Run `git status` to see all changed files.
2. Run `git diff` to understand what changed (staged and unstaged).
3. Analyze the changes and determine the commit type:
   - `feat`: new feature or functionality
   - `fix`: bug fix
   - `refactor`: code restructuring without behavior change
   - `style`: formatting, whitespace, missing semicolons
   - `docs`: documentation changes
   - `test`: adding or updating tests
   - `chore`: maintenance, dependencies, build config

4. Write a commit message following conventional commits:
   ```
   <type>(<scope>): <short description>

   <optional body with more details>
   ```

5. Rules for the message:
   - Subject line: max 50 characters, imperative mood ("add" not "added")
   - Scope: optional, indicates area (e.g., `feat(auth):`, `fix(api):`)
   - Body: wrap at 72 characters, explain "what" and "why"
   - Language: English

6. Stage appropriate files with `git add`.
7. Create the commit.
8. Show the result with `git log -1`.

## Safety

- Do NOT commit files that look like secrets (.env, credentials, tokens)
- Do NOT push unless explicitly asked
- If unsure about what to include, ask the user

## Examples

```
feat(hero): add animated gradient background

fix(api): handle null response from Strapi

refactor: extract common button styles to shared component

docs: update README with local dev instructions
```
