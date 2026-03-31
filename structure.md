# UCR Course Explorer — File Structure

src/
  App.jsx               - Router, global state
  main.jsx              - Entry point
  firebase.js           - Firebase config + Firestore helpers
  
  components/
    Navbar.jsx           - Top nav with search + major filter
    MajorSidebar.jsx     - Left sidebar: browse by major/department
    CourseGrid.jsx       - Grid of CourseCards
    CourseCard.jsx       - Card: code, title, avg difficulty, rating
    CourseModal.jsx      - Full detail view + reviews
    ReviewForm.jsx       - Submit a review
    ReviewList.jsx       - List of existing reviews
    StarRating.jsx       - Reusable star input/display
    DifficultyBadge.jsx  - Color-coded difficulty chip
    WorkloadBadge.jsx    - Light/Medium/Heavy chip

  data/
    courses.js           - Static course data imported from xlsx

index.html
package.json
vite.config.js
