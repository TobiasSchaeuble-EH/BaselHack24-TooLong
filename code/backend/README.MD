# Deployment

Deployed versions will likely not work out-of-the-box,
since youtube sends different content to infra providers
(Heroku, vercel) etc. (needed files Procfile (for Heroku) or vercel.json (for vercel) are still included as reference)

Deploying to private infrastrucutre, however, might work.


_Quick hackathon solution:_
Exposing with the static https address can be done via e.g. `ngrok`
