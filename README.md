This is a [Next.js](https://nextjs.org) project for an AI-enhanced survey.

## 🔒 Security Setup (IMPORTANT)

**⚠️ NEVER commit real API keys or secrets to git!**

This repository uses environment variables to store sensitive credentials. Follow these steps:

1. **Copy the template file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your actual credentials** in `.env.local`:
   - Replace `YOUR_AZURE_OPENAI_API_KEY` with your actual Azure OpenAI key
   - Replace `YOUR_GEMINI_API_KEY` with your actual Google Gemini key
   - Replace `YOUR_DEEPSEEK_API_KEY` with your actual DeepSeek key
   - Replace `USERNAME:PASSWORD` with your MongoDB credentials
   - Set a secure `ADMIN_PASSWORD`

3. **Verify `.env.local` is in `.gitignore`** (it should already be)

## Getting Started

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port printed in the console) with your browser.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Key routes:

- `/` — landing page with hero and FAQs
- `/survey` — multi-step wizard with AI-enhance controls
- `/admin` — charts and export (requires `ADMIN_PASSWORD`, login at `/login`)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
