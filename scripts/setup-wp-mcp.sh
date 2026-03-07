#!/bin/bash
# ============================================================================
# WPaify & PressPilot — WordPress MCP Tools Setup Script
# ============================================================================
# This script installs and configures all WordPress MCP tools for Claude.
# Run from Terminal on macOS.
#
# What it does:
#   1. Checks prerequisites (Node.js, npm, Claude Code CLI)
#   2. Installs WordPress FSE Skills via MCP Market (for Claude Code)
#   3. Creates/updates Claude Desktop config (claude_desktop_config.json)
#   4. Verifies the setup
#
# Usage:
#   chmod +x scripts/setup-wp-mcp.sh
#   ./scripts/setup-wp-mcp.sh
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Config
CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

echo ""
echo -e "${BLUE}${BOLD}============================================${NC}"
echo -e "${BLUE}${BOLD}  WordPress MCP Tools — Setup Script${NC}"
echo -e "${BLUE}${BOLD}  For WPaify & PressPilot${NC}"
echo -e "${BLUE}${BOLD}============================================${NC}"
echo ""

# ── Step 0: Prerequisites Check ──────────────────────────────────────────────

echo -e "${CYAN}[1/5] Checking prerequisites...${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "  ${GREEN}✓${NC} Node.js found: $NODE_VERSION"

    # Check if version >= 18
    NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "  ${RED}✗ Node.js v18+ required (you have $NODE_VERSION)${NC}"
        echo -e "  ${YELLOW}→ Visit https://nodejs.org to upgrade${NC}"
        exit 1
    fi
else
    echo -e "  ${RED}✗ Node.js not found${NC}"
    echo -e "  ${YELLOW}→ Visit https://nodejs.org and install the LTS version${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} npm found: $(npm --version)"
else
    echo -e "  ${RED}✗ npm not found${NC}"
    exit 1
fi

# Check Claude Code CLI
if command -v claude &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} Claude Code CLI found: $(claude --version 2>/dev/null || echo 'installed')"
else
    echo -e "  ${YELLOW}⚠${NC} Claude Code CLI not found"
    echo -e "  ${YELLOW}→ Install with: npm install -g @anthropic-ai/claude-code${NC}"
    echo -e "  ${YELLOW}→ Skills installation will be skipped${NC}"
fi

# Check if Claude Desktop config dir exists
if [ -d "$CLAUDE_CONFIG_DIR" ]; then
    echo -e "  ${GREEN}✓${NC} Claude Desktop config directory found"
else
    echo -e "  ${YELLOW}⚠${NC} Claude Desktop config directory not found"
    echo -e "  ${YELLOW}→ Creating: $CLAUDE_CONFIG_DIR${NC}"
    mkdir -p "$CLAUDE_CONFIG_DIR"
fi

echo ""

# ── Step 1: Install WordPress FSE Skills ─────────────────────────────────────

echo -e "${CYAN}[2/5] Installing WordPress FSE Skills (MCP Market)...${NC}"
echo -e "  ${YELLOW}These embed FSE best practices into Claude's context.${NC}"
echo ""

SKILLS_INSTALLED=0

install_skill() {
    local skill_name="$1"
    local display_name="$2"

    echo -ne "  Installing ${display_name}... "
    if npx -y skillfish add automattic/agent-skills "$skill_name" 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        SKILLS_INSTALLED=$((SKILLS_INSTALLED + 1))
    else
        echo -e "${YELLOW}⚠ skipped (may need Claude Code CLI)${NC}"
    fi
}

# Try installing each skill
install_skill "wp-block-development" "WordPress Block Development"
install_skill "wp-interactivity-api" "WordPress Interactivity API"
install_skill "wp-block-theme-development" "WordPress Block Theme Development"

if [ "$SKILLS_INSTALLED" -gt 0 ]; then
    echo -e "\n  ${GREEN}✓ $SKILLS_INSTALLED skills installed successfully${NC}"
else
    echo -e "\n  ${YELLOW}⚠ Skills installation requires Claude Code CLI.${NC}"
    echo -e "  ${YELLOW}  You can install them manually in Claude Desktop via:${NC}"
    echo -e "  ${YELLOW}  Settings → Extensions → Browse → search 'WordPress'${NC}"
fi

echo ""

# ── Step 2: Set Up Claude Desktop Config ─────────────────────────────────────

echo -e "${CYAN}[3/5] Setting up Claude Desktop configuration...${NC}"

# Check if config file already exists
if [ -f "$CLAUDE_CONFIG_FILE" ]; then
    echo -e "  ${YELLOW}⚠ Existing config found at:${NC}"
    echo -e "  ${YELLOW}  $CLAUDE_CONFIG_FILE${NC}"
    echo ""
    echo -e "  ${BOLD}Current contents:${NC}"
    cat "$CLAUDE_CONFIG_FILE" | head -30
    echo ""

    read -p "  Overwrite with WordPress MCP config? (y/N): " OVERWRITE
    if [[ "$OVERWRITE" != "y" && "$OVERWRITE" != "Y" ]]; then
        echo -e "  ${YELLOW}→ Skipped. You can manually merge the config.${NC}"
        echo -e "  ${YELLOW}  Backup saved to: ${CLAUDE_CONFIG_FILE}.backup${NC}"
        cp "$CLAUDE_CONFIG_FILE" "${CLAUDE_CONFIG_FILE}.backup"

        echo ""
        echo -e "  ${BOLD}Add this inside your existing \"mcpServers\" object:${NC}"
        echo ""
        echo '    "wordpress": {'
        echo '      "command": "npx",'
        echo '      "args": ["-y", "@automattic/mcp-wordpress-remote@latest"],'
        echo '      "env": {'
        echo '        "WP_API_URL": "http://wpaify-test.local/wp-json/mcp/mcp-adapter-default-server",'
        echo '        "WP_API_USERNAME": "admin",'
        echo '        "WP_API_PASSWORD": "YOUR_APP_PASSWORD_HERE"'
        echo '      }'
        echo '    },'
        echo '    "local-wp": {'
        echo '      "command": "npx",'
        echo '      "args": ["-y", "@verygoodplugins/mcp-local-wp@latest"]'
        echo '    }'
        echo ""

        # Skip to next step
        SKIP_CONFIG=true
    fi
fi

if [ "${SKIP_CONFIG:-false}" != "true" ]; then
    # Back up if exists
    if [ -f "$CLAUDE_CONFIG_FILE" ]; then
        cp "$CLAUDE_CONFIG_FILE" "${CLAUDE_CONFIG_FILE}.backup"
        echo -e "  ${GREEN}✓${NC} Backup saved to: ${CLAUDE_CONFIG_FILE}.backup"
    fi

    # Write new config
    cat > "$CLAUDE_CONFIG_FILE" << 'CONFIGEOF'
{
  "mcpServers": {

    "wordpress": {
      "command": "npx",
      "args": ["-y", "@automattic/mcp-wordpress-remote@latest"],
      "env": {
        "WP_API_URL": "http://wpaify-test.local/wp-json/mcp/mcp-adapter-default-server",
        "WP_API_USERNAME": "admin",
        "WP_API_PASSWORD": "PASTE_YOUR_APP_PASSWORD_HERE"
      }
    },

    "local-wp": {
      "command": "npx",
      "args": ["-y", "@verygoodplugins/mcp-local-wp@latest"]
    }

  }
}
CONFIGEOF

    echo -e "  ${GREEN}✓${NC} Config written to: $CLAUDE_CONFIG_FILE"
fi

echo ""

# ── Step 3: Verify .mcp.json in Project ──────────────────────────────────────

echo -e "${CYAN}[4/5] Verifying project-scoped .mcp.json...${NC}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MCP_JSON="$PROJECT_ROOT/.mcp.json"

if [ -f "$MCP_JSON" ]; then
    echo -e "  ${GREEN}✓${NC} .mcp.json found in project root"

    # Validate JSON syntax
    if python3 -m json.tool "$MCP_JSON" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} JSON syntax is valid"
    else
        echo -e "  ${RED}✗ JSON syntax error in .mcp.json${NC}"
        echo -e "  ${YELLOW}→ Run: python3 -m json.tool .mcp.json${NC}"
    fi

    # Check .gitignore
    if grep -q ".mcp.json" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} .mcp.json is in .gitignore"
    else
        echo -e "  ${YELLOW}⚠ .mcp.json is NOT in .gitignore — adding it now${NC}"
        echo ".mcp.json" >> "$PROJECT_ROOT/.gitignore"
        echo -e "  ${GREEN}✓${NC} Added .mcp.json to .gitignore"
    fi
else
    echo -e "  ${RED}✗ .mcp.json not found at: $MCP_JSON${NC}"
    echo -e "  ${YELLOW}→ It should have been created by the setup. Creating now...${NC}"

    cat > "$MCP_JSON" << 'MCPEOF'
{
  "mcpServers": {
    "wordpress": {
      "command": "npx",
      "args": ["-y", "@automattic/mcp-wordpress-remote@latest"],
      "env": {
        "WP_API_URL": "http://wpaify-test.local/wp-json/mcp/mcp-adapter-default-server",
        "WP_API_USERNAME": "admin",
        "WP_API_PASSWORD": "PASTE_YOUR_APP_PASSWORD_HERE"
      }
    },
    "local-wp": {
      "command": "npx",
      "args": ["-y", "@verygoodplugins/mcp-local-wp@latest"]
    }
  }
}
MCPEOF
    echo -e "  ${GREEN}✓${NC} .mcp.json created"
fi

echo ""

# ── Step 4: Final Summary ────────────────────────────────────────────────────

echo -e "${CYAN}[5/5] Setup Summary${NC}"
echo ""
echo -e "${BLUE}${BOLD}┌─────────────────────────────────────────────────────────┐${NC}"
echo -e "${BLUE}${BOLD}│  Setup Complete — Next Steps                            │${NC}"
echo -e "${BLUE}${BOLD}└─────────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "  ${BOLD}YOU STILL NEED TO DO THESE 3 THINGS:${NC}"
echo ""
echo -e "  ${YELLOW}1.${NC} ${BOLD}Install MCP Adapter Plugin on LocalWP:${NC}"
echo -e "     → Open LocalWP > right-click your site > Open Site Shell"
echo -e "     → Run: ${CYAN}composer require wordpress/abilities-api wordpress/mcp-adapter${NC}"
echo -e "     → Or: download from github.com/WordPress/mcp-adapter"
echo -e "            and activate in WP Admin > Plugins"
echo ""
echo -e "  ${YELLOW}2.${NC} ${BOLD}Create a WordPress Application Password:${NC}"
echo -e "     → Open: http://wpaify-test.local/wp-admin/"
echo -e "     → Go to: Users > Profile > Application Passwords"
echo -e "     → Name: 'Claude MCP'"
echo -e "     → Click 'Add New Application Password'"
echo -e "     → ${RED}COPY THE PASSWORD IMMEDIATELY (shown only once!)${NC}"
echo ""
echo -e "  ${YELLOW}3.${NC} ${BOLD}Paste Your App Password Into Both Config Files:${NC}"
echo -e "     → File 1: ${CYAN}$CLAUDE_CONFIG_FILE${NC}"
echo -e "     → File 2: ${CYAN}$MCP_JSON${NC}"
echo -e "     → Replace: ${RED}PASTE_YOUR_APP_PASSWORD_HERE${NC}"
echo -e "     → With your actual password (format: xxxx xxxx xxxx xxxx xxxx xxxx)"
echo ""
echo -e "  ${YELLOW}4.${NC} ${BOLD}Restart Claude Desktop:${NC}"
echo -e "     → Cmd+Q to fully quit"
echo -e "     → Reopen Claude Desktop"
echo ""
echo -e "${GREEN}${BOLD}After these steps, both Claude Desktop and Claude Code will${NC}"
echo -e "${GREEN}${BOLD}have full WordPress MCP access in this project.${NC}"
echo ""
echo -e "  ${BOLD}Test it by asking Claude:${NC}"
echo -e "  ${CYAN}\"List all published posts on my WordPress site.\"${NC}"
echo ""
