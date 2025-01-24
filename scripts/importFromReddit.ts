import puppeteer from 'puppeteer';
import SpotifyWebApi from 'spotify-web-api-node';
import { createOrUpdateRelease } from '../src/lib/releases/releaseService';
import { logger } from '../src/lib/utils/logger';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

async function getSpotifyToken() {
  const data = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(data.body.access_token);
}

async function extractSpotifyLinks(url: string): Promise<string[]> {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set a custom user agent to avoid being blocked
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  await page.goto(url);
  
  // Wait for posts to load
  await page.waitForSelector('.thing');
  
  // Extract all Spotify album links
  const links = await page.evaluate(() => {
    const spotifyLinks: string[] = [];
    const links = document.querySelectorAll('a[href*="open.spotify.com/album"]');
    links.forEach(link => spotifyLinks.push(link.getAttribute('href') || ''));
    return spotifyLinks.filter(link => link !== '');
  });
  
  await browser.close();
  return links;
}

async function getAlbumDetails(spotifyUrl: string) {
  // Extract album ID from URL
  const albumId = spotifyUrl.split('/album/')[1].split('?')[0];
  
  try {
    const albumData = await spotifyApi.getAlbum(albumId);
    const album = albumData.body;
    
    // Format album data for our database
    return {
      name: album.name,
      release_type: album.album_type as 'album' | 'single' | 'ep',
      cover_url: album.images[0]?.url,
      genres: album.genres,
      spotify_url: album.external_urls.spotify,
      release_date: album.release_date,
      artists: album.artists.map(artist => ({
        name: artist.name
      })),
      tracks: album.tracks.items.map((track, index) => ({
        name: track.name,
        track_number: track.track_number,
        duration_ms: track.duration_ms,
        preview_url: track.preview_url,
        credits: track.artists.map(artist => ({
          name: artist.name,
          role: 'Artist'
        }))
      })),
      created_by: 'reddit-import'
    };
  } catch (error) {
    logger.error('Failed to fetch album details', error as Error, { albumId });
    return null;
  }
}

async function importFromReddit() {
  try {
    // Get Spotify access token
    await getSpotifyToken();
    
    // Extract Spotify links from Reddit
    const redditUrl = 'https://old.reddit.com/r/indieheads/search?q=fresh&restrict_sr=on&include_over_18=on&sort=top&t=day';
    const spotifyLinks = await extractSpotifyLinks(redditUrl);
    
    logger.info('Found Spotify links', { count: spotifyLinks.length });
    
    // Process each album
    for (const link of spotifyLinks) {
      try {
        const albumData = await getAlbumDetails(link);
        if (!albumData) continue;
        
        // Import album to database
        await createOrUpdateRelease(albumData, albumData.artists);
        logger.info('Imported album', { name: albumData.name });
      } catch (error) {
        logger.error('Failed to import album', error as Error, { link });
      }
    }
  } catch (error) {
    logger.error('Import failed', error as Error);
  }
}

// Run the import if called directly
if (require.main === module) {
  importFromReddit().catch(console.error);
}

export { importFromReddit, extractSpotifyLinks, getAlbumDetails };
