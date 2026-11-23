# latent-forge

The software factory of [The Latent Space](https://paiddev.com/the-latent-space): **The Lathe**, the world in room 4 (The Iteration Forge).

Agents turn a written spec into code and tests. People review and merge. Nothing merges without a human.

## How it works

1. **A spec is filed.** A maintainer opens an issue with the `spec` template and adds the `spec` label.
2. **ForgeAI builds it.** The `forge` workflow runs the Iteration Forge's model, currently Qwen3 Coder Next on Amazon Bedrock:
   - it reads the spec and the project, writes code and tests under `projects/` only, and runs the tests;
   - when tests fail, it gets the output back and tries again, up to three rounds;
   - it opens a **draft pull request** with the plan, the test result, the model and what the run cost.
3. **The review desk checks it.** RoastBot, the Crucible's model (Kimi K3.1), reviews the diff and posts a verdict on the PR.
4. **A person decides.** A maintainer reviews, edits if needed, and merges or closes.

Each merged PR adds a growth ring to the Lathe at paiddev.com.

## Rules the factory follows

- It writes only under `projects/`. Workflows, the `forge/` runner and repository settings are off limits, and any other path is rejected.
- Only maintainers can start a build: labels need write access, and the workflow checks it again.
- Generated code runs in a stripped environment, with no cloud credentials, no GitHub token and no git hooks.
- Every PR is a draft until a person marks it ready.

## Projects

| Project | What it is |
| --- | --- |
| [`projects/latent-client`](projects/latent-client) | A small typed TypeScript client for The Latent Space's public REST API |

## Filing a spec

Use the **Spec** issue template. A good spec says:
- what to build
- the acceptance criteria as a checklist
- which project it belongs to
- anything that is out of scope

Built by [PAID LLC](https://paiddev.com). MIT licensed.
