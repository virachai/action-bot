# 🛡️ Risk Mitigation Strategy
> **Secure & Sustainable Growth Plan**

This document details actionable strategies to address the critical risks identified in the [Tech & Business Review](./TECH_BUSINESS_REVIEW.md).

---

## 1. 🤖 Risk: Platform Policy (Algorithm Detection)
**The Threat**: TikTok/YouTube downranking content identified as "Low Effort AI".

### ✅ Mitigation Strategy: The "Turing Test" Upgrade
*   **Goal**: Make content indistinguishable from high-effort human editing.

#### Action 1.1: Human-in-the-Loop Workflow
*   **Tech**: Build a "Review Queue" in the Dashboard.
*   **Process**:
    1.  AI generates Script.
    2.  Status set to `NEEDS_REVIEW` (instead of auto-rendering).
    3.  Human editor tweaks the joke/hook -> Clicks "Approve".
    4.  Video renders.

#### Action 1.2: Asset Quality Upgrade
*   **Tech**: Replace placeholders with **Pexels/Storyblocks API**.
*   **Logic**:
    *   *Search*: "Cyberpunk City"
    *   *Filter*: "4K", "Vertical", "No Copyright".

#### Action 1.3: Audio Humanization
*   **Tech**: Integrate **ElevenLabs** API.
*   **Nuance**: Use distinct "Voices" for different niches (e.g., "Deep Documentary Voice" for history, "Energetic Gen-Z" for tech news).

---

## 2. 💸 Risk: Cost Spirals
**The Threat**: Runaway scripts burning thousands of dollars in API credits or S3 storage.

### ✅ Mitigation Strategy: The "Circuit Breaker"

#### Action 2.1: Hard Rate Limits (Redis)
*   **Tech**: Implement a token bucket limiter in the Orchestrator.
*   **Rule**: `MAX_VIDEOS_PER_HOUR = 5` per channel.
*   **Effect**: Even if the loop bugs out, it hits a wall after $0.10 of spend.

#### Action 2.2: Daily Budget Caps
*   **Tech**: Database tracker for `daily_spend`.
*   **Logic**:
    *   Gemini Call: +$0.001
    *   ElevenLabs Call: +$0.10
    *   *Check*: `IF daily_spend > $5.00 THEN STOP`.

#### Action 2.3: S3 Lifecycle Policies
*   **Tech**: AWS S3 Rule.
*   **Rule**: "Expire objects in `temp/` folder after 24 hours." (No need to pay for intermediate render files).

---

## 3. ⚖️ Risk: Legal & Copyright
**The Threat**: Copyright strikes from using scraped images or licensed music.

### ✅ Mitigation Strategy: The "Clean Room" Approach

#### Action 3.1: Asset Allowlist
*   **Policy**: The code *strictly* forbids scraping Google Images.
*   **Source**: Only allow URLs from: `images.unsplash.com`, `videos.pexels.com`, `assets.storyblocks.com`.

#### Action 3.2: Automated Attribution
*   **Tech**: Append a "Credits" section to the video description automatically.
*   **Format**: "Footage provided by Pexels. Music by Epidemic Sound." (Keeps platforms happy).

---

## 4. 🕸️ Risk: Technical Debt (FFmpeg Fragility)
**The Threat**: Complex FFmpeg command strings breaking with minor version updates or becoming unreadable.

### ✅ Mitigation Strategy: Abstraction Layer

#### Action 4.1: Template Engine
*   **Concept**: Stop writing raw FFmpeg commands in Python.
*   **Solutuon**: Use a JSON-based "Timeline" format (similar to Remotion or Lottie).
*   **Benefit**: Editors can tweak `template.json` (change font size, color) without touching Python code.

#### Action 4.2: Visual Regression Testing
*   **Tech**: Generate a 1-second "Preview Frame" for every PR.
*   **Check**: Does the text wrap correctly? Is the background visible?

---

## 📋 Implementation Checklist

| Priority | Strategy | Implementation Effort |
| :--- | :--- | :--- |
| **P0 (Critical)** | **Review Queue** (Human-in-Loop) | Medium (Dashboard UI) |
| **P0 (Critical)** | **S3 Lifecycle Rules** | Low (AWS Config) |
| **P1** | **Pexels API Integration** | Low (Python Service) |
| **P1** | **ElevenLabs Integration** | Low (Python Service) |
| **P2** | **Budget Circuit Breaker** | Medium (DB Logic) |
| **P3** | **FFmpeg Template Engine** | High (Refactor) |
