# Contributing to Pokemon TCG Judge Helper

First off, thank you for considering contributing! This project is built by and for the Pokemon TCG judge community, and every contribution helps make tournaments run smoother.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [What We Accept](#what-we-accept)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [TDD Workflow (Required)](#tdd-workflow-required)
- [Coding Standards](#coding-standards)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior by opening an issue.

---

## What We Accept

| Contribution Type | Accepted? | Notes |
|---|---|---|
| Bug fixes | Yes | Always welcome |
| New translations | Yes | Add locale files in `client/src/i18n/locales/` |
| Feature requests | Maybe | Open an issue first to discuss — features must be requested and approved before implementation |
| UI/UX improvements | Maybe | Open an issue first — design changes need maintainer approval |
| Documentation | Yes | Typo fixes, clarifications, etc. |
| Refactoring | Maybe | Must not break existing tests |

> **Important:** All Pull Requests require maintainer approval before merging. Please open an issue to discuss significant changes before investing time in implementation.

---

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/<your-username>/judge-helper.git
cd judge-helper
```

### 2. Install Dependencies

```bash
cd client
bun install
bun exec playwright install   # install test browsers
```

### 3. Start Dev Server

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Development Workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/my-feature
   # or
   git checkout -b fix/bug-description
   ```

2. Make your changes following the [TDD workflow](#tdd-workflow-required)

3. Ensure all tests pass:
   ```bash
   cd client
   bun exec playwright test
   ```

4. Commit with a clear message:
   ```bash
   git commit -m "feat: add card lookup feature to deck check"
   ```

5. Push and open a Pull Request against `main`

### Branch Naming

| Prefix | Use for |
|--------|---------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `i18n/` | Translation additions/fixes |
| `docs/` | Documentation changes |
| `refactor/` | Code refactoring |

---

## TDD Workflow (Required)

This project follows a strict **Red-Green-Refactor** cycle. All new features and bug fixes must include tests.

### Steps

1. **RED** — Write a failing E2E test in `client/playwright/tests/`
2. **GREEN** — Implement the minimum code to make the test pass
3. **REFACTOR** — Clean up while keeping tests green

### Running Tests

```bash
cd client

# Run all E2E tests
bun exec playwright test

# Run a specific test file
bun exec playwright test playwright/tests/table-judge.spec.ts

# Run with visible browser (useful for debugging)
bun exec playwright test --headed

# Interactive UI mode
bun exec playwright test --ui
```

> PRs without tests for new functionality will not be merged.

---

## Coding Standards

### General

- Implement **only** what is requested — no unrelated extras
- Complete code only — no placeholders or TODOs
- No emojis in code or log messages

### TypeScript

- `camelCase` for variables and functions
- `PascalCase` for components, classes, and interfaces
- No `any` type — use proper typing
- All props must be typed with interfaces

### React

- Functional components only
- Component names in `PascalCase`
- Mobile-first design — default viewport target: 375px (iPhone SE)
- Use [Mantine](https://mantine.dev) components when possible

### Internationalization

- All user-facing strings must go through `i18next`
- Add translations for all supported locales: `en.json`, `pt.json`, `es.json`
- Keys use dot notation: `"deckCheck.pokemon"`, `"tableJudge.start"`

---

## Submitting a Pull Request

1. Make sure your branch is up to date with `main`
2. Fill out the PR template completely
3. Ensure all E2E tests pass
4. Link the related issue (if any)
5. Wait for maintainer review

### PR Checklist

- [ ] E2E tests created for the change
- [ ] All tests passing (`bun exec playwright test`)
- [ ] Mobile-first design verified
- [ ] Code is complete (no placeholders)
- [ ] Translations added for all locales (if applicable)

---

## Reporting Bugs

Use the [Bug Report](https://github.com/FellipeGiulianoDuarte/judge-helper/issues/new?template=bug_report.md) issue template. Include:

- Steps to reproduce
- Expected vs actual behavior
- Device/browser information
- Screenshots if applicable

---

## Requesting Features

Use the [Feature Request](https://github.com/FellipeGiulianoDuarte/judge-helper/issues/new?template=feature_request.md) issue template. Include:

- Clear description of the feature
- Why it would be useful for judges
- Mockups or examples (if possible)

> **Note:** Feature requests need maintainer approval before implementation begins. Please wait for a green light before starting work.

---

## Thank You

Every contribution, no matter how small, makes a difference for Pokemon TCG judges worldwide. Thank you for helping improve this tool!
