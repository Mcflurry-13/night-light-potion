# Night Light Potion

A short browser game for children aged about 7 to 10. Players talk with Granny Fern, a forest witch, to collect three ingredients for a potion. Three helpers guide them to look at her words from different angles:

- Dot (fox): What are the facts?
- Rae (rabbit): What is her reason?
- Bo (bear): Who said so?

The finished potion shows which choices worked. A creature pops out of the pot for each ingredient that went wrong.

## Research context

Prototype for a design-based research project on children's epistemic cognition when judging AI-style answers. Focus areas: accuracy, evidential support and source reliability.

## Run locally

Static site, no build step. Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Deploy

Import this repository in Vercel with the framework preset "Other". No build command and no output directory are needed.

## Granny Fern's replies

Granny Fern answers free-typed questions with a live model.

- Inside claude.ai: the page uses the model that claude.ai provides.
- On Vercel: the page calls `api/fern`, a small server function that calls the Anthropic API. Her persona and notes stay on the server in `api/_fern-notes.js`, so the endpoint only answers as Granny Fern.
- Without either: the free-text box is hidden and she answers the suggested questions with prewritten replies.

### Vercel setup

1. Project Settings, Environment Variables: add `ANTHROPIC_API_KEY` with a key from console.anthropic.com.
2. Optional: add `ANTHROPIC_MODEL` to change the model. Default: `claude-haiku-5-5`.
3. Redeploy so the new variables take effect.

Each reply is capped at 220 tokens, and each visitor at about 20 messages a minute. Set a monthly spend limit in the Anthropic console as well, since the site is public.

### Editing her notes

`api/_fern-notes.js` was generated from the `ROUNDS`, `EXTRA` and `PERSONA` values in `index.html`. After changing those, update this file to match.

## Play log

The end screen has a "Copy play log" button. It copies a JSON record of questions, helper clicks and choices with timestamps.
