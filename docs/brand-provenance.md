# Brand art provenance

`public/brand/source/` holds the two master images the logo is built from. Do not edit them; derive everything from them (the brand-kit step does).

| File | What | Notes |
|---|---|---|
| `didi-icon-master.png` | 1024 x 1024, head-and-shoulders icon, green gradient filling the square edge to edge | master for the tile logo, favicon, apple-touch icon, maskable icon, OG image |
| `didi-full-body.png` | 1024 x 1024, full-body waving pose on flat green | for large brand moments; not for small sizes |

**Made with** Google Gemini (image generation, "Create images", Nano Banana 2) on 2026-10-22, from two reference images exported from the Figma
landing design (`FSJqiLATooQsiMWs9OISQW`): the hero crop of DiDi waving (node `2601:12438`) and "DiDi on a cloud" (node `2601:13022`).
DiDi, the white hooded sprout-doctor, is the project's mascot (docs/landing-decisions.md D3); the alien is retired.

Prompts, in order (same chat, so each builds on the previous result):

1. "Use the two attached images as the exact character reference: a small mascot with a soft white hood, peach face with rosy cheeks, two black oval eyes and a tiny smile,
   a green two-leaf sprout growing from the top of the hood, a white doctor's coat with a green stethoscope. Create a 3D MASCOT LOGO for the health app CheckApp, in the spirit
   of the Duolingo owl app icon: one friendly character, bold simplified shapes, soft glossy clay-like 3D render, slightly oversized head, clean silhouette that stays recognisable
   at small sizes, front-facing with a gentle head tilt and one hand waving, subtle rim light, centered, on a plain flat deep green background (#276221), no text, no clouds,
   no extra objects, square 1:1, high polish studio lighting. Keep the character design EXACTLY consistent with the reference."  -> `didi-full-body.png`
2. "Great fidelity. Now make the APP ICON version, like the Duolingo owl icon: a tight head-and-shoulders close-up of the same mascot, the face filling most of the frame, facing
   forward with a very slight head tilt, the sprout fully inside the frame with a little margin, no waving hand. Same soft glossy clay 3D render, same colours. Background: a
   rounded-square tile with a subtle vertical gradient from #41773C at the top to #276221 at the bottom. Centered, symmetrical, big simple shapes, readable at 32 pixels, no text,
   no extra objects. Square 1:1."
3. "Perfect. Now the same exact icon (same pose, framing, lighting and colours) but with the green gradient background filling the whole square edge to edge: no rounded corners, no
   white corners, no border or frame. Keep the sprout fully inside the frame with a small margin, and make sure nothing appears on the face except eyes, cheeks and the smile.
   Square 1:1."  -> `didi-icon-master.png`

**Lessons worth keeping.** Gemini's "Download full size image" button upscales to 2048 px and that upscale *added* a stethoscope chest-piece on the cheek that the 1024 px original does not
have. The masters are the 1024 px originals, copied with the chat's "Copy image" button. Check any future export against the on-screen image before trusting it.
The generated tile had white corners; the full-bleed prompt (3) removes them, and the rounded tile used in the header is cut from it in code (corner radius 22.4 %).

Rights: AI-generated image derived from the client's own mascot art. Confirm with the client that this derivative is approved as the logo before launch.
