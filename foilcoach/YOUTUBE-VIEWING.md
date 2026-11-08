# Explicit YouTube reference viewing

Grounding: app.mjs owns one source session, local pose analysis and reset generation;
media-import.mjs owns bounded CORS file downloads. Neither can read iframe pixels.
The reference library already contains timestamp links to the Josh Ku video.

Design alternatives:
1. Bare privacy-enhanced iframe: smallest player, but no documented error events,
   in-app timestamp seeking or trustworthy current-time export.
2. Existing iframe + documented IFrame Player API: selected. Isolate parsing/player
   lifetime; the application keeps its local-file inference unchanged. No extraction,
   download service, proxy, authentication, backend or cross-origin pixel access.

Contract:
- parseYouTubeURL(raw) -> {id,start,url} or null for a different host; recognized
  malformed YouTube URLs fail before touching the current source.
- createYouTubeViewer(root,{onStatus}) -> open(video,title), destroy(), seek(seconds),
  time(). Only time() from a ready nonfailed API player is recorded; null otherwise.
- app routes valid YouTube -> viewing/manual-only source; direct HTTPS -> existing
  CORS download/pose pipeline. Every replacement invalidates old jobs and player.

On explicit load, create a canonical youtube-nocookie.com embed with enablejsapi,
legitimate window origin and strict-origin-when-cross-origin referrer policy. Then
load the normal documented https://www.youtube.com/iframe_api. No YouTube iframe or
script is requested on initial page load. Player errors include a normal explicit
YouTube link. No automatic retry with different domains, cookies, accounts or proxy.

YouTube mode resets/hides all old pose results/checkpoints/native controls and keeps
manual review/plans and coaching references. Same-video library timestamp links seek
through the documented API; other links remain ordinary external links. Exports name
this a youtube-reference, automaticPoseAnalysis:false; optional current playback time
comes only from getCurrentTime. There are no captured frames or pose observations.

Official reference opened during implementation:
https://developers.google.com/youtube/iframe_api_reference
Existing iframe construction, getCurrentTime, seekTo, destroy, onReady/onStateChange,
onError (including153) are documented there. Playback acceptance must be verified in
a real browser; mocked API tests do not prove that a specific video permits embedding.

Browser QA: actual Josh Ku playback after clicking Watch Josh Ku / loading the given
youtu.be link; in-app timestamp seek; manual review/export; switch to local/direct
video and confirm real pose analysis resumes. Check both locales, errors, dark mode
and shared page appearance. Do not merge until this passes.

Manual evidence/export update:
- The shared JSON export action sits outside the hidden local-analysis section and
  remains visible/enabled for a YouTube source, including a manual-only plan.
- YouTube review cards have no nonexistent checkpoint menu. Explicit “Use current
  YouTube time” captures getCurrentTime only when the ready API responds. Captures
  include video ID, seconds, method and frameCaptured:false; nothing captures pixels.
- A captured review moment is stored separately from the live export-time playback
  position and separately from static Josh Ku coaching citations. Both card and plan
  label these distinctly. Player events never read current playback time themselves.
- Local checkpoint options include only existing checkpoints. Switching sources
  clears captured reference evidence; choosing a local file also clears the URL field.
- Both-language DOM tests assert no hidden export ancestor, API reads only on explicit
  capture/export, distinct captured/export seconds, nonexistent-option removal and
  complete local replacement reset.
