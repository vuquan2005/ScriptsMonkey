# 🐒 ScriptsMonkey

**ScriptsMonkey** là tập hợp các userscript (.user.js) giúp cải thiện trải nghiệm trên một số trang web. Bạn có thể cài đặt và sử dụng trực tiếp thông qua trình quản lý như Tampermonkey hoặc Violentmonkey.

## 📂 Danh sách Userscript

| Tên Script                   | Mô tả ngắn                                     | Chi tiết                                        | Cài đặt                                         |
| ---------------------------- | ---------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| `EOP_Helper.user.js`         | Hỗ trợ nâng cao khi sử dụng trang web EOP      | [ℹ️](./Scripts/EOP_Helper.user.js.md)         | [Cài đặt](.raw/main/Scripts/EOP_Helper.user.js)         |
| `TruyenTranhEnhance.user.js` | Tối ưu trải nghiệm đọc truyện tranh trực tuyến | [ℹ️](./Scripts/TruyenTranhEnhance.user.js.md) | [Cài đặt](.raw/main/Scripts/TruyenTranhEnhance.user.js) |
| `svHaUI_Helper.user.js`      | Công cụ hỗ trợ cho sinh viên HaUI              | [ℹ️](./Scripts/svHaUI_Helper.user.js.md)      | [Cài đặt](.raw/main/Scripts/svHaUI_Helper.user.js)      |

## 🚀 Cài đặt Userscript

Để sử dụng các Userscript từ **ScriptsMonkey**, bạn cần cài đặt tiện ích [Tampermonkey](https://www.tampermonkey.net/) hoặc một số trình quản lý user scripts khác.

### 🔹 Bước 1: Cài đặt Tampermonkey

1. Truy cập [Tampermonkey Official](https://www.tampermonkey.net/).
2. Chọn trình duyệt bạn đang sử dụng và làm theo hướng dẫn cài đặt.

### 🔹 Bước 2: Thêm Userscript từ ScriptsMonkey

Có **3 cách** để cài đặt Userscript:

#### 🔗 **Cách 1: Cài đặt nhanh từ GitHub**

1. Truy cập [Danh sách Userscript](#-Danh-sách-Userscript).
2. Nhấn vào liên kết "Cài đặt" của script bạn muốn.
3. Tampermonkey sẽ tự động nhận diện và yêu cầu xác nhận cài đặt.

#### 🔗 **Cách 2: Cài đặt thông qua liên kết Raw**

1. Truy cập vào thư mục [Scripts](./Scripts).
2. Chọn file `.user.js` bạn muốn cài.
3. Nhấn nút **Raw** để mở file ở chế độ thô.
4. Tampermonkey sẽ tự động hiển thị giao diện cài đặt, bạn chỉ cần nhấn **Install**.

#### 📥 **Cách 3: Copy-Paste thủ công**

1. Mở Tampermonkey → **Create a new script**.
2. Xóa toàn bộ nội dung mặc định.
3. Copy toàn bộ nội dung từ file `.user.js` trên GitHub.
4. Dán vào trình chỉnh sửa của Tampermonkey.
5. Lưu lại bằng cách nhấn **File → Save** hoặc `Ctrl + S`.

## 🛠 Đóng góp

Bạn có thể đóng góp bằng cách:

-   Gửi Pull Request với script mới hoặc nâng cấp các script hiện tại
-   Mở Issue để báo lỗi hoặc đề xuất ý tưởng

## 📄 Giấy phép

MIT License © [vuquan2005](https://github.com/vuquan2005)
