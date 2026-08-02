# Catalog enrichment

The catalog merges three free daily snapshots (no API keys):

| Feed | License | Snapshot | Normalize |
| --- | --- | --- | --- |
| [gpurentalprices.com](https://gpurentalprices.com/data) | CC BY 4.0 | `public/data/gpurentalprices-latest.json` | `normalizeGpuRentalSnapshot` |
| [gpucloudcompare.com](https://gpucloudcompare.com/data/) | CC-BY-4.0 | `public/data/gpucloudcompare-latest.json` | `normalizeGpuCloudCompareSnapshot` |
| [gridstackhub.ai](https://gridstackhub.ai/developers) | CC BY 4.0 | `public/data/gridstackhub-latest.json` | `normalizeGridstackSnapshot` |

`public/data.ts` merges all three into one `GpuCatalog`. Each `PriceEstimate` carries
`sourceId`; UI credits the matching feed under each price via `CatalogAttribution`.

**gpurentalprices** — broad neocloud / marketplace coverage; per-GPU $/hr. Feed has
no `gpu_count` / locations, so offerings stay 1× with `Multi-region`. Normalize keeps
distinct feed SKUs (e.g. `a100-sxm-40` vs `a100-sxm-80`, `h100-nvl` vs `h100-sxm`) and
drops generic `h100`/`a100` when a provider already publishes a specific SKU.

**gpucloudcompare** — complementary IaaS hosts (Latitude, DigitalOcean, OVH, Scaleway,
UpCloud, …) with real `gpu_count` (1–8), `locations[]`, and node CPU/RAM/disk when
present. Unmapped GPU models are skipped; discovery (`GPU_FAMILY_POPULARITY_ORDER`)
still lists H200/B200/etc. and surfaces them once feeds map into offerings.

**gridstackhub** — on-demand rows with `gpu_count`, `region`, and optional node specs.
Hyperscalers (AWS/Azure/GCP/Oracle/IBM) and Shadeform are excluded from the curated
allowlist; spot/reserved pricing types are dropped. Adds neocloud hosts not fully covered
by the other feeds (FluidStack, Genesis Cloud, Paperspace, Oblivus, Cirrascale, Jarvis
Labs, Thunder Compute, …).

**Deferred:** [gpucloudprices.com](https://gpucloudprices.com/api/) — free JSON but ToS
discourages republishing the compiled dataset; high overlap with existing feeds.

**Decision (2026-08-02):** The three free feeds above are enough for marketing-site
indicative market context until Shadeform/Latitude keys; those APIs remain a stopgap
until an internal deal book. Do not chase additional free scrapers for coverage.

## Keyed enrichment (when API keys arrive)

Enrich **without changing** `GpuCatalog` / `GpuOffering` shapes. Prefer merging into
the same `providerId` + family offerings (update price, regions, stock,
`provisioningType`).

### Shadeform

- Endpoint: `GET /instances/types`
- Filter: `deployment_type=baremetal`
- Use to correct `provisioningType` and add true bare-metal SKUs / regions
- Keep `isIndicative: true` unless the quote path replaces list prices

### Latitude.sh

- Endpoint: `GET /plans?filter[gpu]=true`
- Native bare-metal specs, USD hour/month, `stock_level`
- Map plans onto existing `GpuFamilyId` values; add regions from plan locations

## Ingest

```bash
pnpm catalog:ingest
```

Fetches all three feeds fail-soft to the last committed snapshot per file on network/shape
errors.
