const BRAND_LOGO_URL = 'https://www.hydrabytes.tech/email-logo.png';
const BRAND_SITE_URL = 'https://www.hydrabytes.tech';

function wrapBrandedEmail(innerHtml: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>HydraBytes</title>
    <!--[if mso]>
    <style type="text/css">table,td,div,p,a {font-family: Arial, sans-serif !important;}</style>
    <![endif]-->
  </head>
  <body style="margin:0;padding:0;background:#08080f;-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">HydraBytes: Web, Mobile &amp; AI Solutions</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08080f;">
      <tr>
        <td align="center" style="padding:40px 16px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

            <!-- Logo -->
            <tr>
              <td align="center" style="padding:0 0 8px;">
                <a href="${BRAND_SITE_URL}" style="text-decoration:none;display:inline-block;" target="_blank">
                  <img src="${BRAND_LOGO_URL}" alt="HydraBytes" width="160" height="160" style="display:block;width:160px;height:160px;border:0;outline:none;text-decoration:none;" />
                </a>
              </td>
            </tr>

            <!-- Inner Content -->
            <tr>
              <td align="center" style="padding:0;">
                ${innerHtml}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:32px 16px 16px;">
                <!-- Divider -->
                <div style="width:80px;height:2px;background:linear-gradient(90deg,#1a6b7a,#00b4d8);margin:0 auto 20px;border-radius:2px;"></div>

                <!-- Social Links -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
                  <tr>
                    <td style="padding:0 8px;">
                      <a href="https://www.linkedin.com/company/hydrabytes4/" style="text-decoration:none;color:#6c6c85;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:12px;" target="_blank">LinkedIn</a>
                    </td>
                    <td style="padding:0 8px;color:#2a2a3d;font-size:12px;">·</td>
                    <td style="padding:0 8px;">
                      <a href="https://www.instagram.com/hydrabytes" style="text-decoration:none;color:#6c6c85;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:12px;" target="_blank">Instagram</a>
                    </td>
                    <td style="padding:0 8px;color:#2a2a3d;font-size:12px;">·</td>
                    <td style="padding:0 8px;">
                      <a href="${BRAND_SITE_URL}" style="text-decoration:none;color:#6c6c85;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:12px;" target="_blank">Website</a>
                    </td>
                  </tr>
                </table>

                <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:12px;color:#4a4a65;margin:0 0 6px;line-height:1.6;">
                  HydraBytes · Web, Mobile &amp; AI Solutions
                </p>
                <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:11px;color:#3a3a52;margin:0;line-height:1.6;">
                  © ${year} HydraBytes ·
                  <a href="${BRAND_SITE_URL}" style="color:#6366f1;text-decoration:none;">hydrabytes.tech</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'HydraBytes <contact@hydrabytes.tech>',
      to,
      subject,
      html: wrapBrandedEmail(html),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend error ${response.status}: ${errorText}`);
  }

  return response.json();
}
