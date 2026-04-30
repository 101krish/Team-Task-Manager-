# Visual Guide - Role-Based Progress Tracking

## 1. Task Board Progress Banner

### Before (No Progress Stats)
```
[Kanban Board]
[To Do] [In Progress] [Completed]
  (empty)    (empty)      (empty)
```

### After (With Progress Stats)
```
┌─────────────────────────────────────────────────┐
│ Total Tasks: 10  │ Completed: 6 │ In Progress: 2 │ To Do: 2  │ Progress: 60% │
└─────────────────────────────────────────────────┘

[To Do] (2)        [In Progress] (2)      [Completed] (6)
   [Task]             [Task]                  [Task]
   [Task]             [Task]                  [Task]
  [+ Add]           [+ Add]                 [+ Add]
                                            [Task]
                                            [Task]
                                            [Task]
                                            [Task]
```

---

## 2. Task Card Highlighting

### Task Assigned to Current User
```
┌──────────────────────────────────┐
│ ACTIVE │ 🏷️ Assigned to you      │  ← New badge
│                                  │
│ Implement Login Feature          │
│ Create authentication endpoints  │
│                                  │
│ 📅 May 15, 2026    [JD] (indigo)│  ← Indigo avatar
│                                  │
│ [In Progress] [Done] [Delete]    │
└──────────────────────────────────┘
   ↑ Background: indigo-50
   ↑ Border: indigo-200 (vs gray)
```

### Task Assigned to Other User
```
┌──────────────────────────────────┐
│ ACTIVE                           │
│                                  │
│ Design Database Schema           │
│ Plan table structures            │
│                                  │
│ 📅 May 10, 2026    [SM] (gray)   │
│                                  │
│ [In Progress] [Done] [Delete]    │
└──────────────────────────────────┘
   ↑ Background: white
   ↑ Border: gray-200 (normal)
```

---

## 3. Task Creation Modal - Role-Based

### Admin View (Can Assign to Others)
```
┌────────────────────────────────────┐
│ ✕         Add Task                 │
├────────────────────────────────────┤
│ Title                              │
│ [________________________]          │
│                                    │
│ Description                        │
│ [_______________________]          │
│                                    │
│ Status          │ Assign To       │  ← Both visible
│ [todo]          │ [Assign to me ▼]│
│                 │ [Sarah (SM)]    │
│                 │ [John (JD)]     │
│                 │ [Mike (MK)]     │
│                                    │
│ Due Date                           │
│ [date picker]                      │
│                                    │
│        [Cancel]        [Add Task]  │
└────────────────────────────────────┘
```

### Member View (Cannot Assign to Others)
```
┌────────────────────────────────────┐
│ ✕         Add Task                 │
├────────────────────────────────────┤
│ Title                              │
│ [________________________]          │
│                                    │
│ Description                        │
│ [_______________________]          │
│                                    │
│ Status                             │  ← Only Status shown
│ [todo]                             │     (Auto-assign to self)
│                                    │
│ Due Date                           │
│ [date picker]                      │
│                                    │
│        [Cancel]        [Add Task]  │
└────────────────────────────────────┘
```

---

## 4. Dashboard - Role-Based View

### Admin Dashboard
```
┌────────────────────────────────────────────────────┐
│ Team Overview - Welcome back, Admin Sarah!         │
│                                                    │
│ ┌──────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│ │ 47   │ │ 18     │ │ 29     │ │ 3  ⚠️  │        │
│ │Total │ │Pending │ │Done    │ │Overdue │        │
│ │Tasks │ │        │ │        │ │        │        │
│ └──────┘ └────────┘ └────────┘ └────────┘        │
│                                                    │
│ Project Completion              Recent Activity   │
│ ┌─────────────────┐  ┌──────────────────────────┐ │
│ │ Team Platform   │  │ Sarah created Signup    │ │
│ │ 75% (15/20) ▓   │  │ John updated Dashboard  │ │
│ │                 │  │ Mike marked API done    │ │
│ │ Backend API     │  │ Sarah added UI review   │ │
│ │ 60% (6/10) ▓    │  │ John started Database  │ │
│ │                 │  │                        │ │
│ │ Mobile App      │  │ All team tasks shown    │
│ │ 40% (4/10) ▓    │  └──────────────────────────┘ │
│ └─────────────────┘                               │
└────────────────────────────────────────────────────┘
```

### Member Dashboard
```
┌────────────────────────────────────────────────────┐
│ Team Overview - Welcome back, John!                │
│                                                    │
│ ┌──────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│ │ 12   │ │ 5      │ │ 7      │ │ 1  ⚠️  │        │
│ │My     │ │Pending │ │Done    │ │Overdue │        │
│ │Tasks  │ │        │ │        │ │        │        │
│ └──────┘ └────────┘ └────────┘ └────────┘        │
│                                                    │
│ Project Completion              Recent Activity   │
│ ┌─────────────────┐  ┌──────────────────────────┐ │
│ │ Team Platform   │  │ You completed Login     │ │
│ │ 75% (15/20) ▓   │  │ You updated Dashboard   │ │
│ │                 │  │ Admin assigned API work │ │
│ │ Backend API     │  │ You started Testing     │ │
│ │ 60% (6/10) ▓    │  │                        │ │
│ │                 │  │ Your task activity      │ │
│ │ Mobile App      │  └──────────────────────────┘ │
│ │ 40% (4/10) ▓    │                               │
│ └─────────────────┘                               │
└────────────────────────────────────────────────────┘
```

---

## 5. Project Card - Enhanced Display

### Before
```
┌─────────────────────┐
│ ACTIVE              │
│                     │
│ Website Redesign    │
│ Redesign and        │
│ upgrade the main    │
│                     │
│ 👤 👥 👥 👤        │
│ Progress            │
│ ▓▓▓▓░░░░░░  60%    │
└─────────────────────┘
```

### After
```
┌─────────────────────┐
│ ACTIVE              │
│                     │
│ Website Redesign    │
│ Redesign and        │
│ upgrade the main    │
│                     │
│ 👤 👥 👥 👤        │
│ Progress            │
│ ▓▓▓▓░░░░░░  60%    │
│ 6/10 tasks complete │  ← New line
└─────────────────────┘
```

---

## 6. Progress Tracking - Real-Time Updates

### Scenario: Moving task to Done

```
BEFORE UPDATE:
┌──────────────────────────────┐
│ Total: 10 │ Done: 5 │ Progress: 50% │
└──────────────────────────────┘

USER ACTION: Click "Done" button on task

API CALL: PUT /api/tasks/:id { status: "done" }

RESPONSE:
{
  "progress": {
    "totalTasks": 10,
    "completedTasks": 6,    ← Incremented
    "inProgressTasks": 2,
    "todoTasks": 2,
    "percentage": 60        ← Updated
  }
}

AFTER UPDATE:
┌──────────────────────────────┐
│ Total: 10 │ Done: 6 │ Progress: 60% │
└──────────────────────────────┘
   ✨ Progress bar animates    ✨
   ✨ Numbers update           ✨
```

---

## 7. Access Control - Visual Comparison

### Admin Features
```
✅ See all projects        ✅ See all tasks
✅ Assign to anyone        ✅ Reassign tasks
✅ Delete tasks            ✅ View all progress
✅ Admin dropdown visible  ✅ Full permissions

┌─────────────────────────────┐
│ ✓ Admin View                │
│ ┌─────────────────────────┐ │
│ │ Project 1 (all tasks)   │ │
│ │ Project 2 (all tasks)   │ │
│ │ Project 3 (all tasks)   │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Member Features
```
✅ See own projects        ✅ See own tasks
❌ Assign to others        ❌ Reassign tasks
❌ Delete tasks            ✅ View own progress
❌ Admin dropdown hidden   ❌ Limited permissions

┌─────────────────────────────┐
│ ✓ Member View               │
│ ┌─────────────────────────┐ │
│ │ Project 1 (own tasks)   │ │
│ │ Project 3 (own tasks)   │ │
│ │ (Project 2 not visible) │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

## 8. Color Coding System

### Task Status Colors
```
📋 To Do              : Blue (primary)
🔄 In Progress        : Blue (primary)
✅ Done               : Green (#22c55e)
⚠️  Overdue           : Red (#ef4444)
```

### Role-Based Highlights
```
👤 Assigned to Me     : Indigo (#4f46e5)
   - Background      : indigo-50
   - Border          : indigo-200
   - Avatar          : indigo-100 bg, indigo-700 text
   - Badge           : indigo background

👥 Assigned to Other  : Gray (neutral)
   - Background      : white
   - Border          : slate-200
   - Avatar          : primary-fixed background
```

### Progress Indicators
```
Percentage Display:
- 0-25%   : Light/empty (gray bar)
- 25-50%  : Moderate (blue bar)
- 50-75%  : Good (blue bar)
- 75-100% : Excellent (blue bar)

Text Colors:
- Percentage    : Primary (indigo)
- Task count    : On-surface (dark)
- Completed     : Green
- In Progress   : Blue
- To Do         : Gray
```

---

## 9. Responsive Layout - Task Board

### Desktop (3 Columns)
```
┌─────────────────────────────────────────────┐
│ To Do (2)    │ In Progress (2) │ Done (6)   │
├─────────────┼─────────────────┼────────────┤
│ [Task 1]    │ [Task 5]         │ [Task 7]   │
│ [Task 2]    │ [Task 6]         │ [Task 8]   │
│ [+ Add]     │ [+ Add]          │ [Task 9]   │
│             │                 │ [Task 10]  │
│             │                 │ [Task 11]  │
│             │                 │ [Task 12]  │
│             │                 │ [+ Add]    │
└─────────────┴─────────────────┴────────────┘
```

### Tablet (Stacked)
```
┌──────────────────────┐
│ To Do (2)            │
├──────────────────────┤
│ [Task 1]             │
│ [Task 2]             │
│ [+ Add]              │
└──────────────────────┘

┌──────────────────────┐
│ In Progress (2)      │
├──────────────────────┤
│ [Task 5]             │
│ [Task 6]             │
│ [+ Add]              │
└──────────────────────┘

┌──────────────────────┐
│ Done (6)             │
├──────────────────────┤
│ [Task 7]             │
│ [Task 8]             │
│ [Task 9]             │
│ [Task 10]            │
│ [Task 11]            │
│ [Task 12]            │
│ [+ Add]              │
└──────────────────────┘
```

---

## 10. Animation & Transitions

### Progress Bar Animation
```
When task status changes:
1. Progress percentage updates
2. Bar width animates smoothly (200ms)
3. Number counter updates
4. Category counts update
```

### Task Card Highlight
```
When task loads for current user:
1. Card background fades to indigo-50
2. Border color transitions to indigo-200
3. Avatar badge colors update
4. Badge text appears (fade-in)
```

### Modal Transitions
```
When "Add Task" modal opens:
1. Background dims with overlay
2. Modal slides in from center
3. Form fields ready to focus
4. Buttons accessible and interactive
```

---

## Summary of Visual Changes

| Component | Change | Visual Difference |
|-----------|--------|-------------------|
| TaskCard | Highlighting | Indigo background for personal tasks |
| TaskBoard | Progress Banner | New stats row above columns |
| TaskBoard | Dropdown | Hidden for members (admin only) |
| TaskCard | Badge | "Assigned to you" label appears |
| ProjectCard | Count Display | Shows "6/10 tasks completed" |
| Dashboard | Stats | Shows completed/total format |
| Dashboard | Greeting | Personalized with user name |
| Progress Bar | Animation | Smooth transitions on updates |

---

**All visual changes maintain:**
- ✅ Design system consistency
- ✅ Accessibility standards
- ✅ Mobile responsiveness
- ✅ Performance optimization
- ✅ Readability and contrast
