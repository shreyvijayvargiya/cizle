# Oh, the Places: an interactive storybook

By @EKeric13 · Opus 5.5 · 像素与角色
Language: ? · Domains: edtech, entertainment, product · Source: V01

Original post: https://x.com/EKeric13/status/2107139500980007379

```
had gpt 6 astra and opus 5.5 put together an animated version of "Oh, the places you'll go!"

https://oh-the-places-storybook-ek.ekeric13.chatgpt.site

I am sure you have seen some amazing one prompt demos lately. Unforunately, that didn't quite work for me here. Forunately, vibe coding over the course of 2 days with me randomly checking in here and there did work. That said, it did require some thoughtful human input and iteration on the how the animation was done.
Probably used 70% of the $20 subscription plan for both anthropic and openai. No resets.

The main cost was definitely fal. probably $100 in credits used. And then the other one was ~$5 of eleven labs credits.

Nano Banana 2 + GPT Image 2 was used for the drawings.
LTX 2.3 Pro was used for motion references for character and scenery movement.
Eleven v3 was used for narration.
Scribe v2 was used to align the narration, text, and animation.
Also used FILM (think kling) to generate some interpolation images.

Originally was planning to just use Seedance 2.5 to animate the storybook but that was absolutely chewing through my fal credits so I ended up using a cheaper vid model for motion (LTX 2.3 Pro) that I would translate into js animations.

wrote in detail about that process here with some additional video clips. Worth skimming imo:
https://oh-the-places-storybook-ek.ekeric13.chatgpt.site/review

Two other reasons I moved towards animating with code - video models rarely got everything right on the first try, and I found it easier to get a specific movement by asking claude to animate it in js.

The real hook is that you can insert your own kid into the book. Initially I had a series of prompts that could be used if you uploaded a photo of your kid... but the image models (nano banana / gpt image) would almost always have hiccups. gpt image especially has an overly sensitive classifier and finds dumb reasons to reject your request. So I moved towards a prompt + refernce kit that people can just plugin to their coding harness.
If you have a chatGPT/gemini subscription (so you don't have to pay for images), and a coding agent with solid computer-use... the agent should do a good job hand holding you through the entire process. I think there is a growing expectation that people don't have to use their brain to get value out of your product lol.

Putting your kid in the storybook wasn't hard as long as they held a single pose. The real problem (to use a claude idiom... a claudiom if you may) was getting their full body animated. That workflow required an additional model to the ones above. MiniMax H3 Max was used to do the animation of the child on a white background. I then had the coding agent remove the background and composite the animation into the scene.

Created an eval suite of a few different types of kids (ethnicity, hair, age, etc) so a reasonable level of confidence the feature should generalize across kids.
```

Creator's prompt, collected for private study. Ask before republishing.
