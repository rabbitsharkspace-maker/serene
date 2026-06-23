export const sendEmail = async (
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

  const message = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`, // We can simplify or use B encoding
    '',
    bodyText,
  ].join('\r\n');

  const encodedMessage = encodeBase64Url(message);

  const response = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(`Failed to send email: ${errorData?.error?.message || response.statusText}`);
  }
  
  return await response.json();
};
