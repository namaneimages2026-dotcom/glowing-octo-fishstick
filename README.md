# Namane Supply Workflow & Sustainability Operating System

Namane Supply / Namane Images is a Johannesburg-based CO2 laser cutting and engraving studio focused on non-metal production: leather, MDF, plywood, acrylic, glass engraving, slate, paper/cardboard, and fabric.

This app is a complete front-end operating system for the business flow:
quote request → quote draft → client approval → deposit → production → readiness → collection/delivery → follow-up.

## Run locally

```bash
npm install
npm run dev
```

Build production bundle:

```bash
npm run build
```

## Implemented website/pages

- Home
- Services
- Materials
- Sustainability
- Education / CO2 Laser Simulator
- Quote Request
- B2B Retainers
- Portfolio / Case Studies
- Contact
- Operations (internal dashboard)

## Quote workflow and pricing logic

Pricing constants encoded in the quote engine:

- Retail minimum: **R250**
- B2B/Corporate minimum: **R500**
- Setup/design fees: **R150–R350** by artwork readiness
- Custom design rate: **R350/hour**
- Machine time rate: **R350/hour**
- Deposit: **60% before production**

Quote engine features:

- Rejects unsupported material requests (e.g. metal)
- Estimates machine minutes from material + service type + size + quantity
- Calculates machine cost = estimated minutes / 60 × R350
- Adds material estimate unless client-supplied material
- Adds rush fee for urgent deadlines
- Applies minimum job rules
- Outputs total, 60% deposit, and balance
- Includes terms and non-metal-only disclaimer

## Client approval + production workflow

### Client approval states

- New Request
- Quote Drafted
- Quote Sent
- Client Approved
- Deposit Required
- Deposit Paid
- Production Queued
- In Production
- Quality Check
- Ready for Collection/Delivery
- Completed
- Follow-up Sent

### Production dashboard

- Job cards in status columns
- Due dates + priority flags
- Client type, material, quantity, machine minutes
- Deposit/balance status
- Sustainability badge for offcut/recycled usage

## Sustainability module

Tracks:

- Material source (New sheet / Offcut / Client supplied / Reclaimed)
- Material type
- Estimated waste
- Offcuts generated and reused
- Waste diversion estimate
- Storytelling notes for client reporting

Sustainability principles in this system:

- Digital-first prototyping
- Efficient nesting and low-waste job planning
- Reuse of MDF/acrylic/leather/paper/fabric offcuts
- Small-batch local manufacturing
- Repeatable/repairable production files
- Clear reusable/recyclable scrap separation
- Honest CO2 context: electricity use + extraction requirements + responsible acrylic use

## Education simulator

Interactive CO2 training tool with controls for:

- Material
- Power %
- Speed mm/s
- Passes
- Focus offset
- Air assist on/off

Predicts outcomes such as:

- Clean cut
- Not cut through
- Excess burn
- Charring
- Melted edge
- Engrave only
- Unsafe/unsupported

Includes quest-based training scenarios.

## Automation-ready placeholders (not yet live)

- Gmail quote send
- WhatsApp reminder send
- Google Calendar production slot booking
- Google Drive proof file storage
- Stripe/PayFast/manual EFT deposit tracking
- GitHub Issues/Codex dev task creation

All placeholders are wired in UI with **“coming soon”** labels and async stubs.

## Known limitations

- Uses local component state and seed/mock data only (no backend persistence)
- File upload is placeholder-only
- No authentication/roles yet
- No real payment gateway integration yet

## Future backend compatibility

Data model is structured for future migration to Supabase/Firebase/custom APIs using entities:

- Client
- QuoteRequest
- Quote
- Job
- Material
- SustainabilityRecord
- ProductionStatus
- RetainerPlan
- SimulatorScenario
