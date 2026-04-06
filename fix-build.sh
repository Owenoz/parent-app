#!/bin/bash

echo "🔧 Fixing StudentApp for EAS Build..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Backup package.json
echo "📦 Backing up package.json..."
cp package.json package.json.backup
echo -e "${GREEN}✓${NC} Backup created"
echo ""

# Step 2: Remove incompatible packages
echo "🗑️  Removing incompatible packages..."
npm uninstall \
  react-native-camera \
  react-native-background-job \
  react-native-push-notification \
  react-native-speech-to-text \
  react-native-text-to-speech \
  2>/dev/null

echo -e "${GREEN}✓${NC} Incompatible packages removed"
echo ""

# Step 3: Install Expo alternatives
echo "📥 Installing Expo alternatives..."
npm install \
  expo-camera \
  expo-notifications \
  expo-speech \
  expo-task-manager

echo -e "${GREEN}✓${NC} Expo packages installed"
echo ""

# Step 4: Clean cache
echo "🧹 Cleaning cache..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf android/build 2>/dev/null
rm -rf ios/build 2>/dev/null

echo -e "${GREEN}✓${NC} Cache cleaned"
echo ""

# Step 5: Reinstall dependencies
echo "📦 Reinstalling dependencies..."
npm install

echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

echo -e "${GREEN}✅ Build fix complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update imports in your code (see EAS_BUILD_FIX.md)"
echo "2. Run: eas build --platform android --profile preview"
echo ""
echo "Or test immediately with Expo Go:"
echo "  npm start"
echo "  Then scan QR code with Expo Go app"
echo ""
