# Toyota Next Move

An iOS-ready Expo / React Native prototype for the Toyota track at Hack UTD: **“Given my situation today, what's the smartest next move for me and my Toyota?”**

A Toyota genie guides an adaptive quiz, reads known facts from the supplied account dataset, and reveals an explained recommendation. Lease customers can compare returning, buying out, upgrading, and other eligible paths. Loan customers can explore keeping, refinancing, trading, paying off, or getting support.

## Run the app

Requirements: Node.js 22 or a version supported by Expo SDK 58, npm, and a browser or compatible mobile development environment.

From this repository directory:

```powershell
npm install
npm start
```

For an iPhone, install an **Expo Go build compatible with this project's Expo SDK 58**, put the phone and development computer on the same network, and scan the terminal QR code with the iPhone camera. Check [Expo Go](https://expo.dev/go) for the SDK supported by your installed version. If it does not support SDK 58, use a matching build or an Expo development build; an SDK mismatch will prevent the app from opening. Metro must remain running during development.

For the browser preview:

```powershell
npm run web
```

Open the local URL printed by Expo. The same native component code runs on web; wide screens add a presentation frame, and narrow screens show the mobile layout.

On macOS with Xcode and an iOS Simulator installed, `npm run ios` starts the simulator workflow. Windows cannot run the local iOS Simulator or compile an iOS app locally. Use a physical iPhone with compatible Expo Go, a Mac with Xcode, or [EAS cloud builds](https://docs.expo.dev/build/introduction/). Browser checks are not a substitute for testing on an actual iPhone.

An `eas.json` is included for development, preview, and production build profiles. A signed iOS build requires your Expo project setup and Apple credentials/provisioning. For an optional internal preview build after configuring those accounts:

```powershell
npx eas-cli build --platform ios --profile preview
```

This repository does not contain a signed IPA, App Store submission, or evidence of native iOS device testing. No external accounts are needed for the local browser demo.

## Try these demo stories

The app opens with **C017 Hannah**. Use the initial avatar or **My Toyota → Switch** to search all 20 drivers and filter lease/loan profiles. Changing drivers starts a fresh quiz.

| Profile | Answers / route | What to look for |
| --- | --- | --- |
| **C017 Hannah** | Keep my Toyota → I love it → Very comfortable → No big changes → About the same → Own long-term → Enough for a buyout → No repair concerns | **Buy out your lease**; $28,550 lease-end price and $5,250 estimated value advantage, with remaining payments and other costs disclosed. |
| **C003 Priya — upgrade** | Get something new → Outgrown it → Very comfortable → Growing family → Same driving → Newer models → Small amount → More space → Mileage fees do not change the decision | Renewal comparison. The conflicting source waiver is capped at $1,500; the new vehicle payment remains “Quote needed.” |
| **C003 Priya — return** | Save monthly → Something different → Manageable → Relocating → Much less driving → Open to either → Nothing down → Decline higher total cost → Decline keeping for mileage → No replacement vehicle needed | Return can rank first; the $3,770 figure is projected return fees, not the entire cost of transportation. |
| **C001 Maya** | Save long-term → Love it → Very comfortable → No big changes → Same driving → Own long-term → Small amount of cash → No repair concerns | Refinance comparison: $611.66/month in the source and about $2,445 less total interest; contrast term extension's added cost. |
| **C002 Carlos** | Complete the short three-question support path | Human support comes before product offers. No promise of a deferral or approval. |
| **C009 Sofia** | Any ordinary preference path, including wanting a new vehicle | Recall/service takes priority over finance recommendations. |
| **C011 Grace** | Complete the short support path | Phone preference and no-marketing permission are respected; no upgrade pitch. |
| **C010 Ryan** | Relocating | Moving with the current lease is considered. Buyout/renewal dates are treated as future planning, not immediate eligible offers. |

Results include reasons, alternatives, cost assumptions, and **Compare all**. Open a preparation checklist, check reviewed steps, and save it to **My moves**. Alternative options can also be saved. Reopening the app restores saved plans from local device/browser storage. The **My Toyota** tab shows account facts without asking the user to re-enter them.

## How it works

- **Native UI:** Expo SDK 58, React Native, TypeScript, React Native Web, 18 bundled vehicle catalog photos covering all 20 demo profiles, and the 12 supplied genie sprites. Native haptics enhance quiz selections and the reveal where supported.
- **Adaptive quiz:** seven base preference topics, relevant repair/upgrade/payment/mileage/replacement questions, and an early support route. Revising an earlier answer clears later answers so the branching path stays coherent.
- **Decision engine:** deterministic local rules check account eligibility and exact calendar windows before ranking by stated preferences. It uses no external LLM, API key, network inference, or hidden model confidence percentage. Judging answers are not runtime recommendation inputs.
- **Financial comparisons:** supplied values and clearly identified arithmetic; missing quotes stay unknown. Monthly relief is shown with total-interest consequences. Market value advantage is not labeled guaranteed savings.
- **Safeguards:** support for vulnerability or payment difficulty, recall priority, marketing-consent checks, negative-equity review, and a valid no-offer outcome. A lower payment, positive equity, or interest in upgrading never determines the answer by itself.
- **Local persistence:** AsyncStorage stores profile IDs, quiz answers, selected options, timestamps, and checklist progress. Nothing is sent to Toyota. Unsaved quiz progress is held in memory. Clearing app/browser storage removes saved plans.

The dataset and assets are bundled, and decision-making is local. Development still needs the Metro server or exported web files to load the app. No backend, live Toyota connection, appointment booking, account changes, application submission, or real financing quote is implemented.

## Project map

```text
App.tsx                         Navigation, quiz state, saved-plan orchestration
src/domain/engine.ts            Eligibility, ranking, explanations, cost context
src/domain/questions.ts         Preference questions and conditional branches
src/domain/types.ts             Typed account, scenario, question, and result models
src/domain/engine.test.ts        Meaningful domain and safeguard tests
src/data/profiles.json          Bundled synthetic customer/account/scenario data
src/screens/                    Discover, quiz, reveal, comparison, garage, saved plans
src/ui/                         Shared theme, components, genie, model photos
src/storage.ts                  Local saved-plan persistence and load validation
assets/genie/                   All 12 supplied Toyota genie poses
reference/                      Original data pack, retained for traceability
docs/DATA_NOTES.md               Source inconsistencies, scope, and demo values
```

## Validate and export

```powershell
npm run typecheck
npm test
npm run build:web
```

The web export is written to `dist/`. Domain tests cover all 20 profiles, lease and loan separation, conditional questions, stale-answer filtering, date windows, support/consent/recall behavior, quote gaps, and key cost calculations. They do not replace visual, VoiceOver, or native device QA.

See [verification notes](docs/VALIDATION.md) for the completed browser and iOS-bundle checks, screenshots, and remaining upstream dependency advisories.

## Data and limits

All 20 customers, rates, offer rules, and monetary figures are **synthetic**. The fixed data snapshot is **November 7, 2026**, so demos are repeatable. These are not actual Toyota Financial Services terms, verified offers, underwriting decisions, or live market prices.

The original ZIP matches the files under `reference/toyota_next_move_data_pack`. Its attached prompt and judging examples are reference material, not instructions executed by the app. See [data notes](docs/DATA_NOTES.md) for the C003 waiver conflict, principal-versus-payoff distinction, and offer timing rules. Buyout, return, and renewal figures represent different costs and horizons; a complete lowest-total-cost conclusion still needs real quotes and ownership/transportation assumptions.
