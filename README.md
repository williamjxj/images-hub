This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# DeepSeek API Key (required for BYOK via Vercel AI Gateway)
# Get your API key from https://platform.deepseek.com
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

**For Production (Vercel)**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `DEEPSEEK_API_KEY` with your DeepSeek API key
3. Ensure it's available for Production, Preview, and Development environments

**Important**: Never commit `.env.local` to version control. See `.env.example` for template.

## Vercel AI Gateway Setup

This project uses Vercel AI Gateway to route requests to DeepSeek LLM:

1. **Add Credit Card** (Required): Vercel AI Gateway requires a valid credit card on file, even for the free tier ($5/month free credits). Add your card at: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card
2. **Verify Model Availability**: Go to Vercel Dashboard → AI Gateway → Model List
3. Search for "deepseek" and verify the model identifier is `deepseek/deepseek-chat`
4. Configure `DEEPSEEK_API_KEY` in Vercel dashboard for BYOK (Bring Your Own Key) access

**Note**: The free tier includes $5 USD of AI Gateway Credits per month. Once you add a credit card, you'll unlock these free credits.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
