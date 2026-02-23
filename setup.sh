#!/bin/bash

# プロジェクトセットアップスクリプト

echo "Setting up SiteReportMatch project..."

# .claude ディレクトリ作成
mkdir -p .claude

# .claude/settings.json 作成
cat > .claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": [],
    "deny": []
  },
  "enableAllProjectMcpServers": true
}
EOF

echo "Created .claude/settings.json"

# .gitignore 作成
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Testing
coverage/

# Cache
.cache/
.turbo/
EOF

echo "Created .gitignore"

# README.md 作成
cat > README.md << 'EOF'
# SiteReportMatch

## セットアップ

```bash
chmod +x setup.sh
./setup.sh
```

## プロジェクト構成

```
SiteReportMatch/
├── .claude/
│   └── settings.json
├── docs/           # 設計書
├── src/            # ソースコード
├── setup.sh
└── README.md
```
EOF

echo "Created README.md"

# docs ディレクトリ作成（設計書用）
mkdir -p docs

echo "Created docs/ directory for design documents"

# src ディレクトリ作成
mkdir -p src

echo "Created src/ directory"

echo ""
echo "Setup complete!"
echo "Please place your design documents in the docs/ directory."
