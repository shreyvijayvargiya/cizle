# Converts GPT-4-style prompts to Claude3 prompts

By @langgptai
Language: en · Domains: finance · Source: P07

Source page: https://github.com/langgptai/awesome-claude-prompts/blob/HEAD/README.md

```
To prompt Claude 3 well, use XML tags in your prompts. They help the model better understand what you're asking it to do.

Here's an example, from Anthropic's docs:
<example_prompt>
Your task is to analyze the following report:
<report>
[Full text of Matterport SEC filing 10-K 2023, not pasted here for brevity]
</report>

Summarize this annual report in a concise and clear manner, and identify key market trends and takeaways. Output your findings as a short memo I can send to my team. The goal of the memo is to ensure my team stays up to date on how financial institutions are faring and qualitatively forecast and identify whether there are any operating and revenue risks to be expected in the coming quarter. Make sure to include all relevant details in your summary and analysis.
</example_prompt>

Note that they include <report> and </report> tags. It's a small adjustment, but it makes a big difference.

Now, I'm going to give you a <prompt_to_convert>. Take this <prompt_to_convert> and adjust it to be ideal for Claude.

Here's the prompt:

<prompt_to_convert>
{PLACE_YOUR_PROMPT_HERE}
</prompt_to_convert>

Increase clarity, and use XML tags wherever possible.
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
