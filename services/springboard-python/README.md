# SpringBoard Python Services

Python 3.11 service layer for SpringBoard Local-First AI Assistant.

## Overview

Provides isolated Python-based services:
- **LM Studio Bridge**: HTTP client for local LLM inference
- **Graph API Adapter**: Microsoft Graph API client with token management
- **COM Bridge**: Windows COM automation for Office applications
- **Docker Executor**: Docker container lifecycle management
- **Sandbox Tools**: Filesystem, shell, and browser tool adapters

## Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Development

```bash
# Run service  
python src/main.py

# Run tests
pytest tests/

# Format code
black src/ tests/
```

## Architecture

- **Flask**: Lightweight HTTP server for internal API
- **Requests**: HTTP client for external APIs
- **Pydantic**: Data validation and serialization
- **pywin32**: Windows COM automation

## Environment Variables

Create `.env` file:
```
LM_STUDIO_URL=http://localhost:1234
GRAPH_API_TENANT=your-tenant-id
LOG_LEVEL=INFO
```
