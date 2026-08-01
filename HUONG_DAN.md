# Hướng dẫn setup Messenger Bot có popup form (từ số 0)

## Bước 1 — Lấy Web3Forms Access Key (để gửi email, miễn phí)
1. Vào https://web3forms.com
2. Nhập email của bạn (email sẽ nhận lead) → bấm "Create Access Key"
3. Kiểm tra email, copy đoạn Access Key (dạng chuỗi ký tự dài)
4. Mở file `public/form.html`, tìm dòng:
   ```
   formData.append('access_key', 'YOUR_WEB3FORMS_ACCESS_KEY');
   ```
   Thay `YOUR_WEB3FORMS_ACCESS_KEY` bằng key vừa lấy.

## Bước 2 — Đưa code lên GitHub
1. Tạo repo mới trên GitHub (vd: `fpt-messenger-bot`)
2. Upload toàn bộ nội dung thư mục này lên repo đó (kéo thả trên GitHub web cũng được, không cần biết Git)

## Bước 3 — Deploy lên Vercel (miễn phí)
1. Vào https://vercel.com → đăng nhập bằng GitHub
2. "Add New Project" → chọn repo vừa tạo → Deploy
3. Sau khi deploy xong, bạn sẽ có 1 domain dạng: `https://fpt-messenger-bot.vercel.app`
4. Vào **Settings → Environment Variables**, thêm 3 biến:
   - `VERIFY_TOKEN` = tự đặt 1 chuỗi bất kỳ, vd `fpt2026verify`
   - `PAGE_ACCESS_TOKEN` = (điền ở Bước 5, sau khi có)
   - `FORM_URL` = `https://fpt-messenger-bot.vercel.app/form.html` (đổi đúng domain của bạn)
5. Sau khi thêm/đổi biến môi trường, bấm **Redeploy** để áp dụng.

## Bước 4 — Tạo Meta App
1. Vào https://developers.facebook.com/apps → Create App → chọn loại **Business**
2. Trong App, bấm **Add Product** → chọn **Messenger** → Set Up
3. Ở mục "Access Tokens", chọn Page Facebook mới của bạn → **Generate Token**
   → Copy token này, dán vào biến `PAGE_ACCESS_TOKEN` trên Vercel (Bước 3.4), rồi Redeploy.

## Bước 5 — Đăng ký Webhook
1. Trong Meta App, mục Messenger → **Webhooks** → Add Callback URL:
   - Callback URL: `https://fpt-messenger-bot.vercel.app/api/webhook`
   - Verify Token: đúng chuỗi bạn đặt ở `VERIFY_TOKEN` (vd `fpt2026verify`)
2. Bấm Verify and Save
3. Subscribe vào các field: `messages`, `messaging_postbacks`
4. Chọn Page của bạn để subscribe webhook vào Page đó

## Bước 6 — Test thử
1. Nhắn tin bất kỳ vào Page Facebook của bạn (từ tài khoản cá nhân, hoặc thêm mình làm Tester nếu App chưa Live)
2. Bot sẽ trả lời menu (Internet / Camera / Truyền hình / Tư vấn trực tiếp)
3. Bấm 1 lựa chọn → sẽ hiện nút "Điền thông tin tư vấn" → bấm vào sẽ mở form ngay trong Messenger
4. Điền form → Gửi → kiểm tra email đã nhận lead chưa

## Lưu ý quan trọng
- App Meta mới tạo mặc định ở chế độ **Development**: chỉ những người được thêm vào **App Roles → Testers** mới nhắn được với bot. Muốn public cho mọi khách, cần nộp **App Review** xin quyền `pages_messaging` (Meta duyệt trong vài ngày, cần mô tả use case + video demo).
- Nếu muốn dùng chung 1 project Vercel cho nhiều page sau này, có thể mở rộng thêm.
