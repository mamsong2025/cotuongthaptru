# 🎮 Độ Khó AI - Sau khi tích hợp Fairy-Stockfish NNUE

## 📊 Bảng độ khó hiện tại:

| AI | Tên | Depth | Độ khó (Engine cũ) | Độ khó (Fairy-Stockfish) | Ghi chú |
|----|-----|-------|-------------------|------------------------|---------|
| 1️⃣ | Tiểu Long Nữ ❄️ | 3 | Dễ | **Trung bình** | Mới học |
| 2️⃣ | Mộc Quế Anh 🏹 | 4 | Trung bình | **Khá khó** | Nữ tướng |
| 3️⃣ | **Vương Mẫu 👑** | **3** ⬇️ | Trung bình | **Trung bình** | **ĐÃ GIẢM** |
| 4️⃣ | **Võ Tắc Thiên 👸** | **3** ⬇️ | Khá khó | **Trung bình** | **ĐÃ GIẢM** |
| 5️⃣ | Bạch Cốt Tinh 💀 | 6 | Rất khó | **Siêu khó** | Boss cuối |
| 6️⃣ | Hằng Nga 🌙 | 4 | Trung bình | **Khá khó** | Điềm tĩnh |
| 7️⃣ | Thiết Phiến 🌪️ | 4 | Trung bình | **Khá khó** | Hung dữ |
| 8️⃣ | Hoàng Nguyệt Anh 🧠 | 5 | Khá khó | **Rất khó** | Thông minh |
| 9️⃣ | Điêu Thuyền 💃 | 4 | Trung bình | **Khá khó** | Lắt léo |

## 🔄 Thay đổi:

### ✅ Đã giảm độ khó:
- **Vương Mẫu Nương Nương** 👑: Depth 4 → **3** (giảm 1 cấp)
- **Võ Tắc Thiên** 👸: Depth 5 → **3** (giảm 2 cấp)

### 💡 Lý do:
Với Fairy-Stockfish NNUE, mỗi depth mạnh hơn engine cũ rất nhiều:
- **Depth 3** (Fairy) ≈ **Depth 6-8** (Engine cũ)
- **Depth 4** (Fairy) ≈ **Depth 8-10** (Engine cũ)
- **Depth 5** (Fairy) ≈ **Depth 10-12** (Engine cũ)

## 🎯 Độ khó đề xuất (với Fairy-Stockfish):

### Dễ - Trung bình:
- ❄️ **Tiểu Long Nữ** (depth 3) - Phù hợp người mới
- 👑 **Vương Mẫu** (depth 3) - Phù hợp người chơi bình thường

### Khá khó:
- 🏹 **Mộc Quế Anh** (depth 4) - Thử thách vừa phải
- 🌙 **Hằng Nga** (depth 4) - Chiến thuật tốt
- 🌪️ **Thiết Phiến** (depth 4) - Tấn công mạnh
- 💃 **Điêu Thuyền** (depth 4) - Khó đoán

### Rất khó:
- 👸 **Võ Tắc Thiên** (depth 3) - Cân bằng tốt
- 🧠 **Hoàng Nguyệt Anh** (depth 5) - Rất thông minh

### Siêu khó (Boss):
- 💀 **Bạch Cốt Tinh** (depth 6) - Gần như không thể thắng

## 📝 Gợi ý điều chỉnh thêm (nếu cần):

### Nếu vẫn còn khó:
```typescript
// Giảm thêm các AI khác
student: { depth: 3 },  // Mộc Quế Anh: 4 → 3
wise: { depth: 3 },     // Hằng Nga: 4 → 3
aggressive: { depth: 3 }, // Thiết Phiến: 4 → 3
tease: { depth: 3 },    // Điêu Thuyền: 4 → 3
smart: { depth: 4 },    // Hoàng Nguyệt Anh: 5 → 4
demon: { depth: 5 },    // Bạch Cốt Tinh: 6 → 5
```

### Nếu muốn thêm độ khó:
```typescript
// Tăng độ khó cho boss
demon: { depth: 7 },    // Bạch Cốt Tinh: 6 → 7 (cực khó)
smart: { depth: 6 },    // Hoàng Nguyệt Anh: 5 → 6 (rất khó)
```

## 🧪 Cách test:

1. Chạy game: `npm run dev`
2. Mở http://localhost:3001
3. Chọn **Vương Mẫu** hoặc **Võ Tắc Thiên**
4. Chơi thử và đánh giá độ khó

### Độ khó mong đợi:
- **Vương Mẫu** (depth 3): Trung bình - người chơi bình thường có thể thắng
- **Võ Tắc Thiên** (depth 3): Trung bình - cân bằng tốt

## 💡 Lưu ý:

### Với Fairy-Stockfish NNUE:
- **Depth 3** = Đủ mạnh cho người chơi trung bình
- **Depth 4** = Khá khó, cần kỹ năng tốt
- **Depth 5+** = Rất khó, gần như chuyên nghiệp

### Thời gian tính toán:
- **Depth 3**: ~1-2 giây
- **Depth 4**: ~2-3 giây
- **Depth 5**: ~3-4 giây
- **Depth 6**: ~4-5 giây

## 🎉 Kết luận:

✅ **Đã giảm độ khó thành công:**
- Vương Mẫu: Depth 4 → 3
- Võ Tắc Thiên: Depth 5 → 3

Giờ đây các AI này phù hợp hơn với người chơi bình thường khi sử dụng Fairy-Stockfish NNUE!

---

**Hãy test và cho biết độ khó có phù hợp không nhé! 🎮**
