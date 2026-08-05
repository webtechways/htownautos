import { Injectable, Logger } from '@nestjs/common';
import { ProxyService, ImageFetchBlockedError } from '../proxy/proxy.service';

// ── Copart lotImages API response shape ──────────────────────────────────────
interface CopartImageLink {
  url: string;
  isThumbNail: boolean;
  isHdImage: boolean;
  isBlurred: boolean;
  isEngineSound: boolean;
}

interface CopartImageSequence {
  sequence: number;
  link: CopartImageLink[];
}

interface CopartImagesApiResponse {
  imgCount: number;
  lotImages: CopartImageSequence[];
}

/** One gallery image: a thumbnail (`thb`) + a high-resolution (`hrs`) URL. */
export interface GalleryImage {
  sequence: number;
  thumbnail: string;
  fullSize: string;
}

export interface GalleryResponse {
  lotNumber: string;
  imageCount: number;
  images: GalleryImage[];
}

/**
 * Fetches the image list for a Copart lot from the public inventory API, through
 * the Webshare backbone proxy. Shared by the API (on-demand galleries) and the
 * data-sync crawler (proactive caching) so the logic lives in one place.
 */
@Injectable()
export class CopartImagesService {
  private readonly logger = new Logger(CopartImagesService.name);

  constructor(private readonly proxyService: ProxyService) {}

  /**
   * Returns the sorted gallery images for a lot, or `[]` when the lot has no
   * images / the API returns a non-OK, non-block status (e.g. 404).
   *
   * Propagates {@link ImageFetchBlockedError} when the request stays blocked after
   * every retry, so callers that track jobs can mark them `failed`.
   */
  async fetchImages(
    lotNumber: string,
    opts?: { maxAttempts?: number },
  ): Promise<GalleryImage[]> {
    const apiUrl = `https://inventoryv2.copart.io/v1/lotImages/${lotNumber}`;

    let response: Response;
    try {
      response = await this.proxyService.fetchViaProxy(apiUrl, opts);
    } catch (err) {
      if (err instanceof ImageFetchBlockedError) throw err;
      this.logger.error(
        `[CopartImages] Error fetching lot ${lotNumber}: ${(err as Error).message}`,
      );
      return [];
    }

    if (!response.ok) {
      this.logger.warn(
        `[CopartImages] API returned ${response.status} for lot ${lotNumber}`,
      );
      return [];
    }

    let data: CopartImagesApiResponse;
    try {
      data = (await response.json()) as CopartImagesApiResponse;
    } catch (err) {
      this.logger.warn(
        `[CopartImages] Bad JSON for lot ${lotNumber}: ${(err as Error).message}`,
      );
      return [];
    }

    if (!data.lotImages || !Array.isArray(data.lotImages)) return [];

    return data.lotImages
      .filter((img) => img.sequence < 90)
      .sort((a, b) => a.sequence - b.sequence)
      .map((img) => {
        const thumbnailLink = img.link?.find((l) => l.isThumbNail);
        const hdLink = img.link?.find((l) => l.isHdImage);
        const fallbackUrl = img.link?.[0]?.url?.trim() || '';
        return {
          sequence: img.sequence,
          thumbnail: thumbnailLink?.url?.trim() || fallbackUrl,
          fullSize: hdLink?.url?.trim() || fallbackUrl,
        };
      })
      .filter((img) => img.thumbnail || img.fullSize);
  }
}
