# GitHub Actions Workflow for Pull Requests

## Overview

This project demonstrates a Continuous Integration (CI) workflow using GitHub Actions. The workflow automatically runs when a pull request is created targeting specific branches. It ensures that the code meets quality standards and that the project builds successfully before being merged.

The workflow performs the following stages:

1. Lint Check
2. Code Formatting Check
3. Build Process

This helps maintain code quality and prevents broken code from being merged into important branches.

---

## Workflow Trigger

The workflow is triggered when a pull request is opened, synchronized, or updated targeting the following branches:

* `dev`
* `staging`
* `main`
* `master`

```yaml
on:
  pull_request:
    branches:
      - dev
      - staging
      - main
      - master
```

This ensures that any code changes submitted through pull requests are validated before being merged into critical branches.

---

## Environment Configuration

The workflow defines a global environment variable to specify the Node.js version used during execution.

```yaml
env:
  NODE_VERSION: '16.x'
```

Using a consistent Node.js version ensures that builds run in a predictable environment.

---

## Workflow Jobs

The workflow contains two main jobs:

1. **Lint and Format Check**
2. **Build Project**

The build job runs only if the lint and formatting checks succeed.

---

## Job 1: Lint and Format Check

This job verifies code quality and formatting standards before building the project.

### Steps

**1. Checkout Repository**

The repository code is downloaded into the runner environment.

```yaml
uses: actions/checkout@v4
```

---

**2. Setup Node.js**

Installs the required Node.js version and enables dependency caching.

```yaml
uses: actions/setup-node@v4
```

---

**3. Install Dependencies**

Project dependencies are installed using npm.

```bash
npm ci
```

`npm ci` ensures a clean installation using the `package-lock.json` file.

---

**4. Run ESLint**

Runs static code analysis to detect code quality issues.

```bash
npm run lint
```

ESLint helps maintain consistent coding practices.

---

**5. Run Prettier Formatting Check**

Checks whether the code follows the defined formatting standards.

```bash
npm run prettier:check
```

This ensures consistent code style across the project.

---

## Job 2: Build Project

The build job runs only if the lint and format checks pass successfully.

```yaml
needs: lint-and-format
```

This dependency ensures that the build process does not start if code quality checks fail.

### Steps

**1. Checkout Repository**

The code is checked out again for the build job.

---

**2. Setup Node.js**

The same Node.js environment is configured for building the project.

---

**3. Install Dependencies**

Dependencies are installed again in the clean build environment.

```bash
npm ci
```

---

**4. Create Environment File**

Sensitive configuration values are injected using GitHub Secrets.

```bash
JWT_SECRET=${{ secrets.JWT_SECRET }}
MONGODB_URL=${{ secrets.MONGODB_URL }}
```

This ensures that sensitive data is not stored directly in the repository.

---

**5. Build the Project**

The project build process is executed.

```bash
npm run build
```

The `--if-present` flag ensures the command does not fail if a build script is not defined.

---

**6. Failure Handling**

If the build process fails, the workflow logs an error message.

```bash
if: failure()
```

This helps developers quickly identify issues in the CI pipeline.

---

## Security Considerations

The workflow follows best practices for handling sensitive information:

* No secrets are hardcoded in the workflow file.
* Sensitive values are stored using GitHub Secrets.
* Environment variables are securely injected during runtime.

---

## Benefits of This Workflow

This CI pipeline provides several advantages:

* Automatic validation of pull requests
* Improved code quality through linting
* Consistent code formatting
* Early detection of build issues
* Secure handling of sensitive configuration values

---

## Technologies Used

* Node.js
* npm
* ESLint
* Prettier
* GitHub Actions

---

## Conclusion

This GitHub Actions workflow ensures that all pull requests undergo automated quality checks and build verification before being merged into important branches. This process improves reliability, maintains code quality, and helps teams collaborate more effectively.