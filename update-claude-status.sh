#!/bin/bash
# update-claude-status.sh
# Run this at the END of each Claude CLI session

CLAUDE_MD="/Users/soluwrx/Downloads/PressPilot-OS/PressPilot-OS/CLAUDE.md"
DATE=$(date "+%b %d, %Y @ %I:%M %p")

echo ""
echo "📝 Update CLAUDE.md Status"
echo "=========================="
echo ""
read -p "What was the GOAL of this session? " goal
echo ""
read -p "What did you ACCOMPLISH? (one line) " accomplished  
echo ""
read -p "What FILES were changed? (comma separated) " files
echo ""
read -p "What should NEXT session do? " next_steps
echo ""
read -p "Any BLOCKERS? (or 'none') " blockers

# Create session entry
SESSION_ENTRY="
### Session: $DATE
**Goal:** $goal
**What We Did:**
- $accomplished

**Files Changed:**
- $files

**Blockers:** $blockers

**Next Session Should:**
1. $next_steps

---
"

# Append to session log (after line containing "## 1. SESSION LOG")
# This is a simple append - you may want to insert at the right place
echo "$SESSION_ENTRY" >> "$CLAUDE_MD.sessions"

echo ""
echo "✅ Session logged to $CLAUDE_MD.sessions"
echo "💡 Remember to update the BLOCKING ISSUE section manually if it changed!"
echo ""
