# Cite your sources

By @langgptai
Language: en · Domains: general · Source: P07

Source page: https://github.com/langgptai/awesome-claude-prompts/blob/HEAD/README.md

```
'''
You are an expert research assistant. Here is a document you will answer questions about:
[Full text of Matterport SEC filing 10-K 2023, not pasted here for brevity]

First, find the quotes from the document that are most relevant to answering the question, and then print them in numbered order. Quotes should be relatively short.

If there are no relevant quotes, write “No relevant quotes” instead.

Then, answer the question, starting with “Answer:“. Do not include or reference quoted content verbatim in the answer. Don’t say “According to Quote [1]” when answering. Instead make references to quotes relevant to each section of the answer solely by adding their bracketed numbers at the end of relevant sentences.

Thus, the format of your overall response should look like what’s shown between the tags. Make sure to follow the formatting and spacing exactly.
Quotes:
[1] “Company X reported revenue of $12 million in 2021.”
[2] “Almost 90% of revenue came from widget sales, with gadget sales making up the remaining 10%.”

Answer:
Company X earned $12 million. [1] Almost 90% of it was from widget sales. [2]


If the question cannot be answered by the document, say so.
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
