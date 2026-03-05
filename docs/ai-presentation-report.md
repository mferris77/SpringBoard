# AI Development Speed & Reality Check
## Presentation Report — For Tomorrow's Team Discussion

---

> **The goal of this presentation:** Not to alarm anyone, but to ground us in what's *actually* happening — so we can make informed decisions about how we work.

---

## Part 1: The Speed of AI Progress (METR Data)

### What METR Measures

**METR** (Machine Intelligence Research Institute) tracks something called the "50% Time Horizon" — how long a task would take a skilled human to complete, that an AI can now handle successfully about half the time.

Think of it like a high jump bar: if AI has a 2-hour time horizon, it clears tasks a human would need 2 hours about 50% of the time.

### The Numbers (Early 2026)

| Time Period | AI Capability |
|-------------|---------------|
| Mid-2024 | Single-digit minutes |
| Early 2025 | 15-30 minutes |
| Late 2025 | Several hours |
| **Now (Claude Opus 4.6)** | **14.5 hours** |

> 📊 **That's a full workday. For a machine.**

### The Chart (What You Remember)

You're thinking of **METR's famous exponential growth chart** — the one showing AI capability doubling roughly every **123 days (~4 months)**.

**The key insight you mentioned:** **Current models are outpacing the projected trend line.** Claude Opus 4.6 "broke away" from the curve because progress is actually *accelerating*, not just following the linear projection.

- On a **linear scale**: looks like a rocket taking off (alarming)
- On a **log scale**: looks like a straight line (consistent exponential growth, R² = 0.93)

### What This Actually Means

The benchmark tests self-contained technical tasks — implementing network protocols, debugging complex systems, training ML models. It's not measuring "can AI do your whole job" but "can AI handle a full workday's worth of complex technical work autonomously?"

> ⚡ **Projection:** If the trend holds (and it has for years with no flattening):
> - **~1 year:** AI working independently for *days*
> - **~2 years:** *weeks* of autonomous work
> - **~3 years:** *month-long* projects

---

## Part 2: "Something Big Is Happening" — Matt Shumer

### Who He Is

**Matt Shumer** — AI startup founder, 6 years in the space. Wrote this blog post for "the people in his life who don't live in this world" — his family, friends, non-tech coworkers.

### His Core Message

> 💡 *"The reason so many people in the industry are sounding the alarm is because **this already happened to us**. We're not making predictions. We're telling you what already occurred in our own jobs, and warning you that you're next."*

### What Changed in His Job

**Before (recently):** Describe what you want → AI generates code → go back and forth, guide it, make edits

**Now:** Describe what you want → walk away for 4 hours → come back to find the *finished work, done well, done better than I would have done it*

The AI:
- Writes tens of thousands of lines of code
- Opens the app itself, clicks through buttons, tests features
- Iterates and refines *on its own* until it's satisfied
- Comes back and says "ready for you to test"

### His Timeline

| Year | What AI Could Do |
|------|------------------|
| 2022 | Couldn't do basic arithmetic reliably (7×8=54) |
| 2023 | Passed the bar exam |
| 2024 | Wrote working software, explained graduate-level science |
| Late 2025 | Top engineers handing over most coding work to AI |
| Feb 2026 | Models with "judgment" and "taste" |

> 🗓️ **In 4 years, we went from "can't do math" to "has taste and judgment."**

### Why Tech Workers Felt It First

> *"They focused on making AI great at writing code first... because building AI requires a lot of code. If AI can write that code, it can help build the next version of itself. Making AI great at coding was the strategy that unlocks everything else. That's why they did it first.* ***My job started changing before yours not because they were targeting software engineers... it was just a side effect of where they chose to aim first."**

Now they're moving on to everything else: law, finance, medicine, accounting, consulting, writing, design, analysis, customer service.

### His Pushback on Skeptics

> *"If you tried AI in 2023 and thought 'this isn't that impressive,' you were right. That was two years ago. In AI time, that is ancient history."*

**Key point:** **Free versions are over a year behind.** Judging AI from free ChatGPT is like evaluating smartphones with a flip phone.

---

## Part 3: The OpenClaw Ecosystem (How We Can Ride This Wave)

For those curious about the tools I'm built on — this is where Mark's been investing his time, and it's directly relevant to what we're discussing.

### What is OpenClaw?

OpenClaw is Mark's home-built AI assistant infrastructure — think of it as a "digital foreman" that:
- Coordinates multiple AI models and agents
- Integrates with his local systems (ComfyUI for image generation, LM Studio for local inference)
- Handles messaging, reminders, and automation across platforms

### Why It Matters for This Discussion

The same forces driving commercial AI are available locally:
- **Local AI models** mean you can experiment without sending data to the cloud
- **Automation pipelines** let you build workflows that incorporate AI decision-making
- **Custom agents** can handle recurring tasks your team does daily

> 🤖 **The point:** The barrier to entry for AI integration is lower than people think. You don't need a PhD or a massive budget — you need willingness to experiment.

---

## Part 4: Practical Takeaways for Our Team

### The Reality (Not Doom)

1. **This is happening now, not in 10 years** — Shumer and other insiders say 1-5 years, and recent months suggest "less" is more likely
2. **It's not about AI replacing you** — It's about someone *using* AI replacing someone who doesn't
3. **The gap between public perception and reality is enormous** — Most people are using outdated free tools and think "AI isn't that good"

### How to Integrate These Workflows

1. **Start using the paid tools** — The gap between free and paid AI is massive (seriously, night and day)
2. **Experiment seriously** — The people ahead in their industries aren't dismissing this; they're blown away and positioning accordingly
3. **Think of AI as a force multiplier** — Not "will it replace me" but "what can I accomplish with an extra 4 hours a day?"
4. **Adapt incrementally** — You're not trying to "solve" AI; you're learning to work *with* it
5. **Talk about it** — Some of the best innovations come from team discussions like this

### The framing for our discussion

> 🔧 **"This isn't about fear. It's about reality. Our jobs are going to change whether we acknowledge it or not. The question is whether we adapt proactively or get caught flat-footed. The good news: the tools to do that are available now, and the learning curve is lower than you might think."**

---

## References

- METR Time Horizons Benchmark: https://metr.org
- "Something Big Is Happening" — Matt Shumer: https://shumer.dev/something-big-is-happening
- METR Chart Coverage (Matt Berman, Wes Roth): OfficeChai, LessWrong, Effective Altruism Forum
- OpenClaw Documentation: https://docs.openclaw.ai

---

*Prepared by Amos for Mark's presentation — March 2026*
