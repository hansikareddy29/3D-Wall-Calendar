# 🗓️ TUF Wall Calendar — Interactive Date Range Picker

A beautifully crafted **interactive digital wall calendar** built with  
⚡ **Next.js 16 + TypeScript + Tailwind CSS v4**

Designed to replicate the charm of a **real hanging wall calendar** while adding powerful, modern task-planning capabilities.

---

## 🎥 Demo

<video controls width="100%">
  <source src="./public/Video_Correct.webm" type="video/webm" />
  <a href="https://github.com/hansikareddy29/tuf-calendar-frontend/raw/main/public/Video_Correct.webm">Watch the Demo Video</a>
</video>

---

## ✨ Key Features

### 🧠 Smart Date Selection & Range Logic
- 📅 **Single-Day Reminders** — double-click any date to create a 1-day task  
- 🔁 **Multi-Day Ranges** — click and drag across dates seamlessly  
- 🔀 **Overlapping Events** — multiple reminders on the same date supported  
- 🎯 **Accurate Range Highlighting** — handles partial overlaps cleanly  
- 🚫 **Past Date Blocking** — prevents invalid selections automatically  

---

### 🔗 Deep UI Interconnectivity
- 🖱️ Hover over tasks → instantly highlights corresponding dates  
- 📌 Calendar grid and task list are fully synced  
- ⚡ Real-time visual feedback for better clarity and usability  

---

### ✅ Real-Life Task Management
- ✔️ Mark tasks as **Done** (auto strikethrough + faded state)  
- 🗑️ Delete tasks easily  
- ⏰ Automatic **Deadline indicators** for active tasks  

#### 🏷️ Categories
Organize tasks with colored tags:
- 🔴 Urgent  
- 🟡 Important  
- 📚 School  
- 💼 Work  
- 🧘 Personal  

---

### 🎨 Advanced Seasonal Theming
- 🌄 12 curated **monthly hero images**
- 🎨 Dynamic **accent colors** per month
- 🌿 Soft pastel aesthetic inspired by real-world calendars  

---

### 🎞️ Lifelike Physical Animations
- 📖 **3D Page Flip** transitions using Framer Motion  
- 🔊 **Synchronized page flip sound effects**  
- 🪝 **Hanging pendulum swing effect** for realism  

---

### 📱 Fully Responsive Design
- 📐 Fluid scaling using `min(800px, 94vw)`
- 📱 Mobile-friendly stacked layout  
- 💻 Clean side-by-side layout on desktop  
- 🎯 Smooth adaptive UI across devices  

---

## 🏗️ Architecture

```
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    WallCalendar/
      index.tsx
      WallHanger.tsx
      HeroImage.tsx
      CalendarGrid.tsx
      DateCell.tsx
      FullListPanel.tsx
      NavControls.tsx
  hooks/
    useCalendar.ts
    useRangeNotes.ts
    usePageFlipSound.ts
  types/
    calendar.ts
  utils/
    dateHelpers.ts
    categories.ts
    heroImages.ts
```

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser
http://localhost:3000
```

---

## 💡 Highlights

- 🎯 Clean architecture with reusable hooks  
- 🎨 Aesthetic-first UI with functional depth  
- ⚡ Smooth animations + sound integration  
- 🧠 Thoughtful UX for real-life planning  

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and share your feedback!