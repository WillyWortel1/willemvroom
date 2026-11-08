# Link import + shared website appearance

Plan:
1. Reuse the actual website `/styles.css`, `/site.css`, `/site.js` and `/textsize.js`,
   its `.wv-head`, 760px content width, gray/white cards and red accents. No news,
   account or PIN scripts. Preserve the analysis controls and touch targets.
2. Add file-or-link entry. A public direct HTTPS video file is fetched in the browser
   with CORS, credentials omitted, redirects forbidden, a 60s timeout and a 200MB
   streamed limit. Validate URL, response type and file signature before decoding.
3. Use the existing blob/local inference path. Cancel/replacement prevents stale jobs;
   source provenance records only origin/type/size, never signed query strings.
4. Test URL validation, stream limits, errors, cancellation, UI resets and provenance;
   parent performs browser URL import + before/after visual QA before merge.

Feasibility research:
- Pages is legacy static hosting of main `/`; the only existing workflows update F1
  and Foilassist data. No deployed media-import backend is present in this repository.
- Official YouTube IFrame API exposes playback/time/state, not readable video frames:
  https://developers.google.com/youtube/iframe_api_reference
- Cross-origin pixel reads require permission from the media server:
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video
- Connector catalog search found transcript/channel tools, not an installed supported
  raw-frame import backend. Public Grok Bot/X search supplied no suitable sanctioned
  deployment method. No connector, account, paid API, proxy or credential is installed.
- YouTube/social page links therefore do NOT become analyzable video. The interface
  explains this rather than embedding a player and pretending it enables analysis.
  Supporting those URLs requires a separately authorized media-source integration
  exposing video bytes under the provider's permissions, not a generic iframe.
  Earlier YouTube anti-bot responses are not bypassed.

Technical fixture only (not a foil demonstration):
https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4
1,128,375 bytes, video/mp4, Access-Control-Allow-Origin: * verified.
Upstream https://github.com/mdn/interactive-examples LICENSE is CC0 1.0.
The video is not included in the app or automatically loaded.

Security scope: no server-side fetch/SSRF endpoint exists. The browser rejects CORS
failures and applies its network restrictions. App validation rejects IP literals,
local/internal names, credentials, non-HTTPS, alternate ports and redirects. Client
JavaScript cannot verify DNS answers for arbitrary public-looking hostnames; it does
not claim to replace browser private-network protection. Nothing sends fetched
video contents to another server.


Update: YouTube page links now route separately to supported embedded viewing via
its documented IFrame API (YOUTUBE-VIEWING.md). The no-raw-frame-import boundary above
still applies to automatic measurements. Other social-page links remain unsupported.
