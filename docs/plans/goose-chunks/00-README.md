# Goose Agent — PressPilot Phase A Testing

## How to Use

Run each chunk file ONE AT A TIME, in order. Each chunk is a self-contained task.

| Chunk | File | Task | Est. Time |
|-------|------|------|-----------|
| 01 | `01-restaurant-test.md` | Generate Luigi's Pizza (restaurant) + screenshot all results | 3 min |
| 02 | `02-saas-test.md` | Generate TechFlow (SaaS) + screenshot | 2 min |
| 03 | `03-portfolio-test.md` | Generate Sarah Chen Photography (portfolio) + screenshot | 2 min |
| 04 | `04-ecommerce-test.md` | Generate UrbanThreads (ecommerce) + screenshot | 2 min |
| 05 | `05-local-service-test.md` | Generate BrightSmile Dental (local service) + screenshot | 2 min |
| 06 | `06-write-results.md` | Compile all results into a summary report | 2 min |

## Output Folder

All screenshots and the final report go in: `~/Desktop/presspilot-phase-a-results/`

## Rules

- If generation fails, screenshot the error and move to the next chunk
- Don't try to fix anything — just document what you see
- Each chunk is independent — no need to remember previous chunks
