# Auth0 Environment Variables Setup

Add these environment variables to your `.env` file in the careers-server directory:

```env
# Auth0 Configuration
AUTH0_DOMAIN=hatchbeacon.eu.auth0.com
AUTH0_CLIENT_ID=oOwD1eiYMSO2S1RnSV8HBUDWADXe3Gpy
AUTH0_CLIENT_SECRET=your-auth0-client-secret-here
AUTH0_REDIRECT_URI=http://localhost:3000/callback

# Frontend redirect after Auth0 login
FRONTEND_LOGIN_REDIRECT=http://localhost:3000/login
```

## Where to find these values:

1. **AUTH0_DOMAIN**: Your Auth0 tenant domain (e.g., `hatchbeacon.eu.auth0.com`)
2. **AUTH0_CLIENT_ID**: From your Auth0 Application settings
3. **AUTH0_CLIENT_SECRET**: From your Auth0 Application settings (keep this secret!)
4. **AUTH0_REDIRECT_URI**: The callback URL Auth0 redirects to after authentication
5. **FRONTEND_LOGIN_REDIRECT**: Your admin frontend login page URL

## Important Notes:

- The `AUTH0_CLIENT_SECRET` is required for the backend to exchange the authorization code for tokens
- Make sure the `AUTH0_REDIRECT_URI` matches exactly what's configured in your Auth0 Application settings
- Never commit the `.env` file with secrets to version control
