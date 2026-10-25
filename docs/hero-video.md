# Hero video (currently not used on the page)

The homepage hero now shows the route with the vehicle stops (`js/hero-route.js`). These files are kept in case Sabine wants the truck loop back.

`images/hero-vrachtwagen.webm` (VP9), `.mp4` (H.264, faststart) and `.webp` (poster = first frame). 810x1080 (3:4), 10 s, no audio, ping-pong loop (forward then reversed, boundary frames dropped so it is seamless).

**Source:** the client's real photo `images/fotos/vrachtwagen-lebuinus.webp`, animated with Higgsfield (Seedance 2.5, image-to-video, 5 s, 720p, 35 credits, job c8d7ae90-46bd-4fa5-bcc8-c22b77883215). Prompt: very slow push-in, drifting clouds and leaves, truck and lettering unchanged. The raw Higgsfield file is not in the repo.

**Status:** this is an AI-animated version of a real photo, not a filmed video. Show it to Sabine and ask whether it may stay. Replace it with a real clip if she has one (same file names).

**Rebuild** (ffmpeg, SRC = the 5 s source clip):

```
FILT="[0:v]scale=810:1080:flags=lanczos,fps=24,split=2[f][r0];[r0]reverse,trim=start_frame=1:end_frame=120,setpts=PTS-STARTPTS[r];[f][r]concat=n=2:v=1:a=0,format=yuv420p[v]"
ffmpeg -i SRC -filter_complex "$FILT" -map "[v]" -an -c:v libx264 -crf 29 -preset veryslow -movflags +faststart images/hero-vrachtwagen.mp4
ffmpeg -i SRC -filter_complex "$FILT" -map "[v]" -an -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 -cpu-used 1 -g 48 images/hero-vrachtwagen.webm
ffmpeg -i SRC -vf "scale=810:1080:flags=lanczos" -frames:v 1 -c:v libwebp -quality 82 images/hero-vrachtwagen.webp
```

Keep each video under 1.5 MB.
