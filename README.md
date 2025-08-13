# MZR Survey — AI-Enhanced Survey Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

An open-source survey platform designed to gather insights on technology access, healthcare, and youth-related challenges in Pakistan. It features a multi-lingual, mobile-first interface and leverages multiple AI providers (Azure OpenAI, Gemini, DeepSeek) for response enhancement, sentiment analysis, and generating actionable insights. The platform includes a secure admin dashboard for managing surveys, viewing analytics, and exporting data in various formats, including AI-generated PDF reports.

## ✨ Features

- **📱 Mobile-First Design:** Fully responsive, multi-step survey wizard optimized for all devices.
- **🌐 Multi-Lingual Support:** Supports English, Urdu, and Roman Urdu for broader accessibility.
- **🤖 AI-Powered Enhancements:**
  - **Answer Refinement:** Users can optionally improve their answers for clarity, tone, and conciseness.
  - **AI Assistant:** An integrated chatbot to help users understand questions.
  - **Insight Generation:** AI-driven analysis of responses to identify trends, sentiment, and key themes.
  - **Automated Reporting:** Generate comprehensive PDF and Markdown reports with AI-powered summaries.
- **🛡️ Multi-Provider AI Backend:** Dynamically switches between Azure OpenAI, Google Gemini, and DeepSeek for reliability and cost-effectiveness.
- **🔒 Secure Admin Panel:** Password-protected dashboard to manage surveys, view real-time analytics, and visualize data.
- **📊 Data Export:** Download survey responses as JSON, CSV, or detailed PDF reports.
- **🎨 Customizable Surveys:** (Coming Soon) A visual editor to create and deploy custom surveys.
- **🚀 Deploy Anywhere:** Ready for deployment on Vercel or any Docker-compatible environment.

##  Quick Start

Follow these steps to get the project running locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/zainriaz-dev/mzr-surveys.git
    cd mzr-survey
    ```

2.  **Install dependencies:**
    This project uses `pnpm` for package management.
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Copy the example environment file and fill in your credentials.
    ```bash
    cp .env.example .env.local
    ```
    See the [Configuration](#-configuration) section for more details on each variable.

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```

The application will be available at `http://localhost:3000`.

## ⚙️ Configuration

The application requires the following environment variables to be set in `.env.local`.

| Variable                       | Description                                                                                                                             | Default                          |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_BASE_URL`         | The base URL of the application.                                                                                                        | `http://localhost:3000`          |
| `ADMIN_PASSWORD`               | Secure password to access the `/admin` dashboard.                                                                                       | `YOUR_SECURE_ADMIN_PASSWORD`     |
| `MONGODB_URL`                  | Your MongoDB connection string.                                                                                                         | `mongodb://...`                  |
| `AI_PROVIDER_ORDER`            | Comma-separated list of AI providers to use in order of priority (`azure_openai_primary`, `gemini`, `deepseek`).                         | `azure_openai_primary,...`       |
| `AZURE_OPENAI_API_KEY`         | API key for your primary Azure OpenAI service.                                                                                          | -                                |
| `AZURE_OPENAI_ENDPOINT`        | Endpoint URL for your primary Azure OpenAI service.                                                                                     | -                                |
| `GEMINI_API_KEY`               | API key for Google Gemini.                                                                                                              | -                                |
| `DEEPSEEK_API_KEY`             | API key for DeepSeek.                                                                                                                   | -                                |
| ...                            | *(and other AI provider-specific variables)*                                                                                            |                                  |

##  Scripts

-   `pnpm dev`: Starts the development server with Turbopack.
-   `pnpm build`: Creates a production-ready build.
-   `pnpm start`: Starts the production server.
-   `pnpm lint`: Lints the codebase for errors.
-   `pnpm test`: (Coming Soon) Runs the test suite.

## 🚢 Deployment

### Vercel

The easiest way to deploy this application is with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzainriaz-dev%2Fmzr-surveys)

### Docker

A `Dockerfile` and `docker-compose.yml` are planned. Once available, you will be able to deploy using:

```bash
# (Coming Soon)
docker-compose up --build
```

## 🗺️ Roadmap & Contributing

This project is actively under development. Key features on our roadmap include:

-   [ ] A full-featured visual survey editor.
-   [ ] User authentication and roles.
-   [ ] More advanced analytics and data visualization.
-   [ ] Official Docker support.

We welcome contributions! Please see our `CONTRIBUTING.md` file for guidelines.

## 🛡️ Security

We take security seriously. If you discover a vulnerability, please follow our responsible disclosure policy outlined in `SECURITY.md`. **Do not open a public issue.**

## ❓ FAQ / Troubleshooting

-   **Q: Why does the AI enhancement fail?**
    -   A: This is usually due to an invalid or rate-limited API key. Check your `.env.local` file and the status of your AI provider account. The app will automatically try the next provider in your `AI_PROVIDER_ORDER` list.

-   **Q: Can I use just one AI provider?**
    -   A: Yes. Simply set `AI_PROVIDER_ORDER` to a single provider (e.g., `gemini`) and fill in the corresponding environment variables.

## 🙏 Acknowledgements

-   [Next.js](https://nextjs.org)
-   [Shadcn UI](https://ui.shadcn.com/)
-   [Recharts](https://recharts.org/)
-   The open-source community.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
