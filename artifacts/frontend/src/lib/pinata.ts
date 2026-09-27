import type { PlotMetadata } from '@/lib/dha-contract';

export type PinataUploadResult = {
  metadataUri: string;
  imageUri: string | null;
  metadataCid: string;
};

export async function uploadPlotAssets(
  metadata: PlotMetadata,
  imageFile?: File,
): Promise<PinataUploadResult> {
  const image = imageFile
    ? {
        dataUrl: await fileToDataUrl(imageFile),
        filename: imageFile.name,
        contentType: imageFile.type || 'application/octet-stream',
      }
    : undefined;

  const response = await fetch('/api/pinata/plot-assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metadata, image }),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    metadataUri?: string;
    imageUri?: string | null;
    metadataCid?: string;
    message?: string;
  };
  if (!response.ok || !payload.metadataUri) {
    throw new Error(payload.message || 'Pinata could not save the plot assets.');
  }
  return {
    metadataUri: payload.metadataUri,
    imageUri: payload.imageUri || null,
    metadataCid: payload.metadataCid || '',
  };
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('The selected image could not be read.'));
    reader.readAsDataURL(file);
  });
}