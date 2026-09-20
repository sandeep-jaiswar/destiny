# Contributing to Destiny

Thanks for your interest in contributing! This guide outlines the process for developing, testing, and submitting changes.

## Getting Started

1. **Clone the repository** and install dependencies:
   ```bash
   git clone https://github.com/sandeep-jaiswar/destiny.git
   cd destiny
   npm install
   ```

2. **Bootstrap local development**:
   ```bash
   make dev-up    # Start Floci S3 emulator
   make ingest    # Ingest sample data
   make dev       # Start the terminal UI
   ```

3. **Make your changes** in a feature branch:
   ```bash
   git checkout -b feat/my-feature
   ```

## Code Style

- **TypeScript/React**: Run `npm run format` to auto-format code
- **Python**: Follow PEP 8; use `black` for formatting (included in service environments)
- **Commit messages**: Follow [Conventional Commits](./COMMIT_CONVENTION.md)

## Commit Messages

This project uses [commitlint](https://commitlint.js.org/) to enforce consistent commit messages. The format is:

```
<type>(<optional scope>): <description>

<optional body>

<optional footer>
```

**Type** must be one of:
- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation
- `style` — formatting/whitespace
- `refactor` — code refactoring
- `perf` — performance improvement
- `test` — test changes
- `ci` — CI/CD changes
- `chore` — other changes

**Example**:
```
feat(ingest): add corporate actions dataset support

Adds ingestion pipeline for NSE corporate actions (splits, bonuses, rights).
Includes schema definition and CLI command.
```

See [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md) for detailed guidelines.

## Testing

- **Node/React**: Run `npm run check-types` to validate TypeScript
- **Python**: Unit tests in `services/*/tests/` — run via `make test-py`
- **Integration**: Test the full pipeline: `make ingest && make test-integration`

## Pull Requests

1. **Keep PRs focused** — one feature or fix per PR
2. **Write clear descriptions** — explain the "why", not just the "what"
3. **Link issues** — reference related issues with `Closes #123`
4. **Ensure CI passes** — all checks must pass before merge
5. **Request reviews** — tag maintainers for approval

## Architecture

See the [README.md](./README.md) for the overall architecture and [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md) for data layout.

For new features:
- **New ingestion dataset?** Use `.claude/skills/new-ingestion-dataset.md`
- **New UI panel?** Use `.claude/skills/bloomberg-terminal-ui.md`
- **New DuckDB query?** Use `.claude/skills/duckdb-s3-queries.md`

## Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/sandeep-jaiswar/destiny/discussions)
- **Bugs?** File a [GitHub Issue](https://github.com/sandeep-jaiswar/destiny/issues)
- **Commit validation fails?** Run `npx commitlint --edit <file>` for details

## License

All contributions are licensed under the [MIT License](./LICENSE).

---

Thank you for contributing! 🚀
