#!/usr/bin/env bash
# Farm Vision Monitoring System - Complete Setup & Run Script
# This script sets up and starts all services
# Usage: bash run_system.sh

set -e

echo "🌾 Farm Vision Monitoring System - Setup & Run"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_step() {
    echo -e "${BLUE}>>> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Node.js is installed
print_step "Checking Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_success "Node.js $(node -v)"

# Check if npm is installed
print_step "Checking npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm $(npm -v)"

# Check if Python is installed
print_step "Checking Python..."
if ! command -v python &> /dev/null; then
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed"
        exit 1
    fi
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi
print_success "Python $($PYTHON_CMD --version)"

# Setup Backend
print_step "Setting up Backend Express Server..."
if [ -d "backend" ]; then
    cd backend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    print_success "Backend dependencies installed"
    cd ..
else
    print_error "backend directory not found"
    exit 1
fi

# Setup Vision Service
print_step "Setting up FarmVisionAI Vision Service..."
if [ -d "FarmVisionAI" ]; then
    cd FarmVisionAI
    
    # Check if venv exists, if not create it
    if [ ! -d "venv" ]; then
        $PYTHON_CMD -m venv venv
        print_success "Python virtual environment created"
    fi
    
    # Activate venv
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    # Install Python dependencies
    pip install -r requirements.txt --quiet
    print_success "Python dependencies installed"
    
    # Check if .env exists, if not copy from example
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success ".env created from template"
        else
            print_error ".env.example not found"
            exit 1
        fi
    fi
    
    cd ..
else
    print_error "FarmVisionAI directory not found"
    exit 1
fi

# Setup Frontend
print_step "Setting up Frontend React App..."
if [ -d "frontend" ]; then
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    print_success "Frontend dependencies installed"
    cd ..
else
    print_error "frontend directory not found"
    exit 1
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✓ All Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  Starting Services...${NC}"
echo ""

# Create a temporary directory for logs
LOGS_DIR="./logs"
mkdir -p "$LOGS_DIR"

print_step "Starting Backend Express Server (Port 3000)..."
cd backend
npm run dev > ../$LOGS_DIR/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../$LOGS_DIR/backend.pid
cd ..
print_success "Backend started (PID: $BACKEND_PID, Logs: $LOGS_DIR/backend.log)"

sleep 2

print_step "Starting Vision Service (Port 5000)..."
cd FarmVisionAI
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi
$PYTHON_CMD final.py > ../$LOGS_DIR/vision.log 2>&1 &
VISION_PID=$!
echo $VISION_PID > ../$LOGS_DIR/vision.pid
cd ..
print_success "Vision Service started (PID: $VISION_PID, Logs: $LOGS_DIR/vision.log)"

sleep 2

print_step "Starting Frontend Dev Server (Port 5173)..."
cd frontend
npm run dev > ../$LOGS_DIR/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../$LOGS_DIR/frontend.pid
cd ..
print_success "Frontend started (PID: $FRONTEND_PID, Logs: $LOGS_DIR/frontend.log)"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✓ All Services Running!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

echo -e "${YELLOW}📍 Service URLs:${NC}"
echo "  🟢 Backend Express:    http://localhost:3000"
echo "  🟢 Vision Service:     http://localhost:5000"
echo "  🟢 Frontend React:     http://localhost:5173"
echo ""

echo -e "${YELLOW}📊 Health Check URLs:${NC}"
echo "  • System Health:       curl http://localhost:3000/api/system/health"
echo "  • Vision Health:       curl http://localhost:5000/health"
echo "  • Vision Metrics:      curl http://localhost:5000/metrics"
echo ""

echo -e "${YELLOW}📝 Logs:${NC}"
echo "  • Backend:  $LOGS_DIR/backend.log"
echo "  • Vision:   $LOGS_DIR/vision.log"
echo "  • Frontend: $LOGS_DIR/frontend.log"
echo ""

echo -e "${YELLOW}🛑 To Stop Services:${NC}"
echo "  • Press Ctrl+C in terminal (will attempt kill)"
echo "  • Or use: kill $BACKEND_PID $VISION_PID $FRONTEND_PID"
echo ""

echo -e "${YELLOW}🔧 Configuration:${NC}"
echo "  • Backend:   backend/.env"
echo "  • Vision:    FarmVisionAI/.env (update CAMERA_SOURCE if needed)"
echo "  • Frontend:  No config needed"
echo ""

# Wait for processes
wait
