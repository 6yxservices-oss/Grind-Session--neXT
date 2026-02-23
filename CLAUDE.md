# CLAUDE.md

This file provides guidance for AI assistants working in the **Grind-Session--neXT** repository.

## Repository Overview

This is a documentation repository for the **Grind Session neXT** project. It contains API integration specifications for three interconnected services: GS, Dropt, and neXT. There is no application source code — the repository's primary artifact is the API integration documentation.

## Repository Structure

```
Grind-Session--neXT/
├── CLAUDE.md                  # This file — AI assistant guidance
└── API_INTEGRATION_SPEC.md    # API integration documentation for GS, Dropt, and neXT
```

## Technology Stack

- **Type:** Documentation-only repository
- **Format:** Markdown (`.md`)
- **Version Control:** Git
- **No build system, package manager, or runtime dependencies**

## Documented APIs

The repository documents three APIs defined in `API_INTEGRATION_SPEC.md`.

### GS API
- **Base URL:** `https://api.example.com/gs`
- **Purpose:** User management
- **Endpoints:**
  - `GET /users/{userId}` — Fetch user information by ID
  - `POST /users` — Create a new user

### Dropt API
- **Base URL:** `https://api.example.com/dropt`
- **Purpose:** Item management
- **Endpoints:**
  - `GET /items/{itemId}` — Retrieve item details by ID

### neXT API
- **Base URL:** `https://api.example.com/next`
- **Purpose:** Authentication
- **Endpoints:**
  - `POST /auth` — Authenticate a user and return a JWT token

## Development Conventions

### Documentation Standards
- All documentation is written in GitHub-flavored Markdown.
- API endpoints must include: HTTP method, path, description, and JSON request/response examples.
- JSON examples should be realistic and self-explanatory (use placeholder values like `"john_doe"`, `99.99`).
- Sensitive fields (e.g., `password`, `token`) must never contain real values in documentation.

### Branch Strategy
- The `main` branch holds the canonical state of all documentation.
- Feature and AI-driven documentation branches follow the pattern: `claude/<description>-<id>`.
- All changes should be made on the appropriate feature branch and merged via pull request.

### Commit Style
- Write concise, imperative commit messages (e.g., `Add Dropt item deletion endpoint`).
- Scope commits to a single logical change.

## Working with This Repository

### Adding or Updating API Documentation
1. Edit `API_INTEGRATION_SPEC.md` directly.
2. Follow the existing Markdown structure: H2 for each API service, H3 for sub-sections (Base URL, Endpoints).
3. For each new endpoint, add: method, path, description, and JSON request/response blocks.
4. Commit with a descriptive message and push to the working branch.

### No Build or Test Steps
Because this repository contains only Markdown documentation, there are no build, lint, or test commands to run. Validate changes by reviewing the rendered Markdown output.

## AI Assistant Notes

- Do not generate or commit code files unless explicitly requested.
- When updating `API_INTEGRATION_SPEC.md`, preserve the existing document structure and tone.
- Never include real credentials, tokens, or personally identifiable information in documentation examples.
- When adding new API sections, follow the pattern established by the existing GS, Dropt, and neXT sections.
- Keep example JSON payloads consistent with the field naming conventions already in use (camelCase keys, descriptive placeholder values).
