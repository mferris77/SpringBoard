#!/bin/bash

###############################################################################
# SpringBoard Development Environment Setup Script
#
# Purpose: Automated setup of development environment for local development
#
# Usage:
#   ./scripts/setup-dev-environment.sh
#
# Prerequisites:
#   - Windows 10/11 (x64)
#   - Git installed and in PATH
#   - Node.js 20 LTS installed and in PATH
#   - Python 3.11 installed and in PATH
#
# Manual Steps Required (NOT automated):
#   - WSL2 installation (Windows feature + Linux distro)
#   - Docker Desktop installation
#   - LM Studio installation + model loading
#
# Output:
#   - Sets up monorepo (npm install)
#   - Creates Python virtual environment
#   - Initializes SQLite database
#   - Displays checklist for manual steps
#
###############################################################################

set -e  # Exit on error

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}SpringBoard Development Environment Setup${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

###############################################################################
# Phase 1: Verify Prerequisites
###############################################################################

echo -e "${YELLOW}[Phase 1] Verifying prerequisites...${NC}"
echo ""

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git not found. Install from https://git-scm.com/${NC}"
    exit 1
fi
GIT_VERSION=$(git --version | awk '{print $3}')
echo -e "${GREEN}✓ Git${NC} ($GIT_VERSION)"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org/${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
if [[ ! $NODE_VERSION =~ v20 ]]; then
    echo -e "${RED}✗ Node.js version must be 20 LTS. Found: $NODE_VERSION${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js${NC} ($NODE_VERSION)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓ npm${NC} ($NPM_VERSION)"

# Check Python
if ! command -v python &> /dev/null; then
    echo -e "${RED}✗ Python not found. Install from https://python.org/${NC}"
    exit 1
fi
PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
if [[ ! $PYTHON_VERSION =~ 3.11 ]]; then
    echo -e "${YELLOW}⚠ Python version should be 3.11. Found: $PYTHON_VERSION${NC}"
fi
echo -e "${GREEN}✓ Python${NC} ($PYTHON_VERSION)"

echo ""
echo -e "${GREEN}All prerequisites verified.${NC}"
echo ""

###############################################################################
# Phase 2: Check WSL2 and Docker (Informational)
###############################################################################

echo -e "${YELLOW}[Phase 2] Checking Docker & WSL2 (required for Phase 2+)...${NC}"
echo ""

# Check WSL2
if command -v wsl &> /dev/null; then
    echo -e "${GREEN}✓ WSL2 detected${NC}"
else
    echo -e "${YELLOW}⚠ WSL2 not detected. Required for tool sandboxing (Phase 3+).${NC}"
    echo "   To install: Settings → Apps → Optional Features → Enable WSL2 → Choose Linux distro"
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
    echo -e "${GREEN}✓ Docker${NC} ($DOCKER_VERSION)"
else
    echo -e "${YELLOW}⚠ Docker not detected. Required for tool sandboxing (Phase 3+).${NC}"
    echo "   To install: https://docs.docker.com/desktop/install/windows-install/"
fi

echo ""

###############################################################################
# Phase 3: Clone Repository (if needed)
###############################################################################

echo -e "${YELLOW}[Phase 3] Setting up repository...${NC}"
echo ""

if [ ! -f "$REPO_ROOT/package.json" ]; then
    echo -e "${RED}✗ Repository not found at $REPO_ROOT${NC}"
    echo "Please clone SpringBoard first:"
    echo "  git clone https://github.com/mferris77/SpringBoard.git"
    echo "  cd SpringBoard"
    echo "  git checkout 001-local-ai-assistant"
    exit 1
fi

# Verify correct branch
CURRENT_BRANCH=$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "001-local-ai-assistant" ]; then
    echo -e "${YELLOW}⚠ Not on feature branch. Current: $CURRENT_BRANCH${NC}"
    echo "Switching to correct branch..."
    git -C "$REPO_ROOT" checkout 001-local-ai-assistant
fi

echo -e "${GREEN}✓ Repository at$NC $REPO_ROOT (branch: $CURRENT_BRANCH)"
echo ""

###############################################################################
# Phase 4: Install Node Dependencies (Monorepo)
###############################################################################

echo -e "${YELLOW}[Phase 4] Installing Node.js dependencies (monorepo)...${NC}"
echo ""

cd "$REPO_ROOT"

if [ -d "node_modules" ]; then
    echo "node_modules already exists. Running npm install to verify..."
else
    echo "Installing root dependencies..."
fi

npm install --legacy-peer-deps 2>&1 | tail -20  # Show last 20 lines

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ npm install failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Root dependencies installed${NC}"

# Install backend dependencies
if [ -d "apps/springboard-backend" ]; then
    echo ""
    echo "Installing backend dependencies..."
    cd "$REPO_ROOT/apps/springboard-backend"
    npm install --legacy-peer-deps 2>&1 | tail -10
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
    cd "$REPO_ROOT"
fi

echo ""

###############################################################################
# Phase 5: Setup Python Virtual Environment
###############################################################################

echo -e "${YELLOW}[Phase 5] Setting up Python virtual environment...${NC}"
echo ""

if [ -d "services/springboard-python" ]; then
    cd "$REPO_ROOT/services/springboard-python"
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python -m venv venv
        echo -e "${GREEN}✓ Virtual environment created${NC}"
    else
        echo -e "${GREEN}✓ Virtual environment already exists${NC}"
    fi
    
    # Activate venv and install requirements
    source venv/bin/activate
    
    if [ -f "requirements.txt" ]; then
        echo "Installing Python requirements..."
        pip install --upgrade pip > /dev/null 2>&1
        pip install -r requirements.txt
        echo -e "${GREEN}✓ Python requirements installed${NC}"
    else
        echo -e "${YELLOW}⚠ requirements.txt not found${NC}"
    fi
    
    deactivate
    cd "$REPO_ROOT"
else
    echo -e "${YELLOW}⚠ Python services directory not found${NC}"
fi

echo ""

###############################################################################
# Phase 6: Initialize Database
###############################################################################

echo -e "${YELLOW}[Phase 6] Initializing database...${NC}"
echo ""

# Create AppData directories
APPDATA_DIR="$USERPROFILE/AppData/Local/SpringBoard"
mkdir -p "$APPDATA_DIR"
mkdir -p "$APPDATA_DIR/audit"
mkdir -p "$APPDATA_DIR/config"
mkdir -p "$APPDATA_DIR/skills"
mkdir -p "$APPDATA_DIR/logs"

echo -e "${GREEN}✓ AppData directories created at${NC} $APPDATA_DIR"

# Database will be initialized by backend on first run
echo -e "${YELLOW}⚠ Database will be initialized on first backend startup${NC}"

echo ""

###############################################################################
# Phase 7: Display Summary & Manual Steps
###############################################################################

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Setup Summary${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

echo -e "${GREEN}✓ Completed:${NC}"
echo "  • Node.js dependencies (root + backend)"
echo "  • Python virtual environment"
echo "  • AppData directory structure"
echo ""

echo -e "${YELLOW}⚠ Manual steps required:${NC}"
echo ""
echo "1. ${YELLOW}Install WSL2${NC} (if not already installed)"
echo "   • Settings → Apps → Optional Features → Enable 'Windows Subsystem for Linux'"
echo "   • Restart computer"
echo "   • Run: wsl --install"
echo "   • Choose Linux distro (e.g., Ubuntu 22.04)"
echo ""

echo "2. ${YELLOW}Install Docker Desktop${NC} (if not already installed)"
echo "   • Download: https://www.docker.com/products/docker-desktop"
echo "   • Install + start Docker Desktop"
echo "   • Enable WSL2 integration (Docker Desktop settings)"
echo "   • Verify: docker ps (should list containers)"
echo ""

echo "3. ${YELLOW}Install & Run LM Studio${NC} (required for Phase 1 testing)"
echo "   • Download: https://lmstudio.ai/"
echo "   • Install native app (Windows)"
echo "   • Open LM Studio"
echo "   • Select a model (e.g., Mistral 7B or Llama 2 13B)"
echo "   • Load model into VRAM"
echo "   • Start local server on port 8000"
echo "   • Verify: curl http://localhost:8000/v1/models"
echo ""

echo "4. ${YELLOW}Bootstrap Frontend${NC} (when ready for Sprint 1)"
echo "   • From repo root:"
echo "   • npx create-vite@latest apps/springboard-desktop -- --template vue-ts"
echo "   • cd apps/springboard-desktop && npm install"
echo ""

echo -e "${YELLOW}Quick Start (after manual steps):${NC}"
echo ""
echo "  # Terminal 1: Backend"
echo "  npm run backend"
echo ""
echo "  # Terminal 2: Frontend (after bootstrap)"
echo "  cd apps/springboard-desktop && npm run dev"
echo ""
echo "  # Terminal 3: LM Studio (native app, already running from step 3)"
echo ""

echo "  # Then open: http://localhost:5173"
echo ""

###############################################################################
# Phase 8: Verify Monorepo Structure
###############################################################################

echo -e "${YELLOW}[Phase 8] Verifying monorepo structure...${NC}"
echo ""

EXPECTED_DIRS=(
    "apps/springboard-backend"
    "services/springboard-python"
    "packages/springboard-contracts"
    "specs/001-local-ai-assistant"
    "docs"
)

for dir in "${EXPECTED_DIRS[@]}"; do
    if [ -d "$REPO_ROOT/$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir"
    else
        echo -e "${RED}✗${NC} $dir (missing)"
    fi
done

echo ""

###############################################################################
# Final Message
###############################################################################

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Complete manual steps above (WSL2, Docker, LM Studio)"
echo "  2. Bootstrap frontend: npx create-vite..."
echo "  3. Run: npm run backend"
echo "  4. Run: cd apps/springboard-desktop && npm run dev"
echo "  5. Open: http://localhost:5173"
echo ""
echo "For troubleshooting, see: ${BLUE}DEVELOPMENT.md${NC}"
echo ""
