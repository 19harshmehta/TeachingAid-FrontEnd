# 🌟 TeachingAid-FrontEnd 🚀

![Project Status](https://img.shields.io/badge/Status-Actively%20Developed-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Stars](https://img.shields.io/github/stars/19harshmehta/TeachingAid-FrontEnd?style=social)
![Repo Size](https://img.shields.io/github/repo-size/19harshmehta/TeachingAid-FrontEnd)

**Engage Your Audience, Instantly!** 🗣️✨

TeachingAid-FrontEnd is a dynamic and intuitive web application designed to revolutionize real-time interactivity. It empowers users (specifically educators, presenters, and event organizers) to effortlessly create engaging polls and collect instant feedback from their audience. Perfect for classrooms, presentations, workshops, and live events, this platform makes audience engagement simpler, faster, and more effective.

## 🎯 Table of Contents

-   [💡 Introduction](#-introduction)
-   [✨ Features](#-features)
-   [🛠️ Technologies Used](#%EF%B8%8F-technologies-used)
-   [🚀 Getting Started](#-getting-started)
    -   [ prerequisites](#-prerequisites)
    -   [ installation](#-installation)
    -   [ running-the-application](#-running-the-application)
-   [📊 Usage](#-usage)
-   [📂 Project Structure](#-project-structure)
-   [📞 Contact](#-contact)
-   [🙏 Acknowledgements](#-acknowledgements)

## 💡 Introduction

In today's fast-paced learning and interactive environments, real-time feedback and engagement are crucial. TeachingAid-FrontEnd addresses this need by providing a streamlined, user-friendly interface for creating and managing interactive polls. This repository hosts the entire client-side application, built to deliver a seamless experience for both poll creators and participants, ensuring that valuable insights are gathered instantly and effortlessly.

## ✨ Features

TeachingAid-FrontEnd comes packed with features designed for maximum engagement and ease of use:

*   **⚡ Instant Poll Creation:** Quickly design and launch polls on the fly with a simple, intuitive interface.
*   **🗣️ Real-time Results:** Watch answers update live as participants respond, providing immediate insights and fostering dynamic discussions.
*   **🔒 Secure Creator Login:** Dedicated and secure authentication for poll creators, ensuring only authorized individuals can manage polls.
*   **✅ Hassle-Free Participation:** No login required for poll respondents! Anyone can join and answer polls directly, making participation incredibly simple and accessible.
*   **📱 Responsive Design:** A beautiful and functional interface that adapts flawlessly to any device – desktops, tablets, and mobile phones.
*   **📈 Analytics & Data Visualization:** Clear visual representations of poll results to aid in quick understanding. 
*   **🗑️ Poll Management:** Creators can easily manage, activate, and deactivate their created polls.

## 🛠️ Technologies Used

This project leverages a robust and modern front-end stack to deliver a highly performant and scalable application:

*   **Framework/Library:** **React.js** (`react`, `react-dom`)
*   **Language:** **TypeScript** (`typescript`)
*   **Build Tool:** **Vite** (`vite`, `@vitejs/plugin-react-swc`)
*   **UI Components:** **Shadcn UI** (built on Radix UI and Tailwind CSS components) - Evidenced by numerous `@radix-ui` dependencies.
*   **Styling:** **Tailwind CSS** (`tailwindcss`, `tailwindcss-animate`, `postcss`, `autoprefixer`)
*   **State Management/Data Fetching:** **React Query (@tanstack/react-query)** (for server state management and data fetching)
*   **Routing:** **React Router DOM** (`react-router-dom`)
*   **Form Management:** **React Hook Form** (`react-hook-form`, `@hookform/resolvers`, `zod` for validation)
*   **Real-time Communication:** **Socket.IO Client** (`socket.io-client`) - Crucial for live poll updates.
*   **HTTP Client:** **Axios** (`axios`)
*   **Utility Libraries:**
    *   `clsx`, `tailwind-merge`: For conditionally applying Tailwind classes.
    *   `lucide-react`: For icons.
    *   `date-fns`, `react-day-picker`: For date handling and pickers.
    *   `recharts`: For charting and data visualization (likely for poll results).
    *   `sonner`: For toasts/notifications.
    *   `embla-carousel-react`: For carousels.
    *   `qrcode.react`: For generating QR codes (potentially for sharing poll links).
    *   `next-themes`: For theme management (e.g., dark/light mode).
    *   `@fingerprintjs/fingerprintjs`: For browser fingerprinting (could be used for unique poll participation tracking without login).
*   **Package Manager:** **npm** (based on `package-lock.json` and `bun.lockb` suggests potential `bun` usage, but `npm` is explicitly mentioned in scripts).

## 🚀 Getting Started

Follow these steps to get a local copy of TeachingAid-FrontEnd up and running on your machine for development and testing.

### Prerequisites

Make sure you have the following installed:

*   [Node.js](https://nodejs.org/en/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/) or [Bun](https://bun.sh/) (as `bun.lockb` is present)

### Installation

1.  **Clone the repository:**
    ```
    git clone https://github.com/19harshmehta/TeachingAid-FrontEnd.git
    ```
2.  **Navigate to the project directory:**
    ```
    cd TeachingAid-FrontEnd
    ```
3.  **Install dependencies:**
    ```
    npm install
    # or
    yarn install
    # or
    bun install
    ```

### Running the Application

To start the development server:

npm run dev
or
yarn dev

The application should now be accessible in your web browser at `http://localhost:5173` (Vite's default port, or another port as indicated by your development server).

## 📊 Usage

Once the application is running, here's how you can interact with it:

1.  **For Poll Creators:**
    *   Navigate to the designated login/registration page.
    *   Sign up for a new account or log in with existing credentials.
    *   Once logged in, you will access your creator dashboard where you can:
        *   Click "Create New Poll" to design your interactive question.
        *   Share the unique poll link or code (via QR code using `qrcode.react`).
        *   Monitor real-time results directly from your dashboard, potentially visualized with `recharts`.

2.  **For Poll Participants:**
    *   Simply visit the poll URL or scan the QR code provided by the creator (e.g., `http://localhost:5173/poll/YOUR_POLL_ID`).
    *   Select your answer from the given options.
    *   Submit your response – no login or registration required! (Fingerprinting using `@fingerprintjs/fingerprintjs`used internally to prevent duplicate votes from the same device).

## 📁 Project Structure

```txt
├── public/                # Static assets (e.g., index.html, favicon)
├── src/                   # All application source code
│   ├── components/        # Reusable UI components (likely from Shadcn UI or custom)
│   ├── assets/            # Images, fonts, etc.
│   ├── pages/             # Page-level components for routes
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Entry point of the application
├── .gitignore             # Git ignore rules
├── bun.lockb              # Bun lock file for dependencies
├── components.json        # Shadcn UI component config
├── eslint.config.js       # Linting configuration
├── index.html             # Main HTML file
├── package-lock.json      # Lock file for npm dependencies
├── package.json           # Project metadata and dependencies
├── postcss.config.js      # PostCSS config (used by Tailwind CSS)
├── README.md              # You are here!
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.app.json      # TypeScript config for app code
├── tsconfig.json          # Base TypeScript config
├── tsconfig.node.json     # TypeScript config for Node (Vite, etc.)
├── vercel.json            # Vercel deployment config
└── vite.config.ts         # Vite build configuration
```

## 📞 Contact

For any questions, feedback, or collaborations, feel free to reach out:

*   **Harsh Mehta** - mehtah631@gmail.com
*   **GitHub Profile:** [https://github.com/19harshmehta](https://github.com/19harshmehta)
*   **LinkedIn:** https://www.linkedin.com/in/harsh-mehta19/

## 🙏 Acknowledgements

*   Thanks to all open-source libraries and tools that made this project possible (e.g., **React, Vite, Tailwind CSS, Shadcn UI, React Query, Socket.IO**).
*   Special thanks to the online communities and resources that provide invaluable learning.
*   Thanks Prof Ankush For such an opportunity to work on such project 
