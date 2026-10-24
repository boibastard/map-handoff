# Map Handoff Agent Instructions

## Purpose

This repository is the Map Handoff application.

The app sends addresses, coordinates, and Google Maps destinations between devices using shared pair codes and Supabase.

## Branch Rules

Never commit directly to:

- main
- dev

For agent work, create a dedicated branch from dev using:

agent/<short-task-name>

Example:

agent/test-agent-workflow

Do not force-push.

## Before Making Changes

Before modifying files:

1. Inspect the relevant implementation.
2. Check the current Git status.
3. Confirm which branch is active.
4. Preserve existing behavior unless the task explicitly changes it.
5. Keep changes scoped to the requested task.

## Secrets and Environment Files

Never:

- modify `.env.local`
- commit `.env.local`
- print secrets
- expose Supabase credentials
- move secrets into source code

Environment variables currently required:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Required Verification

Before proposing or committing a change, run:

npm run lint
npm run check
git diff --check

If the change affects runtime behavior, also perform an appropriate smoke test.

Do not claim that a change works unless verification succeeds.

## Git Workflow

Before making changes:

git status
git branch --show-current

Agent work should follow:

dev
→ agent/<task-name>
→ implementation
→ verification
→ review diff
→ commit
→ push

Do not merge into dev or main automatically.

## Commits

Use conventional commit messages where appropriate:

feat:
fix:
refactor:
test:
docs:
chore:

Keep commits focused on one task.

## Database

Do not:

- alter Supabase schema automatically
- delete production data
- modify production records for testing

Database/schema changes require explicit human approval.

## Dependencies

Do not add, remove, or upgrade dependencies unless required by the task.

## Destructive Actions

Do not:

- delete branches
- reset shared branches
- force-push
- delete databases
- remove large groups of files
- modify system configuration

unless explicitly instructed.

## Final Report

After completing a task, report:

1. What changed.
2. Files changed.
3. Verification performed.
4. Any failed checks or warnings.
5. Git branch.
6. Commit hash if committed.
7. Anything that still requires human review.  
