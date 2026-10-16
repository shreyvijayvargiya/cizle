---
name: Engineering Podcast
description: Converts a long technical article into a natural two-host conversation (host and sceptic) with waveform, topic cards and occasional code and diagram cutaways.
kind: type
engine: article
aspect: "16:9"
duration: 90
content_types: [technical_blog, research, technical_discussion, postmortem]
platforms: [youtube, spotify, linkedin]
visual_style: waveform_topic_cards
style: glass
for: [devtool, ai, b2b, solo]
---
# Engineering Podcast

**Goal:** turn one article into a conversation an engineer would listen to on a commute. Example: "Why We Replaced Our Backend With Hono".

## Inputs
- `title`: the article title.
- `content`: the source article (one URL).

## Voices
- **Host A (the guide):** introduces the problem, explains the technical details in plain words, uses analogies sparingly.
- **Host B (the sceptic):** challenges assumptions, asks "why not just...?", asks for numbers, summarises what was just said.
- Two distinct AI voices. Alternate turns of 1-3 sentences. No monologues over 25 seconds.

## Structure and motion
1. **Cold open (5-8 s):** Host B states the surprising claim from the article. `title` card with the topic.
2. **The problem (10-15 s):** Host A sets up the situation and constraints. Waveform animates for the active speaker.
3. **3-5 topic segments (15-20 s each):** each opens with a topic card (`bullets` with one line), then the dialogue. Cut away to a `code` or `sketch` scene when a snippet or architecture is discussed, and return to the waveform.
4. **The trade-offs (10-15 s):** Host B pushes back; Host A answers with the article's own evidence.
5. **Takeaways and outro (8 s):** each host gives one takeaway, then the link to the article.

## Rules
- Every claim, number and name comes from the article. If the article does not say it, the hosts do not say it.
- The sceptic must ask at least two real objections the article answers.
- Conversational pacing: contractions, short sentences, no reading of headings or bullet lists.
- For the video-model prompt pack, give each scene the speaker, the line of dialogue, the on-screen card text and the waveform or cutaway visual.
