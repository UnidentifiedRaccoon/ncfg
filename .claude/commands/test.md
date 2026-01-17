Run tests for the project.

## Process

1. Check `package.json` in the relevant app directory to find the test command.
2. Identify the test runner (vitest, jest, playwright, etc.).
3. Run the tests:
   - For unit/integration: `pnpm test` or `pnpm run test`
   - For specific file: `pnpm test <path>`
   - For watch mode: `pnpm test:watch` (if available)

4. Analyze the output:
   - If all tests pass: report success with summary
   - If tests fail:
     - List failing tests with file paths
     - Show the error messages
     - Ask if I should attempt to fix them

5. If no tests exist yet:
   - Report that no tests were found
   - Suggest creating tests for critical functionality

## Common commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test src/lib/utils.test.ts

# Run tests with coverage
pnpm test:coverage
```

## Notes

- Run tests from the correct directory (apps/web or apps/cms)
- Check for test configuration files (vitest.config.ts, jest.config.js)
- Look for existing test patterns in the codebase before writing new tests
