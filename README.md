# Pokemon TCG Judge Helper

A mobile-first web application to assist Pokemon TCG judges during tournaments.

## Stack

- React + TypeScript + Vite
- Mantine UI
- React Router DOM
- i18next (EN/PT/ES)
- Playwright (E2E tests)
- Bun

## Getting Started

### Development

```bash
cd client
bun install
bun vite
```

Open http://localhost:5173

### Production

From the root of the project:

```bash
cd client && bun install && bun run build && bun run preview
```

Or step by step:

```bash
cd client
bun install          # Install dependencies
bun run build        # Build for production
bun run preview      # Preview production build locally
```

The production build will be created in `client/dist/` directory.

## Running Tests

```bash
cd client
bunx playwright test
```

## Features

- **Table Judge**: Track player actions and timer during matches
- **Deck Check**: Quick card counting tool
- **Documents**: Quick access to official Pokemon TCG documents

## Project Structure

```
client/
├── src/
│   ├── components/     # Shared components
│   ├── pages/          # Route pages
│   ├── i18n/           # Internationalization
│   └── App.tsx
├── playwright/tests/   # E2E tests
└── package.json
```

## License

MIT
