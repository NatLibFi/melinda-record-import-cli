#!/bin/bash

# Check arguments
if [ $# -ne 1 ]; then
    echo "Usage: $0 <path_to_json_file>"
    exit 1
fi

JSON_FILE="$1"

# Check file exists and is readable
if [ ! -r "$JSON_FILE" ]; then
    echo "❌ File '$JSON_FILE' not found or not readable." >&2
    exit 3
fi

# Check if jq exists
command -v jq >/dev/null || { echo "❌ 'jq' not found. Install with: sudo apt install jq" >&2; exit 2; }

# Ensure data directory exists
mkdir -p ./data

echo "📄 Reading IDs from: $JSON_FILE"
echo "🔍 Extracted IDs:"
jq -r '.[].id' "$JSON_FILE" | head -3  # Show first 3 IDs for debug

# Read IDs into array (avoids subshell issues)
mapfile -t ids < <(jq -r '.[].id' "$JSON_FILE")

if [ ${#ids[@]} -eq 0 ]; then
    echo "⚠️ No 'id' fields found. Check JSON structure."
    echo "Sample JSON structure:"
    jq '.' "$JSON_FILE" | head -10
    exit 4
fi

echo "✅ Found ${#ids[@]} blob(s). Processing..."

for id in "${ids[@]}"; do
    if [ -z "$id" ]; then
        echo "⚠️ Skipping empty ID"
        continue
    fi

    echo "📦 Processing blob ID: $id"

    # Run command and redirect output to file
    node dist/index.js blobs read "$id" > "./data/${id}.json" 2>&1
    status=$?

    if [ $status -eq 0 ]; then
        echo "✅ Saved ./data/${id}.json"
    else
        echo "❌ Failed for ID: $id (exit code: $status)"
    fi
done

echo "🏁 Done! Processed ${#ids[@]} blob(s)."
