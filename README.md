# 🌸 Fleur de Lune

**Fleur de Lune** là một trang web tiệm hoa cao cấp với trải nghiệm mua hoa mang tính cảm xúc — giao diện pastel hiện đại, hiệu ứng chuyển động mượt mà, một "linh vật" bướm bay tương tác kèm gợi ý câu thoại theo ngữ cảnh, và trang quản trị (Admin) đơn giản để chỉnh sửa sản phẩm/nội dung shop.

## ✨ Tech Stack

- **React 19** — thư viện UI
- **TypeScript** — type-safety cho toàn bộ codebase
- **Vite** — build tool & dev server tốc độ cao
- **Tailwind CSS v4** — utility-first styling
- **Framer Motion** — animation cho component React
- **GSAP** (`@gsap/react`) — animation nâng cao, timeline phức tạp
- **React Router (v7)** — điều hướng SPA

## 📸 Demo / Screenshots

> _Chèn ảnh chụp màn hình của project tại đây._

<!--
![Home page](./docs/screenshot-home.png)
![Bouquet detail](./docs/screenshot-detail.png)
![Admin dashboard](./docs/screenshot-admin.png)
-->

## 🚀 Cài đặt & chạy local

**Yêu cầu:** Node.js phiên bản 18 trở lên (khuyến nghị 20+) và npm.

```bash
# 1. Clone repository
git clone https://github.com/<your-username>/fleur-de-lune.git
cd fleur-de-lune

# 2. Cài đặt dependencies
npm install

# 3. Chạy dev server
npm run dev
```

Mặc định ứng dụng sẽ chạy tại [http://localhost:5173](http://localhost:5173).

### Các lệnh khác

```bash
npm run build     # Build production vào thư mục dist/
npm run preview   # Xem thử bản build production
npm run lint      # Kiểm tra lỗi ESLint
```

## 📁 Cấu trúc thư mục (rút gọn)

```
src/
├─ assets/       # Hình ảnh, font, tài nguyên tĩnh
├─ components/   # React components tái sử dụng
├─ data/         # Dữ liệu mẫu (bouquets, ...)
├─ pages/        # Các trang (Home, Admin, ...)
├─ services/     # Lớp truy xuất dữ liệu (localStorage db)
├─ types/        # TypeScript type definitions
├─ App.tsx       # Component gốc & routing
└─ main.tsx      # Entry point
```

## ⚠️ Lưu ý

Trang **Admin Dashboard** trong bản demo này chỉ dùng mật khẩu tĩnh phía client và lưu dữ liệu vào `localStorage` của trình duyệt — phù hợp cho mục đích demo/portfolio, **chưa an toàn để dùng cho dữ liệu thật**. Nếu triển khai thực tế, cần thay bằng backend + xác thực (auth) đúng chuẩn.

## 📄 License

Private/demo project — chưa xác định license.
