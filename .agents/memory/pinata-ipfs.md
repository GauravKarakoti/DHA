---
name: Pinata IPFS integration
description: DHA uses a server-side Pinata v3 upload flow for plot images and metadata.
---

Keep `PINATA_JWT` as a server-only secret, upload through the API server, and return only public `ipfs://` URIs to the browser. Pinata's public v3 files endpoint accepts multipart `file` uploads and returns `data.cid`.

**Why:** Exposing the JWT in Vite client variables would let every browser user reuse the project credential.

**How to apply:** Upload the optional image first, merge its `ipfs://` URI into the metadata JSON, upload that JSON, and mint the resulting metadata URI. Use a public Pinata gateway for browser reads.