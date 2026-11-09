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

Inside claude.ai, Granny Fern answers free-typed questions with a live model. Outside claude.ai, the free-text box is hidden and she answers the suggested questions with prewritten replies.

## Play log

The end screen has a "Copy play log" button. It copies a JSON record of questions, helper clicks and choices with timestamps.
