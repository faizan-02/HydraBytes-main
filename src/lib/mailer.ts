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
  <body style="margin:0;padding:0;background:#eef1f7;-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">HydraBytes — Web, Mobile &amp; AI Solutions</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef1f7;">
      <tr>
        <td align="center" style="padding:32px 12px 8px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
            <tr>
              <td align="center" style="padding:0 0 20px;">
                <a href="${BRAND_SITE_URL}" style="text-decoration:none;display:inline-block;" target="_blank">
                  <img src="${BRAND_LOGO_URL}" alt="HydraBytes" width="180" height="180" style="display:block;width:180px;height:180px;border:0;outline:none;text-decoration:none;" />
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0;">
                ${innerHtml}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 16px 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
                <p style="font-size:12px;color:#7a8296;margin:0 0 6px;line-height:1.6;">
                  HydraBytes · Web, Mobile &amp; AI Solutions
                </p>
                <p style="font-size:12px;color:#9aa2b5;margin:0;line-height:1.6;">
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
