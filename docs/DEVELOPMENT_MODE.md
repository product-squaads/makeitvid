# Development Mode Features

## Using Environment Variables for API Keys (Localhost Only)

When developing locally, makeitvid provides a convenient way to use API keys from your `.env` file instead of entering them in the UI every time.

### How it Works

1. **Security First**: This feature is ONLY available when running on localhost (development mode)
2. **No Production Exposure**: API keys from `.env` are never sent to the client or exposed in production
3. **User Choice**: Even in development, users can choose to use their own keys via the UI

### Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your development API keys:
   ```env
   GOOGLE_GEMINI_API_KEY=your_actual_gemini_key
   CARTESIA_API_KEY=your_actual_cartesia_key
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. In the Settings modal, you'll see a "Development Mode" notice with a checkbox to use `.env` keys

### How It's Implemented

1. **Client-Side Detection**: The app detects if it's running on localhost
2. **Server-Side Validation**: API routes only accept dev keys in development mode
3. **Secure Headers**: Uses custom headers (`x-use-dev-keys`) to indicate dev key usage
4. **No Key Transmission**: When using dev keys, empty strings are sent from client

### Security Measures

- ✅ Environment check: `process.env.NODE_ENV === 'development'`
- ✅ Hostname validation: Only `localhost` or `127.0.0.1`
- ✅ Server-side only: Keys are never sent to the browser
- ✅ Production safety: Feature completely disabled in production builds

### Benefits for Open Source

- Contributors can test with their own keys locally
- No need to share API keys in the repository
- Easier onboarding for new developers
- Maintains security while improving developer experience