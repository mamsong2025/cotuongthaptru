# 🔥 TĂNG ĐỘ KHÓ AI - Fairy-Stockfish NNUE

## ⬆️ **Đã tăng độ khó cho TẤT CẢ AI**

### 📊 Bảng so sánh:

| AI | Emoji | Depth cũ | Depth mới | Tăng | Độ khó mới |
|----|-------|----------|-----------|------|-----------|
| **Tiểu Long Nữ** | ❄️ | 3 | **4** | +1 | **Trung bình** |
| **Mộc Quế Anh** | 🏹 | 4 | **5** | +1 | **Khá khó** |
| **Vương Mẫu** | 👑 | 3 | **5** | +2 | **Khá khó** |
| **Võ Tắc Thiên** | 👸 | 3 | **6** | +3 | **Rất khó** |
| **Bạch Cốt Tinh** | 💀 | 6 | **8** | +2 | **CỰC KHÓ** |
| **Hằng Nga** | 🌙 | 4 | **5** | +1 | **Khá khó** |
| **Thiết Phiến** | 🌪️ | 4 | **5** | +1 | **Khá khó** |
| **Hoàng Nguyệt Anh** | 🧠 | 5 | **7** | +2 | **Rất khó** |
| **Điêu Thuyền** | 💃 | 4 | **5** | +1 | **Khá khó** |

---

## 🎯 **Độ khó mới (với Fairy-Stockfish NNUE):**

### 🟢 Trung bình (Depth 4):
- ❄️ **Tiểu Long Nữ** - Phù hợp người chơi có kinh nghiệm

### 🟡 Khá khó (Depth 5):
- 🏹 **Mộc Quế Anh** - Chiến thuật tốt
- 👑 **Vương Mẫu** - Uy nghiêm, khó đánh
- 🌙 **Hằng Nga** - Mưu sâu tựa biển
- 🌪️ **Thiết Phiến** - Tấn công mạnh mẽ
- 💃 **Điêu Thuyền** - Khó đoán, lắt léo

### 🔴 Rất khó (Depth 6-7):
- 👸 **Võ Tắc Thiên** (depth 6) - Nữ hoàng bá đạo
- 🧠 **Hoàng Nguyệt Anh** (depth 7) - Cực kỳ thông minh

### ⚫ CỰC KHÓ (Depth 8):
- 💀 **Bạch Cốt Tinh** - Boss cuối, gần như bất khả chiến bại!

---

## 💪 **Độ mạnh ước tính (Elo):**

| Depth | Elo ước tính | Cấp độ |
|-------|--------------|--------|
| 4 | ~2000-2100 | Cao thủ nghiệp dư |
| 5 | ~2200-2300 | Cao thủ mạnh |
| 6 | ~2400-2500 | Grandmaster |
| 7 | ~2600-2700 | Super Grandmaster |
| 8 | ~2800+ | Siêu Grandmaster |

---

## ⏱️ **Thời gian tính toán:**

| Depth | Thời gian | Ghi chú |
|-------|-----------|---------|
| 4 | ~2-3 giây | Nhanh |
| 5 | ~3-4 giây | Vừa phải |
| 6 | ~4-5 giây | Hơi lâu |
| 7 | ~5-6 giây | Lâu |
| 8 | ~6-8 giây | Rất lâu |

*Lưu ý: Thời gian có thể khác nhau tùy thiết bị*

---

## 🎮 **Khuyến nghị chơi:**

### Người mới bắt đầu:
- ❄️ **Tiểu Long Nữ** (depth 4) - Vẫn khó nhưng có thể thắng được

### Người chơi trung bình:
- 🏹 **Mộc Quế Anh** (depth 5)
- 👑 **Vương Mẫu** (depth 5)
- 🌙 **Hằng Nga** (depth 5)

### Người chơi giỏi:
- 🌪️ **Thiết Phiến** (depth 5)
- 💃 **Điêu Thuyền** (depth 5)
- 👸 **Võ Tắc Thiên** (depth 6)

### Cao thủ:
- 🧠 **Hoàng Nguyệt Anh** (depth 7)

### Thử thách cực đại:
- 💀 **Bạch Cốt Tinh** (depth 8) - **CẢNH BÁO: CỰC KHÓ!**

---

## 🧪 **Test ngay:**

Server đang chạy tại: **http://localhost:3001**

1. Refresh trang (Ctrl+F5)
2. Chọn bất kỳ AI nào
3. Cảm nhận độ khó mới!

---

## 🔧 **Nếu vẫn còn dễ:**

Bạn có thể tăng thêm trong `App.tsx`:

```typescript
const AI_PERSONALITIES: Record<string, AIPersonality> = {
  baby: { depth: 5 },      // Tiểu Long Nữ: 4 → 5
  student: { depth: 6 },   // Mộc Quế Anh: 5 → 6
  elder: { depth: 6 },     // Vương Mẫu: 5 → 6
  master: { depth: 7 },    // Võ Tắc Thiên: 6 → 7
  demon: { depth: 10 },    // Bạch Cốt Tinh: 8 → 10 (SIÊU KHỦNG)
  wise: { depth: 6 },      // Hằng Nga: 5 → 6
  aggressive: { depth: 6 }, // Thiết Phiến: 5 → 6
  smart: { depth: 8 },     // Hoàng Nguyệt Anh: 7 → 8
  tease: { depth: 6 },     // Điêu Thuyền: 5 → 6
};
```

**⚠️ Cảnh báo**: Depth 10 có thể mất 10-15 giây mỗi nước!

---

## 🔥 **Nếu vẫn còn dễ quá:**

### Tăng thời gian tính toán:

Trong `engine.worker.ts`, dòng 40:

```typescript
// Tăng thời gian từ 500ms lên 1000ms mỗi depth
const timeMs = Math.min(depth * 1000, 10000); // Max 10 giây
```

Hoặc tăng depth thêm 2x:

```typescript
// Dòng 42: Tăng depth gấp đôi
bestMove = await getFairyStockfishMove(board, color, depth * 3, timeMs);
```

---

## 📊 **Kết luận:**

✅ **Đã tăng độ khó toàn bộ AI**
- Depth thấp nhất: **4** (Tiểu Long Nữ)
- Depth cao nhất: **8** (Bạch Cốt Tinh)
- Trung bình: **5-6** (Khá khó - Rất khó)

🎯 **Độ khó hiện tại:**
- **Trung bình**: 1 AI (Tiểu Long Nữ)
- **Khá khó**: 5 AI (Quế Anh, Vương Mẫu, Hằng Nga, Thiết Phiến, Điêu Thuyền)
- **Rất khó**: 2 AI (Võ Tắc Thiên, Hoàng Nguyệt Anh)
- **Cực khó**: 1 AI (Bạch Cốt Tinh)

---

**🔥 Giờ đây AI sẽ KHÓ HƠN NHIỀU! Chúc bạn may mắn! 💪**
