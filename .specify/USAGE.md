1. Establish project principles
Launch your AI assistant in the project directory. The /speckit.* commands are available in the assistant.

Use the /speckit.constitution command to create your project's governing principles and development guidelines that will guide all subsequent development.

/speckit.constitution Create principles focused on code quality, testing standards, user experience consistency, and performance requirements

2. Create the spec
Use the /speckit.specify command to describe what you want to build. Focus on the what and why, not the tech stack.

2b. (Optional) /speckit.clarify - Ask structured questions to de-risk ambiguous      │
│  areas before planning (run before /speckit.plan if used)  

/speckit.specify Build an application that can help me organize my photos in separate photo albums. Albums are grouped by date and can be re-organized by dragging and dropping on the main page. Albums are never in other nested albums. Within each album, photos are previewed in a tile-like interface.

3. Create a technical implementation plan
Use the /speckit.plan command to provide your tech stack and architecture choices.

/speckit.plan The application uses Vite with minimal number of libraries. Use vanilla HTML, CSS, and JavaScript as much as possible. Images are not uploaded anywhere and metadata is stored in a local SQLite database.

3b. (Optional) /speckit.checklist - Generate quality checklists to validate requirements, completeness, clarity, and consistency

4. Break down into tasks
Use /speckit.tasks to create an actionable task list from your implementation plan.

/speckit.tasks

4b. (Optional) /speckit.analyze - Cross-artifact consistency & alignment report

5. Execute implementation
Use /speckit.implement to execute all tasks and build your feature according to the plan.

/speckit.implement

Have a look around at the repo - no code yet - an empty palette! Do look at the ideas and notes.  Take particular care to review the /docs/proposal folder, the 'RESEARCH' and 'PRD' documents.  

I'd like your help designing a finely detailed and structured development plan to bring this to fruition. I already have something similar I've been building as a personal project and I'd like to borrow some of the designs from it. (I'll pull the repo while you're taking a look...)