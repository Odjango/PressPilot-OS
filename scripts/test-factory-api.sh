#!/bin/bash
# Test script for PressPilot Factory API
# This verifies the WordPress Factory Plugin endpoint is working

set -e

FACTORY_URL="https://factory.presspilotapp.com/wp-json/presspilot/v1/generate"

echo "=== PressPilot Factory API Test ==="
echo ""

# Get API key from server
echo "1. Getting API key from factory server..."
API_KEY=$(ssh factory "docker exec wordpress-moosc0gwkg48kss04c8cgkc4 wp option get presspilot_api_key --allow-root 2>/dev/null" || echo "")

if [ -z "$API_KEY" ]; then
    echo "ERROR: Could not retrieve API key from server"
    echo "Make sure SSH is configured: ssh factory"
    exit 1
fi

echo "   API Key: ${API_KEY:0:20}..."
echo ""

# Test the factory endpoint
echo "2. Testing factory endpoint..."
echo "   URL: $FACTORY_URL"
echo ""

RESPONSE=$(curl -s -X POST "$FACTORY_URL" \
  -H "Content-Type: application/json" \
  -H "X-PressPilot-Key: $API_KEY" \
  -d '{
    "businessName": "API Test Co",
    "category": "corporate",
    "colors": {
      "primary": "#1e40af",
      "secondary": "#64748b",
      "accent": "#f59e0b",
      "background": "#ffffff",
      "text": "#1f2937"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "content": {
      "hero": {
        "headline": "Welcome to API Test",
        "subheadline": "Testing the factory endpoint",
        "cta_text": "Get Started",
        "cta_url": "/contact"
      },
      "about": {
        "headline": "About Us",
        "description": "This is a test generation."
      }
    }
  }')

echo "3. Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "=== SUCCESS: Factory API is working ==="
    echo ""
    echo "n8n Workflow Configuration:"
    echo "  Endpoint: POST $FACTORY_URL"
    echo "  Header: X-PressPilot-Key: $API_KEY"
else
    echo "=== ERROR: Factory API request failed ==="
    exit 1
fi
