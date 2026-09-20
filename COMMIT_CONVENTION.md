# Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by [commitlint](https://commitlint.js.org/).

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, whitespace)
- **refactor**: Code refactoring without feature changes or bug fixes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **ci**: CI/CD configuration changes
- **chore**: Other changes (deps, build, etc.)
- **revert**: Reverts a previous commit

## Rules

1. **Type must be lowercase** and one of the types listed above
2. **Subject (description) must be lowercase** and not end with a period
3. **Subject must not be empty**
4. **Body must be separated from subject by a blank line** (if present)
5. **Body lines must not exceed 100 characters**
6. **Footer must be separated from body by a blank line** (if present)
7. **Footer lines must not exceed 100 characters**

## Examples

### Simple feature
```
feat: add command bar keyboard navigation
```

### Bug fix with body
```
fix: resolve s3 endpoint configuration issue

AWS endpoint configuration was not being stripped of scheme prefix,
causing DuckDB to fail when connecting to Floci. Now properly removes
http:// and https:// prefixes before setting s3_endpoint.
```

### Feature with scope
```
feat(ui): implement movers grid with sortable columns
```

### With multiple paragraphs
```
feat: add hive partitioning support for bhavcopy data

Enables efficient partition pruning in DuckDB queries by organizing
parquet files by year/month instead of daily files.

This reduces the object count from 762 daily files to ~35 monthly files
for equities data and dramatically improves query performance.
```

## Validation

Commit messages are automatically validated on `git commit` via the `commit-msg` Git hook. Invalid messages will be rejected with details on what needs to be fixed.

To manually validate a message:
```bash
npx commitlint --edit <message-file>
```

## Configuration

See `commitlint.config.js` for the complete configuration.
