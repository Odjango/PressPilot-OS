# MCP Server Integration Guide for PressPilot

## Overview
This guide explains how to integrate Model Context Protocol (MCP) servers with PressPilot to enable AI agents to interact directly with Supabase, WordPress, and GitHub.

## Current Implementation (Non-MCP)
PressPilot currently uses:
- **Supabase SDK** (`@supabase/supabase-js`) via `src/lib/supabase/operations.ts`
- **Static WordPress Block Registry** via `src/generator/validators/blocks/WordPressBlockRegistry.ts`
- **Direct File System Access** for code editing

## MCP Servers to Integrate

### 1. Supabase MCP Server

#### Installation
```bash
# Option A: Official Supabase MCP (if available)
npm install @modelcontextprotocol/server-supabase

# Option B: Rube MCP with Supabase plugin
npm install @rube/mcp-server
```

#### Configuration
Create `.mcp/supabase-config.json`:
```json
{
  "name": "presspilot-supabase",
  "type": "supabase",
  "connection": {
    "url": "${NEXT_PUBLIC_SUPABASE_URL}",
    "serviceKey": "${SUPABASE_SERVICE_ROLE_KEY}"
  },
  "capabilities": {
    "postgres": {
      "tables": ["jobs", "projects", "generated_themes"],
      "operations": ["select", "insert", "update", "delete"]
    },
    "storage": {
      "buckets": ["logos", "generated-themes"],
      "operations": ["upload", "download", "delete", "list"]
    }
  }
}
```

#### Usage in Code
Replace `src/lib/supabase/operations.ts` imports with MCP tool calls:

**Before (Current SDK):**
```typescript
import { JobOperations } from '@/lib/supabase/operations';
const job = await JobOperations.claim(workerId);
```

**After (MCP):**
```typescript
// Agent uses MCP tool directly
const job = await mcp.call('supabase.jobs.claim', { workerId });
```

#### Migration Path
1. Keep `operations.ts` as fallback
2. Add MCP wrapper: `src/lib/supabase/mcp-adapter.ts`
3. Gradually migrate worker and API routes to use MCP tools

---

### 2. WordPress MCP Server

#### Installation
```bash
# Option A: WordPress MCP (if community-built)
npm install @modelcontextprotocol/server-wordpress

# Option B: Custom Docker-based MCP
# See: scripts/wordpress-mcp-server.ts
```

#### Configuration
Create `.mcp/wordpress-config.json`:
```json
{
  "name": "wordpress-validator",
  "type": "wordpress",
  "instance": {
    "type": "docker",
    "image": "wordpress:latest",
    "plugins": ["woocommerce"],
    "autoStart": true
  },
  "capabilities": {
    "blocks": {
      "list": true,
      "validate": true
    },
    "themes": {
      "install": true,
      "activate": true,
      "test": true
    }
  }
}
```

#### Usage in Validators
**Before (Static Registry):**
```typescript
import { ALLOWED_BLOCKS } from './blocks/WordPressBlockRegistry';
// Static list, manually updated
```

**After (MCP):**
```typescript
// Agent queries live WordPress instance
const coreBlocks = await mcp.call('wordpress.blocks.list', { type: 'core' });
const wooBlocks = await mcp.call('wordpress.blocks.list', { type: 'woocommerce' });
```

#### Runtime Testing
```typescript
// Install generated theme in test WP instance
await mcp.call('wordpress.theme.install', { 
  zipPath: '/path/to/theme.zip' 
});

// Activate and test
await mcp.call('wordpress.theme.activate', { slug: 'test-theme' });
const result = await mcp.call('wordpress.theme.test', { 
  urls: ['/', '/shop', '/about'] 
});

// result = { passed: true, errors: [] }
```

---

### 3. GitHub MCP Server

#### Installation
```bash
npm install @modelcontextprotocol/server-github
```

#### Configuration
Create `.mcp/github-config.json`:
```json
{
  "name": "presspilot-repo",
  "type": "github",
  "repository": {
    "owner": "your-username",
    "repo": "PressPilot-OS",
    "branch": "main"
  },
  "auth": {
    "token": "${GITHUB_TOKEN}"
  },
  "capabilities": {
    "files": ["read", "write", "commit"],
    "branches": ["create", "merge"],
    "pullRequests": ["create", "review"]
  }
}
```

#### Usage for Multi-Agent Coordination
```typescript
// Agent 1: Updates generator
await mcp.call('github.file.update', {
  path: 'src/generator/index.ts',
  content: newGeneratorCode,
  message: 'feat: Add WooCommerce support'
});

// Agent 2: Updates worker (aware of Agent 1's changes)
const latestGenerator = await mcp.call('github.file.read', {
  path: 'src/generator/index.ts'
});
// Agent 2 can now coordinate with Agent 1's changes
```

---

## Integration Steps

### Step 1: Install MCP CLI
```bash
npm install -g @modelcontextprotocol/cli
```

### Step 2: Initialize MCP Configuration
```bash
mcp init
# Creates .mcp/ directory with config templates
```

### Step 3: Configure Each Server
Copy the JSON configs above into `.mcp/` directory.

### Step 4: Start MCP Servers
```bash
# Terminal 1: Supabase MCP
mcp start supabase

# Terminal 2: WordPress MCP
mcp start wordpress

# Terminal 3: GitHub MCP (optional)
mcp start github
```

### Step 5: Update Antigravity Settings
In your Antigravity IDE settings, add MCP server endpoints:
```json
{
  "mcp": {
    "servers": [
      {
        "name": "supabase",
        "url": "http://localhost:3100"
      },
      {
        "name": "wordpress",
        "url": "http://localhost:3101"
      },
      {
        "name": "github",
        "url": "http://localhost:3102"
      }
    ]
  }
}
```

### Step 6: Verify MCP Tools Available
Ask Antigravity:
> "List available MCP tools for Supabase"

Expected response:
- `supabase.jobs.claim`
- `supabase.jobs.complete`
- `supabase.storage.upload`
- etc.

---

## Migration Checklist

### Phase 1: Supabase MCP
- [ ] Install Supabase MCP server
- [ ] Configure `.mcp/supabase-config.json`
- [ ] Create adapter: `src/lib/supabase/mcp-adapter.ts`
- [ ] Update `scripts/start-worker.ts` to use MCP tools
- [ ] Update `scripts/cleanup-expired.ts` to use MCP tools
- [ ] Test job claiming with MCP vs SDK (verify identical behavior)

### Phase 2: WordPress MCP
- [ ] Set up Docker WordPress instance
- [ ] Install WordPress MCP server
- [ ] Update `BlockValidator.ts` to query live block list
- [ ] Create runtime test script using MCP
- [ ] Add to CI/CD pipeline

### Phase 3: GitHub MCP (Optional)
- [ ] Install GitHub MCP server
- [ ] Configure repository access
- [ ] Test multi-file edits via MCP
- [ ] Document agent coordination patterns

---

## Fallback Strategy
If MCP servers are unavailable:
1. **Supabase**: Use existing `operations.ts` (already implemented)
2. **WordPress**: Use static `WordPressBlockRegistry.ts` (already implemented)
3. **GitHub**: Use direct file system access (current behavior)

---

## Testing MCP Integration

### Test 1: Supabase Job Claim
```typescript
// scripts/test-mcp-supabase.ts
import { mcp } from '@/lib/mcp-client';

const job = await mcp.call('supabase.jobs.claim', { 
  workerId: 'test-worker' 
});

console.log('Claimed job:', job);
```

### Test 2: WordPress Block Validation
```typescript
// scripts/test-mcp-wordpress.ts
const blocks = await mcp.call('wordpress.blocks.list', { type: 'all' });
console.log(`Found ${blocks.length} blocks`);
```

### Test 3: GitHub File Update
```typescript
// scripts/test-mcp-github.ts
await mcp.call('github.file.update', {
  path: 'README.md',
  content: '# Updated via MCP',
  message: 'test: MCP integration'
});
```

---

## Benefits of MCP Integration

### Supabase MCP
- **Atomic Operations**: Built-in transaction support
- **Type Safety**: MCP tools are strongly typed
- **Audit Trail**: All DB operations logged by MCP server
- **Rate Limiting**: MCP handles connection pooling

### WordPress MCP
- **Always Up-to-Date**: Block list reflects latest WordPress/WooCommerce
- **Runtime Validation**: Test themes in real WordPress environment
- **No Manual Updates**: Eliminates need to manually sync block lists

### GitHub MCP
- **Conflict Resolution**: MCP handles merge conflicts
- **Multi-Agent Safety**: Prevents agents from overwriting each other
- **Atomic Commits**: All related changes committed together

---

## Troubleshooting

### MCP Server Won't Start
```bash
# Check logs
mcp logs supabase

# Verify config
mcp validate .mcp/supabase-config.json
```

### Tools Not Available in Antigravity
1. Restart Antigravity IDE
2. Check MCP server status: `mcp status`
3. Verify `.mcp/` configs are valid JSON

### Performance Issues
- MCP adds ~50-100ms latency per call
- Use batching for multiple operations
- Consider caching MCP responses

---

## Next Steps
1. Review this guide with your team
2. Install MCP CLI and servers
3. Test each MCP server independently
4. Gradually migrate PressPilot to use MCP tools
5. Document any custom MCP tools you build

---

## Resources
- [MCP Specification](https://modelcontextprotocol.io)
- [Supabase MCP Examples](https://github.com/modelcontextprotocol/servers/tree/main/src/supabase)
- [WordPress Docker Setup](https://hub.docker.com/_/wordpress)
- [GitHub MCP Documentation](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
