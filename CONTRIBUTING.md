# Contributing to This Project

Thank you for your interest in contributing! This document outlines our guidelines and processes for contributing to this project.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Local Development Setup

1. **Fork the repository** and clone your fork:
   ```bash
   git clone https://github.com/zainriaz-dev/mzr-surveys.git
   cd mzr-surveys
   ```

2. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/zainriaz-dev/mzr-surveys.git
   ```

3. **Install dependencies**:
   ```bash
   # For Node.js projects
   npm install
   # OR for Python projects
   pip install -r requirements.txt
   # OR for other package managers, adjust accordingly
   ```

4. **Set up pre-commit hooks** (if available):
   ```bash
   # Install pre-commit hooks to ensure code quality
   pre-commit install
   ```

## Development Workflow

### Branching Model

We follow the **Git Flow** branching model:

- **`main`** - Production-ready code
- **`develop`** - Integration branch for features
- **Feature branches** - `feature/description-of-feature`
- **Bugfix branches** - `bugfix/description-of-fix`
- **Release branches** - `release/version-number`
- **Hotfix branches** - `hotfix/description-of-hotfix`

#### Creating a Feature Branch

```bash
# Start from develop branch
git checkout develop
git pull upstream develop

# Create your feature branch
git checkout -b feature/your-feature-name

# Work on your changes
# ... make your changes ...

# Push your branch
git push origin feature/your-feature-name
```

### Commit Message Style

We use **Conventional Commits** specification. This leads to more readable messages and helps with automated changelog generation.

#### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

#### Examples

```bash
feat: add user authentication
fix: resolve memory leak in data processing
docs: update API documentation
style: format code according to style guide
refactor: simplify user validation logic
test: add unit tests for payment processing
chore: update dependencies
```

#### Breaking Changes

For breaking changes, add a `!` after the type/scope or include `BREAKING CHANGE:` in the footer:

```bash
feat!: remove deprecated API endpoints
feat(api)!: change user authentication method

feat: add new user role system

BREAKING CHANGE: The old role system has been removed. Users need to be reassigned roles.
```

## Pull Request Workflow

1. **Ensure your branch is up to date**:
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout your-feature-branch
   git rebase develop
   ```

2. **Run tests and linting** (see sections below)

3. **Create a Pull Request**:
   - Use a descriptive title following conventional commit format
   - Fill out the PR template completely
   - Reference any related issues
   - Add appropriate labels

4. **Code Review Process**:
   - At least one maintainer review is required
   - Address all feedback and requested changes
   - Keep your PR updated with the latest changes from develop

5. **Merge Requirements**:
   - All CI checks must pass
   - Code coverage must not decrease
   - Documentation must be updated if needed
   - PR must be approved by maintainers

## Code Quality

### Running the Linter

We use [specific linter] to maintain code quality:

```bash
# Run linter
npm run lint
# OR
flake8 .
# OR
golangci-lint run

# Fix automatically fixable issues
npm run lint:fix
# OR
autopep8 --in-place --recursive .
```

### Running Tests

Always run tests before submitting a PR:

```bash
# Run all tests
npm test
# OR
pytest
# OR
go test ./...

# Run tests with coverage
npm run test:coverage
# OR
pytest --cov
# OR
go test -cover ./...

# Run specific test files
npm test -- src/components/Button.test.js
# OR
pytest tests/test_auth.py
```

### Writing Unit Tests

#### Guidelines
- Write tests for all new functionality
- Maintain or improve code coverage
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

#### Test Structure

```javascript
// Example for JavaScript/TypeScript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { name: 'John', email: 'john@example.com' };
      
      // Act
      const result = await userService.createUser(userData);
      
      // Assert
      expect(result.id).toBeDefined();
      expect(result.name).toBe('John');
    });

    it('should throw error for invalid email', async () => {
      // Arrange
      const userData = { name: 'John', email: 'invalid-email' };
      
      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow('Invalid email format');
    });
  });
});
```

```python
# Example for Python
import pytest
from myapp.services import UserService

class TestUserService:
    def test_create_user_with_valid_data(self):
        # Arrange
        user_data = {'name': 'John', 'email': 'john@example.com'}
        
        # Act
        result = UserService.create_user(user_data)
        
        # Assert
        assert result['id'] is not None
        assert result['name'] == 'John'

    def test_create_user_with_invalid_email(self):
        # Arrange
        user_data = {'name': 'John', 'email': 'invalid-email'}
        
        # Act & Assert
        with pytest.raises(ValueError, match="Invalid email format"):
            UserService.create_user(user_data)
```

## Internationalization (i18n)

### Adding Translations

1. **Add new translation keys**:
   ```json
   // src/locales/en.json
   {
     "common": {
       "welcome": "Welcome",
       "save": "Save",
       "cancel": "Cancel"
     },
     "user": {
       "profile": "Profile",
       "settings": "Settings"
     }
   }
   ```

2. **Update all supported languages**:
   - Copy keys to all locale files (`es.json`, `fr.json`, etc.)
   - Provide appropriate translations
   - Use professional translation services for important content

3. **Use translation keys in code**:
   ```javascript
   // React example
   const { t } = useTranslation();
   return <button>{t('common.save')}</button>;
   
   // Vue example
   <template>
     <button>{{ $t('common.save') }}</button>
   </template>
   ```

### Translation Guidelines

- Use descriptive, hierarchical keys
- Avoid long sentences as keys
- Include context in key names when needed
- Test all language variants
- Consider text expansion in UI layouts
- Use interpolation for dynamic content:
  ```json
  {
    "welcome_user": "Welcome, {{username}}!"
  }
  ```

## Documentation

- Update README.md if your changes affect usage
- Add inline code comments for complex logic
- Update API documentation
- Include examples in your documentation
- Keep documentation in sync with code changes

## Release Process

Releases are handled by maintainers:

1. Create release branch from develop
2. Update version numbers and changelog
3. Merge to main and tag release
4. Deploy to production
5. Merge back to develop

## Getting Help

- Check existing issues and pull requests
- Join our community discussions
- Read the project documentation
- Contact maintainers for complex questions

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Community highlights

Thank you for contributing! 🎉
