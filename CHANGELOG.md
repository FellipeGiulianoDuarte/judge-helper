# Changelog

All notable changes to Judge Helper will be documented in this file.

This project follows [Semantic Versioning](https://semver.org/). See [VERSIONING.md](VERSIONING.md) for the full versioning strategy.

---

## [1.0.0] - 2026-04-08

First stable release of Pokemon TCG Judge Helper. Includes all core judging tools, internationalization, and PWA support.

### Features

- **Penalties Tab** — Register penalties during a tournament with official TCG infraction categories (Gameplay Errors, Marked Cards, Deck Errors, Pace of Play, Tardiness, Unsporting Conduct, Cheating). Auto-fills the recommended penalty tier when selecting an infraction. Search and filter by player name. ([#12](https://github.com/FellipeGiulianoDuarte/judge-helper/pull/12))
- **Penalty CSV Export** — Export all logged penalties to a CSV file (Round, Player, Infraction, Penalty) sorted by round. Filename includes the current date (`penalties_YYYY-MM-DD.csv`). Headers follow the active language. ([#15](https://github.com/FellipeGiulianoDuarte/judge-helper/pull/15))
- **Penalty Disclaimer** — Disclaimer note under Penalty Guidelines in the Documents tab clarifying that suggestions follow rulebook recommendations but may be escalated or de-escalated based on context. ([#15](https://github.com/FellipeGiulianoDuarte/judge-helper/pull/15))
- **Time Extension Categories** — Categorize time extensions (Judge Call, Deck Check, Other) when logging them. Categories are displayed in the extensions list and persisted to localStorage. ([#9](https://github.com/FellipeGiulianoDuarte/judge-helper/pull/9))
- **Onboarding Wizard Steps** — Added onboarding wizard steps for the new time extension category feature. Removed the deprecated recommended extensions table. ([#9](https://github.com/FellipeGiulianoDuarte/judge-helper/pull/9))
- **Localized Document Links** — Document links in the Documents tab now point to Portuguese versions when PT is the active language. ([#8](https://github.com/FellipeGiulianoDuarte/judge-helper/pull/8))

### Fixes

- **Onboarding Redirect** — Returning users are no longer redirected to the onboarding screen on every visit. ([#11](https://github.com/FellipeGiulianoDuarte/judge-helper/pull/11))
- **Tab Layout** — Navigation tabs arranged in a balanced 3/3 layout instead of 4/2 for better spacing on mobile.
- **CSV Safety** — CSV export avoids state mutation (`[...penalties].sort()`), uses local date instead of UTC for the filename, and sanitizes fields against spreadsheet formula injection. ([#15](https://github.com/FellipeGiulianoDuarte/judge-helper/pull/15))
- **Mobile Layout** — Export CSV and Clear All buttons stack vertically for proper display on 375px screens. ([#15](https://github.com/FellipeGiulianoDuarte/judge-helper/pull/15))

### Baseline (from pre-release)

These features existed before the staging cycle and ship as part of v1.0.0:

- **Table Judge** — Track player actions (Supporter, Energy, Stadium, Retreat, Other), turn timer with pace calculation, prize counter, turn history, and autostart options.
- **Deck Check** — Card counting tool for Pokemon, Trainer, and Energy cards with +1/+2/+3/+4 increments, undo, and reset. Visual indicator at 60 cards.
- **Round Timer** — Configurable countdown with BO1/BO3/Top Cut presets, pause/reset, color-coded remaining time, and a full-screen display mode.
- **Time Extensions** — Log time extensions per table/round with edit and delete.
- **Documents** — Quick-access links to official Pokemon TCG documents (Rulebook, Tournament Handbook, Penalty Guidelines, Banned Card List, Promo Legality, Attack Steps).
- **Onboarding Wizard** — Interactive first-time tutorial highlighting each feature.
- **Internationalization** — Full support for English, Portuguese, and Spanish.
- **Dark Mode** — System-aware theme toggle.
- **PWA** — Installable on mobile, works offline, localStorage persistence.
