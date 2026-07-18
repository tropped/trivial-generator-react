// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { youtube } from "@googleapis/youtube";

const API_KEY = import.meta.env.MAIN_VITE_YOUTUBE_API_KEY;

const youtubeAPI = youtube({ version: "v3", auth: API_KEY });

export async function importYoutubePlaylist(playlistId: string) {
  if (!API_KEY) {
    throw new Error(
      "Missing YouTube API key. Set MAIN_VITE_YOUTUBE_API_KEY in your .env file."
    );
  }

  const response = await youtubeAPI.playlistItems
    .list({
      part: "id,snippet",
      playlistId,
      key: API_KEY,
      maxResults: 50
    })
    .catch((err) => {
      if (err.code === 404) {
        throw new Error("Playlist not found");
      } else if (err.code === 403) {
        throw new Error("YouTube API request rejected (invalid/restricted API key or quota exceeded)");
      } else {
        throw err;
      }
    });

  const playlistItems = response.data.items;
  const songs = playlistItems.map((song) => {
    const { title, resourceId } = song.snippet;
    return { id: resourceId.videoId, title };
  });

  return songs;
}
