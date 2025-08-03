# AI-First CRM Redesign Plan

Transform your working tab-based mobile CRM into a truly AI-native, minimalist, high-impact experience.

---

## 1. Design Foundations

- **Palette**  
  - Background: White (`#FFFFFF`)  
  - Text: Charcoal (`#111111`)  
  - Accent: Electric Blue (`#0070F3`)  

- **Typography**  
  - Font: Inter (weights 400 / 600 / 800)  
  - Hierarchy (mobile sizes):  
    - H1: 28px  
    - H2: 22px  
    - H3: 18px  
    - Body: 16px  

- **Spacing**  
  - Base grid: 16px  
  - Vertical gutters: 24–32px  

- **Icons**  
  - Heroicons (2px stroke, outline style)  

- **Elevation**  
  - Subtle shadows (small depth) only on floating elements (FABs, hover cards)

---

## 2. Navigation & Shell

### A. Persistent Command Bar

- **Position:** Pinned above the tab bar (or as a small overlay on desktop).  
- **Placeholder:** "Type or speak a command…"  
- **Behaviors:**  
  - Tap `/` to focus from anywhere.  
  - Voice input icon on the right.

### B. Bottom Tab Bar → Contextual Tabs

- **Tabs:** Dashboard | Leads | Pipeline | Tasks | AI  
- **More Tab:** Slides up a modal with Insights, Calendar, Settings.

### C. Floating Action Button (FAB)

- **Contextual "+"** changes action based on active tab:  
  - New Lead  
  - New Task  
  - Run Playbook  

---

## 3. Key Screen Redesigns

| Screen            | Before                           | After (AI-First / Minimalist)                                                                                                                                      |
|-------------------|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Dashboard**     | Stat cards + funnel chart       | **AI Feed:** single scroll of Hot Leads, Intelligent Nudges, Upcoming Tasks. Swipe cards to complete or expand into actions.                                        |
| **Leads List**    | Plain list + filters            | **Smart List:** shows top-scored leads by default; filters open full-screen overlay.                                                                                |
| **Lead Detail**   | Tabbed Info / Activity / Notes  | **Chat Thread:** all history, AI summary at top ("Last contact summary"), inline action chips (Call, Email, Schedule).                                               |
| **Pipeline**      | Kanban swimlanes                | **Compact Kanban:** horizontal columns, cards with deal name, amount, AI win-probability. Smooth drag & drop.                                                        |
| **Tasks**         | List view + calendar toggle     | **Agenda Scroll:** mixed feed of today's tasks, upcoming tasks, AI-suggested tasks. Calendar icon drills down.                                                     |
| **AI Assistant**  | Separate chat tab               | **Integrated Chat:** pull-up bottom sheet ("Ask agent…"), never leaves current context.                                                                              |

---

## 4. AI-Native Overlays & Components

- **Hot Leads Carousel**  
  - Swipeable cards showing lead photo, score, next step.

- **Intelligent Nudge Banners**  
  - Inline sticky banners ("It's been 3 days since last follow-up—draft a message?").

- **Dynamic Action Bar**  
  - Button row above tab bar, context-aware (e.g., Call / Email / Note vs. Move Stage / Add Task).

- **Agent Playbook Launcher**  
  - FAB long-press opens mini-dashboard of active playbooks and status.

- **Global Command Palette**  
  - Full-screen overlay on `/` or "Ask" tap for natural-language search & actions.

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Week 1) - COMPLETED
- [x] Save redesign plan
- [x] Color palette overhaul (White/Charcoal/Electric Blue)
- [x] Typography system (Inter font, mobile hierarchy)
- [x] Spacing & grid system (16px base, 24-32px gutters)
- [x] Component library setup

### Phase 2: Navigation Shell (Week 1-2) - IN PROGRESS
- [x] Persistent command bar implementation
- [x] Contextual tab bar redesign (Dashboard | Leads | Pipeline | Tasks | AI)
- [x] Floating Action Button (FAB)
- [x] Global command palette integration
- [ ] Command bar keyboard shortcuts ('/') full testing
- [ ] More tab modal for additional features

### Phase 3: Core Screens (Week 2-3)
- [ ] Dashboard → AI Feed redesign
- [ ] Leads List → Smart List
- [ ] Lead Detail → Chat Thread
- [ ] 10% user rollout for testing

### Phase 4: Pipeline & Tasks (Week 3-4)
- [ ] Pipeline → Compact Kanban
- [ ] Tasks → Agenda Scroll
- [ ] User feedback integration

### Phase 5: AI Integration (Week 4-5)
- [ ] Hot Leads Carousel
- [ ] Intelligent Nudge Banners
- [ ] Dynamic Action Bar
- [ ] Agent Playbook Launcher
- [ ] Integrated Chat system

### Phase 6: Analytics & Optimization (Ongoing)
- [ ] Track CTA clicks, time-to-action, AI engagement
- [ ] Weekly iteration based on user behavior
- [ ] Complete rollout

---

## Success Metrics
- User engagement with AI suggestions
- Time-to-action improvements
- Lead conversion rate increases
- User satisfaction scores

---

> By embedding conversational flows, proactive AI cues, and contextual actions, your CRM will evolve from a "regular app" into a true AI-native experience.