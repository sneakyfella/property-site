#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# new-listing.sh  —  Scaffold a new property listing in seconds
# Usage:  ./new-listing.sh <listing-id>
# Example: ./new-listing.sh jurong-west-hdb-blk123
# ─────────────────────────────────────────────────────────────────

set -e

LISTING_ID="$1"

if [ -z "$LISTING_ID" ]; then
  echo "Usage: ./new-listing.sh <listing-id>"
  echo "Example: ./new-listing.sh river-valley-condo"
  exit 1
fi

LISTING_DIR="listings/$LISTING_ID"

# 1. Check for duplicates
if [ -d "$LISTING_DIR" ]; then
  echo "❌  Folder '$LISTING_DIR' already exists. Choose a different ID."
  exit 1
fi

# 2. Create folder structure
mkdir -p "$LISTING_DIR/photos"

# 3. Copy template
cp listings/_template/listing.json "$LISTING_DIR/listing.json"

# 4. Swap in the listing ID
sed -i "s/\"id\": \"LISTING_ID\"/\"id\": \"$LISTING_ID\"/" "$LISTING_DIR/listing.json"

# 5. Register in the index (jq preferred; plain sed fallback)
if command -v jq &>/dev/null; then
  TMP=$(mktemp)
  jq --arg id "$LISTING_ID" \
     '.listings += [{"id": $id, "active": true}]' \
     data/listings-index.json > "$TMP" && mv "$TMP" data/listings-index.json
  echo "✅  Registered '$LISTING_ID' in data/listings-index.json via jq"
else
  # Fallback: append before the closing ]
  sed -i "s/\]$/  ,{\"id\": \"$LISTING_ID\", \"active\": true}\n]/" data/listings-index.json
  echo "✅  Registered '$LISTING_ID' in data/listings-index.json (plain sed)"
fi

# 6. Done
echo ""
echo "──────────────────────────────────────────────"
echo "  New listing scaffolded!"
echo ""
echo "  📁  $LISTING_DIR/"
echo "      ├── listing.json   ← fill in all details"
echo "      └── photos/        ← drop photo1.jpg, photo2.jpg …"
echo ""
echo "  Next steps:"
echo "  1. Open $LISTING_DIR/listing.json and fill in price,"
echo "     address, description, photos array, etc."
echo "  2. Drop your photos into $LISTING_DIR/photos/"
echo "  3. Set \"active\": true is already done ✓"
echo "  4. Set \"featured\": true to show on homepage"
echo "──────────────────────────────────────────────"
