# Security Advisories & Known Scanner Findings

Vulnerability scanners (Snyk, GitHub Dependabot, `npm audit`, Orca, and similar tools) sometimes flag findings against packages that Compose SDK depends on, directly or transitively. Not every flagged finding represents an actual, exploitable risk in how Compose SDK uses that dependency. This page documents findings we've investigated.

**No action is required** in your application for the findings below, as long as you use the affected Compose SDK components as documented. If your own scanner still flags one of these, you can suppress it using your scanner's exception mechanism, referencing this page as justification.

## CVE-2025-69993 (Leaflet, transitive dependency)

`leaflet` (used by `@sisense/sdk-ui` for the Scattermap and Areamap chart types) has an open, unfixed [GHSA-h5cx-hfj5-x8v3](https://github.com/advisories/GHSA-h5cx-hfj5-x8v3) finding for a cross-site scripting issue in `bindPopup()`/`bindTooltip()`, which render a raw HTML string without sanitizing it.

The Leaflet maintainers have disputed this CVE with MITRE and marked it `wontfix` ([Leaflet/Leaflet#10214](https://github.com/Leaflet/Leaflet/issues/10214)): these APIs are documented to accept an HTML string, a DOM element, or a function, and it's the calling application's responsibility to sanitize any untrusted content before passing it in.

Compose SDK's Scattermap and Areamap chart renderers only use Leaflet's tooltip API (`bindTooltip()`) to render map labels — they don't use `bindPopup()` or any other Leaflet API that accepts raw HTML. The tooltip HTML that Compose SDK builds from your query result data (location names, formatted measure values) is fully sanitized with [DOMPurify](https://github.com/cure53/DOMPurify) before it's ever handed to Leaflet, so it cannot be used as an XSS vector regardless of the values present in your query results.
