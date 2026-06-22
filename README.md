# LeetLab 🚀

LeetLab is a modern, high-performance, and visually stunning coding platform inspired by LeetCode. It provides an end-to-end environment for developers to practice algorithmic problems, compete on global leaderboards, and discuss solutions in a community forum.

## ✨ Features

- **🔐 Secure Authentication & RBAC**: JWT-based authentication with role-based access control (Admin & User roles).
- **👨‍💻 Modern IDE Experience**: Integrated **Monaco Editor** with beautiful themes, syntax highlighting, and auto-completion for an authentic coding experience right in the browser.
- **🌍 Multi-Language Support**: Write and execute code in multiple languages (JavaScript, Python) powered by robust, sandboxed background workers.
- **🏆 Global Leaderboard**: Climb the ranks by solving problems. Earn points based on problem difficulty (Easy: 10, Medium: 30, Hard: 50).
- **💬 Solutions & Discussion Forum**: Share your approach! Post markdown-formatted solutions, embed code blocks, and upvote the smartest algorithms from the community.
- **🧑‍🎨 Comprehensive User Profiles**: Dashboard-style user profiles showcasing global rank, total points, problem-solving progress rings, and a timeline of recent accepted submissions. Edit your profile to add a bio and social links (GitHub, Website).
- **🛠️ Admin Panel**: A dedicated administrative dashboard to create, update, and manage the coding problems dynamically without touching the database directly.

## 🛠️ Technology Stack

**Frontend:**
- **React.js** (via Vite)
- **TailwindCSS** for a sleek, glassmorphic, and dynamic UI
- **React Router** for seamless SPA navigation
- **Lucide React** for beautiful iconography
- **Monaco Editor** for the browser-based IDE

**Backend:**
- **Node.js & Express.js**
- **PostgreSQL** as the primary relational database
- **Redis** for ultra-fast caching (Leaderboards, Profiles)
- **BullMQ** for reliable background job processing and code execution

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js, PostgreSQL, and Redis installed and running on your local machine.

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd leetlab
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   *Configure your `.env` file with your PostgreSQL credentials, Redis URL, and a `JWT_SECRET`.*
   Run the development server and worker:
   ```bash
   npm run dev
   # In a separate terminal inside backend/
   node src/services/worker.js
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`.

## 📜 Future Roadmap
*As new features are added to LeetLab, they will be documented here! Planned features include AI Assistants, User Streaks, and more.*
