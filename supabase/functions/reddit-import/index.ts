import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Launch browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Go to Reddit
    const redditUrl = 'https://old.reddit.com/r/indieheads/search?q=fresh&restrict_sr=on&include_over_18=on&sort=top&t=day';
    await page.goto(redditUrl);
    
    // Wait for posts to load
    await page.waitForSelector('.thing');
    
    // Extract Spotify links
    const links = await page.evaluate(() => {
      const spotifyLinks: string[] = [];
      const links = document.querySelectorAll('a[href*="open.spotify.com/album"]');
      links.forEach(link => spotifyLinks.push(link.getAttribute('href') || ''));
      return spotifyLinks.filter(link => link !== '');
    });
    
    await browser.close();

    // Get Spotify token
    const spotifyTokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(
          `${Deno.env.get('SPOTIFY_CLIENT_ID')}:${Deno.env.get('SPOTIFY_CLIENT_SECRET')}`
        ),
      },
      body: 'grant_type=client_credentials',
    });

    const { access_token: spotifyToken } = await spotifyTokenResponse.json();

    // Process albums
    const importedAlbums = [];
    const failedAlbums = [];

    for (const link of links) {
      try {
        // Get album ID from URL
        const albumId = link.split('/album/')[1].split('?')[0];

        // Get album details from Spotify
        const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        });

        const album = await albumResponse.json();

        // Format album data
        const releaseData = {
          name: album.name,
          release_type: album.album_type,
          cover_url: album.images[0]?.url,
          genres: album.genres,
          spotify_url: album.external_urls.spotify,
          release_date: album.release_date,
          created_by: user.id,
          artists: album.artists.map((artist: any) => ({
            name: artist.name,
          })),
          tracks: album.tracks.items.map((track: any) => ({
            name: track.name,
            track_number: track.track_number,
            duration_ms: track.duration_ms,
            preview_url: track.preview_url,
            credits: track.artists.map((artist: any) => ({
              name: artist.name,
              role: 'Artist',
            })),
          })),
        };

        // Insert into database
        const { error: insertError } = await supabaseClient
          .from('releases')
          .upsert([releaseData], {
            onConflict: 'spotify_url',
          });

        if (insertError) {
          failedAlbums.push(link);
          console.error('Failed to insert album:', insertError);
        } else {
          importedAlbums.push(album.name);
        }
      } catch (error) {
        failedAlbums.push(link);
        console.error('Failed to process album:', error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        importedCount: importedAlbums.length,
        failedCount: failedAlbums.length,
        importedAlbums,
        failedAlbums,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        importedCount: 0,
        failedCount: 0,
        importedAlbums: [],
        failedAlbums: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
