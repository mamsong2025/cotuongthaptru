# 🎮 Hướng dẫn Test Fairy-Stockfish Integration

## ✅ Đã hoàn thành:

1. ✅ **Cài đặt ffish-es6** - Package Fairy-Stockfish WASM cho Xiangqi
2. ✅ **Tạo fairyStockfish.ts** - Wrapper để giao tiếp với engine qua UCI protocol
3. ✅ **Nâng cấp engine.worker.ts** - Hỗ trợ cả Fairy-Stockfish và engine cũ (fallback)
4. ✅ **Cập nhật App.tsx** - Truyền tham số turn và useFairy cho worker
5. ✅ **Sửa vite.config.ts** - Config worker format = 'es'
6. ✅ **Build thành công** - Không có lỗi compilation

## 🧪 Cách test:

### Bước 1: Mở game trong browser
1. Server đang chạy tại: **http://localhost:3000**
2. Mở browser và truy cập địa chỉ trên
3. Mở **Developer Console** (F12) để xem logs

### Bước 2: Kiểm tra khởi tạo engine
Trong console, bạn sẽ thấy một trong hai thông báo:

**✅ Nếu Fairy-Stockfish khởi tạo thành công:**
```
[Worker] Initializing Fairy-Stockfish WASM...
[Worker] ✅ Fairy-Stockfish ready! Using NNUE engine.
```

**⚠️ Nếu fallback về engine cũ:**
```
[Worker] Initializing Fairy-Stockfish WASM...
[Worker] ⚠️ Fairy-Stockfish not available, using fallback engine.
```

### Bước 3: Chơi game
1. Click **"Chọn Đối Thủ"**
2. Chọn bất kỳ AI nào (ví dụ: "Cốt Tinh")
3. Bắt đầu chơi - di chuyển một quân cờ
4. Đợi AI phản hồi

### Bước 4: Kiểm tra engine nào được sử dụng
Trong console khi AI đang tính toán, bạn sẽ thấy:

**✅ Nếu dùng Fairy-Stockfish:**
```
[Worker] Using Fairy-Stockfish NNUE engine
[FairyStockfish] Position FEN: rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR b - - 0 1
[FairyStockfish] Searching with depth=12, time=3000ms
[FairyStockfish] Best move (UCI): e3e4
```

**⚠️ Nếu dùng engine cũ:**
```
[Worker] Using original engine
Depth 1 finished in 50ms. Best move: 7,4
Depth 2 finished in 120ms. Best move: 7,4
...
```

## 🎯 So sánh độ mạnh:

### Engine cũ ("Cốt Tinh"):
- Độ sâu: 3-6 ply
- Thời gian tính: 1-3 giây
- Đánh giá: Bảng điểm cố định
- Mức độ: **Trung bình - Khá**

### Fairy-Stockfish NNUE:
- Độ sâu: 10-20+ ply
- Thời gian tính: 1-5 giây
- Đánh giá: **Neural Network**
- Mức độ: **Grandmaster - Siêu cao thủ**

## 🔧 Troubleshooting:

### Nếu Fairy-Stockfish không load:
1. Kiểm tra console có lỗi gì không
2. Thử refresh trang (Ctrl+F5)
3. Xóa cache browser và thử lại
4. Kiểm tra file `ffish.wasm` có được load không (tab Network trong DevTools)

### Nếu game không chạy:
1. Kiểm tra console có lỗi JavaScript không
2. Engine cũ vẫn hoạt động như fallback
3. Game vẫn chơi được bình thường

## 📊 Kết quả mong đợi:

✅ **Thành công** nếu:
- Fairy-Stockfish khởi tạo thành công
- AI đi nước cờ thông minh hơn rõ rệt
- Thời gian tính toán hợp lý (1-5 giây)
- Không có lỗi trong console

⚠️ **Fallback** nếu:
- WASM không load được (do browser cũ hoặc môi trường không hỗ trợ)
- Engine cũ vẫn hoạt động bình thường
- Game vẫn chơi được

## 🚀 Build cho Android:

Khi test xong trên browser, build cho Android:

```bash
npm run build
npx cap sync android
npx cap open android
```

Trong Android Studio, build APK và test trên thiết bị thật.

## 📝 Ghi chú:

- **Offline**: Fairy-Stockfish WASM chạy hoàn toàn offline trong browser/app
- **Không cần server**: Tất cả xử lý trên thiết bị
- **Tương thích**: Chạy trên mọi browser hiện đại và Android app
- **Dung lượng**: Tăng ~77KB (ffish WASM module)

---

**Chúc bạn test thành công! 🎉**
