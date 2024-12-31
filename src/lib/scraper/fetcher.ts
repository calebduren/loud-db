import { CORS_PROXIES, ALLMUSIC_URL, FETCH_CONFIG } from './config';

async function fetchWithTimeout(url: string, config: RequestInit & { timeout?: number }) {
  const { timeout = 5000, ...fetchConfig } = config;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchConfig,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function fetchAllMusicHtml(): Promise<string> {
  let lastError: Error | null = null;

  // Try each proxy in sequence
  for (const proxy of CORS_PROXIES) {
    try {
      const url = proxy + encodeURIComponent(ALLMUSIC_URL);
      const response = await fetchWithTimeout(url, FETCH_CONFIG);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      if (!html || html.length < 100) {
        throw new Error('Received empty or invalid response');
      }

      // Check if we got an error page instead of actual content
      if (html.includes('Access Denied') || html.includes('Captcha')) {
        throw new Error('Access blocked by AllMusic');
      }

      return html;
    } catch (error) {
      console.warn(`Proxy ${proxy} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      continue; // Try next proxy
    }
  }

  throw lastError || new Error('All proxies failed');
}