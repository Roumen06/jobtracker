export default async function handler(req, res) {
  res.setHeader('Set-Cookie', 'auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  res.redirect('/');
}
