# Dreamscape channel film

The homepage Explore Treks play button requests `/api/youtube/latest` when the dialog opens. YouTube is not loaded on initial page load.

Set these server environment variables and restart the application:

- `YOUTUBE_CHANNEL_HANDLE`: defaults to the supplied `@Dreamscapetreks` channel. An optional `YOUTUBE_CHANNEL_ID` (`UC` followed by 22 characters) overrides the handle.
- `YOUTUBE_API_KEY`: a server-only Google API key with YouTube Data API v3 enabled. Restrict it to that API and your server's IP where supported. Never place it in a public variable or commit it.

The endpoint resolves the channel's uploads playlist, checks its ten most recent entries, and selects the latest published public, embeddable video that is not live/upcoming. Shorts are eligible. It caches YouTube API responses for five minutes, so uploads are not instantaneous; visitors get refreshed data on subsequent dialog openings after cache refresh. An already playing film is never interrupted.

When the channel is unconfigured or unavailable, the existing labelled photographic preview remains available. With a configured channel, visitors also get a direct channel link. A watch-on-YouTube link accompanies the player for playback restrictions that an iframe cannot detect. Browser settings may require tapping Play inside YouTube.

Verification before launch: configure the API key, open Explore Treks, compare the selected film to the latest eligible channel upload, and check mobile playback. The real channel handle is configured; live automatic lookup has not been verified because a key has not been supplied.

Reference: https://developers.google.com/youtube/v3/docs/channels/list and https://developers.google.com/youtube/v3/docs/playlistItems/list
