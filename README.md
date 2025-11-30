# GPUcloud Store

Main site for GPUcloud Store.

## Tooling

- Volta
- pnpm
- ESLint
- Prettier

## TODO

- Make simple-search and halo-search share as much code as possible

- Add hybrid server/client form validation helpers
- INTL w/ autodetect & fallbacks (English/German/Portuguese)
- Add GTM support
- Add GDRP cookie banner

- Add static-generated blog content from markdown (PoC)
- Convert blog content from markdown-based to PayloadCMS with basic shadcn-based blocks

- Region specific content/styling

==========================================

## Revision

### 1. Big picture: does this flow fit a broker?

**Yes, but only if the copy is honest about what happens after "Add to plan".**

Right now the UI visually screams instant cloud:

- "Instant GPU Power – Spin up GPUs in seconds…"
- Capacity plan
- Hourly price next to each config

**That's 100% the on-demand mental model.**

For a broker, the same UI can totally work if you reposition it as:

- "Design your cluster + see indicative rates"
- Plan = Capacity Plan, not a literal checkout
- Final CTA = Request Capacity / Get Custom Quote, not "Buy"

**So: interaction model = great, expectation management = needs copy tweaks.**

### 2. Hero & search: how to position it

#### Keep:

- The single search bar as the primary affordance. It feels powerful and focused.
- The dark/fog/sodium lamp aesthetic – it's nicely "serious AI infra".

#### Change:

Add the one-liner right under "GPUCloud" that sets the frame:

- **Dedicated GPU capacity, brokered across multiple providers for serious AI workloads.**
- **Plan, price, and secure dedicated GPU clusters – we handle the providers.**

Swap the feature cards' copy so they don't promise instant spin-up:

- **Instant GPU Power → Guaranteed Capacity**
  - Secure dedicated GPUs for multi-week training runs – no spot interruptions, no marketplace volatility.
- **Predictable Pricing** can stay, but maybe:
  - Transparent example hourly rates and contract terms – no surprise fees, no opaque discounts.
- **Global Availability → Multi-provider Coverage**
  - One contract, many regions and data centers – we broker capacity where you need it.

**The visual treatment is good; the words just need to match the brokerage reality.**

### 3. Config search + list: what to surface

The search → list → detail modal is great. For a broker, I'd tweak what you show:

#### Keep:

- SKU (L40S x8, A100 x8, etc.)
- vCPU / RAM / NVMe
- An hourly rate in the list – that's how people think.

#### Add / change:

Somewhere in the row or modal, add brokerage-specific metadata:

- Region(s) typically available
- Typical lead time (e.g. "1–3 days to provision")
- Minimum term (e.g. "Monthly contract" / "3-month minimum")
- A small label: "Rate from… (subject to availability)"

In the detail modal, change the "Hourly Rate" section to feel like an estimate, not a live meter:

- **Heading: Estimated Hourly Rate**
- **Subtext: Final pricing confirmed in your quote based on region, term, and volume.**

That keeps the UX snappy but sets the right expectations.

### 4. Plan: capacity planning for structured quotes

The plan UX is very clever for steering people into a structured quote.

#### Keep:

- The ability to add multiple configs (A100 x8 + 4090 x4 etc.).
- The "Contact Sales Representative" CTA.
- The side-drawer plan pattern.

#### Change:

The plan terminology has been implemented as "Capacity Plan" throughout the application.

In the plan, show summary stats that match how serious users think:

- Total GPUs (e.g. "Total: 24 GPUs across 3 configs")
- Rough monthly estimate (e.g. "Est. $X–Y /month @ 24/7 usage")
- Maybe a "Target start date" field in the quote flow later.

Change the blue CTA to something like:

- **"Request Capacity & Quote"**
- with subtext: **We’ll match you with providers and send a detailed quote within 24 hours.**

That makes it very clear this is not an instant checkout.

### 5. Quote form page: you're 90% there

The side-by-side configs + form is exactly what you want: it reminds people what they're asking for and pushes them to clarify requirements.

#### Keep:

- Search + add configs on the left.
- Editable selected configs list.
- Right-hand form with Name / Company / Role / Additional requirements.

#### Improve:

Make the "What we can help with" block more broker-specific:

- Global GPU capacity brokerage
- Dedicated clusters for LLM training & long-running jobs
- Hybrid / multi-provider setups with one contract & bill
- Advisory on GPU choice & topology

Add response expectation at the bottom:

- **We typically respond within 4 business hours with availability & next steps.**

Include a small line like:

- **Need to send a spec doc instead? Email us at …**

This keeps the human + concierge vibe strong.

**Headline:**

```
Find real GPU capacity. We handle everything else.
```

**Subheadline (microcopy, optional but strong):**

```
Search configurations, build your cluster plan, and request dedicated capacity — brokered across our global partners.
```

**Search Bar Placeholder:**

```
Search GPU configs…
```

**Visuals:** Your fog + sodium lamp + subtle lightning aesthetic matches the tone perfectly.

#### 2. Flicker Cards (6 total)

These appear under the hero section and cycle slowly. Content should feel calm, premium, and credible — not overselling. Each card is titled with a "feeling word" that complements the larger, clean white card title beneath it.

**Card 1:**

```
Focused
Guaranteed GPU Capacity
Dedicated hardware secured for long-running training jobs — no interruptions, no volatility.
```

**Card 2:**

```
Clear
Transparent, Indicative Pricing
Browse real configurations with hourly rates. Final pricing depends on region, term, and volume.
```

**Card 3:**

```
Connected
Global Multi-Provider Coverage
One contract, many data centers. We match your needs with the best available capacity worldwide.
```

**Card 4:**

```
Deliberate
Cluster-Ready Configurations
Build multi-GPU node groups and full clusters in seconds. Your plan becomes your quote request.
```

**Card 5:**

```
Assured
SLA-Backed Provisioning
We coordinate timelines, uptime guarantees, and provider-side escalations on your behalf.
```

**Card 6:**

```
Supported
Engineering-First Partnership
Direct access to experienced infra engineers for provisioning, networking, and distributed training.
```

#### 3. Middle Section(s) — Filling the Empty Space Elegantly

You have a large gap between the hero + flicker cards and the bottom contact section. The goal is to add meaning without noise, in the same premium minimalist tone.

**Section A — "How It Works" (3 Steps, Beautiful, Minimal):**

```
How It Works

1. Search Configurations
Find the GPU models and node types you need, with indicative pricing.

2. Build Your Cluster Plan
Add nodes to your plan. Define quantities, memory requirements, and preferred regions.

3. Request Dedicated Capacity
We match your plan with available hardware across our partners and handle procurement end-to-end.
```

**Section B — "Who We Serve" (3 short bullets):**

```
Designed for Serious AI Teams

Research labs running multi-week model training
Startups scaling inference and fine-tuning pipelines
Enterprises migrating GPU workloads off hyperscalers
```

**Section C — (Optional) A Single Statement Banner:**

```
Dedicated GPU infrastructure — without the complexity of managing providers.
```

#### 4. Contact Form Section (refined copy)

**Headline:**

```
Request Dedicated GPU Capacity
```

**Subheadline:**

```
Send us your cluster plan or describe your requirements — we'll respond within 24 hours with availability and pricing.
```

**Left Column (Your Configurations):**

```
Your Cluster Plan
[Indicative rates shown. Final pricing is based on region, duration, and volume.]
```

**Right Column (Form Fields):**

- Name
- Company
- Email
- Role (dropdown: CTO, ML Engineer, Founder, Researcher, etc.)
- Additional Requirements
- Placeholder: "Networking needs, storage preferences, regions, timelines, or any specification details…"

**Submit Button:**

```
Request Quote
```

**Below the Form:**

```
Need to send a spec document instead? Email us at shrey@gpucloud.store
```

#### 5. Optional Footer (minimal, premium)

Barely-visible links:

- Privacy
- Terms
- Status
- Contact

A small line:

```
© 2025 GPUCloud. Dedicated GPU capacity brokered worldwide.
```

#### Putting It All Together (Structural Flow)

**Top (Hero Section):**

- Headline + subheadline
- Search bar
- Fog aesthetic
- Flicker Cards (rotating 3–6)

**Middle Block (fills the gap elegantly):**

- "How it Works" (3 steps)
- "Who We Serve"
- Optional confidence banner

**Bottom (Contact Form Section):**

- Clear headline
- Refined copy
- Cluster plan preview on left
- Form on right
- Microcopy + direct email

**Recommended Card Rotation:**
If you want only three cards to dominate the cycle (with others rotating more sparsely), the strongest picks are:

- **Focused** — Guaranteed GPU Capacity
- **Connected** — Global Multi-Provider Coverage
- **Deliberate** — Cluster-Ready Configurations

These anchor the product's core: availability → global reach → structured cluster planning.
