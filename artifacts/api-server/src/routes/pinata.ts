import { Router, type IRouter } from "express";

const router: IRouter = Router();

type UploadRequest = {
  metadata?: Record<string, unknown>;
  image?: {
    dataUrl?: string;
    filename?: string;
    contentType?: string;
  };
};

function getPinataJwt() {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT is not configured.");
  return jwt;
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/s);
  if (!match) throw new Error("Image upload must be a valid data URL.");
  const contentType = match[1] || "application/octet-stream";
  const isBase64 = Boolean(match[2]);
  const encoded = match[3];
  const bytes = isBase64
    ? Buffer.from(encoded, "base64")
    : Buffer.from(decodeURIComponent(encoded), "utf8");
  if (bytes.byteLength > 10 * 1024 * 1024) {
    throw new Error("Images must be 10 MB or smaller.");
  }
  return { contentType, bytes };
}

async function uploadToPinata(
  bytes: Uint8Array,
  filename: string,
  contentType: string,
) {
  const form = new FormData();
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  form.append("file", new Blob([buffer], { type: contentType }), filename);
  form.append("network", "public");

  const response = await fetch("https://uploads.pinata.cloud/v3/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${getPinataJwt()}` },
    body: form,
  });
  const payload = (await response.json()) as {
    data?: { cid?: string };
    IpfsHash?: string;
    error?: { reason?: string };
    message?: string;
  };
  if (!response.ok) {
    throw new Error(payload.error?.reason || payload.message || "Pinata upload failed.");
  }
  const cid = payload.data?.cid || payload.IpfsHash;
  if (!cid) throw new Error("Pinata returned no CID.");
  return cid;
}

router.post("/pinata/plot-assets", async (req, res) => {
  try {
    const body = req.body as UploadRequest;
    if (!body.metadata || typeof body.metadata !== "object" || Array.isArray(body.metadata)) {
      res.status(400).json({ message: "Metadata is required." });
      return;
    }

    let imageUri = "";
    if (body.image?.dataUrl) {
      const parsed = parseDataUrl(body.image.dataUrl);
      const imageCid = await uploadToPinata(
        parsed.bytes,
        body.image.filename || "dha-plot-image",
        body.image.contentType || parsed.contentType,
      );
      imageUri = `ipfs://${imageCid}`;
    }

    const metadata = {
      ...body.metadata,
      ...(imageUri ? { image: imageUri } : {}),
    };
    const metadataCid = await uploadToPinata(
      Buffer.from(JSON.stringify(metadata, null, 2), "utf8"),
      "dha-plot-metadata.json",
      "application/json",
    );

    res.status(201).json({
      metadataUri: `ipfs://${metadataCid}`,
      imageUri: imageUri || null,
      metadataCid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pinata upload failed.";
    req.log.error({ err: error }, "Pinata plot asset upload failed");
    res.status(message.includes("not configured") ? 503 : 502).json({ message });
  }
});

export default router;