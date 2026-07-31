# DESIGN.md — APEX Simracing Telemetry Design Spec

```yaml
tokens:
  colors:
    bg_primary: "#121212"
    bg_secondary: "#1E1E28"
    bg_tertiary: "#272732"
    accent_red: "#E10600"
    accent_red_hover: "#B80500"
    accent_green: "#00E676"
    accent_amber: "#FFAB00"
    text_primary: "#FFFFFF"
    text_secondary: "#A0A0B0"
    text_muted: "#6C6C7D"
    border_color: "#3A3A45"
  typography:
    header: "'Rajdhani', 'Oswald', sans-serif"
    title: "'Oswald', sans-serif"
    mono: "'Share Tech Mono', 'Roboto Mono', monospace"
    body: "'Titillium Web', -apple-system, sans-serif"
  borderRadius: "0px" # Strict 0px sharp telemetry geometry rule
  dimensions:
    headerHeight: "56px"
    bottomNavHeight: "64px"
    touchTargetMin: "48px"
```

## Visual Architecture & Rationale

- **Theme:** High-Performance Telemetry Aesthetic (Formula 1 / Simracing HUD).
- **Color Palette:** Pure `#121212` dark mode canvas, `#1E1E28` cards, with `#E10600` F1 Racing Red primary accents for active states, badges, and progress indicators.
- **Typography:** Hybrid display headers (`Rajdhani`, `Oswald`), monospaced telemetry telemetry values (`Share Tech Mono`), and legible technical body copy (`Titillium Web`).
- **Geometry:** Strict 0px border-radius across all components (buttons, cards, badges, inputs) to emulate rugged industrial sim-hardware and telemetry instruments.
