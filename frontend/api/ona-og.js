export default function handler(req, res) {
  const ua = req.headers["user-agent"] || "";
  const isBot = /facebookexternalhit|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|applebot|curl|wget|bingbot|googlebot/i.test(
    ua
  );

  const title = "ONA Residences · Preventa en Los Cusis";
  const desc =
    "Departamentos de 1 y 2 dormitorios en Los Cusis desde USD 40.375. Arquitectura contemporánea y alta rentabilidad. Reserva con USD 2.000.";
  const img = "https://nia-web.com/ona/og-ona.jpg";
  const targetUrl = "https://nia-web.com/?proyecto=ona";

  if (!isBot) {
    res.writeHead(307, { Location: targetUrl });
    res.end();
    return;
  }

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <meta name="robots" content="index, follow" />
  
  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ONA Residences · N.I.A" />
  <meta property="og:url" content="${targetUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:image:secure_url" content="${img}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="ONA Residences en Los Cusis" />
  
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${img}" />

  <meta http-equiv="refresh" content="0; url=${targetUrl}" />
</head>
<body style="background:#0d0d0d;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>Cargando ONA Residences...</p>
  <script>window.location.replace("${targetUrl}");</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  res.status(200).send(html);
}
