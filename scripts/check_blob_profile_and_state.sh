#!/bin/bash

# Input and output files
INPUT_FILE="uuids.txt"
OUTPUT_FILE="results"

# Check if input file exists
if [[ ! -f "$INPUT_FILE" ]]; then
    echo "Error: Input file '$INPUT_FILE' not found!" >&2
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: 'jq' is required but not installed. Install with: apt-get install jq (or brew install jq)" >&2
    exit 1
fi

# Create/clear output file and add header (optional)
echo -e "id\tprofile\tstate" > "$OUTPUT_FILE"

# Process each UUID
while IFS= read -r uuid || [[ -n "$uuid" ]]; do
    # Skip empty lines and comments
    [[ -z "$uuid" || "$uuid" =~ ^[[:space:]]*# ]] && continue

    echo "Processing UUID: $uuid"

    # Execute command and capture output
    response=$(node dist/index.js blobs read "$uuid" 2>&1)
    exit_code=$?

    if [[ $exit_code -ne 0 ]]; then
        echo "⚠️ Error executing command for UUID '$uuid' (exit code: $exit_code)" >&2
        echo -e "$uuid\tERROR\tCOMMAND_FAILED" >> "$OUTPUT_FILE"
        continue
    fi

    # Try to parse JSON and extract fields
    id_val=$(echo "$response" | jq -r '.id // empty' 2>/dev/null)
    profile_val=$(echo "$response" | jq -r '.profile // empty' 2>/dev/null)
    state_val=$(echo "$response" | jq -r '.state // empty' 2>/dev/null)

    # Check if JSON parsing succeeded and fields exist
    if [[ -z "$id_val" || -z "$profile_val" || -z "$state_val" ]]; then
        echo "⚠️ Missing fields in JSON response for UUID '$uuid'" >&2
        echo -e "$uuid\tMISSING_FIELDS\t$profile_val" >> "$OUTPUT_FILE"
        continue
    fi

    # Append to output file (tab-separated)
    printf "%s\t%s\t%s\n" "$id_val" "$profile_val" "$state_val" >> "$OUTPUT_FILE"

done < "$INPUT_FILE"

echo "✅ Done! Results saved to '$OUTPUT_FILE'"