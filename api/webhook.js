// api/webhook.js
// Webhook Messenger Platform - chạy trên Vercel Serverless Function
// URL sau khi deploy: https://<ten-project>.vercel.app/api/webhook

export default async function handler(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
  const FORM_URL = process.env.FORM_URL; // vd: https://ten-project.vercel.app/form.html

  // Bước xác minh webhook khi khai báo trong Meta App
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // Nhận sự kiện thật từ Messenger
  if (req.method === 'POST') {
    const body = req.body;

    if (body.object === 'page') {
      for (const entry of body.entry) {
        const event = entry.messaging?.[0];
        if (!event) continue;

        const senderId = event.sender.id;

        let payload = null;
        if (event.postback) payload = event.postback.payload;
        if (event.message?.quick_reply) payload = event.message.quick_reply.payload;

        if (payload) {
          await sendButtonTemplate(senderId, payload, PAGE_ACCESS_TOKEN, FORM_URL);
        } else if (event.message?.text) {
          await sendMenu(senderId, PAGE_ACCESS_TOKEN);
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    }
    return res.status(404).send('Not Found');
  }

  return res.status(405).send('Method Not Allowed');
}

// Menu ban đầu gửi cho khách (quick replies)
async function sendMenu(senderId, token) {
  const message = {
    recipient: { id: senderId },
    message: {
      text: 'Chào anh/chị! Anh/chị quan tâm dịch vụ nào ạ?',
      quick_replies: [
        { content_type: 'text', title: 'Internet', payload: 'INTERNET' },
        { content_type: 'text', title: 'Camera an ninh', payload: 'CAMERA' },
        { content_type: 'text', title: 'Truyền hình FPT', payload: 'TRUYENHINH' },
        { content_type: 'text', title: 'Tư vấn trực tiếp', payload: 'TUVAN' },
      ],
    },
  };
  await callSendAPI(message, token);
}

// Nút mở webview form khi khách chọn 1 mục
async function sendButtonTemplate(senderId, payload, token, formUrl) {
  const serviceLabel =
    {
      INTERNET: 'Internet',
      CAMERA: 'Camera an ninh',
      TRUYENHINH: 'Truyền hình FPT',
      TUVAN: 'Tư vấn trực tiếp',
    }[payload] || 'Tư vấn';

  const url = `${formUrl}?service=${encodeURIComponent(serviceLabel)}`;

  const message = {
    recipient: { id: senderId },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: `Để được tư vấn nhanh nhất về ${serviceLabel}, anh/chị vui lòng điền thông tin vào form bên dưới nhé:`,
          buttons: [
            {
              type: 'web_url',
              url,
              title: 'Điền thông tin tư vấn',
              webview_height_ratio: 'tall',
              messenger_extensions: true,
            },
          ],
        },
      },
    },
  };
  await callSendAPI(message, token);
}

async function callSendAPI(message, token) {
  const response = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  const result = await response.json();

  if (!response.ok || result.error) {
    // In lỗi thật sự ra Vercel Logs để dễ debug
    console.error('Facebook Send API error:', JSON.stringify(result, null, 2));
  } else {
    console.log('Facebook Send API success:', JSON.stringify(result));
  }
}
