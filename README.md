# Digital Mental Health & Psychological Support System

## Project Overview

This project is a **web-based mental health support platform** designed for college students. It provides an AI-driven conversational companion, self-help resources, mood tracking, and access to professional counselling. The goal is to make mental health support more **accessible, confidential, and engaging** for students.

## Problem Statement

College students face increasing levels of **stress, anxiety, burnout, and loneliness**, especially during exam periods or personal challenges. Traditional counselling services are often limited, stigmatized, or hard to access. Students may hesitate to seek help due to fear or privacy concerns. There is a need for a **scalable, anonymous, and supportive system** to help students cope with common mental health issues and seek professional help when needed.

## Objectives

- **Provide immediate support:** Offer students a friendly AI chat companion that listens empathetically and suggests coping strategies.  
- **Increase accessibility:** Enable students to access mental-health guidance anytime, anywhere, without stigma.  
- **Promote self-care:** Encourage regular mood tracking and journaling to build self-awareness.  
- **Facilitate professional help:** Allow easy booking of confidential counselling sessions when serious issues are detected.  
- **Ensure privacy and security:** Protect user data and ensure any personal information is kept private and confidential.  

## Scope of the Project

- **Included (MVP):** Student registration and login; an AI chat interface for mental-health support; a curated self-help resource library; mood tracking and journaling features; confidential counsellor booking; and an admin dashboard with anonymized usage statistics.  
- **Excluded / Not Implemented Yet:** Audio or voice interaction; social peer-to-peer forums; advanced gamification or reward systems; multi-language support beyond initial implementation; integration with external medical systems. These may be added as future enhancements.

## Proposed Solution

We propose a **hybrid AI-human platform**. Students interact with an **AI chatbot** to discuss their feelings and stressors. The AI uses a controlled knowledge base (via Retrieval-Augmented Generation) to provide **evidence-based coping strategies** (like breathing exercises, study planning, or mindfulness tips) and to gently encourage healthy habits. Meanwhile, the system monitors risk signals (e.g., signs of severe distress) using predefined rules and asks additional questions. If needed, it suggests professional help. Students can also browse **educational resources** (articles, videos) on topics like stress and anxiety. If a student indicates significant issues, they can **book an appointment** with a human counsellor through the platform. An **admin dashboard** provides anonymized insights (e.g., most common issues, usage trends) to help the institution plan support initiatives. Overall, the solution combines the **scalability of AI** with the **safety of human oversight**.

## Functional Requirements

1. **User Authentication:** Students, counsellors, and admins must register and log in securely.  
2. **Chatbot Interaction:** The system shall allow students to send messages to the AI and receive context-aware responses.  
3. **Knowledge Base:** The system shall retrieve relevant coping strategies and information from a curated mental-health database.  
4. **Risk Detection:** The system shall analyze each message for risk level (low, moderate, high) and handle urgent cases differently.  
5. **Mood Tracking:** Students shall be able to record their mood (e.g., on a simple scale) and view their mood history graphically.  
6. **Journaling:** Students shall be able to write and save private journal entries.  
7. **Resource Library:** Students shall have access to categorized mental-health resources (articles, guides, exercises).  
8. **Counselling Booking:** Students shall browse available counsellors and book appointments.  
9. **Notifications:** The system shall notify students of upcoming appointments or relevant tips (optional feature).  
10. **Admin Analytics:** Admins shall view dashboards showing aggregate data: user count, common issues, mood trends, appointment stats, etc. All analytics must be anonymized.  

## Non-Functional Requirements

- **Security & Privacy:** All personal data and conversations must be encrypted and stored securely. The platform shall comply with privacy best practices (e.g., data minimization, confidentiality).  
- **Performance:** The chatbot should respond within a few seconds. The system should support multiple concurrent users (target at least 100 simultaneous users).  
- **Usability:** The UI shall be user-friendly, intuitive, and accessible (e.g., responsive design, clear fonts).  
- **Scalability:** The backend should be able to scale (via stateless APIs and a robust database) as the user base grows.  
- **Reliability:** The system shall have high uptime (target 99%) and handle API failures gracefully (e.g., if the AI API is down, show an error message).  
- **Legal/Ethical:** The system must not give medical advice or diagnoses. It shall include disclaimers and emergency contacts for crisis situations.

## User Roles

- **Student:** Can log in, chat with the AI, track mood, write journal entries, view resources, and book counselling. Each student has a private account.  
- **Counsellor:** A mental health professional who can set availability, view and manage appointments, and optionally view anonymized session notes or stats (not personal details).  
- **Admin:** The platform administrator who can manage users/counsellors, add/edit resources, and view system-wide analytics. Admins do NOT see private student conversations, only aggregated trends.

## System Features / Modules

- **Authentication Module:** Handles user signup, login, password management, and role-based access control.  
- **Chatbot Module:** Interfaces with the AI (LLM + RAG) to process student messages and generate replies. It includes intent and risk analysis subcomponents.  
- **Knowledge Base Module:** A database of categorized mental-health topics and coping strategies. Used by the chatbot to retrieve information.  
- **Mood & Journal Module:** Allows students to record mood entries and write diary entries, and view past records.  
- **Resource Library Module:** Displays categorized content (stress, anxiety, exam tips, meditation videos, etc.).  
- **Counselling Module:** Shows counsellor profiles and availability. Allows booking and scheduling of appointments.  
- **Admin Analytics Module:** Generates dashboards with charts (e.g., common issues, mood trends, user stats).

## System Workflow

1. **Student Registration & Login:** New users register with email and create a profile. Existing users log in securely.  
2. **AI Conversation:** On the student dashboard, the student opens the chat. They type a message (e.g., "I'm feeling very anxious about exams").  
3. **Message Processing:** The backend receives the message, checks for keywords or patterns, and determines the **risk level** (e.g., normal stress vs. high distress).  
4. **Knowledge Retrieval:** The system retrieves relevant topics (e.g., "exam stress", "breathing exercises") from the knowledge base.  
5. **AI Response:** The LLM generates a response using the retrieved information. For example, it might say, "I understand exams can be stressful. Have you tried taking deep breaths or making a study plan?"  
6. **Risk Handling:** If the risk is moderate/high, the chatbot gently suggests professional help and offers the option to book a counsellor. For urgent cases (e.g., suicidal thoughts), it provides crisis resources immediately.  
7. **Mood/Journal Logging:** The student can periodically log mood via a simple form and write journal entries. These entries are saved privately.  
8. **Booking Counselling:** If the student chooses, they view a list of available counsellors (date/time slots) and book an appointment. The counsellor and student receive confirmation.  
9. **Admin/Analytics:** The admin user can see, for example, a chart of how many students reported "exam stress" or a trend of average stress levels over weeks (all data is anonymous).  
10. **Feedback Loop:** Over time, the student’s mood trends and conversation history help the AI personalize responses and identify patterns (with privacy in mind).

## Technology Stack

- **Frontend:** React.js with Tailwind CSS for a responsive user interface.  
- **Backend:** Node.js with Express.js for REST APIs.  
- **Database:** PostgreSQL (with Prisma ORM) to store user data, conversations, mood entries, etc.  
- **AI & NLP:** An LLM API (e.g., OpenAI GPT or similar) for conversation generation; a vector database or retrieval service for the knowledge base (RAG approach).  
- **Authentication:** JWT (JSON Web Tokens) or an authentication service (e.g., Auth0) for secure login.  
- **Charts:** Recharts (React library) for displaying analytics graphs on the admin dashboard.  
- **Deployment:** Frontend hosted on Vercel or Netlify; backend on a cloud service (e.g., Heroku, Render, or AWS); database on a cloud provider (e.g., Heroku Postgres or AWS RDS).

## System Architecture

The system follows a **client-server architecture** with a separate AI service layer:

- The **React frontend** communicates with the **Node.js backend** via RESTful APIs.  
- The backend handles **authentication**, serves **static content**, processes chat messages, and queries the database.  
- The **AI Service** (a separate module or microservice) handles message analysis: it runs risk detection algorithms, retrieves relevant knowledge, calls the LLM API to get a response, and returns it to the backend.  
- **Data Flow Diagram:** 
  ```
  [Student] -> [React UI] -> [Backend API] -> [AI Service]
      ↖                                        ↙
       \              Database              /
        -------------------------------------
  ```
- The **Admin Dashboard** and **Counsellor Portal** are part of the React app, with backend endpoints providing aggregated data.

## Database Requirements

The database will include tables such as:

- **Users:** Stores user credentials and roles (student, counsellor, admin).  
- **Profiles:** (optional) stores additional user information (full name, contact).  
- **Conversations:** Each chat session or topic with a student.  
- **Messages:** Individual chat messages linked to a conversation (with fields: sender, content, timestamp).  
- **Risk Assessments:** Records of risk level per message.  
- **Mood_Entries:** Records of date, mood rating, stress level, and optional notes.  
- **Journal_Entries:** Records of personal journal posts by students.  
- **Counsellors:** Records of counsellor profiles (linked to a user) with specializations and availability.  
- **Appointments:** Booking details linking a student and a counsellor with date/time and status.  
- **Resources:** Predefined articles/videos with category labels.

Each table has appropriate primary keys (UUIDs) and foreign keys (e.g., `messages.conversation_id` → `conversations.id`, `appointments.student_id` → `users.id`). Timestamps (`created_at`, `updated_at`) track record history.

## API Requirements

The backend will expose REST API endpoints, for example:

- `POST /api/auth/register` – Register a new user (student or counsellor).  
- `POST /api/auth/login` – Authenticate and obtain a JWT.  
- `GET /api/users/me` – Get current user profile.  
- `POST /api/chat` – Send a message to the chatbot; returns AI response.  
- `GET /api/conversations` – List a student's past conversations.  
- `GET /api/conversations/:id/messages` – Retrieve messages in a conversation.  
- `POST /api/mood` – Submit a mood entry.  
- `GET /api/mood/history` – Get mood entries for the user.  
- `POST /api/journal` – Create a new journal entry.  
- `GET /api/journal/:id` – Get or update a journal entry.  
- `GET /api/resources` – List resource items by category.  
- `GET /api/counsellors` – List available counsellors.  
- `POST /api/appointments` – Book an appointment with a counsellor.  
- `GET /api/appointments` – List user's appointments.  
- `GET /api/admin/stats` – (Admin only) Get site-wide stats (user count, common topics, etc.).  

All endpoints require authentication; some are role-restricted (e.g., only admins can access certain endpoints).

## Hardware / Software Requirements

- **Development Machine:** Any modern PC or laptop (Windows, Mac, or Linux) with at least 8 GB RAM.  
- **Software:** Node.js (v16+), npm or yarn, and a modern web browser (Chrome, Firefox, etc.).  
- **Database:** PostgreSQL (v12+) installed locally or access to a hosted Postgres database.  
- **AI API:** Access to an LLM service (e.g., OpenAI API) with internet connection.  
- **Additional:** Git for version control, and optionally Docker if containerizing the app.  

No special hardware (GPU, etc.) is required, as the LLM processing is done via cloud API.

## Installation & Setup

1. **Clone the Repository:**  
   ```bash
   git clone https://github.com/your-org/mental-health-support.git
   cd mental-health-support
   ```
2. **Backend Setup:**  
   - Navigate to `server/` folder.  
   - Install dependencies: `npm install` (or `yarn`).  
   - Create a `.env` file with configuration (e.g., `DATABASE_URL`, `JWT_SECRET`, `AI_API_KEY`).  
   - Run database migrations or `prisma migrate dev` to set up tables.  
   - Start the server: `npm start` or `npm run dev`.  
3. **Frontend Setup:**  
   - In a new terminal, navigate to `client/`.  
   - Install dependencies: `npm install`.  
   - Create a `.env` file if needed (e.g., to set `REACT_APP_API_URL`).  
   - Start the development server: `npm start`.  
4. **Initialize Data (if any):**  
   - The app may include seed scripts to populate initial resources or an admin user. Run `npm run seed` if provided.  
5. **Access the App:**  
   - Open `http://localhost:3000` in your browser for the frontend.  
   - The backend runs on `http://localhost:5000` (or as configured).

## Project Structure

```
mental-health-support/
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # UI components (Chat, MoodForm, etc.)
│   │   ├── pages/      # Page components (Dashboard, Login, Resources, etc.)
│   │   └── ... 
│   └── package.json
├── server/             # Node.js backend
│   ├── src/
│   │   ├── controllers/ # API route handlers
│   │   ├── routes/      # Express route definitions
│   │   ├── models/      # Database models (Prisma schema)
│   │   ├── services/    # Business logic (AI service, risk analysis)
│   │   └── ...
│   ├── prisma/         # Prisma schema and migrations
│   └── package.json
├── docs/               # Documentation (design docs, ER diagrams, etc.)
├── .env.example        # Example environment variables
└── README.md           # This README file
```

- **`client/`** contains the React application with components for chat, user profile, mood tracking, etc.  
- **`server/`** contains the Express app with endpoints for auth, chat, and data.  
- **`prisma/schema.prisma`** defines the database schema used by PostgreSQL.  
- **`docs/`** holds any additional documentation or diagrams.  

## Testing

- **Unit Testing:** The backend can use a framework like Jest or Mocha/Chai to test controllers and services. The frontend can use Jest and React Testing Library for component tests.  
- **Integration Testing:** Test API endpoints using Postman or automated scripts. For example, verify that `/api/chat` returns appropriate responses and that `/api/appointments` correctly stores bookings.  
- **End-to-End Testing:** Tools like Cypress can simulate a student logging in, chatting, and booking a session.  
- **Manual Testing:** Users should test key flows: registering, chatting, logging mood, viewing resources, and booking counselling. Pay special attention to error handling (e.g., invalid login, AI service failures).  
- **Data Safety Testing:** Ensure that personal data is not exposed in logs. Verify that the admin dashboard only shows aggregated data.  

*(Testing code and scripts should be added as the project evolves.)*

## Limitations

- The **AI companion is not a licensed therapist**. It provides general support and resources but cannot replace professional diagnosis or treatment.  
- The chatbot's responses depend on the quality of its knowledge base and may occasionally be generic. Further tuning may be needed.  
- The system **does not handle medical emergencies** automatically. In high-risk cases, it only provides static crisis hotline information (no automatic call-out).  
- Multi-language support is not implemented in the MVP. Right now, the chatbot works in English only.  
- The platform assumes trust in the counsellors and administrators; no advanced identity verification is in place.  

## Future Enhancements

- **Multilingual Support:** Add more languages (e.g., Hindi, Marathi) so students can chat in their preferred language.  
- **Peer Support Communities:** Create anonymized forums or group chats where students can share experiences (moderated for safety).  
- **Gamification:** Introduce rewards or badges for consistent mood tracking or completing wellness activities.  
- **Voice/Speech Interface:** Allow voice conversation with the chatbot for accessibility (using speech-to-text).  
- **Mobile App:** Develop React Native mobile apps for Android/iOS with push notifications.  
- **Advanced Analytics:** Use machine learning to detect trends or risk factors across the user base (while preserving anonymity).  
- **Integration:** Connect with university systems for calendar syncing or identity management (if applicable).  

## Team / Contributors

This project was developed by a multidisciplinary team of students and faculty specializing in software engineering and psychology:

- **Project Lead:** Dr. Sandeep Kulkarni (Advisor / Project Sponsor)  
- **Team Members:** Atharv Tandale (Frontend Lead), Tanmay Yadav (Backend Lead), Manish Choudhary (AI Specialist), Harshit Hiremath (Database & Infrastructure).  
- *(These are example names; replace with the actual development team members.)*

## License

This project is released under the **MIT License**. See the [LICENSE](LICENSE) file for details.