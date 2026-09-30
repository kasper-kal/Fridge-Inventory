---
name: Onboarding in drawers
description: Interaction rule for tutorial steps that open modal drawers or other portal-based surfaces.
---

When onboarding directs a user into a drawer or modal, move the instruction into that surface and keep it visible while the user completes the task. Do not remove all guidance when the tutorial overlay unmounts, and do not treat opening a menu as completing the step.

**Why:** A tutorial overlay may be dismissed or obscured when a portal-based drawer opens, leaving the user without the instruction they need to continue.

**How to apply:** Put the active step’s short instruction inside the drawer/modal content and signal advancement from the successful submit/action path. On cancellation, close the step cleanly without marking it complete.