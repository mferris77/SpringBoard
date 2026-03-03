https://github.com/bigguy345/Github-Copilot-Atlas
https://github.com/ShepAlderson/copilot-orchestra
https://github.com/code-yeongyu/oh-my-opencode/blob/dev/docs/guide/installation.md

Either a VS Code plugin or an Electron app where we can tie together one or more agent service (OpenAI, Azure OpenAI, Google, Claude, local LLM, etc) into a single workspace

* A 'getting started' skill - use when there is no clear design, plan or it seems the user hasn't fully fleshed out what they want to build.  Ensure the groundwork is laid so development doesn't go off track.  Divide development into logical sprints.
* Idea builder skill - allow the user to say what new feature they want to see - ask clarifying questions, flesh out a development plan, assign it to a sprint/agent, etc.
- planner/onboarding/new repo review agent (assesses current code base, identifies areas for imrprovement, missing tests, documentation need, areas which are confusing or unclear that would cause agents to generate incorrect code)
* Kanban boards
* Assign a task to an agent, let it run
* Create new tasks while agents are running
* Create workflows and/or agent teams (documentation, QA, code review, adherence to spec, duplicate code check, nitpicker: KISS, DRY, etc.)
* Skill builder expert
* Skill and MCP library
* MCP librarian? Focuses only on identifying MCP tools relevant to the task
* Chat / thread history, branching
* Work trees
* PR/Repo Man assistant
* Ralph?
* NotebookLM / Obsidian / Notion / Local RAG integration

---
The updates for copilot on the new insiders build are having a real big impact on performance now: models are actually using the tools they have properly, and with the auto-injection of the agents file it's pretty easy to let the higher tier models like codex and opus adhere to the repo standards. Hell, this is the first time copilot models are actually sticking to using uv without having to constantly interrupting to stop them using regular python!

The subagent feature is my favorite improvement all around I think. Not just to speed things up when you're able to parallelize tasks, but it also solves context issues for complex multi step tasks: just include instructions in your prompt to break down the task into stages and spawn a subagent for each step in sequence. This means each subtask has its own context window to work with, which has given me excellent results.

Best of all though is how subagents combine with the way copilot counts usage: each prompt deducts from your remaining requests... but subagents don't! I've been creating detailed dev plans followed by instructing opus or 5.2-codex to break down the plan into tasks and execute each one with a subagent. This gives me multi-hour runs that implement large swathes of the plan for the cost of 1 request!

The value you can get out of the 300 requests you get with copilot pro pretty much eclipses any other offer out there right now because of this. As an example, here's a prompt I used a few times in a row, updating the refactor plan in between runs, and each execution netting me executions of 1 to 2 hours of pretty complex refactoring w/ 5.2-codex, for the low price of 4 used requests:

````
Please implement this refactor plan: #file:[refactorplan.md]. Analyze the pending tasks & todos listed in the document and plan out how to split them up into subtasks.

For each task, spawn an agent using #runSubagent, and ensure you orchestrate them properly. It is probably necessary to run them sequentually to avoid conflicts, but if you are able, you are encouraged to use parallel agents to speed up development. For example, if you need to do research before starting the implementation phase, consider using multiple parallel agents: one to analyze the codebase, one to find best practices, one to read the docs, etcetera.

You have explicit instructions to continue development until the entire plan is finished. do not stop orchestrating subagents until all planned tasks are fully implemented, tested, and verified up and running.

Each agent should be roughly prompted like so, adjusted to the selected task:
```
[TASK DESCRIPTION/INSTRUCTIONS HERE]. Ensure you read the refactor plan & agents.md; keep both files updated as you progress in your tasks. Always scan the repo & documentation for the current implementation status, known issues, and todos before proceeding. DO NOT modify or create `.env`: it's hidden from your view but has been set up for development. If you need to modify env vars, do so directly through the terminal.

Remember to use `uv` for python, eg `uv run pytest`, `uvx ruff check [path]`, etc.  Before finishing your turn, always run linter, formatter, and type checkers with: `uvx ruff check [path] --fix --unsafe-fixes`, `uvx ty check [path]`, and finally `uvx ruff format [path]`. If you modified the frontend, ensure it builds by running `pnpm build` in the correct directory.

Once done, atomically commit the changes you made and update the refactor plan with your progress.
```
````
---
Electron Agent App (can include the above)
Sections of the app:
- General tab - no skill, just copilot chat interface
- Database tab - natural language to SQL, sql database agent `https://github.com/business-science/ai-data-science-team/blob/master/ai_data_science_team/agents/sql_database_agent.py`
- Todo tab - currently working, ideas, upcoming tasks, time tracking?
- DQM Tab
- ACI Tab
- Altria Tab
- New Project Registration tab - use when consulting or starting work on a new project, provide background details, agent asks clarifying questions, references past projects, finds potential issues, etc.
- Half-Baked tab - brain dump, ideas worth exploring - skills to help brainstorm, enhance, evaluate, estimate value and impact, develop PRD or next steps
- Teams tab - how much can we tie into Teams? Chat? Can we pull transcripts from meetings?
- Meeting tab- quick access to past meetings / calls
- Timesheet tab - time tracking and timesheet prep - look through past emails, calendar, etc to identify what we might have been working on and when - scan folders for 'last modified' date, scan onedrive/recent documents for recent edits, teams messages based on dates
- People Tab -graph tieing coworkers to projects? Helps with RAG and time tracking (chat message from isabelle? it's ACI work, etc.)
- NotebookLM / RAG tab

Onboarding / install skill - interview the user 'what exactly would you say that it is that you do here?' customize app setup based on role (HR, manager, operations, etc)


https://github.com/MaxHastings/llm-madness

https://github.com/lzjever/routilux

https://github.com/RunMaestro/Maestro

stitch.withgoogle.com/projects/787332661449310048?pli=1

https://github.com/business-science/ai-data-science-team/tree/master/apps

KanDo inspiration - Eigent app: https://www.youtube.com/watch?v=_5QeLwdI-F0&t=386s
https://github.com/DevAgentForge/Open-Claude-Cowork
https://github.com/TM9657/flow-like


Multi-agent research team: https://www.marktechpost.com/2025/07/19/building-a-multi-agent-ai-research-team-with-langgraph-and-gemini-for-automated-reporting/

Vue RBAC: https://vue-rbac.nangazaki.io/

Guardrails: 
https://www.guardrailsai.com/hub
https://github.com/orgs/guardrails-ai/repositories?type=all

RAG 
https://github.com/kreuzberg-dev/kreuzberg
https://www.reddit.com/r/Rag/comments/1pn2fxv/kreuzberg_v400rc8_is_available/

Training data: 
https://github.com/e-p-armstrong/augmentoolkit?tab=readme-ov-file#video-tutorials


Agents/Skills:
https://github.com/wshobson/agents
https://github.com/DeevsDeevs/agent-system
https://github.com/ShepAlderson/copilot-orchestra
https://github.com/anthropics/knowledge-work-plugins/blob/main/data/skills/data-visualization/SKILL.md
https://www.reddit.com/r/google_antigravity/comments/1r3hlis/share_your_best_google_antigravity_skills_rules/
https://github.com/DevAgentForge/Open-Claude-Cowork

Mindmap:
https://github.com/SaiDev1617/mindmap

GSD For Copilot
https://github.com/Punal100/get-stuff-done-for-github-copilot

https://github.com/vudovn/antigravity-kit/blob/main/.agent/agents/code-archaeologist.md

https://github.com/google-gemini/gemini-skills

# loguru
Python’s built-in logging module is… an experience.

`loguru` is what logging should have been from day one.

```
from loguru import logger  
 
logger.add("app.log", rotation="1 MB")  
logger.info("Application started")  
logger.warning("Something feels off")  
logger.error("Something broke")
```
Why this matters more than you think:

- Zero configuration
- Structured logs by default
- Rotating files without ceremony


# Pydantic
Every bug eventually traces back to **bad input**.

`pydantic` enforces structure _before_ chaos enters your system.

```
from pydantic import BaseModel, ValidationError  
 
class User(BaseModel):  
    id: int  
    email: str  
    is_active: bool = True  
try:  
    user = User(id="abc", email="not-an-email")  
except ValidationError as e:  
    print(e)
```

Why I install it immediately:

- Automatic type validation
- Self-documenting models
- Fail fast, fail loud

# python-dotenv
Every beginner hardcodes API keys.  
Every expert regrets it.

```
# .env  
DATABASE_URL=postgresql://user:pass@localhost/db  
API_KEY=super_secret_key

from dotenv import load_dotenv  
import os  
 
load_dotenv()  
db_url = os.getenv("DATABASE_URL")  
api_key = os.getenv("API_KEY")
```
Why this library quietly saves careers:
- Keeps secrets out of Git
- Makes deployments predictable
- Works everywhere (local, Docker, CI)


# Rich
If you’re still using plain `print()` for debugging, you’re living in the Stone Age.

`rich` turns your terminal into a **developer-grade dashboard**.
```
from rich import print  
from rich.console import Console  
from rich.table import Table  
 
console = Console()  
table = Table(title="User Stats")  
table.add_column("Name", style="cyan")  
table.add_column("Score", justify="right", style="green")  
table.add_row("Alice", "98")  
table.add_row("Bob", "87")  
console.print(table)
```

Why this matters:

- Readable logs reduce debugging time (by a lot)
- Structured output beats scrolling through text soup
- You can visualize JSON, tracebacks, progress bars, and trees


# tenacity
APIs fail.  
Databases blink.  
Networks have moods.

`tenacity` gives you **retries with dignity**.

```
from tenacity import retry, stop_after_attempt, wait_exponential  
 
@retry(stop=stop_after_attempt(3), wait=wait_exponential())  
def fetch_data():  
    print("Trying...")  
    raise Exception("Temporary failure")  
fetch_data()
```
Why I install it early:

- Eliminates flaky behavior
- Makes failures predictable
- Saves you from writing retry spaghetti

If your project touches anything over the network, you need this.


# typer

Every serious project eventually needs a command-line interface.

`argparse` works.  
`typer` feels like cheating.

```
import typer  
 
app = typer.Typer()  
@app.command()  
def greet(name: str, admin: bool = False):  
    if admin:  
        typer.echo(f"Welcome back, admin {name}")  
    else:  
        typer.echo(f"Hello {name}")  
if __name__ == "__main__":  
    app()
```
Run:

`python app.py greet Alice --admin`

Why `typer` is underrated:

- Auto-generated help docs
- Type hints become CLI validation
- Built on `click` (battle-tested)

I use this even for _internal_ tools.  
Future-me always thanks past-me.


# watchdog
This one is criminally underused.

`watchdog` lets your program **react to file system events in real time**.

```
from watchdog.observers import Observer  
from watchdog.events import FileSystemEventHandler  
import time  
 
class Handler(FileSystemEventHandler):  
    def on_modified(self, event):  
        print(f"{event.src_path} changed")  
observer = Observer()  
observer.schedule(Handler(), path=".", recursive=True)  
observer.start()  
try:  
    while True:  
        time.sleep(1)  
except KeyboardInterrupt:  
    observer.stop()  
observer.join()
```
Use cases:

- Auto-reload configs
- Trigger pipelines on file drops
- Build dev tools without polling