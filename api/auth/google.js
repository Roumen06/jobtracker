export default async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}/api/auth/callback`
    : 'http://localhost:5173/api/auth/callback';

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'consent'
  })}`;

  res.redirect(googleAuthUrl);
}
