# Versioning Strategy

Judge Helper follows [Semantic Versioning 2.0.0](https://semver.org/) adapted for a client-side PWA with no public API.

## Version Format

```
MAJOR.MINOR.PATCH
```

| Segment | Bump when... | Examples |
|---------|-------------|----------|
| **MAJOR** | Breaking changes to user-facing behavior: features removed, data format changes that invalidate localStorage, or workflows that fundamentally change. | Removing the Penalties tab, changing localStorage schema without migration, redesigning navigation so existing muscle memory breaks. |
| **MINOR** | New features or meaningful enhancements that are backward-compatible. Users get new functionality without losing anything. | Adding a new tab, CSV export, new infraction categories, new language support, onboarding steps for a new feature. |
| **PATCH** | Bug fixes, performance improvements, translation corrections, and cosmetic adjustments that don't change functionality. | Fixing UTC date in filename, layout fixes for mobile, formula injection protection, fixing onboarding redirect. |

## Branch Workflow

```
feature/fix branch  →  staging  →  main
                         ↑           ↑
                      QA/test     production release
```

| Branch | Purpose | Deploys to |
|--------|---------|------------|
| `main` | Stable, tagged releases only. | Production (Vercel) |
| `staging` | Integration branch. All feature/fix branches merge here first. | Vercel preview |
| `feat/*`, `fix/*` | Short-lived branches for individual changes. | Vercel preview (per-PR) |

- All work targets `staging` via PR.
- When staging is stable and ready, merge `staging → main` and tag the release.
- Never push directly to `main`.

## Release Process

1. **Confirm staging is stable** — all Playwright tests pass, Vercel preview looks good.
2. **Update version** in `client/package.json`.
3. **Update CHANGELOG.md** — add a new section with the version, date, and categorized changes.
4. **Merge staging → main** via PR.
5. **Tag the release** on main:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
6. **Create a GitHub Release** from the tag, copying the changelog entry as the body.

## Changelog Convention

Each version entry in `CHANGELOG.md` groups changes under:

- **Features** — new user-facing functionality (`feat:` commits)
- **Fixes** — bug fixes and corrections (`fix:` commits)
- **Refactors** — internal improvements with no user-facing change (`refactor:` commits)
- **Docs** — documentation-only changes (`docs:` commits)

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add penalties registration tab
fix: prevent onboarding redirect for returning users
refactor: remove recommended extensions table
docs: update contributing guide
```

The commit prefix determines which changelog section the change falls under and helps decide the version bump:

| Prefix | Changelog section | Minimum bump |
|--------|-------------------|-------------|
| `feat:` | Features | MINOR |
| `fix:` | Fixes | PATCH |
| `refactor:` | Refactors | PATCH |
| `docs:` | Docs | PATCH |
| `BREAKING CHANGE:` | (noted in Features/Fixes) | MAJOR |

## When in Doubt

- If it adds something new the user can see or interact with → **MINOR**.
- If it fixes something that was broken or improves existing behavior → **PATCH**.
- If it removes or fundamentally changes how an existing feature works → **MAJOR**.
