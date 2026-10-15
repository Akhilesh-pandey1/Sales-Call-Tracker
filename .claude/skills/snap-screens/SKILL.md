---
name: snap-screens
description: Take a full-page PNG screenshot of every HTML screen in a design folder's screens/ subfolder - reads the --M/--T/--P size marker in each file name and screenshots at exactly that width. Only the user can invoke it; the agent never runs it on its own. Use when the user asks to screenshot screens, snap screens, or turn HTML designs into PNGs.
disable-model-invocation: true
---

# Snap Screens

Turn every HTML screen in a design folder into a full-page PNG, saved next to the HTML with the same name. Each file name carries a size marker - the max size that screen is designed for. The script reads the marker and screenshots at exactly that width:

```
<folder>/screens/
  index.html              <- the runner - never screenshotted
  01-login--M.html     ->  01-login--M.png      (375px - mobile only)
  02-dashboard--T.html ->  02-dashboard--T.png  (768px - up to tablet)
  02-dashboard--P.html ->  02-dashboard--P.png  (1440px - up to PC)
```

Full page, top to bottom, in one shot - no scrolling. The PNG is what you give to an LLM instead of the full HTML code.

## Steps

1. **Find the design folder** - the folder that contains `screens/`. If the user gave a path with the command, use it. Otherwise try `design/`. No `design/screens/` - ask the user for the folder.
2. **Run the script**:

   ```bash
   python "<this skill's folder>/scripts/screenshot.py" "<folder>"
   ```

   - The script reads the `--M`, `--T`, or `--P` marker in each file name and picks the width itself - no width flag needed.
   - If `python` is missing, try `python3`, then `py -3`.
3. **Playwright missing?** The script prints two install commands. Pass them to the user exactly as printed and stop - never install packages yourself.
4. **Report** - PNG count, skipped files (if any), and the folder path. Then open 2-3 PNGs with the Read tool and look for real visual problems (overlapping text, broken layout, unreadable contrast). Report what you find. Fix the HTML only if the user says so.

## Guardrails

- User-invoked only - never run this skill as part of another skill or workflow.
- Never screenshot `index.html` (the runner) or `THEME.md` - only the marker-named screen files.
- A file without a size marker is skipped with a warning - never guess a width for it. Tell the user to rename it.
- Never delete or modify HTML files. PNGs are simply regenerated on every run.
