# ReviewFlow

A powerful local code review tool that enhances GitHub's review capabilities with hunk-based review management, memo/comment separation, and interactive diff viewing.

## Features

- **Hunk-based Review Management**: Mark each code hunk as reviewed, pending, or noted
- **Memo vs Comment Separation**: Separate personal memos from review comments
- **Interactive Diff Range Selection**: Choose exactly which commits and files to review
- **Commit Graph Visualization**: Visual commit history and branch relationships
- **Modern Web UI**: Clean, responsive interface with dark mode support
- **Local First**: Runs entirely on your machine for privacy and speed
- **CLI Integration**: Simple `review` command to start sessions

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Build the project**:
   ```bash
   pnpm build
   ```

3. **Install the CLI command globally**:
   ```bash
   cd packages/cli
   pnpm link --global
   ```

   Note: If you get "Unable to find the global bin directory" error, run:
   ```bash
   pnpm setup
   ```
   Then restart your shell and try the link command again.

4. **Start a review session**:
   ```bash
   review start
   ```

## Usage

### Start Review Session
```bash
# Review last commit
review start

# Review specific range
review start --range HEAD~3..HEAD

# Review specific files
review start --files "src/**/*.ts"

# Use custom port
review start --port 3001
```

### Check Status
```bash
review status
```
Shows current configuration and project status.

## Architecture

ReviewFlow is built as a monorepo with the following packages:

- **`@reviewflow/app`**: All-in-one application with integrated frontend and backend
- **`@reviewflow/frontend`**: Standalone React + TypeScript web UI
- **`@reviewflow/backend`**: Standalone Node.js + Express API server
- **`@reviewflow/cli`**: Command-line interface
- **`@reviewflow/shared`**: Shared types and utilities

## Development

### Prerequisites
- Node.js 18+ or 20+
- pnpm 8.14.0+
- Git

### Setup
```bash
# Clone and install
git clone <repository-url>
cd reviewflow
pnpm install

# Start development servers (all packages in parallel)
pnpm dev

# Or start individual packages
pnpm --filter @reviewflow/frontend dev
pnpm --filter @reviewflow/backend dev
```

### Build
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @reviewflow/frontend build
```

### Testing
```bash
# Run all tests (build, type-check, lint, test)
pnpm ci-test

# Individual commands
pnpm type-check    # TypeScript type checking
pnpm lint          # ESLint code linting
pnpm test          # Unit tests

# Test GitHub Actions workflow locally
act
```

### Project Structure
```
reviewflow/
├── packages/
│   ├── app/          # All-in-one application
│   ├── frontend/     # Standalone React web UI
│   ├── backend/      # Standalone Express API server
│   ├── cli/          # CLI application
│   └── shared/       # Shared types & utilities
├── package.json      # Root package configuration
└── pnpm-workspace.yaml
```

## Configuration

ReviewFlow stores global configuration in `~/.config/review/config.json`:

```json
{
  "contextLines": 3,
  "showWhitespace": false,
  "darkMode": true,
  "viewMode": "unified",
  "autoOpenBrowser": true,
  "defaultPort": 3000
}
```

The configuration is created automatically with default values when you first run `review start`.

## Data Storage

Review data is stored locally in your cache directory:

- **Database**: `~/.cache/reviewflow/reviews.db` - SQLite database for review sessions, hunk status, and notes
- **Sessions**: `~/.cache/reviewflow/sessions/` - Session data and temporary files
- **Cache**: Other cached data for improved performance

All data is stored locally on your machine for privacy and speed.

## CI/CD

This project uses GitHub Actions for continuous integration:

- **Node.js Matrix**: Tests on Node.js 18.x and 20.x
- **Automated Testing**: Runs build, type-check, lint, and test on every push/PR
- **Branch Protection**: Tests must pass before merging to main

### Local Testing
Test the same workflow locally using [act](https://github.com/nektos/act):
```bash
# Install act (macOS)
brew install act

# Run GitHub Actions workflow locally
act
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b YYYY.MM.DD-feature-name`
3. Make your changes
4. Run tests: `pnpm ci-test`
5. Ensure tests pass with `act`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
