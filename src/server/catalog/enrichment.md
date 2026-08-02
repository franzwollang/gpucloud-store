# Catalog enrichment (pending keys)

The MVP catalog is normalized from the free
[gpurentalprices.com](https://gpurentalprices.com/data) daily snapshot
(`public/data/gpurentalprices-latest.json` → `src/lib/catalog/normalize.ts`).

When API keys arrive, enrich **without changing** `GpuCatalog` /
`GpuOffering` shapes. Prefer merging into the same `providerId` + family
offerings (update price, regions, stock, provisioningType).

## Shadeform

- Endpoint: `GET /instances/types`
- Filter: `deployment_type=baremetal`
- Use to correct `provisioningType` and add true bare-metal SKUs / regions
- Keep `isIndicative: true` unless the quote path replaces list prices

## Latitude.sh

- Endpoint: `GET /plans?filter[gpu]=true`
- Native bare-metal specs, USD hour/month, `stock_level`
- Map plans onto existing `GpuFamilyId` values; add regions from plan locations

## Ingest

```bash
pnpm catalog:ingest
```

Fails soft to the last committed snapshot on network/shape errors.
