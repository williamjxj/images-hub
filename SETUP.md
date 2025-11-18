# Vercel AI Gateway + Deepseek Setup Guide

This guide will help you set up Vercel AI Gateway with Deepseek API key for both local development and production.

## Prerequisites

- ✅ Next.js 16+ project
- ✅ Vercel account
- ✅ Deepseek API key from [https://platform.deepseek.com](https://platform.deepseek.com)
- ✅ Clerk account with API keys from [https://dashboard.clerk.com](https://dashboard.clerk.com)

## Step 1: Local Development Setup

### 1.1 Create `.env.local` file

Create a `.env.local` file in the project root with your API keys:

```env
# Clerk Authentication (required)
# Get your keys from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
CLERK_SECRET_KEY=sk_test_your-secret-key-here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# DeepSeek API Key (required for local development)
# Get your API key from https://platform.deepseek.com
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 1.2 Test Local Development

1. Start the development server:

   ```bash
   pnpm dev
   ```

2. **Sign in first**: Open [http://localhost:3000](http://localhost:3000) and sign in using the Sign In button in the header. You must be authenticated to use the chat API.

3. The API route will automatically use the Deepseek provider directly with your API key from `.env.local`.

**Important**: The chat API requires authentication. Make sure you're signed in before testing the chat functionality.

## Step 2: Production Setup on Vercel

### 2.1 Configure Deepseek API Key in Vercel Dashboard

For production, you need to configure the Deepseek API key in Vercel's AI Gateway Integrations:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **AI Gateway** → **Integrations** (in the left sidebar)
3. Find **Deepseek** in the provider list and click **Add**
4. Enter your Deepseek API key in the dialog
5. Ensure the **Enabled** toggle is turned on
6. Click **Test Key** to validate your credentials
7. Click **Add** to save

### 2.2 Verify Model Availability

1. In the AI Gateway tab, go to **Model List**
2. Search for "deepseek" or "deepseek-chat"
3. Verify the exact model identifier is `deepseek/deepseek-chat`

### 2.3 Add Credit Card (Required)

Vercel AI Gateway requires a valid credit card on file, even for the free tier ($5/month free credits):

1. Go to [Vercel Dashboard → AI Gateway](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card)
2. Add your credit card when prompted
3. Once added, you'll unlock $5 USD of free AI Gateway credits per month

### 2.4 Deploy to Vercel

Deploy your project to Vercel:

```bash
vercel deploy
```

Or connect your GitHub repository to Vercel for automatic deployments.

## How It Works

### Local Development

- Uses `@ai-sdk/deepseek` provider directly
- Reads `DEEPSEEK_API_KEY` from `.env.local`
- Makes direct API calls to Deepseek

### Production (Vercel)

- Uses model string format `"deepseek/deepseek-chat"`
- Automatically routes through Vercel AI Gateway
- Uses API key configured in Vercel Dashboard → AI Gateway → Integrations
- Benefits from Gateway features: rate limiting, observability, cost tracking

## Verification Checklist

- [ ] `.env.local` created with `DEEPSEEK_API_KEY`
- [ ] Local development server runs without errors
- [ ] Deepseek API key added to Vercel Dashboard → AI Gateway → Integrations
- [ ] Credit card added to Vercel account
- [ ] Model `deepseek/deepseek-chat` verified in Gateway Model List
- [ ] Project deployed to Vercel
- [ ] Chat API works in production

## Troubleshooting

### Issue: "DEEPSEEK_API_KEY is required" error in local development

**Solution**: Make sure `.env.local` exists in the project root and contains `DEEPSEEK_API_KEY=sk-your-key-here`. Restart the dev server after creating/updating the file.

### Issue: Gateway not routing requests in production

**Solution**:

- Verify the API key is configured in Vercel Dashboard → AI Gateway → Integrations
- Ensure the key is enabled (toggle is on)
- Check that the model identifier matches exactly: `deepseek/deepseek-chat`
- Verify your credit card is on file

### Issue: Credit card requirement error

**Solution**: Add a credit card in Vercel Dashboard. Even though there's a free tier, Vercel requires a card on file to unlock the free credits.

### Issue: API key not working

**Solution**:

- Verify your Deepseek API key is valid at [https://platform.deepseek.com](https://platform.deepseek.com)
- Test the key using the "Test Key" button in Vercel Dashboard → AI Gateway → Integrations
- Check that the key hasn't expired or been revoked

### Issue: "Authentication required. Please sign in." error locally

**Symptom**: Getting `{"error":{"type":"authentication","message":"Authentication required. Please sign in.","retryable":false}}` when calling the chat API locally.

**Solution**:

1. **Sign in first**: The chat API requires authentication. Open [http://localhost:3000](http://localhost:3000) in your browser and click "Sign In" in the header to authenticate.

2. **Verify Clerk configuration**:
   - Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set in `.env.local`
   - Restart the dev server after adding/updating environment variables: `pnpm dev`

3. **Check Clerk Dashboard**:
   - Verify your Clerk application is active at [https://dashboard.clerk.com](https://dashboard.clerk.com)
   - Ensure the API keys match your Clerk application
   - Check that your local URL (`http://localhost:3000`) is allowed in Clerk Dashboard → Settings → Domains

4. **Clear browser cache**: Sometimes browser cache can cause authentication issues. Try:
   - Clear browser cache and cookies
   - Use an incognito/private window
   - Sign out and sign back in

5. **Verify session**: After signing in, check the browser console for any Clerk-related errors. The UserButton should appear in the header when authenticated.

## Additional Resources

- [Vercel AI Gateway Documentation](https://vercel.com/docs/ai-gateway)
- [Vercel AI Gateway BYOK Guide](https://vercel.com/docs/ai-gateway/byok)
- [Deepseek Platform](https://platform.deepseek.com)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
