export interface ScrapedRelease {
  name: string;
  artists: { name: string }[];
  releaseType: 'single' | 'EP' | 'LP' | 'compilation';
  coverUrl?: string;
  genres: string[];
  recordLabel?: string;
  trackCount: number;
  releaseDate: string;
}

export interface ScraperResult {
  success: boolean;
  releases: ScrapedRelease[];
  error?: string;
}