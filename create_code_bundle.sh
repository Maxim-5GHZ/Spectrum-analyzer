#!/bin/bash

OUTPUT_FILE="project_code_bundle.txt"

# Clear the output file if it exists
> "$OUTPUT_FILE"

echo "Collecting all .ts and .tsx files from the project (excluding node_modules)..."

# Find all .ts and .tsx files, excluding node_modules, and process them
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "./node_modules/*" | while read -r file; do
  echo "--- File Path: $file ---" >> "$OUTPUT_FILE"
  cat "$file" >> "$OUTPUT_FILE"
  echo -e "\n--- End of $file ---\n" >> "$OUTPUT_FILE"
done

echo "Done. All code has been written to $OUTPUT_FILE"
