# ReviewFlow

A powerful local code review tool that enhances GitHub's review capabilities with hunk-based review management, memo/comment separation, and interactive diff viewing.

## Features

- **Hunk-based Review Management**: Mark each code hunk as reviewed, pending, or noted
- **Memo vs Comment Separation**: Separate personal memos from review comments
- **Interactive Diff Range Selection**: Choose exactly which commits and files to review
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

3. **Initialize ReviewFlow in your project**:
   ```bash
   review init
   ```

4. **Start a review session**:
   ```bash
   review start
   ```

## Usage

### Initialize a Project
```bash
review init
```
Creates a `.reviewflow` directory with configuration and database.

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

- **`@reviewflow/frontend`**: React + TypeScript web UI
- **`@reviewflow/backend`**: Node.js + Express API server
- **`@reviewflow/cli`**: Command-line interface
- **`@reviewflow/shared`**: Shared types and utilities

## Development

### Prerequisites
- Node.js 18+
- pnpm 8+

### Setup
```bash
# Clone and install
git clone <repository-url>
cd reviewflow
pnpm install

# Start development servers
pnpm dev
```

### Build
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @reviewflow/frontend build
```

### Project Structure
```
reviewflow/
├── packages/
│   ├── frontend/     # React web UI
│   ├── backend/      # Express API server
│   ├── cli/          # CLI application
│   └── shared/       # Shared types & utilities
├── package.json      # Root package configuration
└── pnpm-workspace.yaml
```

## Configuration

ReviewFlow stores configuration in `.reviewflow/config.json`:

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

## Data Storage

Review data is stored locally in SQLite database at `.reviewflow/reviews.db`:

- **Review Sessions**: Track different review sessions
- **Hunk Status**: Store review status for each code hunk
- **Review Notes**: Store memos and comments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.