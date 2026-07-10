# PABLO: Learning Personalized Agent Orchestration with Factorized Bandits

This public repository hosts the static project page for **PABLO**:
Personalized Agent Bandit Learning for Orchestration.

The page is intentionally separated from the private research repository. It
contains only the public website assets:

- `index.html`
- `assets/css/style.css`
- `assets/js/main.js`
- `assets/img/pablo-flow.svg`
- `assets/data/pahf-results.json`
- `assets/data/math500-results.json`
- `assets/data/live-pablo-demo-trace.json`

The PAHF result summaries are preliminary. The page reports their absolute
values and explicitly notes that independent-seed intervals and promotion
benefits are not yet established.

## Local Preview

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## GitHub Pages

This repository is intended to publish from the `main` branch and repository
root:

```text
https://jindiande.github.io/personalized_agent_page/
```

The manuscript and implementation repository remain private unless separately
released.
