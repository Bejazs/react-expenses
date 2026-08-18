import { mock, describe, it, expect, beforeEach } from "bun:test";

mock.module("expo-file-system", () => ({
  Directory: class {},
  Paths: { document: "mock-path" },
  File: class {},
}));

mock.module("react-native", () => ({
  Platform: {
    OS: "web",
  },
}));

import { saveCustomIcon } from './ImageService';

describe('ImageService', () => {
  describe('Web', () => {
    const mockBlob = { size: 1024, type: 'image/png' };
    const mockBase64 = 'data:image/png;base64,mockBase64Data';

    beforeEach(() => {
      // Mock fetch
      global.fetch = (url: string) => Promise.resolve({
        blob: () => Promise.resolve(mockBlob),
      }) as any;
      (global.fetch as any).mock = { calls: [] };
      const originalFetch = global.fetch;
      global.fetch = (url: string) => {
        (global.fetch as any).mock.calls.push([url]);
        return originalFetch(url);
      };

      // Mock FileReader
      global.FileReader = class {
        onloadend: (() => void) | null = null;
        onerror: ((e: any) => void) | null = null;
        result: string | null = null;

        readAsDataURL(blob: any) {
          setTimeout(() => {
            this.result = mockBase64;
            if (this.onloadend) this.onloadend();
          }, 0);
        }
      } as any;
    });

    it('should convert blob URL to base64 on web', async () => {
      const blobUrl = 'blob:http://localhost:8081/uuid';
      const result = await saveCustomIcon(blobUrl);

      expect((global.fetch as any).mock.calls[0][0]).toBe(blobUrl);
      expect(result).toBe(mockBase64);
    });

    it('should return original URI if fetch fails', async () => {
      const blobUrl = 'blob:http://localhost:8081/uuid';
      global.fetch = (url: string) => Promise.reject(new Error('Fetch failed'));

      const result = await saveCustomIcon(blobUrl);

      expect(result).toBe(blobUrl);
    });

    it('should return original URI if FileReader fails', async () => {
      const blobUrl = 'blob:http://localhost:8081/uuid';

      global.FileReader = class {
        onloadend: (() => void) | null = null;
        onerror: ((e: any) => void) | null = null;
        result: string | null = null;

        readAsDataURL(blob: any) {
          setTimeout(() => {
            if (this.onerror) this.onerror(new Error('FileReader failed'));
          }, 0);
        }
      } as any;

      const result = await saveCustomIcon(blobUrl);

      expect(result).toBe(blobUrl);
    });
  });
});
