# TEAM ME PRO
### Intelligent Team Matchmaking, Multi-Touch Finger Chooser & Tournament Bracket Engine

> A cross-platform mobile and progressive web application engineered for deterministic team generation, fair roster distribution, multi-touch tactile selection, and single-elimination tournament management—built with React Native and an adaptive Glassmorphic design system.

---

<div align="center">

[![Download Latest Release](https://img.shields.io/badge/DOWNLOAD-v1.0.0_LATEST_RELEASE-2ea44f?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Amr-khalid/TeammeApp/releases/tag/v1.0.0)

[![Expo SDK](https://img.shields.io/badge/Expo-SDK_57.0-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.86.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-orange?style=for-the-badge)](https://expo.dev)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<br/>

[Downloads](#download--release-assets) •
[Overview](#overview) •
[Key Features](#key-features) •
[Screen Architecture](#screen-architecture) •
[Design System](#design-system--themes) •
[Matchmaking Algorithms](#matchmaking-algorithms) •
[Installation & Quick Start](#installation--quick-start) •
[Tech Stack](#tech-stack) •
[License](#license)

</div>

---

## Download & Release Assets

> ### **[Direct Download: Team Me Pro v1.0.0 (APK & Source Packages)](https://github.com/Amr-khalid/TeammeApp/releases/tag/v1.0.0)**
> Ready-to-install Android APK binaries, standalone release packages, and asset bundles are hosted directly on the GitHub Releases page. Click the link above or use the badge at the top to download the latest stable build.

---

## Overview

**TEAM ME PRO** is an offline-first mobile and progressive web application built to eliminate roster imbalance and streamline event coordination across sports, esports, and competitive group activities. The application integrates mathematical balancing heuristics, low-latency multi-touch detection, and automated tournament bracket progression inside a responsive glassmorphic interface with contextual haptics and spatial audio feedback.

---

## Key Features

### 1. Algorithmic Team Matchmaking
- **Four Dedicated Allocation Strategies**:
  - `Balanced Skill (Snake Draft)`: Sorts players by aggregate ratings and executes snake distribution paired with variance minimization to ensure uniform team power.
  - `Role & Position-Aware`: Balances critical on-field responsibilities (Goalkeepers, Defenders, Midfielders, and Forwards) proportionally across rosters.
  - `Captains Draft`: Seeds highest-rated players as team leads and iterates round-robin selections for remaining personnel.
  - `Fair Random`: Cryptographically unbiased distribution powered by the *Fisher-Yates* algorithm.
- **Interactive Lineup Swapping**: Instant drag-and-swap player reallocation with real-time recalculation of team averages and rating deltas.
- **One-Click Export**: Generates structured, shareable rosters formatted for WhatsApp, Telegram, or clipboard storage.

### 2. Multi-Touch Finger Chooser
- Hardware-accelerated touch tracking supporting up to **10 concurrent contact points**.
- Dynamic neon particle waves and pulse shaders mapping unique color hashes per touch index.
- **Three Operational Modes**:
  1. `Single Selection`: Selects a single initiator or captain at random.
  2. `Direct Team Split`: Segregates active contact points into balanced teams using synchronized color assignments.
  3. `Pair Matchmaker`: Automatically clusters adjacent inputs into duos.
- Real-time countdown sequence synchronized with stepped haptic pulses and rising frequency audio cues.

### 3. Knockout Tournament Bracket Engine
- Single-elimination bracket builder scaling across standard bracket sizes (Round of 16 through Finals and 3rd Place Playoff).
- Live match scoring interface with deterministic promotion of winners to downstream rounds.
- Automated champion podium module equipped with dynamic particle confetti and triumph audio feedback.

### 4. Decision Engine & Arbitrator
- **Custom Fortune Wheel**: Configurable probability wheel with dynamic deceleration physics and audio-indexed ticks.
- **3D Simulated Coin Toss**: Deterministic heads-or-tails physics simulation.
- **Contextual Decision Arbitrator**: Generates instant outcomes for tie-breakers and ambiguous decisions.

### 5. Roster & Player Database
- Normalized member profiles featuring 1-to-5 star skill ratings and positional attributes (Goalkeeper, Defender, Midfielder, Forward, Captain, Utility).
- **Intelligent Bulk Parser**: Parses unformatted text rosters pasted directly from messaging apps or plain text notes.
- In-memory search indexing, attribute filtering, and one-tap Active/Bench state toggles.

### 6. Offline-First Architecture & Data Privacy
- Zero backend dependencies, telemetric tracking, or compulsory user authentication.
- Client-side data persistence managed through `@react-native-async-storage/async-storage`.
- Snapshot-based JSON export and import for seamless backup and cross-device roster recovery.

### 7. Native Haptics & Audio Architecture
- Sound execution engine running via `expo-audio` providing distinct auditory cues for system triggers (selections, charging cycles, countdowns, whistles).
- Precision tactile responses utilizing `expo-haptics` to deliver low-latency touch confirmations.

### 8. Full Bilingual Internationalization
- Real-time dynamic switching between **Arabic (RTL)** and **English (LTR)** layouts.
- Preserves layout symmetry and token scaling irrespective of writing direction.

---

## Screen Architecture

| Screen Component | File Path | Functional Responsibility |
| :--- | :--- | :--- |
| **Home** | `src/screens/HomeScreen.js` | Main dashboard, metrics summary, quick action routing, and theme/locale switchers |
| **Members** | `src/screens/MembersScreen.js` | Roster database CRUD operations, bulk import pipeline, and rating configuration |
| **Generate** | `src/screens/GenerateScreen.js` | Team parameter setup, algorithm selection, balance calculation, live swapping, and export |
| **Finger Chooser** | `src/screens/FingerChooserScreen.js` | Multi-touch canvas supporting point tracking, particle rendering, and tactile selection |
| **Tournament** | `src/screens/TournamentScreen.js` | Knockout bracket generator, match result validation, and winner determination |
| **Oracle** | `src/screens/OracleScreen.js` | Physics-driven decision modules including spinning wheel, coin toss, and dispute resolution |
| **History** | `src/screens/HistoryScreen.js` | Local match logs and historic team distributions with rollback/re-export capabilities |
| **Settings** | `src/screens/SettingsScreen.js` | Design system preset management, audio/haptic toggles, locale settings, and JSON backup/restore |

---

## Design System & Themes

The application includes an internal tokenized styling engine providing 9 high-contrast Glassmorphism themes with blur backdrops and balanced visual hierarchies:

| Theme ID | Display Name | Accent Palette | Primary Hex Codes |
| :--- | :--- | :--- | :--- |
| `manga_black` | Shadow Noir | Monochrome Dark / Sky Blue | `#000000` \| `#38bdf8` |
| `manga_white` | Manga Paper | Clean Monochrome Light / Cyan | `#ffffff` \| `#0284c7` |
| `nebula` | Nebula (Default) | Deep Void / Electric Violet | `#070817` \| `#7c3aed` |
| `frost` | Pure Frost | Cool Light Gray / Deep Sky | `#f1f5f9` \| `#0284c7` |
| `corporate` | Obsidian Slate | Deep Charcoal / Slate Muted | `#0b0f19` \| `#94a3b8` |
| `royal` | Imperial Gold | Warm Onyx / Amber Gold | `#0c0a09` \| `#f59e0b` |
| `aurora` | Aurora Emerald | Forest Deep / Vivid Mint | `#041c16` \| `#10b981` |
| `cyber` | Cyber Voltage | Midnight / Cyan Neon | `#050811` \| `#00f0ff` |
| `crimson` | Velvet Crimson | Wine Dark / Hot Rose | `#180812` \| `#ec4899` |

---

## Matchmaking Algorithms

```mermaid
graph TD
    A[Active Roster Selection] --> B{Strategy Selection}
    B -->|Skill Balanced| C[Sort Descending by Rating]
    C --> D[Snake Draft Distribution]
    D --> E[Variance Minimization Pass]
    
    B -->|Position Aware| F[Group by Role: GK / DEF / MID / FWD]
    F --> G[Proportional Round-Robin Assignment]
    
    B -->|Captains Draft| H[Seed Top Ranked Captains]
    H --> I[Alternating Turn Selection Cycle]
    
    B -->|Pure Random| J[Fisher-Yates Fair Crypto Shuffle]
    
    E --> K[Computed Balanced Rosters]
    G --> K
    I --> K
    J --> K
    K --> L[Interactive Dynamic Player Swapping]
