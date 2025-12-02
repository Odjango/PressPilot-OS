# YouTube Video Summary Tool — Mini Spec

This is a *side tool* inside PressPilot-OS. It does **not** touch the WP theme generator or PressPilot engine.

## Goal

User pastes a **YouTube URL** → clicks **Summarize Video** → gets:

- Executive summary
- Key takeaways (bullets)
- Actionable insights (bullets)
- Optional outline (with timestamps)
- Optional full article text
- Optional Arabic summary

All of this is returned as JSON from `/api/yt/summary` and rendered in `/tools/video-summary`.
