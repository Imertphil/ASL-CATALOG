# ASL Landmark Catalog

A data catalog website for American Sign Language hand signs. Each entry stores the sign as a series of animation frames, where each frame contains 21 hand landmark coordinates captured by MediaPipe. You can search, filter, sort, and view skeleton animations for each sign.

Built with vanilla HTML, CSS, and JavaScript. No frameworks, no server, no API calls.

---

## What it does

Click any sign to open the detail panel and watch the hand skeleton animate. The animation uses the x, y, and z landmark coordinates to draw bones and joints on a canvas element. The z value controls dot size and line brightness to give a rough depth effect. There is a motion trail slider that shows where the hand was in previous frames.

The controls bar at the top lets you search by word or meaning, filter by category, and sort alphabetically or by frame count. All three work by filtering and sorting the same data array and re-rendering the card list.

You can also soft-delete any sign from the catalog. Deleted signs are tracked by ID in localStorage so the original data file never changes. The reset button in the nav clears the deletion list and brings everything back.

---

## Data structure

Each sign is a JavaScript object. Here is a simplified example:

```js
{
  id: "sign-001",
  word: "HELLO",
  meaning: "A greeting",
  category: "Common Words",
  numHands: 1,
  difficulty: "beginner",
  addedAt: "2026-04-01",
  keyframes: [
    {
      timestamp: 0.0,
      leftHand: null,
      rightHand: [
        { x: 0.51, y: 0.72, z: -0.04 },
        // ... 20 more landmarks
      ]
    },
    // ... more frames
  ]
}
```

All base data lives in `data/gestures.js` and gets imported into `scripts.js`. The landmark coordinates are normalized between 0 and 1 by MediaPipe, so they are independent of video resolution.

---

## File structure

```
project/
├── index.html
├── style.css
├── scripts.js
└── data/
    └── gestures.js
```

---

## How to run

Open `index.html` in a browser. No build step needed.

---

## Features

**Search** — filters by word and meaning fields using `String.includes`

**Filter by category** — narrows the list to one category using `Array.filter`

**Sort** — alphabetical ascending or descending using `localeCompare`, or by frame count

**Skeleton animation** — plays back hand landmarks frame by frame on a canvas element with depth shading and a motion trail option

**Soft delete and reset** — removes signs from the view without touching the source data, stored in localStorage

---

## Known limitations

The landmark data was pre-extracted and hardcoded. The site does not do any live hand detection or gesture recognition. Adding new signs through the browser is not supported in the current version.

---

## If I had more time

The most interesting extension would be real time gesture matching, where the site compares your webcam hand landmarks against the catalog and tells you which sign you are performing. Another direction would be letting users record and submit their own signs through the browser using the MediaPipe tasks-vision library.

---

## Tools used

MDN Web Docs, MediaPipe documentation, Stack Overflow, Google Fonts
