# R'Courses — UCR Course Explorer

A React + Firebase web app for UCR students to browse courses and leave reviews.

## Features
- Browse all UCR undergraduate courses by department/major
- Search by course code, title, or description
- Sort by course code, title, easiest, or top-rated
- View difficulty ratings, professor ratings, workload, and recommend %
- Leave reviews with: difficulty, professor rating, workload, grade received, free text
- Real-time reviews stored in Firebase Firestore

---

## Setup (5 steps)

### 1. Install dependencies
```bash
cd ucr-courses
npm install
```

### 2. Set up Firebase
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `ucr-courses`
3. Click **Web** (</>) → register app → copy the `firebaseConfig`
4. In the left sidebar: **Build → Firestore Database → Create database**
   - Choose **Start in test mode** (allows reads/writes without auth)
   - Pick any region (us-west2 for California)
5. Open `src/firebase.js` and paste your config values

### 3. Load your real course data
```bash
# Make sure ucr_courses.xlsx is in this folder
python3 xlsx_to_js.py
```

Then in `src/App.jsx`, replace lines 13-14:
```js
// REMOVE:
import { SAMPLE_COURSES, DEPARTMENTS, getDepartmentCodes } from './data/courses.js'
const COURSES = SAMPLE_COURSES

// ADD:
import COURSES from './data/allCourses.json'
```

### 4. Run locally
```bash
npm run dev
```
Open http://localhost:5173

### 5. Deploy (optional)
```bash
npm run build
# Then drag the `dist/` folder to https://vercel.com or https://netlify.com
```

---

## Project Structure
```
src/
  App.jsx              Main app, routing, filtering, sorting
  firebase.js          Firebase config + Firestore helpers
  index.css            Global styles + CSS variables
  components/
    Navbar.jsx         Top nav with search
    DeptSidebar.jsx    Left sidebar: browse by department
    CourseCard.jsx     Course card with difficulty/rating preview
    CourseModal.jsx    Full course detail + review list
    ReviewForm.jsx     Review submission form
    StarRating.jsx     Star display + input components
  data/
    courses.js         Sample course data + department map
    allCourses.json    (generated) your real course data

xlsx_to_js.py         Converts ucr_courses.xlsx → allCourses.json
```

---

## Firestore Data Model
```
reviews/
  {auto-id}
    courseCode: "CS 010"
    difficulty: 3          (1-5)
    professorRating: 4     (1-5)
    workload: "Medium"     ("Light"|"Medium"|"Heavy")
    wouldRecommend: true
    gradeReceived: "A"
    professor: "Dr. Smith"
    text: "Great class..."
    createdAt: Timestamp

courseStats/
  {CS_010}               (courseCode with spaces → underscores)
    courseCode: "CS 010"
    reviewCount: 12
    totalDifficulty: 36
    totalProfRating: 44
    recommendCount: 10
```
