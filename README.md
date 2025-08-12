This is a [Next.js](https://nextjs.org) project for an AI-enhanced survey.

## Getting Started

First, create a `.env.local` in the repo root with:

```
MONGODB_URI=
MONGODB_DB=survey

ADMIN_PASSWORD=

GEMINI_API_KEY=
DEEPSEEK_API_KEY=
AI_PROVIDER=gemini
```

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
