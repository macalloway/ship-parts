#!/bin/bash
# Script pour exécuter le code TypeScript directement avec ts-node
# en s'assurant que les modules sont correctement résolus

# Définir NODE_PATH pour inclure les node_modules locaux et ceux de star-utils-lib
export NODE_PATH="$NODE_PATH:$(pwd)/node_modules:$(pwd)/../star-utils-lib/node_modules"

# Exécuter avec ts-node
npx ts-node --project tsconfig.json src/fleetManager.ts
