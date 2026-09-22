# Trusted HTML rendering for Lab posts

## What will change
- Detect Lab post content that begins with the exact string `<div class="lab-post"`.
- Render matching content as trusted HTML on the Lab detail page instead of sending it through the existing markdown renderer.
- Before rendering, remove every `<script>` element and every HTML attribute whose name begins with `on`, such as `onclick` or `onerror`.
- Keep all other post content on the current markdown rendering path without changing its behavior.
- Wrap both content paths in a horizontally clipped container so wide embedded content, including inline SVGs, cannot cause mobile page overflow.

## Technical details
- Add a small deterministic sanitizer near the Lab detail route so server and browser output match during hydration.
- Preserve the existing mid-article signup placement for markdown posts; trusted HTML posts render their supplied HTML as authored.
- Verify type safety and test both an HTML-prefixed post and a regular markdown post at mobile width.
