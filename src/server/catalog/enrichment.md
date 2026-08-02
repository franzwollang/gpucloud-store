# Catalog enrichment

The catalog merges two free daily snapshots (no API keys):

| Feed | License | Snapshot | Normalize |
| --- | --- | --- | --- |
| [gpurentalprices.com](https://gpurentalprices.com/data) | CC BY 4.0 | `public/data/gpurentalprices-latest.json` | `normalizeGpuRentalSnapshot` |
| [gpucloudcompare.com](https://gpucloudcompare.com/data/) | CC-BY-4.0 | `public/data/gpucloudcompare-latest.json` | `normalizeGpuCloudCompareSnapshot` |

`public/data.ts` merges both into one `GpuCatalog`. Each `PriceEstimate` carries
`sourceId`; UI credits the matching feed under each price via `CatalogAttribution`.

**gpurentalprices** — broad neocloud / marketplace coverage; per-GPU $/hr; offerings
are 1× with `Multi-region` until richer feeds land.

**gpucloudcompare** — complementary IaaS hosts (Latitude, DigitalOcean, OVH, Scaleway,
UpCloud, …) with real `gpu_count` (1–8), `locations[]`, and node CPU/RAM/disk when
present. Unmapped GPU models are skipped; discovery (`GPU_FAMILY_POPULARITY_ORDER`)
still lists H200/B200/etc. and surfaces them once feeds map into offerings.

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

Fetches both feeds fail-soft to the last committed snapshot per file on network/shape
errors.
