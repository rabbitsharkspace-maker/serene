// Creates a real Gmail DRAFT via the Gmail API (drafts.create) — safer than sending:
// the user reviews it in their own Gmail and hits send themselves.
export const createGmailDraft = async (
  accessToken: string,
  to: string,
  subject: string,
  bodyText: string
) => {
  const encodeBase64Url = (str: string) => {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  // RFC 2047 encode the subject so non-ASCII characters survive.
  const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const message = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${encodedSubject}`,
    '',
    bodyText,
  ].join('\r\n');

  const raw = encodeBase64Url(message);

  const response = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/drafts',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: { raw } }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(`Failed to create draft: ${errorData?.error?.message || response.statusText}`);
  }

  return await response.json(); // { id, message: { id, ... } }
};
