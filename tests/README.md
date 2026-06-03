# IDPBL Test Suite

Comprehensive test suite for the SmartNav Indoor Building Navigation System.

## Test Structure

### Test Files

1. **pathfinding.test.js**
   - A* pathfinding algorithm tests
   - Dijkstra algorithm tests
   - Graph building and structure validation
   - Multi-floor pathfinding
   - Path details and step generation

2. **app.test.js**
   - NavigationApp initialization
   - Theme management (light/dark mode)
   - Search and room selection
   - Floor navigation
   - Navigation flow and routing
   - Steps panel management

3. **buildingData.test.js**
   - Room data retrieval and management
   - Vertical transit (stairs/elevators)
   - Building connectivity
   - Data integrity validation

4. **html.test.js**
   - HTML structure and DOM elements
   - Canvas elements
   - Data attributes
   - Element availability

5. **utils.test.js**
   - Distance calculation utilities
   - Room retrieval functions
   - Vertical transit utilities

## Running Tests

### Prerequisites

```bash
npm install --save-dev jest
```

### Configuration

Create `jest.config.js` in the root directory:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    '*.js',
    '!tests/**',
    '!node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test pathfinding.test.js
```

## Test Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| Pathfinding | 18 | Core algorithms |
| App (UI) | 28 | Navigation & theme |
| Building Data | 15 | Room & transit data |
| HTML | 12 | DOM structure |
| Utils | 9 | Helper functions |
| **TOTAL** | **82** | **Comprehensive** |

## Test Categories

### Unit Tests
- Individual function behavior
- Algorithm correctness
- Data validation

### Integration Tests
- Multi-component workflows
- Navigation flow from start to finish
- Theme persistence with localStorage

### UI/UX Tests
- DOM element rendering
- User interaction handling
- State management

## Key Test Scenarios

### Pathfinding
- ✅ Same-floor routing
- ✅ Multi-floor routing via stairs/elevators
- ✅ Invalid room handling
- ✅ Path optimization
- ✅ Graph connectivity validation

### Navigation
- ✅ Start location selection
- ✅ Destination search and filtering
- ✅ Route calculation and display
- ✅ Error handling
- ✅ Dual-view for multi-floor paths

### UI
- ✅ Theme switching (light/dark)
- ✅ Floor button navigation
- ✅ Pan and zoom controls
- ✅ Steps panel collapse/expand
- ✅ Room label rendering

### Data
- ✅ Room coordinate validation
- ✅ Floor connectivity
- ✅ Stairs/elevator configuration
- ✅ Distance calculations

## Mocking & Fixtures

All tests use real building data from `buildingData.js`. Mock data is not required as the system uses a complete building dataset.

## Coverage Goals

- **Statements**: 70%+
- **Branches**: 70%+
- **Functions**: 70%+
- **Lines**: 70%+

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure all tests pass
3. Maintain coverage above 70%
4. Update test documentation

## Debugging Tests

```bash
# Run with verbose output
npm test -- --verbose

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand pathfinding.test.js

# Show test timing
npm test -- --detectOpenHandles
```

## Future Test Enhancements

- [ ] E2E tests with Cypress/Playwright
- [ ] Performance benchmarking
- [ ] Visual regression testing
- [ ] Accessibility testing
- [ ] Load testing for pathfinding
