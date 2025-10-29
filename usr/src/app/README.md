# FIn-Box - Your Personal Finance Mentor

FIn-Box is a modern, AI-powered personal finance management application designed to help early-stage entrepreneurs in India gain financial clarity and make informed decisions. It combines essential financial tracking tools with personalized, AI-driven advice and insights.

![FIn-Box Dashboard](https://storage.googleapis.com/studio-assets/readme-dashboard.png)

## ✨ Key Features

- **Intuitive Dashboard**: Get a quick overview of your total income, expenses, and savings rate. The dashboard also provides a personalized "Fin Bite" suggestion to improve your financial habits.
- **Transaction Management**: Easily add transactions manually or import them from documents (PDF, CSV, etc.) using an AI-powered extraction tool.
- **Budget Tracking**: Create and manage monthly budgets for various spending categories. Progress bars provide a clear visual of your spending against your budget.
- **AI Financial Advisor**: A conversational chat interface where you can ask financial questions and receive personalized advice based on your transaction history.
- **Fin Bites & Investment Ideas**: Explore a curated library of startup ideas, get AI-powered analysis on them, and stay updated with the latest government schemes for entrepreneurs in India.
- **Secure Authentication**: User authentication is handled securely via Zoho Catalyst.

## 🚀 Tech Stack

This project is built with a modern, robust, and scalable tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Component Library**: [ShadCN/UI](httpss://ui.shadcn.com/)
- **Generative AI & Backend**: [Zoho Catalyst](https://www.zoho.com/catalyst/) (RAG API, Data Store, Authentication) & [Google AI (Gemini)](https://ai.google/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## 🛠️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/uplift-ai.git
    cd uplift-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and fill in your credentials.
    ```bash
    touch .env
    ```
    Now, open `.env` and add your project-specific keys.

    ```env
    # .env

    # Zoho Catalyst - Replace with your Zoho credentials
    ZOHO_PROJECT_ID="24392000000011167"
    ZOHO_CATALYST_ORG_ID="60056122667"
    ZOHO_STATIC_ACCESS_TOKEN="1000.8bd5d91923db0a9c1b4da8ac6a15a958.1b6aacd60da8774eff25b62fc5c92dec"

    # Google AI - Replace with your Gemini API Key
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```
    You can get your Zoho credentials from the Zoho API console. You can get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running at [http://localhost:9002](http://localhost:9002).

## 📄 Pages Overview

- **/login**: Secure sign-up and login page.
- **/** (Dashboard): The main landing page after login, providing a summary of your finances.
- **/transactions**: View a history of all your income and expenses. Add transactions manually or import them.
- **/budgets**: Create and monitor spending budgets for different categories.
- **/ai-advisor**: Chat with your AI mentor to get financial advice.
- **/fin-bites**: Discover investment ideas and learn about relevant startup schemes.

---

Let's **#BuildBharat** together with FIn-Box!
# fin-box-app
