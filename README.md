# SpicaVault — Private Media Vault

A secure and minimal private vault application designed to help users store and manage sensitive photos, videos, and files with full control and privacy.

## Overview

SpicaVault is built for users who want to keep personal content hidden from their main gallery without relying on insecure or ad-heavy applications. It provides a clean, distraction-free experience focused on privacy, performance, and simplicity.

## Problem

Most “secure folder” apps:
- rely heavily on ads and trackers
- provide weak or unclear data protection
- expose files through system galleries or backups
- offer poor user experience

Users need a trustworthy, offline-first solution where their data stays under their control.

## Solution

SpicaVault creates an isolated storage environment where:
- files are securely imported and hidden from public galleries
- access is restricted via authentication
- content is managed within a controlled, private interface

## Core Features

### 🔐 Security & Privacy
- App-level authentication (PIN / biometric ready)
- Hidden storage isolated from system gallery
- No third-party tracking or analytics

### 📁 Media Management
- Import photos and videos into vault
- Organized grid view for quick access
- Safe deletion and management tools

### ⚡ Performance
- Lightweight and fast
- Offline-first architecture
- Optimized media loading

## Tech Stack

- Mobile: React Native (Expo)
- Storage: Local device storage (secure handling)
- Future: Encryption layer (planned)

## Engineering Decisions

- Chose local storage over cloud to prioritize user privacy
- Avoided background sync to eliminate data leakage risks
- Designed import flow to ensure original files are not publicly accessible

## Challenges

- Handling file imports while respecting OS-level permissions
- Ensuring media is not indexed by system gallery apps
- Balancing security with smooth UX

## Future Improvements

- End-to-end encryption for stored media
- Decoy vault / stealth mode
- Cloud backup (user-controlled and encrypted)
- Folder-based organization

## Status

🚧 Actively in development

## Disclaimer

SpicaVault focuses on privacy but does not replace full device-level encryption. Users are responsible for securing their devices.

## License

MIT License
