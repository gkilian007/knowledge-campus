# Knowledge Campus Scene Briefs

## MVP scenes in scope
1. `agents-wing-hall`
2. `agents-wing-room-01` — Use Cases
3. `agents-wing-room-02` — Agents
4. `agents-wing-room-03` — Builder

All scenes assume 48x48 tile authoring.

---

## 1. Hall / Entry

### Goal
Make the product promise legible in under 10 seconds and route the player into the first active wing.

### Visual feeling
- clean modern entry
- semi-exterior threshold or lobby edge
- campus signage
- one clear path forward

### Must-have zones
- **arrival zone** — where the player starts
- **campus sign zone** — visible title / welcome
- **wing entry corridor** — clear path deeper into the experience
- **intro hotspot zone** — main explanation point

### Main hotspot
- object id: `hall-intro-hotspot`
- purpose: explain what Knowledge Campus is and what the user gets here

### Suggested composition
- lower part: arrival tiles / threshold
- middle part: open floor with campus sign or reception feeling
- right or upper side: door/corridor to next room
- one kiosk / sign / board near the central path

### Collision guidance
- block outer perimeter
- keep central path wide and obvious
- avoid maze feeling

### Transition objects
- `to-use-cases-room`
- optional `back-to-entry`

---

## 2. Room 01 — Use Cases

### Goal
Show the 3 launch outcomes before teaching abstract concepts.

### Visual feeling
- practical demo lab
- three stations or desks
- each station represents one use case path

### 3 use case stations
1. **Content & communication**
2. **Research & synthesis**
3. **Personal ops automation**

### Must-have zones
- **room entry zone**
- **main station cluster**
- **main explanation hotspot**
- **forward exit to Agents room**

### Main hotspot
- object id: `use-cases-main-hotspot`
- purpose: explain the 3 launch routes and help the player pick one mentally

### Optional secondary hotspots
- `use-cases-content-example`
- `use-cases-research-example`
- `use-cases-ops-example`

### Suggested composition
- room center: 3 desk/station layout
- each desk slightly distinct visually
- wall board or poster reinforcing “choose your path”
- visible exit to next room

### Collision guidance
- keep stations readable but not cramped
- allow the player to circulate around the center cluster

### Transition objects
- `to-agents-room`
- `back-to-hall`

---

## 3. Room 02 — Agents

### Goal
Teach the practical distinction between chatbot, workflow, and agent.

### Visual feeling
- more technical, but still approachable
- workstations / terminals / boards
- focused “understand the machine” vibe

### Must-have zones
- **entry zone**
- **comparison zone** — chatbot vs workflow vs agent
- **terminal/workstation zone**
- **main hotspot zone**
- **forward exit to Builder room**

### Main hotspot
- object id: `agents-main-hotspot`
- purpose: explain the mental model and what should be delegated to an agent

### Optional secondary hotspots
- `agents-tool-use-example`
- `agents-memory-example`

### Suggested composition
- one wall board or poster area for comparison
- one desk cluster with screens/terminals
- slightly more focused/compact than Use Cases room
- exit clearly visible

### Collision guidance
- terminals and furniture can create tighter lanes than the hall
- do not make navigation annoying; this is still onboarding, not a puzzle

### Transition objects
- `to-builder-room`
- `back-to-use-cases-room`

---

## 4. Room 03 — Builder

### Goal
Make the user feel they reached the practical outcome room.

### Visual feeling
- culminating workshop / studio station
- focused build desk or kiosk
- slightly more special than the previous rooms

### Must-have zones
- **entry zone**
- **main build station**
- **main builder hotspot**
- **optional decorative UI accents**

### Main hotspot
- object id: `builder-main-hotspot`
- purpose: connect the room to the builder flow and practical output generation

### Optional secondary hotspots
- `builder-prompt-template-example`
- `builder-workflow-template-example`

### Suggested composition
- one strong focal station in the room
- cleaner layout than the Agents room
- use subtle UI/main-screen accents to signal “this is where the result happens”

### Collision guidance
- keep the focal station easy to approach
- avoid overfilling this room with props

### Transition objects
- `back-to-agents-room`

---

## Shared scene rules

### Required object layers
- `hotspots`
- `transitions`
- `collision` (if using object geometry in addition to tile collision)

### Required hotspot naming discipline
Respect these ids exactly:
- `hall-intro-hotspot`
- `use-cases-main-hotspot`
- `agents-main-hotspot`
- `builder-main-hotspot`

### Design rule
Each room should answer one practical question:
- Hall: what is this place and where do I go?
- Use Cases: which real-world path fits me?
- Agents: what is an agent and what should I delegate?
- Builder: how do I leave with something useful?
