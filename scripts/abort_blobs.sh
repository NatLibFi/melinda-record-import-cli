#!/bin/bash

# Check arguments
if [ $# -ne 1 ]; then
    echo "Usage: $0 <path_to_json_file>"
    exit 1
fi

JSON_FILE="$1"

# Check if jq exists
command -v jq >/dev/null || { echo "❌ 'jq' not found. Install with: sudo apt install jq" >&2; exit 2; }

# Check file exists and is readable
if [ ! -r "$JSON_FILE" ]; then
    echo "❌ File '$JSON_FILE' not found or not readable." >&2
    exit 3
fi

echo "🔍 Reading JSON from: $JSON_FILE"

# Validate JSON first (jq will print error if invalid)
if ! jq empty "$JSON_FILE" 2>/dev/null; then
    echo "❌ Invalid JSON in '$JSON_FILE'" >&2
    # Show first few lines for debugging
    echo "First 3 lines of file:"
    head -n 3 "$JSON_FILE"
    exit 4
fi

# Extract IDs — use explicit error handling
echo "✅ JSON is valid. Extracting IDs..."
ids=()
while IFS= read -r id; do
    ids+=("$id")
done < <(jq -r '.[].id' "$JSON_FILE" 2>/dev/null)

echo "📊 Found ${#ids[@]} ID(s)"

if [ ${#ids[@]} -eq 0 ]; then
    echo "⚠️ No IDs extracted."
    echo "🔍 Debug: Raw jq output:"
    jq -r '.[].id' "$JSON_FILE"
    exit 0
fi

echo "🚀 Starting abort commands..."
for id in "${ids[@]}"; do
    echo "➡️ Aborting blob: $id"
    node dist/index.js blobs abort "$id"
done

echo "✅ Done."
