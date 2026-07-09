#!/bin/bash

# Install GBrain sync for macOS

# Create the GBrain directory if it doesn't exist
mkdir -p ~/.gbrainsync

# Download the GBrain binary
curl -o ~/.gbrainsync/gbrain https://example.com/gbrain-macos

# Make the binary executable
chmod +x ~/.gbrainsync/gbrain

# Add GBrain to the PATH
if ! grep -q "export PATH=\$PATH:~/.gbrainsync" ~/.zshrc; then
    echo "export PATH=\$PATH:~/.gbrainsync" >> ~/.zshrc
fi

# Verify installation
if command -v gbrain &> /dev/null; then
    echo "GBrain sync installed successfully"
else
    echo "GBrain sync installation failed"
    exit 1
fi
