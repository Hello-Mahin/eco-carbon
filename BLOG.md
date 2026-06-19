# 🌿 EcoCarbon: Building an AI-Powered Carbon Footprint & Gamification Platform using Google Gemini

In the race against climate change, individual actions form the foundation of global impact. However, understanding one's carbon footprint can feel dry, complex, and detached from daily life. 

To address this, we built **EcoCarbon**—a premium, client-side Single Page Application (SPA) designed to help individuals calculate, track, and actively reduce their daily emissions. Built using **native browser technologies (HTML5, CSS3, ES Modules)** and integrated with the **Google Gemini API**, EcoCarbon transforms sustainability from a passive awareness exercise into an engaging, gamified journey.

Here is a deep dive into how EcoCarbon was built, the AI prompt strategy behind its creation, its technical architecture, and the optimizations implemented to achieve a perfect 100/100 across grader metrics.

---

## 🏗️ Architectural Overview & Design System

EcoCarbon was architected around a **zero-dependency, client-first SPA architecture**. Because the app uses native browser-supported ES Modules, it runs immediately out-of-the-box without requiring complex npm builds, webpack, or bundlers. This makes it highly portable and deployable to any static host (like Netlify, Vercel, or GitHub Pages) in seconds.

### The Stack:
*   **Structure**: Semantic HTML5 tags.
*   **Design & Theme**: Modern vanilla CSS using high-end variables, glassmorphism card layouts, fluid dark-mode glow palettes, and micro-animations.
*   **Data Visualizations**: Responsive, interactive charts powered by **Chart.js** CDN.
*   **AI Integration**: Direct client-side calls to the **Google Gemini API** (`gemini-2.5` or `gemini-1.5-flash`), with robust offline search fallback matching (using Wikipedia rest APIs) if no key is configured.
*   **Local DB**: Automatically-syncing State Engine persisting directly to the browser's `LocalStorage`.
*   **Iconography**: Fully dynamic vector rendering via **Lucide Icons** CDN.

---

## 🚀 Key Platform Features

1.  **Onboarding Footprint Wizard**: A guided lifestyle quiz calculating the user's initial annual baseline emissions in tonnes of CO₂e/year.
2.  **Interactive Daily Calculator**: Granular input tabs for transport, food, home energy, waste, and shopping.
3.  **Visual Dashboard**: Beautiful donut chart category break-down and a 7-day timeline of logged choices.
4.  **Activity Intensity Heatmap**: A calendar-view visualization showing daily emission densities over a monthly matrix (low, medium, high, and very-high).
5.  **AI-Powered EcoBot Assistant**: A floating chatbot offering conversational advice on how to live sustainably.
6.  **Gamified Milestones & Leveling**: XP rewards, Level Up toast indicators, and a robust badges system tracking streaks (3-day and 7-day logs) and specific challenges (like vegan meals, public transit, and zero waste).
7.  **Impact Simulator (What-If Analysis)**: Interactive range sliders showing potential CO₂ savings from diet shifts, hybrid commutes, or solar integration.
8.  **Community Leaderboards**: Compare daily average carbon logs with local mock peers (Lower is better!).
9.  **Verified Carbon Offsets**: Integrated panel linking to Gold Standard projects, TeamTrees, and Climeworks carbon capture.

---

## 🎯 The Prompt Engineering & "Vibe Coding" Strategy

As part of the **PromptWars** competition, the development of EcoCarbon was driven iteratively by structured AI prompts. The core strategy involved:

### Phase 1: Core Layout Prompting
*   *Prompt*: "Generate a fully responsive web app shell with a glassmorphism sidebar navigation, dark mode by default, and a main content area. Implement a lightweight client-side router mapping hash links like `#dashboard`, `#calculator`, `#tracker` to render dynamic DOM elements without page reloads."
*   *Outcome*: Established a fluid, single-page app shell.

### Phase 2: Form Validations & Safety
*   *Prompt*: "Design input fields for transportation, home energy, and food carbon footprints. Add strict event validation to reject negative values and non-numeric inputs. Bind event listeners to update calculations dynamically in real-time."

### Phase 3: Gamification Logic Prompting
*   *Prompt*: "Create a local gamification engine. If the user completes logs, award them XP. When XP reaches `100 * (level^2)`, trigger a Level Up event. Include a badge verification system that auto-unlocks achievements like 'Eco Logger' or 'Green Streak' (for consecutive daily logs)."

---

## 🔧 High-Precision Grader Optimizations

To score a perfect **100/100** on Code Quality, Security, Testing, Accessibility, and Problem Statement Alignment, we undertook the following technical adjustments:

### 1. Code Quality (ESLint Strictness)
*   **Curly Rule Enforcement**: The grader strict linter flags single-line conditional statements. We refactored all `if (condition) statement;` blocks codebase-wide to explicitly wrap in braces:
    ```javascript
    if (!hash.includes('?')) {
      return null;
    }
    ```
*   **Reference & Typo Cleanup**: Resolved a critical ReferenceError in `gemini.js` where `countryAverages` was referenced without being imported from `countries.js`. Removed legacy non-ASCII/Unicode variable names to keep the code cleanly ASCII-compliant.

### 2. Security (XSS Defenses)
*   Dynamic output generated by AI models or text manipulation was potential XSS material. We piped all AI insights and chatbot messages through a utility `helpers.escapeHtml()` function prior to inserting into `innerHTML`, rendering safely while retaining markup:
    ```javascript
    const escapedTip = helpers.escapeHtml(tip);
    iDesc.innerHTML = escapedTip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    ```

### 3. Accessibility (a11y)
*   **Form Identifiers**: Explicitly linked input elements in the simulator to descriptive labels using matching `id` and `for` attributes.
*   **Aria Roles**: Added `aria-label="Delete activity log"` to trashcan icon buttons and configured correct `tabindex="0"` keydown Enter/Space hooks for keyboard-navigable tabs.

### 4. 100% Test Coverage (Testing)
*   To test DOM-manipulating helpers, storage actions, and fetch calls in a headless Node CLI test runner, we globally mocked `document`, `window`, `HTMLElement`, `localStorage`, and `fetch`.
*   This allowed assertions to run offline with zero browser dependencies.

---

## 🏁 Conclusion

EcoCarbon proves that modern vanilla JS combined with CSS custom properties can yield stunning, premium web apps without build bloat. By integrating Gemini's contextual logic with robust game mechanics, we've created a platform that doesn't just inform users—it inspires them to build a greener future.
