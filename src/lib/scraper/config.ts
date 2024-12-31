// List of CORS proxies to try in order
export const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest='
];

export const ALLMUSIC_URL = 'https://www.allmusic.com/newreleases';

export const FETCH_CONFIG = {
  headers: {
    'Accept': 'text/html,application/xhtml+xml',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  },
  timeout: 10000
};