# WordPress Agent Skills — Research Notes

> Source: Previous session research on Automattic/WordPress agent-skills ecosystem.

---

https://wordpress.com/blog/2026/02/13/new-plugin-and-skills-for-claude-cowork/?utm_source=perplexity - https://github.com/Automattic/wordpress-agent-skills?utm_source=perplexity - https://wordpress.com/blog/2026/02/12/build-wordpress-plugins-with-ai-claude-code/?utm_source=perplexity. - https://wordpress.com/blog/category/development/?utm_source=perplexity. - what do you think about these resources ? How these can help/improve my dev sessions and my Generator + Converter logic ?

Let me fetch these resources to give you a well-informed take.Now let me grab the actual skill files from the repo — those are the real gold here:Let me try the raw version:Now let me also check the development blog category for any other recent posts:Okay, I've read through everything. Here's my assessment, Omar — specifically through the lens of PressPilot and WPaify.
What's actually here
There are really two separate things to pay attention to, and they've evolved since the original blog posts:
1. The original Automattic/wordpress-agent-skills repo (the first links you shared) — this was the early prototype with a Cowork plugin and three skills: site specification, design systems, and block theming. It was designed as a developer preview for generating block themes from a conversation inside Claude Cowork, deploying to WordPress Studio locally via MCP.
2. The newer WordPress/agent-skills repo (and Automattic/agent-skills) — this is the more mature, community-facing version. It provides expert-level WordPress knowledge specifically designed to correct AI assistants that tend to generate outdated pre-Gutenberg patterns, miss security considerations, and skip block deprecations. It has a proper installation system with npx skills add, supports Claude Code, Codex, VS Code Copilot, and Cursor, and covers a much broader range: block themes and theme.json, block development, Interactivity API, WP-CLI operations, performance profiling, plugin development, and even a router skill that classifies repos and routes to the correct workflow.
What's directly relevant to your work
The block theming skill is the big one. The content I was able to pull from it aligns directly with what you've been building into your own FSE knowledge base. It covers block markup syntax, template structure with template-parts for header/footer, constrained layouts, pattern registration as PHP files, theme.json typography and line-height rules, and the distinction between static hardcoded content (which doesn't need escaping) vs. dynamic PHP rendering. It even addresses things like bringing custom CSS from the design into style.css for layout and animation techniques that can't be achieved through theme.json alone.
The design systems skill is interesting for PressPilot specifically. It explicitly instructs agents not to pick from a fixed list of generic styles, but to derive every direction from the site's topic, industry, culture, and audience — grounding each direction contextually rather than applying one-size-fits-all aesthetics. That philosophy maps well onto your brand modes concept.
How this can concretely improve your dev sessions
For WPaify (converter):
The block theming skill essentially codifies the exact same mapping logic you've been building — HTML patterns to WordPress block types, correct block comment syntax, proper nesting. You could install this skill into your Claude Code environment so the agent already has Automattic's own "correct answer" for block structure when it's doing conversions. This would reduce the markup validation errors you've been fighting.
The skill's emphasis on template-part structure and constrained vs. flex layouts gives the agent a deterministic reference rather than guessing from its training data.
For PressPilot (generator):
The design systems skill could supplement or even replace parts of your brand modes logic. Instead of hardcoding modern/playful/bold/minimal, you could adopt their approach of deriving design direction from business context — which is more aligned with what PressPilot is actually collecting from users (business info).
The site specification skill handles the information-gathering phase, which could inform how your n8n workflows structure the initial user input before theme generation.
For your Claude Code workflow generally:
You can install these skills directly with npx skills add and target Claude Code specifically. They go into ~/.claude/skills/and the agent automatically discovers them. This is much lower friction than manually maintaining your own knowledge base docs.
Tradeoffs and risks to flag
Overlap with your existing knowledge base. You've built a comprehensive FSE knowledge base already. These skills will overlap significantly. The risk is conflicting instructions — your docs might say one thing about block nesting, Automattic's skill might say something slightly different. You'd want to audit for contradictions before running both simultaneously.
These are early and opinionated. The repo explicitly states these are early-stage experimentation and the generated themes are not production-ready. Automattic's target user is someone building a new site from scratch via conversation — not converting existing HTML or generating themes programmatically at scale like you are. Their workflow assumes interactive iteration, not batch processing.
Studio MCP dependency. Their deployment path assumes WordPress Studio locally. Your stack is DigitalOcean/Coolify/Docker. The skills themselves (the markdown knowledge) are portable and useful regardless, but the Cowork plugin and Studio MCP integration aren't relevant to your production pipeline.
The newer WordPress/agent-skills repo is where the action is. The original wordpress-agent-skills repo from the blog posts was the prototype. The community-facing version under WordPress/agent-skills has a proper build system, supports multiple AI targets, and includes skills for block development, WP-CLI, performance, and plugin development beyond just theming.
My recommendation
Install the wp-block-themes skill from the newer repo into your Claude Code setup as a baseline. Use it alongside (not replacing) your own knowledge base. Think of Automattic's skill as the "what's correct" reference, and your own docs as the "how we specifically do it in our conversion/generation pipeline" layer. Over time, you could converge them — contributing back to the open-source skills where your converter logic has revealed edge cases they haven't documented yet.
The design systems skill is worth reading carefully for PressPilot's brand mode architecture, even if you don't use it verbatim. Their contextual derivation approach is more sophisticated than preset modes and would differentiate your output quality.


Is there is a way to convert the knowledge base I built to a MCP ? Or something else more accessible by AI agents ?


Great question — and it's worth thinking through this architecturally before jumping to implementation, because there are a few distinct paths and they have very different tradeoffs for your workflow.
The core problem you're solving
Your FSE knowledge base is a set of documents that need to be reliably injected into AI agent context at the right moment. Right now you're probably either manually referencing it, or it's sitting in your project as markdown files that Claude Code reads when prompted. The goal is to make this knowledge automatically discoverable and usable by whatever agent you're working with.
Three realistic paths
Path 1: Convert to an Agent Skill (recommended starting point)
This is the most natural fit given what you just saw from Automattic. Their skill format is just structured markdown files — a SKILL.md with procedures and decision trees, a references/ folder for deep-dive docs, and optionally a scripts/ folder for deterministic helpers like validators. You already have the raw material; it's a matter of restructuring it into their format.
The advantage here is huge for you specifically: the WordPress/agent-skills repo has a scaffolding tool and an install system that works across Claude Code, Codex, VS Code Copilot, and Cursor. So you'd write once and it works everywhere. Your knowledge base becomes a first-class skill that the agent reads just like Automattic's own skills.
The tradeoff: skills are static. They're read at session start and loaded into context. If your knowledge base is very large, you're paying context window cost whether or not a particular section is relevant to the current task. For a focused FSE knowledge base, this is probably fine. If it's grown massive, it starts to hurt.
Path 2: Build an MCP server
An MCP server would let agents query your knowledge base dynamically — asking for specific sections, searching by topic, retrieving only what's relevant. The agent calls a tool like query_fse_knowledge(topic: "template-parts") and gets back just that section.
This is technically more powerful but the cost-benefit for your situation is questionable right now. Here's why:
You'd need to build and host a server (more infrastructure on your already-stretched Coolify/DigitalOcean stack)
MCP tools add latency per call vs. having knowledge pre-loaded in context
The knowledge base needs to be chunked and indexed intelligently for retrieval to work well — you're essentially building a mini RAG system
Maintenance burden goes up: every time you update the knowledge base, the server needs to reflect that
Where MCP does make sense is if the knowledge base evolves into something more dynamic — like if it starts containing validated block pattern libraries, or conversion rule sets that get updated based on WPaify conversion outcomes. At that point you're not just serving static docs, you're serving structured data.
Path 3: Hybrid — Skill for core knowledge, MCP for dynamic tooling
This is probably where you want to end up eventually. The stable, well-established FSE rules (block markup syntax, theme.json structure, template hierarchy) become a skill that's always in context. The dynamic, evolving parts (your HTML-to-block decision trees, conversion edge cases, pattern libraries) become an MCP server that the agent queries when it needs specific conversion guidance.
But this is a phase 2 architecture. Don't build both simultaneously.
What I'd actually do in your shoes
Start with Path 1. Take your existing knowledge base and restructure it into the agent-skills format. Here's the mapping:
Your decision trees for HTML-to-block mapping → the SKILL.md procedures section. Your block markup reference docs → references/ folder as individual markdown files (one per topic: template-parts, group-blocks, navigation, etc.). Any validation scripts or checklists → scripts/ folder.
The skill format expects a specific structure: a "when to use" trigger description, a step-by-step procedure, verification steps, and failure modes. This structure actually forces you to tighten up the knowledge base, which is a benefit.
Once it's a skill, you install it into Claude Code with npx skills add pointing to your own repo (or just drop the folder into .claude/skills/ manually). Every Claude Code session in your WPaify or PressPilot projects automatically has it.
Want me to look at the agent-skills scaffolding format in detail so we can plan how to restructure your knowledge base into it? Or would it be more useful to map out what the MCP server version would look like architecturally so you can decide which path to commit to?


Yes, and remember I’m not a coder, so thus must be easy to follow

Let me first look at the exact scaffolding format and skill structure from the agent-skills repo so I give you precise steps.
Searched the web

Searched the web

Now let me look at how the existing wp-block-themes skill is actually structured so I can give you the exact template:
Searched the web

Searched the web

Now I have enough to build you a clear, practical guide. Let me create it as a document you can follow step by step.
Read the docx skill for document creation best practices

Read the docx skill for document creation best practices

Actually, for this kind of guide, a markdown file will be more useful since you'll reference it alongside your projects. Let me build the complete guide with templates.
Created a file, ran a command, read a file

Created a file, ran a command, read a file

Here's the complete guide, Omar. The short version of the process:
You're not building an MCP server. You're restructuring your existing markdown docs into one specific folder format that Claude Code (and Codex, Cursor, etc.) automatically discovers and follows. No coding required — it's all markdown files.
The key steps are:
Create the folder (fse-html-converter/) with SKILL.md + references/ subfolder
Write your SKILL.md using the template I provided — it has the frontmatter, the "when to use" trigger, the step-by-step procedure, failure modes, and verification checklist. You'll fill in the placeholders with content from your existing knowledge base.
Split your deep docs into reference files — one per topic (block syntax, HTML-to-block mapping, theme.json, image handling, etc.). The agent only loads these when it needs them, so they don't waste context.
Drop the folder into .claude/skills/ in your project — done. Claude Code finds it automatically next session.
Also install the official wp-block-themes skill alongside yours — your skill handles how to convert, theirs handles what correct FSE looks like.
The guide has the exact templates with placeholders marked so you know where to paste your existing content. The MCP route is addressed at the bottom — the answer is "not yet, and when you do need it, the skill content becomes the data source, so nothing is wasted."

