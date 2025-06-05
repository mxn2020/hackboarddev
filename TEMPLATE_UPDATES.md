# Template Updates

This project is based on the [boltdotnew-template-netlify-redis](https://github.com/mxn2020/boltdotnew-template-netlify-redis) template.

## Git Remote Configuration

- `origin` - Your main repository: https://github.com/mxn2020/hackboarddev.git
- `template` - The original template: https://github.com/mxn2020/boltdotnew-template-netlify-redis.git

## How to Pull Updates from Template

To pull updates from the template repository, follow these steps:

### 1. Fetch the latest changes from the template
```bash
git fetch template
```

### 2. Check what's new in the template
```bash
git log HEAD..template/main --oneline
```

### 3. Merge template changes (Option A - Direct merge)
```bash
git merge template/main
```

### 4. Alternative: Cherry-pick specific commits (Option B)
If you want to selectively apply changes:
```bash
# List commits to see what you want to pick
git log template/main --oneline

# Cherry-pick specific commits
git cherry-pick <commit-hash>
```

### 5. Alternative: Create a branch for template updates (Option C - Recommended)
```bash
# Create a new branch for template updates
git checkout -b template-updates

# Merge template changes into this branch
git merge template/main

# Review changes and resolve conflicts if any
# Then merge back to main
git checkout main
git merge template-updates

# Clean up
git branch -d template-updates
```

## Handling Conflicts

When merging template updates, you might encounter conflicts. Here's how to handle them:

1. **Review the conflicts**: Git will mark conflicted files
2. **Resolve conflicts**: Edit the files to resolve conflicts
3. **Stage resolved files**: `git add <file>`
4. **Complete the merge**: `git commit`

## Best Practices

1. **Regular Updates**: Check for template updates regularly
2. **Test Before Merging**: Always test template updates in a separate branch first
3. **Backup**: Make sure your work is committed and pushed before pulling template updates
4. **Document Changes**: Keep track of what template changes you've applied

## Current Template Version

Last updated from template: Initial setup (June 5, 2025)
Template commit: [Will be shown after first template update]
