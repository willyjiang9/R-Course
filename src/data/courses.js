// src/data/courses.js
// ─────────────────────────────────────────────────────────────────
// HOW TO POPULATE THIS FILE:
//
// Run this one-time script after you have ucr_courses.xlsx:
//
//   pip3 install openpyxl
//   python3 xlsx_to_json.py
//
// That will generate courses.json which you import below.
// OR paste the output directly into the `courses` array.
//
// For now, sample data is included so the app runs immediately.
// ─────────────────────────────────────────────────────────────────

// Organized by department code → array of courses
// Each course: { code, number, fullCode, title, units, description, prerequisites, scheduleType }

export const DEPARTMENTS = {
  "CS":   "Computer Science",
  "MATH": "Mathematics",
  "BIOL": "Biology",
  "CHEM": "Chemistry",
  "PHYS": "Physics",
  "ENGL": "English",
  "HIST": "History",
  "PSYC": "Psychology",
  "ECON": "Economics",
  "SOC":  "Sociology",
  "ENGR": "Engineering",
  "BUS":  "Business Administration",
  "STAT": "Statistics",
  "PHIL": "Philosophy",
  "ANTH": "Anthropology",
  "ART":  "Art",
  "MUS":  "Music",
  "POLS": "Political Science",
  "SPAN": "Spanish",
  "NRSC": "Neuroscience",
}

// Sample courses — replace with real data from your xlsx
export const SAMPLE_COURSES = [
  { fullCode: "CS 010",  subject: "CS", number: "010",  title: "Introduction to Computer Science", units: 4, description: "Introduction to problem solving and program design using Python. Topics include variables, control structures, functions, and basic data structures.", prerequisites: "None", scheduleType: "Lecture" },
  { fullCode: "CS 012",  subject: "CS", number: "012",  title: "Introduction to Data Structures", units: 4, description: "Fundamental data structures and their applications. Arrays, linked lists, stacks, queues, trees, and graphs.", prerequisites: "CS 010", scheduleType: "Lecture" },
  { fullCode: "CS 014",  subject: "CS", number: "014",  title: "Data Structures and Algorithms", units: 4, description: "Algorithm analysis, sorting and searching, hash tables, trees, graphs, and dynamic programming.", prerequisites: "CS 012", scheduleType: "Lecture" },
  { fullCode: "CS 061",  subject: "CS", number: "061",  title: "Machine Organization and Assembly Language", units: 4, description: "Computer organization, assembly language programming, memory hierarchy, and I/O.", prerequisites: "CS 012", scheduleType: "Lecture" },
  { fullCode: "CS 100",  subject: "CS", number: "100",  title: "Software Construction", units: 4, description: "Software engineering principles, design patterns, testing, and version control in large-scale projects.", prerequisites: "CS 014", scheduleType: "Lecture" },
  { fullCode: "CS 110",  subject: "CS", number: "110",  title: "Algorithms", units: 4, description: "Algorithm design paradigms: divide and conquer, greedy, dynamic programming, network flow, and computational complexity.", prerequisites: "CS 014, MATH 009B", scheduleType: "Lecture" },
  { fullCode: "CS 120",  subject: "CS", number: "120",  title: "Programming Languages", units: 4, description: "Syntax, semantics, and implementation of programming languages. Functional, logic, and imperative paradigms.", prerequisites: "CS 014, CS 061", scheduleType: "Lecture" },
  { fullCode: "CS 141",  subject: "CS", number: "141",  title: "Intermediate Data Structures and Algorithms", units: 4, description: "Advanced data structures, algorithm analysis, and complexity theory.", prerequisites: "CS 014", scheduleType: "Lecture" },
  { fullCode: "CS 150",  subject: "CS", number: "150",  title: "Principles of Computer Operating Systems", units: 4, description: "Process management, memory management, file systems, I/O, and distributed systems.", prerequisites: "CS 061, CS 100", scheduleType: "Lecture" },
  { fullCode: "CS 160",  subject: "CS", number: "160",  title: "Concurrent Programming and Parallel Systems", units: 4, description: "Concurrency, parallelism, synchronization, deadlock, and parallel programming models.", prerequisites: "CS 150", scheduleType: "Lecture" },
  { fullCode: "CS 170",  subject: "CS", number: "170",  title: "Introduction to Artificial Intelligence", units: 4, description: "Search, knowledge representation, machine learning, and neural networks.", prerequisites: "CS 014, MATH 009B", scheduleType: "Lecture" },
  { fullCode: "CS 171",  subject: "CS", number: "171",  title: "Introduction to Machine Learning", units: 4, description: "Supervised and unsupervised learning, regression, classification, neural networks, and deep learning fundamentals.", prerequisites: "CS 014, STAT 100A", scheduleType: "Lecture" },
  { fullCode: "CS 180",  subject: "CS", number: "180",  title: "Introduction to Computer Networks", units: 4, description: "Network architecture, protocols, TCP/IP, routing, and security.", prerequisites: "CS 150", scheduleType: "Lecture" },

  { fullCode: "MATH 009A", subject: "MATH", number: "009A", title: "First-Year Calculus", units: 4, description: "Limits, derivatives, and their applications. Introduction to integration.", prerequisites: "High school precalculus", scheduleType: "Lecture" },
  { fullCode: "MATH 009B", subject: "MATH", number: "009B", title: "First-Year Calculus", units: 4, description: "Techniques of integration, applications, infinite series, and differential equations.", prerequisites: "MATH 009A", scheduleType: "Lecture" },
  { fullCode: "MATH 009C", subject: "MATH", number: "009C", title: "First-Year Calculus", units: 4, description: "Multivariable calculus: vectors, partial derivatives, multiple integrals, and vector calculus.", prerequisites: "MATH 009B", scheduleType: "Lecture" },
  { fullCode: "MATH 010A", subject: "MATH", number: "010A", title: "Calculus of Several Variables", units: 4, description: "Differential calculus of functions of several variables.", prerequisites: "MATH 009C", scheduleType: "Lecture" },
  { fullCode: "MATH 046",  subject: "MATH", number: "046",  title: "Ordinary Differential Equations", units: 4, description: "First and second order ODEs, systems of equations, Laplace transforms, and applications.", prerequisites: "MATH 009C", scheduleType: "Lecture" },
  { fullCode: "MATH 131",  subject: "MATH", number: "131",  title: "Linear Algebra", units: 4, description: "Systems of linear equations, matrix algebra, determinants, vector spaces, eigenvalues.", prerequisites: "MATH 009B", scheduleType: "Lecture" },

  { fullCode: "PHYS 040A", subject: "PHYS", number: "040A", title: "General Physics", units: 4, description: "Mechanics: kinematics, Newton's laws, energy, momentum, rotational motion.", prerequisites: "MATH 009A", scheduleType: "Lecture" },
  { fullCode: "PHYS 040B", subject: "PHYS", number: "040B", title: "General Physics", units: 4, description: "Thermodynamics, waves, optics, and modern physics.", prerequisites: "PHYS 040A", scheduleType: "Lecture" },
  { fullCode: "PHYS 040C", subject: "PHYS", number: "040C", title: "General Physics", units: 4, description: "Electricity and magnetism, Maxwell's equations, and electromagnetic waves.", prerequisites: "PHYS 040B", scheduleType: "Lecture" },

  { fullCode: "BIOL 005A", subject: "BIOL", number: "005A", title: "Introduction to Cell Biology", units: 4, description: "Cell structure and function, genetics, molecular biology, and metabolism.", prerequisites: "None", scheduleType: "Lecture" },
  { fullCode: "BIOL 005B", subject: "BIOL", number: "005B", title: "Introduction to Organismal Biology", units: 4, description: "Evolution, ecology, and diversity of life.", prerequisites: "BIOL 005A", scheduleType: "Lecture" },
  { fullCode: "BIOL 102",  subject: "BIOL", number: "102",  title: "Genetics", units: 4, description: "Mendelian and molecular genetics, gene expression, and genomics.", prerequisites: "BIOL 005A, CHEM 001A", scheduleType: "Lecture" },

  { fullCode: "CHEM 001A", subject: "CHEM", number: "001A", title: "General Chemistry", units: 4, description: "Stoichiometry, atomic structure, chemical bonding, thermochemistry, and gases.", prerequisites: "High school chemistry", scheduleType: "Lecture" },
  { fullCode: "CHEM 001B", subject: "CHEM", number: "001B", title: "General Chemistry", units: 4, description: "Solutions, kinetics, equilibrium, acids and bases, electrochemistry.", prerequisites: "CHEM 001A", scheduleType: "Lecture" },
  { fullCode: "CHEM 112A", subject: "CHEM", number: "112A", title: "Organic Chemistry", units: 4, description: "Structure, bonding, reactions of organic compounds. Alkanes, alkenes, alkynes, and aromatics.", prerequisites: "CHEM 001B", scheduleType: "Lecture" },

  { fullCode: "PSYC 001",  subject: "PSYC", number: "001",  title: "Introduction to Psychology", units: 4, description: "Survey of major topics in psychology: perception, cognition, emotion, development, and social behavior.", prerequisites: "None", scheduleType: "Lecture" },
  { fullCode: "PSYC 102",  subject: "PSYC", number: "102",  title: "Research Methods in Psychology", units: 4, description: "Experimental design, data collection, statistical analysis, and scientific writing.", prerequisites: "PSYC 001, STAT 100A", scheduleType: "Lecture" },

  { fullCode: "ECON 002",  subject: "ECON", number: "002",  title: "Introduction to Macroeconomics", units: 4, description: "National income, unemployment, inflation, monetary and fiscal policy.", prerequisites: "None", scheduleType: "Lecture" },
  { fullCode: "ECON 003",  subject: "ECON", number: "003",  title: "Introduction to Microeconomics", units: 4, description: "Supply, demand, market equilibrium, consumer theory, and firm behavior.", prerequisites: "None", scheduleType: "Lecture" },
  { fullCode: "ECON 100A", subject: "ECON", number: "100A", title: "Intermediate Microeconomics", units: 4, description: "Consumer theory, production, market structure, and welfare economics.", prerequisites: "ECON 003, MATH 009B", scheduleType: "Lecture" },

  { fullCode: "ENGL 001A", subject: "ENGL", number: "001A", title: "First-Year Composition", units: 4, description: "Academic writing, argumentation, research skills, and rhetorical analysis.", prerequisites: "None", scheduleType: "Lecture" },
  { fullCode: "ENGL 001B", subject: "ENGL", number: "001B", title: "First-Year Composition and Literature", units: 4, description: "Critical reading of literary texts combined with analytical and argumentative writing.", prerequisites: "ENGL 001A", scheduleType: "Lecture" },

  { fullCode: "STAT 100A", subject: "STAT", number: "100A", title: "Introduction to Statistics", units: 4, description: "Descriptive statistics, probability, random variables, distributions, and statistical inference.", prerequisites: "MATH 009A", scheduleType: "Lecture" },
  { fullCode: "STAT 100B", subject: "STAT", number: "100B", title: "Introduction to Statistics", units: 4, description: "Regression, ANOVA, chi-square tests, and nonparametric methods.", prerequisites: "STAT 100A", scheduleType: "Lecture" },

  { fullCode: "HIST 010",  subject: "HIST", number: "010",  title: "World History to 1500", units: 4, description: "Survey of world civilizations from prehistoric times through the 15th century.", prerequisites: "None", scheduleType: "Lecture" },
  { fullCode: "POLS 020",  subject: "POLS", number: "020",  title: "Introduction to American Government", units: 4, description: "The U.S. Constitution, branches of government, political parties, and elections.", prerequisites: "None", scheduleType: "Lecture" },
  { fullCode: "PHIL 001",  subject: "PHIL", number: "001",  title: "Introduction to Philosophy", units: 4, description: "Major philosophical questions and methods. Knowledge, reality, ethics, and mind.", prerequisites: "None", scheduleType: "Lecture" },
  { fullCode: "SOC 001",   subject: "SOC",  number: "001",  title: "Introduction to Sociology", units: 4, description: "Social structure, culture, inequality, race, class, gender, and social change.", prerequisites: "None", scheduleType: "Lecture" },
]

// Group courses by subject
export function getCoursesByDepartment(courses) {
  const map = {}
  for (const c of courses) {
    if (!map[c.subject]) map[c.subject] = []
    map[c.subject].push(c)
  }
  return map
}

// Get unique department codes from course list
export function getDepartmentCodes(courses) {
  return [...new Set(courses.map(c => c.subject))].sort()
}
