# Contributing to SpringBoard

Thank you for contributing to SpringBoard Local-First AI Assistant!

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/[org]/SpringBoard.git
   cd SpringBoard
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd services/springboard-python
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Initialize database**
   ```bash
   node scripts/init-db.js
   ```

4. **Run development servers**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   npm run dev:backend
   
   # Terminal 3: Python services
   npm run dev:python
   ```

## Code Standards

- **TypeScript**: ESLint + Prettier configured
- **Python**: Black formatter + type hints
- **Commits**: Follow conventional commits format
- **Tests**: Required for all new features

## Testing

```bash
# Run all tests
npm test

# Run specific workspace tests
npm test --workspace=apps/springboard-backend

# Python tests
cd services/springboard-python
pytest tests/
```

## Pull Request Process

1. Create feature branch from `development`
2. Make changes following code standards
3. Add tests for new functionality
4. Update documentation if needed
5. Submit PR with clear description
6. Address review feedback
7. Ensure CI passes before merge

## Constitution Principles

All contributions must follow these principles:

1. **Microsoft-First**: Use Graph API for Office integration
2. **CLI-First**: Provide CLI interfaces for all operations
3. **Test-First**: Write tests before implementation
4. **Integration Testing**: Test API contracts
5. **Observability**: Structured logging with audit trails

## Questions?

Open a discussion or contact maintainers.
