# MVP Design Considerations for an AI-Powered Video Narration Tool

## Supported Source Types in V1 (Input Formats)

For the MVP, the tool will focus on **plain text inputs**. This includes simple text files (e.g. `.txt`) and Markdown documents (`.md`). More complex source types – like PDFs, web URLs, Google Docs, or YouTube transcript files – are **not in scope for v1**. By limiting to plain text, we simplify parsing and avoid the added complexity of handling varied formats (e.g. PDF layout extraction or API integrations for Docs/YouTube). This lean approach ensures the core features (script generation and slide creation) work reliably first. Future versions can expand to rich formats once the text-based pipeline is validated. In summary:

* **Supported in MVP:** Plain text content – e.g. raw text or Markdown files.
* **Not supported yet:** PDFs, Word docs, HTML/web pages, Google Docs, YouTube transcripts, or other media (these could be added in later updates).

*(Rationale: Focusing on text streamlines development and avoids edge cases in format conversion early on. Users can always copy-paste or convert other formats to text for now.)*

## LLM Preference for Script Generation

Choosing the right language model is critical for generating high-quality narration scripts from the source material. We plan to support multiple LLMs, giving users a choice, but will prioritize a few models initially that offer the best mix of performance and accessibility:

* **Google Gemini 2.5 (Flash, Pro, Flash-Lite)** – Google’s latest family of multi-modal models. Gemini 2.5 models are *“hybrid reasoning”* LLMs designed to deliver strong performance while staying at the *“Pareto frontier”* of cost and speed. The Flash and Pro variants are now production-ready, and a Flash-Lite model is in preview as an ultra-fast, cost-efficient option. These models bring advanced capabilities (they can “turn on” step-by-step thinking, use tools like web search, accept images as input, etc.) and support a massive context window (up to **1 million tokens**). If accessible via Vertex AI, integrating Gemini would provide cutting-edge quality (especially as it’s built to excel at tasks like summarization and even has multimodal understanding). One consideration is that using Gemini requires Google Cloud setup and may have costs, so it could be an opt-in for those with GCP access.

* **Cerebras / Alibaba Qwen-3 (235B)** – A very powerful open model served through Cerebras’ cloud API. Qwen-3 235B Instruct is noteworthy for its **speed and scale**: it generates text at roughly *1,400 tokens per second*, which is an order of magnitude faster than typical GPT-4 rates. It also supports extremely long context (131k tokens for paid tier) enabling it to handle large documents. Quality-wise, Qwen-3 is top-tier – it *outperforms OpenAI’s GPT-4.1 and other frontier models on a broad set of knowledge, reasoning, coding, and STEM benchmarks*. Cerebras reports that compared to GPT-4, Qwen-3 delivers *12× faster generation and about 70% lower cost per token*, making it excellent for a fast, cost-effective script generation engine. For the MVP, supporting Qwen via the Cerebras API (which even offers a free token quota) can give users a high-quality open-model alternative to OpenAI.

* **OpenAI GPT-4 (and GPT-3.5)** – OpenAI’s models are industry-standard for a reason: GPT-4 is currently one of the most reliable and creatively capable models for text generation. We anticipate many users will want to use GPT-4 for script writing if they have an API key. Out-of-the-box, GPT-4 produces excellent summaries and explanations, which suits our use-case. However, we note it is comparatively slower and costlier. (As mentioned, emerging models like Qwen hint at GPT-4 being slower/pricey – Qwen’s API claims a *12× speed advantage and significant cost reduction vs. GPT-4*.) Nonetheless, GPT-4’s strong track record means we’ll likely support it first, along with possibly GPT-3.5 Turbo for those who want a faster/cheaper but lower-quality option. OpenAI integration will assume the user provides an API key, and we’ll include settings for model choice (e.g. GPT-3.5 vs GPT-4).

* **Meta LLaMA 2 (70B)** – As an open-source alternative, LLaMA-2 70B or similar large models could be supported for users who prefer self-hosting or non-cloud solutions. In an MVP context, we might not bundle a 70B model due to infrastructure constraints, but we could allow hooking into one (for instance, via an API like HuggingFace Inference or a local runtime if the user sets it up). LLaMA-2’s quality is decent, though not on par with GPT-4, but it can be fine-tuned and run on local hardware with enough resources. That said, since we have Qwen-3 via Cerebras (which is even larger and likely stronger), a local LLaMA might be less needed. We will keep the design modular so that adding new model backends (e.g. Anthropic Claude, or future LLaMA-3) is straightforward.

In summary, **initial support will likely center on OpenAI’s GPT-4 (for its quality) and one of the advanced open models (Qwen via Cerebras)** to cover both closed and open options. Google’s Gemini is highly attractive as well; if we can integrate it through Vertex AI, it provides multi-language and multi-modal strengths (Gemini 2.5 models excel at tool use and even have image understanding, which could be handy down the line). The UI will allow choosing the model for generation (more on that under *LLM Selection Flexibility*), so users can experiment or opt for the model that suits their needs (accuracy vs. speed vs. cost).

## Visual Assets: Auto-Generated vs User-Supplied Content

We plan to have the tool **automatically generate visual assets** (images, diagrams, highlighted quotes, etc.) for the slides, rather than relying entirely on user-supplied visuals. In essence, the AI will not only write the script for each slide but also suggest or create accompanying visuals, much like how Google’s NotebookLM creates its “Video Overview” slides. NotebookLM’s approach is a good model: *the AI host dynamically creates new visuals to illustrate points, pulling in images, diagrams, quotes, and statistics from the source material*. This makes the generated slide deck more engaging and helps explain complex concepts – **“making abstract concepts more tangible”** with illustrative aids.

In our MVP, each narrated slide could include elements like:

* **Key phrase highlights or quotes** from the source text (automatically extracted and styled).
* **Diagrams or charts** generated from data in the source (if numeric data is present, the AI might suggest a simple chart).
* **Images** related to the topic, either fetched from a royalty-free source or generated via an image model. (For example, if the slide says “Einstein’s theory of relativity,” the system might insert a public-domain photo of Einstein or a symbolic graphic of spacetime – this would be experimental for MVP and might leverage image APIs or generative image models.)

All visuals will be incorporated into the **HTML/CSS slides** that the system generates. We will design default slide templates that can accommodate text and media neatly. Initially, user-supplied visuals won’t be required – the idea is the user can go from raw text to a complete video with slides without manually adding anything. Of course, the user could have the option to upload or insert their own images in a later version, but for MVP the emphasis is on *auto-generated content* to minimize user effort.

This decision to auto-generate visuals is in line with making the tool an **end-to-end video creator** (the user should not have to prepare a separate slideshow). It differentiates from simpler scripts-to-video tools by providing a richer, more informative visual narrative. It also leverages the AI’s understanding of the content – the AI can pick out which diagram or image would reinforce the spoken explanation. *(Naturally, we must ensure we use images that are either provided by the user’s documents or are license-free/generative outputs to avoid copyright issues.)*

## Text-to-Speech (TTS) Engine Integration

For narration audio, we will **use external Text-to-Speech APIs** rather than a built-in TTS model. High-quality, natural-sounding TTS is crucial for a polished video, and currently the best results come from dedicated providers like **ElevenLabs** or **Cartesia** (as well as others like Google Cloud TTS, Amazon Polly, Azure, etc., but ElevenLabs and Cartesia are leaders in voice cloning and expressiveness).

By leveraging external APIs, we benefit from state-of-the-art voice synthesis without having to host large voice models ourselves. The MVP will allow the user to enter API keys for their chosen TTS service and select a voice. Among the options:

* **ElevenLabs** – offers very realistic voices in many languages and the ability to clone a voice given a sample. It’s known for its expressiveness and is used in productions for audiobooks, videos, etc. However, it is a paid service with a relatively higher price. (ElevenLabs provides 70+ languages and a wide range of features, but cost can ramp up for long scripts.)

* **Cartesia** – a newer competitor focusing on efficient, high-quality voice cloning and TTS. Notably, Cartesia can create an instant voice clone with only **3 seconds of audio** from a speaker, whereas ElevenLabs typically needs \~30 seconds of audio for a similar clone. This means Cartesia could let a user quickly clone their own voice for narration by just providing a short sample clip – a very compelling feature. Additionally, Cartesia’s pricing is significantly cheaper; *Cartesia’s TTS is roughly one-fifth the cost of ElevenLabs’* on comparable plans, making it attractive for an open-source tool where users may prefer a cost-effective solution.

* **Open-source TTS (Coqui TTS/Piper)** – while there are open-source TTS engines we could bundle, they tend to require large model downloads and often do not match the natural quality of services like ElevenLabs out of the box. For the MVP, we lean toward using the cloud APIs for quality and simplicity. Advanced users who insist on offline TTS could integrate a local solution, but that would be a custom setup (perhaps in later documentation we can guide how to plug a local TTS in place of our API calls).

**Plan:** The UI will have a settings section for TTS where users can select the provider (e.g. “ElevenLabs” or “Cartesia” or “Custom API”) and input the required API key (and possibly select a voice preset or enter a voice ID). When generating the video, the script for each slide will be sent to the TTS API to synthesize the audio chunks, which we’ll then stitch together. Using external TTS ensures we get very lifelike narration. For example, ElevenLabs offers both male and female voices, different accents, and even an AI dubbing tool for translations. Cartesia emphasizes voice fidelity and low latency (their tech boasts \~40–90ms latency for generating speech, and high quality with emotion control).

By not reinventing TTS, we save development time and let users tap into whichever service they prefer. The MVP will treat TTS providers as plug-and-play modules (with the default suggestion being one of the popular ones like ElevenLabs). We will keep an eye on quality – if the user’s chosen TTS yields poor results, we might provide a sample test or recommend a better voice. But overall, **external TTS via API is the way to go** for v1 to deliver professional-sounding voiceovers.

## Slide Rendering and Video Generation

To produce the final video (narrated slides), we need to render slide visuals and combine them with audio. We have two main approaches: using a web technology-based slide renderer (HTML/CSS/JS, e.g. a browser slideshow) or a direct video generation pipeline (drawing on a canvas or using FFmpeg filters to lay out text/images). After evaluating options, the plan is to **use an HTML/CSS slide framework and a headless browser to capture it**, which is simpler and more flexible for MVP.

### HTML/CSS Slides with Headless Browser

We can create the slides as a webpage (for example, using a framework like *Reveal.js* or a custom HTML template for each slide). This allows us to leverage standard web design for layout, styling, and even animations. The slides can be previewed in a normal browser during development, which speeds up design iterations.

For the video, we will automate a headless Chromium (via Puppeteer) to load the slides and capture frames. Specifically, one proven method is:

1. **HTML Slideshow Webpage** – The tool generates an HTML presentation of the slides (with all text and images in place, and maybe simple transitions).
2. **Puppeteer script** – A Node.js script uses Puppeteer to open this slideshow in a headless browser and advance through each slide (or each animation step), taking screenshots of each state.
3. **FFmpeg stitching** – Another process or library takes the sequence of screenshots and the narration audio to compose a video file. Essentially, images are fed to FFmpeg (as a stream or as files) at a specified frame rate, and the audio track is overlaid to produce the final synchronized `.mp4`.

This pipeline is known to work. In one example, a developer described using *“a web application to render the HTML slideshow, a Puppeteer runner to capture frames, and then FFmpeg to stitch the frames together (with audio)”*. We’ll follow a similar strategy. By using HTML/CSS, we can easily ensure consistent slide formatting, and any content that can be shown in a browser (including SVG charts or web fonts) can be used in our slides.

**Why not generate video directly?** The alternative would be to programmatically draw onto a canvas or use FFmpeg’s complex filter syntax to lay out text and images, generating video frames without a browser. While possible, that approach is more labor-intensive to implement and less flexible (essentially rebuilding a layout engine from scratch). HTML gives us responsive layout, styling, and even the possibility of embedding interactive elements if needed (though for video we’ll ultimately capture as static frames).

Using a browser engine also means we can future-proof with web-based features: for example, if we want to include a short video clip on a slide or animations, those could play in the browser and be recorded. Reveal.js (if we use it) even supports slide transitions and multimedia embedding which we get for free.

### Video Rendering: Server-Side vs Client-Side

We will perform the slide rendering and video encoding **server-side**. That is, the heavy lifting of running Puppeteer and FFmpeg will happen on the server (or the user’s machine if self-hosting), not in the end-user’s web browser. This decision is because video encoding is CPU-intensive and not reliably doable on all clients via browser alone. A server-side process can ensure the final video is encoded correctly regardless of the user’s device. It also simplifies things like using headless Chrome (which wouldn’t run in a browser environment, obviously) and writing output files.

The result of the generation will be an `.mp4` file that the user can download or play. We’ll likely render at standard HD resolution (720p or 1080p) by setting the Puppeteer viewport accordingly, and a reasonable frame rate (perhaps 30 fps for any slide animations to look smooth, though mostly slides will be static per narration segment). FFmpeg will handle combining audio – for example, we might generate one continuous audio track from the TTS, and instruct FFmpeg to mux that with the image sequence. **Note:** We must ensure slide timings match the narration (each slide image may need to be shown for the duration of its spoken script). We can handle that either by pausing in the slideshow or by duplicating the slide image in the video timeline to cover the audio length.

*(In a future version, we might allow client-side exports or previews, or even keep the slides interactive. But for MVP, a server-side render to video is more straightforward. We might also consider offering the HTML slides as a separate export – since they’re already generated – which could be useful for users who want to present the slides live or edit them manually. This isn’t the core goal, but it’s a nice side benefit of using HTML for slides.)*

## **** *NotebookLM’s interface now supports output in multiple languages (the image shows options like English, বাংলা, Nederlands, Español, العربية, etc.), highlighting the importance of multilingual output.*

## Versioning and Multi-Language Outputs

We want to empower users to create multiple versions of their video content easily – for example, different language narrations, or cuts tailored to different audiences – **from day one**. This is inspired by Google’s NotebookLM Studio update: originally, NotebookLM only allowed one of each output type per notebook, but a recent upgrade introduced the ability to *“create multiple outputs of the same type”* and make *“different versions of overviews tailored to different languages, roles, or study chapters.”*.

In our tool, this means a single project (based on one set of source notes) could produce, say, an English video and a Spanish video, or a “beginner-friendly” version and an “expert-level” version of the script. Practically, the UI might allow the user to clone a generated script/slide deck and then adjust the parameters for a new target audience or language.

**Multi-Language:** Multilingual support is a priority. We aim to let the user select an **output language** for the video’s narration and slides. The system can then either translate the generated script into that language or prompt the LLM to generate the script directly in the target language. NotebookLM recently rolled out a similar feature for its Audio Overviews – users can now choose among 50+ languages for the summary, using a new *“Output Language”* setting. This kind of built-in translation drastically increases accessibility: content creators can reach non-English speakers, and learners can get material in their preferred language. Our MVP will include at least a few major languages (leveraging the multilingual capabilities of models like Gemini or Qwen, or using translation APIs if necessary). For example, a user could generate an English script, then with a click, get a Spanish version of the same script (assuming the source content can be translated, or the LLM can summarize in Spanish). The slide visuals and structure would remain the same, just the text and audio would be translated.

**Multiple Audiences or Cuts:** Another aspect of versioning is producing variations of the content for different contexts. Perhaps one version of the video is a 5-minute summary for executives, another is a 15-minute deep dive for engineers. In MVP, we might not have a full workflow for customizing by audience type, but we at least plan to allow users to regenerate or edit the script with different instructions (e.g. “make it more detailed” or “assume the viewer knows nothing about the topic”) and save those as separate outputs. The NotebookLM Studio panel concept shows the utility of this: you could have one notebook and spawn a “general overview”, a “detailed Q\&A”, etc., now even multiple of each kind. We can mirror that idea by allowing multiple saved script drafts per project.

Implementing versioning early on sets us apart. Users won’t need to create duplicate projects or copy-paste content to make a new version – it’ll be an integrated feature. It also aligns with supporting multilingual education: For instance, **teachers might generate slides in several languages for a diverse classroom**, akin to Google’s example of students generating summaries in their preferred language to break down language barriers.

To summarize, **the MVP will support creating multiple outputs from the same source**. The primary use case is multiple languages, which we’ll handle via an output language setting. Secondarily, we consider multiple audience-targeted variants (likely via letting users refine the script after initial generation and keeping those versions). This approach makes our tool *more powerful and flexible* than if we limited one project to one video. It encourages iteration and experimentation – users can compare which version they like or use different versions for different purposes.

## Deployment Model (Web App vs Desktop)

We’ve decided to build the MVP as a **web application (likely with Next.js)**, which users can either self-host or run locally, rather than as a native desktop app initially. This choice is driven by several factors:

* **Cross-platform availability:** A web app works on any device with a browser (desktop or even tablet), whereas a desktop/Electron app would need packaging for Windows, Mac, Linux separately. By using Next.js (React framework) for the frontend and backend API routes, we can develop the UI and server logic in one project that can be deployed on a server or run locally. This gives flexibility: technically, we could still wrap the web app in an Electron shell later to offer a “desktop app” experience, but focusing on the web first ensures broad accessibility.

* **Ease of hosting and collaboration:** If the tool is web-based, an organization could host it on a server and multiple team members could access it through their browsers (even if we don’t have real-time collaboration, they could share the instance). Also, updates to the software are easier to roll out on a server – you update the code once, all users get the new version. With desktop apps, you’d have to manage auto-updaters or rely on users to download new versions. For an MVP developed rapidly, controlling the environment via a web deployment is simpler.

* **Developer velocity:** Next.js allows quickly building UIs, has support for API routes (which we can use for backend tasks like calling LLM APIs, TTS, video rendering), and comes with a lot of tooling (bundling, etc.). We can also leverage the rich React ecosystem for UI components. Electron, in contrast, would bring us back to bundling a Chromium instance and more complicated IPC management between front and back. Given our team’s web experience, a Next.js app will likely get us to a demo faster.

* **Open-source friendliness:** Many open-source AI projects choose a web interface (with an easy one-click deploy or Docker) so that both technical and non-technical users can spin it up. We can do the same. Our target is a self-hostable web service: basically, a Next.js application that one can run on their machine or on a server. Tech-savvy users can run it locally (`npm run dev` or Docker) and access `http://localhost:3000` for a personal use. We could also deploy an online demo somewhere for broader testing.

In the MVP, we won’t provide native mobile apps or similar – however, the web UI being responsive is a plus (someone could potentially use it on an iPad). An Electron app could be packaged in the future if offline use is important, but even then, it would essentially embed our web app. So we prefer to invest in the web codebase which serves both needs.

To summarize: **MVP = Next.js web app**, focused on being easy to run and develop. This covers both a UI and the necessary server-side operations (Next.js can handle server-side rendering and has Node capabilities for calling external APIs and running Puppeteer/FFmpeg, etc., especially if using the Node runtime or a custom server). If demand arises, we will later consider distribution as a desktop app, but it’s not a priority for now.

## Collaboration and Multi-User Support

For the initial version, the tool will be **single-user oriented, with no multi-user collaboration features**. Each instance (or each project space) is assumed to be used by one user at a time, and we are not building in shared editing, cloud accounts, or permission management in the MVP.

The reason is simplicity: multi-user collaboration introduces a lot of complexity (user accounts, authentication, real-time syncing, conflict resolution, permissions, etc.) that doesn’t directly contribute to proving the core concept. In an MVP, we want to nail the core functionality (ingesting notes, generating a script, making slides, and producing a video) for one user. Once that works, we can think about how multiple users might interact with it.

**Analogy:** Many productivity tools start single-player. Even Google’s NotebookLM in its current form is basically tied to your Google account and your personal notebooks; it isn’t a collaborative editor (you don’t have two people editing the same AI-generated summary simultaneously). Similarly, we will not attempt something like Google Docs collaboration in slides or co-creation of scripts in v1.

That said, because we plan to make this a web app, if a user did host it, they could theoretically share their screen or results with others easily. And versioning (discussed above) allows making different versions for different audiences – but that’s not real-time collaboration, it’s just output variation.

**No user management:** In MVP, we likely won’t have user login at all (aside from perhaps a single admin login if we want to secure a hosted instance). The assumption is either the user is running it themselves (so they control it fully), or in a hosted scenario, it’s a personal or internal tool without needing distinct accounts. This avoids building a whole auth system and database of users in the first iteration.

Down the line, if the project evolves, we could add cloud features – e.g. saving projects under user accounts, sharing a project with someone, or co-editing – but those would come after proving value and possibly when we have the resources to maintain a live service. For now, **MVP is strictly single-user.** The user’s work (notes, generated scripts, etc.) stays local to them.

*(We will, however, make sure to store project data in a convenient way – probably locally on the server in a file or lightweight database – so that even as a single-user app, their progress is saved between sessions. But it won’t be multi-user aware.)*

## API Key Management for Third-Party Services

Since our tool will integrate with various external APIs (LLM providers, TTS services, possibly others), we need a secure and user-friendly way to handle API keys. The approach for the open-source MVP will be two-fold:

1. **Environment Variables / Config Files:** For users deploying the app themselves (developers or self-hosters), the simplest method is to have them put their API keys in an `.env` file or a config file. For example, `OPENAI_API_KEY=...` in the environment, `CEREBRAS_API_KEY=...`, `ELEVENLABS_API_KEY=...` etc. Our application will read these on startup. This keeps keys out of the front-end and ensures they are not exposed publicly. It’s a common practice for open-source projects to require the user to edit an `.env` with their secrets.

2. **In-App Settings UI:** To cater to non-technical users (or simply to improve UX), we will also provide a settings page or modal where a user can paste in their API keys. This could be especially useful if the user is running a hosted instance or using a packaged version where they can’t easily access server files. When they input a key in the UI, we’ll save it – possibly updating the server-side config or storing in a database or in the browser’s local storage depending on the architecture. For MVP, a straightforward plan is to save keys in a config JSON on the server (since we’re not multi-user, we don’t need a full vault per user; it’s essentially one set of keys for the whole app instance). We will document that these keys are stored and used only for making requests on the user’s behalf.

**Security considerations:** We must treat API keys as sensitive. If we do build a UI to input them, we should not send them to any backend except to store or use them – and if stored on disk, perhaps encrypt them (though if it’s the user’s own server, they control security). At minimum, we won’t expose keys in any client-side logs or error messages. Using environment variables is secure if the server is secure. We will encourage users deploying publicly to rotate their keys if needed and to keep the `.env` out of version control.

Additionally, in the UI we might show the status of keys (e.g. “OpenAI API key ✓ configured” without revealing the whole key) to let users know things are set up. Each integration could be optional; if a user doesn’t have a certain API, that feature can be disabled.

In summary, **API keys will be provided by the user and not hard-coded.** For MVP, storing them in an `.env` is acceptable (since it’s open-source, technical users expect that). We’ll likely also implement a basic settings screen to paste keys for convenience. All keys can be stored either in memory or disk on the server side, which is reasonably secure for a single-user scenario.

*(Since the project is open-source, we will make clear that users need their own API accounts for OpenAI, Cerebras, TTS services, etc. We might later integrate with something like OpenAI’s OAuth for users to connect their account, but that’s overkill for MVP.)*

## LLM Selection Flexibility in the UI

We intend to allow the user to **choose between different LLMs at runtime**, rather than fixing the model per installation or project. This means within the application interface, the user can select which AI model will be used to generate the script (and possibly which to use for other tasks if that arises). The idea is to make the choice of LLM as simple as picking from a dropdown menu, so users can leverage the strengths of various models easily.

**How it works:** We’ll have a menu (perhaps in the navbar or in the project settings) listing available models, e.g. “GPT-4 (OpenAI)”, “GPT-3.5”, “Qwen-3 235B (Cerebras)”, “Gemini 2.5” etc. The user can switch at any time – likely before generating a script, they choose the model, and then the next generation request goes to that model. We might also allow switching and regenerating a particular section with a different model to compare outputs. All underlying API differences will be abstracted away, so from the user’s perspective, it’s a seamless swap.

**Why this matters:** Different LLMs have different strengths, costs, and access requirements. By letting the user change the model on the fly, we accommodate:

* Users who have multiple API keys or want to try, say, both OpenAI and an open model to see which gives a better result or to avoid hitting rate limits.
* The ability to downgrade or upgrade model usage based on need. For a rough draft, the user might use a cheaper or local model; for the final script, they might switch to GPT-4 for maximum quality.
* Future expandability: we can add new models to the list without disrupting the UI much. If a new LLM comes out (say a better open-source model or a specialized model for technical text), we can integrate it and the user can just choose it.

In MVP implementation, when the user selects a model, we’ll likely set a context variable (e.g., `currentModel = "openai:gpt-4"` or `currentModel = "cerebras:qwen"`). The generation requests will route accordingly: our backend will have client code for each provider (OpenAI API, Cerebras API, Google API, etc.).

We will ensure the **UI clearly shows which model is active**, because that can affect output style. Possibly, we also show a short description of each model’s capabilities or limitations when hovering or in docs (for instance, “Gemini 2.5 – can handle images as input, up to 1M tokens context” or “GPT-4 – high quality general model, 8k/32k context”).

This design puts the user in control, which is important. Some users might not have an OpenAI key and only use the open ones; others might trust OpenAI more for quality. We give the choice. It’s also helpful for us to test internally which models work best for the task.

*(Technical note: We will abstract LLM calls so that adding a new model is implementing an interface – e.g. a function `generateScript(model, prompt)` that routes to the correct API. This way, the UI doesn’t need to know the details, it just passes the selection.)*

## Slide Template Editing and Style Customization

In the MVP, we **will not include a user-facing slide template editor or advanced design customization**. The slides will be generated with a default template and style that we provide. The user’s role will be largely to supply content (and perhaps some preferences) and let the AI produce the slides, rather than designing slides themselves in the tool.

**Why no template editor in v1:** Adding a full WYSIWYG slide designer or even exposing CSS editing would significantly increase the scope. We’d have to build UI for selecting themes, changing fonts/colors, repositioning elements, etc. That moves us toward being a presentation software (like PowerPoint/Google Slides) which is a whole product on its own. Our goal in MVP is to *automate* slide creation, not to have the user manually tweak each slide’s layout. So we assume users are okay with a fairly uniform style for the generated slides, at least initially.

We will therefore craft a **clean, general-purpose slide theme** – likely something minimal and modern (think along the lines of Google Slides default or a simple Reveal.js theme). It may include:

* A solid background (perhaps with light/dark mode options).
* A consistent font for headings and body text.
* Simple positioning of text and images (e.g., title at top, bullet points or paragraph below, maybe an image to the side or full-bleed if appropriate).
* Transitions/animations kept simple or none, to avoid distracting or complicating the rendering.

The user will not have controls to change these in the MVP UI. However, for advanced users, since the slides are HTML, one could theoretically modify the CSS or add their own theme file if they delve into the code – but that’s outside normal usage.

We will consider just two **base themes: light and dark.** The user might toggle between a light mode slide deck (white background, dark text) and a dark mode deck (dark background, light text) to suit their needs or to match the narration tone. This will likely correspond with the overall app theme as well (discussed in the Design System section). Other than that, no fine-grained theming.

In a future version (v2 or beyond), we can introduce a template/gallery of themes or a small editor for users to adjust colors and fonts. We might also allow exporting the slides as an editable file (e.g., a PowerPoint or Google Slides) so users can fine-tune them manually after generation if they want to add their branding or stylistic touches. But those are enhancements once the core workflow is proven valuable.

For MVP, **automation trumps customization** – we assume users prefer the speed of getting an auto-generated video over spending time polishing slide aesthetics. We’ll thus focus on making the default slides look reasonably good and professional for general use.

## Workflow: AI Generation vs Manual Edits

We are designing the workflow to be mostly **AI-driven in a single pass**, but we acknowledge the value of user intervention, so we’ll incorporate at least a review step for feedback. Here’s how the flow is envisioned:

1. **User inputs sources and requests a video script.**
2. **AI generates the narration script and draft slides automatically.** This includes the slide text and any suggested visuals.
3. **Review/Edit Step (Limited in MVP):** After generation, the user can review the script (and possibly a preview of slides) *before* final video rendering. In MVP, this might be as simple as showing the script in a text editor where the user can make quick tweaks or corrections. The user might spot factual inaccuracies or want to rephrase something – editing directly can be faster than re-prompting the AI. We will allow editing the script text at this stage. Similarly, if the user doesn’t like an image choice or layout, they might not have many tools to fix it in MVP, but they could delete an image or adjust a title.
4. **Finalize / Render Video.** Once happy, the user clicks a “Render Video” button, which triggers the TTS for each slide and the slide rendering process.

The reason to at least have a minimal manual edit opportunity is quality control. AI-generated content can sometimes be off or require tailoring. For example, the AI might produce 8 slides but the user decides combining two slides into one makes more sense – they should be able to do that edit. Or the AI’s tone might be slightly off and a quick wording change by the user can fix it.

However, beyond simple edits, we are not implementing a full iterative feedback loop in v1 (where the user could say to the AI “regenerate slide 5 with more detail” and it does it). That kind of conversational refinement could be amazing (and something we consider for later – a chat interface to refine the script, perhaps), but for MVP it’s probably too much to build. Instead, the user’s “feedback” is manual editing for now.

We will design the UI such that after generation, the user lands on a **“Script & Slides Review”** page. They can scroll through the slides, see the text (and maybe a placeholder for images), and there will be an edit button or inline editing. If they make changes, those changes will be used in the final output. We have to ensure re-rendering the slides HTML from those edits is doable (it should be, since it’s just substituting the edited text).

If the user is completely unhappy with the AI output, they could also choose to regenerate the whole script (perhaps after tweaking the prompt or settings). MVP might allow a single re-prompt or we might instruct them to adjust the source or prompt if results aren’t good, and then regenerate.

In summary, the MVP workflow is *mostly one-shot generation* for speed, with a light touch of user editing allowed. This ensures the user isn’t stuck with raw AI output if there’s an obvious fix needed. Going forward, we’d love to integrate a more interactive loop (like “thumbs down this slide and regenerate just that slide’s content” with the AI considering the feedback). That could be a v2 feature, but it’s beyond MVP scope to implement thoroughly. For now, a **manual edit stage** is our compromise to achieve higher quality without building complex AI feedback systems.

## Voice Selection Scope (Per-Project vs Per-Slide)

The text-to-speech **voice choice will be a project-level setting** (or even application-level default), not something that varies from slide to slide. We want the final video to have a consistent narrator voice throughout, for coherence and professionalism. Thus, the user will select a voice (e.g. a specific narrator persona or their own cloned voice) once, and the entire script will be synthesized in that voice.

In the UI, when the user enters their TTS settings (as discussed earlier), they’ll pick the voice. For example, in ElevenLabs, they might choose the premade voice “Bella” or supply a custom voice ID; in Cartesia, similarly a voice profile. That voice will apply globally to the generation run. We won’t have an option like “Slide 1 use Voice A, Slide 2 use Voice B” in MVP, because typically a single speaker per video is the norm (unless we were creating a dialogue or dramatization, which is a niche use-case).

**Per-project vs global:** It likely makes sense that each project can have its own voice setting. For instance, one project might use an English male voice, another a Spanish female voice, depending on content and audience. We will store the chosen voice with the project’s settings. Possibly, we’ll also have a default voice in the user’s profile so that they don’t have to re-select every time if they always use the same. But since MVP doesn’t have multi-user profiles, the default might just be remembered in local storage or a config.

The user can change the voice for a new generation if they want to experiment or if doing a multi-language output (they might select an appropriate voice for each language). But we won’t mix voices within one video output.

This design keeps things simple and is aligned with how users expect to produce narrations (one consistent narrator). It also avoids complicating the script with labels for different voices or having to split the text by speaker.

*(In future, if someone wanted multi-voice videos – say a conversation – that’s an advanced feature where the script would have to mark speakers and the system would use different voice IDs for each. We don’t plan on tackling that now.)*

## Design System and Theming (Light/Dark Mode)

We will implement a basic design system that supports at least **light and dark themes** for the application (and by extension, the slide generation interface). Providing a dark mode is important for user experience: not only do many users find it easier on the eyes during low-light conditions, but a significant portion simply **prefer the dark mode aesthetic** and expect modern apps to offer it. In fact, users often assume an app will respect their OS-level theme setting and automatically display in dark mode if they’ve enabled it globally. We plan to honor that expectation by using CSS media queries or a toggle to switch the app’s theme.

**Light Theme:** Likely a clean white or light gray background for pages, black or dark text, and our accent color for buttons/links.

**Dark Theme:** A dark background (charcoal or true black) with light text, adjusted colors for components (ensuring sufficient contrast). We have to be mindful of things like any logos or images – making sure icons have appropriate versions for dark bg, etc., as Nielsen Norman Group points out that simply inverting colors isn’t enough; we need to check that all UI elements (and slide content) remain legible and pleasant in dark mode.

We will include a theme toggle in the UI (for example, an icon to switch, and also default to the system preference on first load). This covers the interface around the slides (menus, editors, etc.) and potentially the slides themselves. We might generate slides in two variants (light or dark background) depending on user choice, since a user who prefers dark mode in the app might also want the video with dark slides. (This could be an option: “Slide Color Scheme”.) For MVP, linking the two is simplest – e.g. if app is in dark mode, output slides use dark theme. We’ll document that.

**User-defined CSS themes:** The question of whether to let users define custom themes (beyond light/dark) – for MVP, we will not provide a full theme editor. However, we will architect our CSS in a way that theming is manageable (using CSS variables or a CSS-in-JS theme provider). This means adding new themes or allowing customization later won’t require a full rewrite. But at launch, just the two modes are offered.

The **benefits** of providing theming from the start:

* Accessibility: Some users have visual preferences or needs (e.g., high contrast mode, or avoiding bright backgrounds at night).
* Professionalism: It makes the tool feel more polished and modern, as most applications today have a dark mode option. As an example, many developers simply won’t use a tool that blinds them with a white screen at midnight – offering dark mode enhances user satisfaction and comfort, which can lead to better adoption.
* It’s not too hard to implement with modern frameworks, especially if we plan it from the beginning (use variables for colors, etc.).

**Theming for generated slides:** This is slightly separate from the app UI theme. We will ensure the slide template has a dark mode variant. For instance, light theme slides (white background) may be better for printing or bright environments, whereas dark theme slides (dark background) might look good in videos or when the content is being viewed on screens in a dark room. We have to test both to ensure readability (e.g., some colors or images might need adjustment on dark background, as NN/g notes about images with white backgrounds showing awkwardly in dark mode). At MVP, our slide content is mostly text and maybe some images; we’ll pick colors that work in both modes (or use a filter on images if needed to avoid jarring white boxes).

In conclusion, **yes to light/dark theme support** as part of the design system. We will not allow arbitrary user-defined theme creation in MVP, but we will lay the groundwork for theming. This should satisfy most users out of the box and show that we care about UX details like eye strain and aesthetics. Offering both modes can *“enhance user satisfaction and meet market expectations”* since major apps do so, without compromising our development timeline too much.

---

**Sources:**

1. Google Labs – *What’s new in NotebookLM: Video Overviews and an upgraded Studio* (Jul 29, 2025) – Describes NotebookLM’s narrated slides (Video Overviews) and the Studio panel update for multiple outputs.

2. *How to programmatically convert an HTML5 slideshow to a video* – Developer blog by Robinz (2018) – Outlines using a web app, Puppeteer, and FFmpeg to capture slides and make a video.

3. Nielsen Norman Group – *Dark Mode: How Users Think About It* (Feb 2023) – Explains user expectations and preferences for dark mode in applications.

4. Google Labs – *NotebookLM Audio Overviews in 50+ languages* (Apr 29, 2025) – Highlights the addition of an output language option in NotebookLM, enabling multilingual audio summaries.

5. Cerebras Blog – *Qwen3 235B Instruct Now Available* (Jul 29, 2025) – Announces Qwen-3 235B model on Cerebras, noting its 1,400 tokens/sec generation and comparisons to GPT-4.1 in speed and cost, as well as benchmark performance.

6. Google Product Blog – *Expanding our Gemini 2.5 family of models* (Jun 17, 2025) – Describes Gemini 2.5 Pro, Flash, and Flash-Lite, emphasizing cost/speed efficiency and capabilities like 1M context and multimodal support.

7. Cartesia vs ElevenLabs – *Cartesia.ai comparison page* (accessed 2025) – Details differences between Cartesia and ElevenLabs TTS, including voice cloning requirements (3s vs 10–30s).

8. ElevenLabs Blog – *ElevenLabs vs. Cartesia (June 2025)* – Provides a comparison, noting that Cartesia’s self-serve TTS pricing is about one-fifth the cost of ElevenLabs for equivalent use.
