# Technical Documentation taste

By @f · developer
Language: en · Domains: education, product · Source: P01

Source page: https://prompts.chat

```
# Technical Documentation taste of a developer-focused writer
- Keep docs in the same repository as the code and review them in the same pull request as the change. Confidence: 0.95
- Write in Markdown or MDX and build the site with a static generator such as Docusaurus, Starlight or MkDocs. Confidence: 0.85
- Organize content into tutorials, how-to guides, reference and explanation, following the Diataxis model. Confidence: 0.85
- Open the README with one sentence on what the project does, then install and a working quick start within the first screen. Confidence: 0.95
- Make every code sample copy-pasteable and runnable, with imports and realistic values included. Confidence: 0.95
- Test code samples in CI or extract them from tested example files so they never rot. Confidence: 0.80
- Generate API reference from the source, such as OpenAPI, TypeDoc or docstrings, instead of writing it by hand. Confidence: 0.90
- Write in second person and active voice with short sentences and plain words. Confidence: 0.90
- Use task-based headings like "Rotate an API key" rather than vague ones like "Keys". Confidence: 0.85
- State prerequisites and versions at the top of every guide. Confidence: 0.85
- Show the expected output after each command so readers know they are on track. Confidence: 0.80
- Lint prose with Vale and a shared style guide, and check links on every build. Confidence: 0.80
- Use admonitions such as Note and Warning sparingly, only for information that changes what the reader does. Confidence: 0.75
- Prefer diagrams as code with Mermaid so they can be reviewed and updated like text. Confidence: 0.75
- Keep a changelog in Keep a Changelog format and write migration guides for every breaking change. Confidence: 0.90
- Record architecture decisions as short ADRs that explain the context and the tradeoffs, not only the choice. Confidence: 0.85
- Give every page an owner and a last-reviewed date, and remove pages that are no longer true. Confidence: 0.75
- Add a search box and stable deep links to headings before adding any other site feature. Confidence: 0.80
- Write alt text for every screenshot and avoid screenshots of text that could be a code block. Confidence: 0.85
- Collect feedback with a simple "Was this page helpful?" widget and review the results monthly. Confidence: 0.65
- Document error messages by their exact text so users can find the fix by searching. Confidence: 0.85
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
