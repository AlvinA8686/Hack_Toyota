# Prototype verification

Verified on November 8, 2026, using the supplied November 7 synthetic account snapshot.

- TypeScript: `npm run typecheck` passes with the Expo SDK 58 compatible toolchain.
- Decision engine: all 18 tests pass, including all 20 profiles, conditional paths, invalid/stale answers, consent, support, recalls, eligibility dates, loan payoff, and the known dataset contradictions.
- Web release: `npm run build:web` exports successfully to `dist/`.
- iOS JavaScript: `npx expo export --platform ios --output-dir dist-ios` produces a Hermes bundle. This is a JavaScript bundle check, not a signed native application or physical-device test.
- Browser interaction: completed Hannah's eight-question buyout path and verified the $28,550 price and $5,250 value advantage; completed Carlos's three-question support route and confirmed product pitches are absent in the comparison.
- Persistence: saved a buyout checklist with one reviewed item, reloaded the page, and reopened the plan with its progress intact.
- Layout: inspected the app at 375 × 812 and 390 × 844 mobile viewports and a 1280 × 900 desktop viewport. No browser console errors appeared during the exercised flows.

Screenshots: [desktop home](screenshots/home-desktop.png) and [iPhone-sized reveal](screenshots/reveal-iphone.png).

## Vehicle photo and navigation update

- TypeScript and the web release export pass after replacing the generic vehicle artwork.
- All 20 profiles resolve to one of 18 bundled, matching model/year photos; the original PNG collection was visually inspected.
- At a 390 × 844 viewport, checked the Highlander photo on the home card and garage, then switched to Maya and confirmed her RAV4 photo appears.
- Entered the garage from the home account card and from the My Toyota tab. The labeled Home back button returned to Discover in both cases.
- No browser console errors appeared during these checks. See the [updated garage screenshot](screenshots/garage-with-vehicle.png) and [image source notes](VEHICLE_IMAGES.md).

Dependency audit: npm reports five moderate affected packages, with no high or critical findings. These trace to two upstream tooling advisories in `glob` and `minimatch`, through Expo CLI/fingerprinting: [glob cancellation](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) and [minimatch pattern amplification](https://github.com/advisories/GHSA-g3hv-75wg-m249). npm's proposed automatic fix would downgrade Expo across major versions to SDK 53; it was not applied because it would break the verified SDK 58 dependency set. Review compatible upstream fixes before production distribution.

Still needed before distribution: physical iPhone testing (including VoiceOver and larger text), native signing/provisioning, and any real Toyota integration. The demo saves plans locally and does not submit applications, send messages, book appointments, or alter accounts.
