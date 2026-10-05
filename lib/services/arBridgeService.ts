/**
 * 🏛️ Veloura Living — Phase 13 AR & WebXR Bridge Service
 * Generates Mobile QuickLook / SceneViewer intents and QR code payloads.
 */

import { ConfigurableFurniturePiece } from '@/types/configurator';

export interface ARIntentPayload {
  deviceType: 'ios' | 'android' | 'desktop';
  arUrl: string;
  fallbackQrUrl: string;
  title: string;
}

export class ARBridgeService {
  /**
   * Generates device-specific AR launch intent or mobile scan link
   */
  static generateARPayload(
    piece: ConfigurableFurniturePiece,
    configurationQuery: string,
    originUrl: string = 'https://veloura-living.vercel.app'
  ): ARIntentPayload {
    const isClient = typeof window !== 'undefined';
    const userAgent = isClient ? navigator.userAgent : '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);

    const configuratorDirectUrl = `${originUrl}/configurator?piece=${piece.id}&${configurationQuery}&ar_mode=1`;

    let deviceType: 'ios' | 'android' | 'desktop' = 'desktop';
    let arUrl = configuratorDirectUrl;

    if (isIOS) {
      deviceType = 'ios';
      // iOS AR QuickLook scheme fallback
      arUrl = piece.usdzModelUrl || configuratorDirectUrl;
    } else if (isAndroid) {
      deviceType = 'android';
      // Android Google Scene Viewer intent fallback
      if (piece.glbModelUrl) {
        arUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
          piece.glbModelUrl
        )}&mode=ar_only&title=${encodeURIComponent(piece.name)}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end;`;
      } else {
        arUrl = configuratorDirectUrl;
      }
    }

    // High quality QR Code API link with warm luxury bronze/espresso & soft parchment palette
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      configuratorDirectUrl
    )}&color=2E1B11&bgcolor=EFE4D6&margin=10`;

    return {
      deviceType,
      arUrl,
      fallbackQrUrl: qrApiUrl,
      title: `${piece.name} — Veloura AR Spatial Projection`,
    };
  }

  /**
   * Converts a configuration dictionary into a compact URL search parameter string
   */
  static serializeConfigToQuery(partMaterials: Record<string, string>): string {
    const params = new URLSearchParams();
    Object.entries(partMaterials).forEach(([part, mat]) => {
      params.append(`cfg_${part}`, mat);
    });
    return params.toString();
  }

  /**
   * Deserializes URL search parameters back into a configuration dictionary
   */
  static deserializeConfigFromQuery(searchParams: URLSearchParams): Record<string, string> {
    const config: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('cfg_')) {
        const part = key.replace('cfg_', '');
        config[part] = value;
      }
    });
    return config;
  }
}
