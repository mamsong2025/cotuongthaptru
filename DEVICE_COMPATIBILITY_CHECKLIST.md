# Danh Sách Kiểm Tra Tương Thích Thiết Bị

## 🔍 Các Lỗi Phổ Biến Đã Phát Hiện và Khắc Phục

### 1. ❌ LỖI: "Ứng dụng không được cài đặt" / "App not installed"
**Nguyên nhân:**
- Target SDK quá cao (API 36) - chưa được hỗ trợ rộng rãi
- Thiếu cấu hình ABI cho chip 32-bit
- Xung đột package name hoặc signature

**Đã khắc phục:**
- ✅ Hạ Target SDK từ 36 → 35 (Android 15)
- ✅ Thêm ABI filters: `armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`
- ✅ Đảm bảo minSdkVersion = 24 (Android 7.0+)

**Cách kiểm tra:**
```bash
# Kiểm tra ABI của thiết bị
adb shell getprop ro.product.cpu.abi

# Cài đặt APK
adb install -r app-debug.apk
```

---

### 2. ❌ LỖI: Ứng dụng đơ/treo khi AI suy nghĩ (ANR - Application Not Responding)
**Nguyên nhân:**
- Chess engine chạy trên Main Thread
- Depth tính toán quá sâu (7-12) trên thiết bị yếu
- Blocking UI khi tính toán

**Đã khắc phục:**
- ✅ Chuyển engine sang Web Worker (chạy background)
- ✅ Giảm depth xuống 4-5 cho các AI mạnh
- ✅ Thêm loading indicator khi AI đang tính

**Cách kiểm tra:**
```bash
# Monitor ANR logs
adb logcat | grep -i "anr"

# Kiểm tra CPU usage
adb shell top | grep "com.thanco.docmieng"
```

---

### 3. ❌ LỖI: Màn hình trắng khi khởi động / Crash ngay sau splash
**Nguyên nhân:**
- Tailwind CDN không load được (mạng yếu/offline)
- Font Google Fonts bị chặn
- API Key Gemini không hợp lệ

**Đã khắc phục:**
- ✅ Chuyển Tailwind từ CDN → local build
- ✅ Thêm fallback fonts hệ thống
- ✅ Xử lý lỗi API key gracefully (không crash)

**Cách kiểm tra:**
```bash
# Kiểm tra WebView logs
adb logcat | grep -i "chromium\|console"

# Test offline mode
adb shell svc wifi disable
adb shell svc data disable
```

---

### 4. ❌ LỖI: Âm thanh không phát / TTS không hoạt động
**Nguyên nhân:**
- AudioContext bị suspend trên một số thiết bị
- Gemini TTS API bị chặn hoặc lỗi
- Quyền RECORD_AUDIO chưa được cấp

**Đã khắc phục:**
- ✅ Tắt TTS mặc định (chỉ hiển thị text)
- ✅ Resume AudioContext khi user tương tác
- ✅ Fallback về silent mode nếu lỗi

**Cách kiểm tra:**
```bash
# Kiểm tra audio permissions
adb shell dumpsys package com.thanco.docmieng | grep -i "audio"
```

---

### 5. ⚠️ LỖI: Font chữ Trung Quốc không hiển thị đúng
**Nguyên nhân:**
- Thiết bị không có font 'Ma Shan Zheng', 'Noto Serif TC'
- WebView không load Google Fonts

**Đã khắc phục:**
- ✅ Thêm fallback fonts: `serif`, `sans-serif`
- ✅ Sử dụng Unicode characters thay vì font đặc biệt

**Cách kiểm tra:**
- Mở app và kiểm tra quân cờ có hiển thị đúng 將/帥/車/馬/炮/兵 không

---

### 6. ⚠️ LỖI: Worker không hoạt động trên một số WebView cũ
**Nguyên nhân:**
- WebView < Chrome 80 không hỗ trợ ES Module Workers
- Vite worker bundling không tương thích

**Giải pháp dự phòng:**
```typescript
// Fallback nếu Worker không khả dụng
if (!window.Worker) {
  // Chạy engine trên main thread với timeout
  setTimeout(() => findBestMove(...), 0);
}
```

---

## 📱 Ma Trận Kiểm Tra Thiết Bị

| Loại Thiết Bị | Android Ver | RAM | Chip | Trạng Thái |
|---------------|-------------|-----|------|------------|
| **Flagship** (Samsung S23, Pixel 8) | 14+ | 8GB+ | Snapdragon 8 Gen 2 | ✅ Hoàn hảo |
| **Mid-range** (Redmi Note 12, Galaxy A54) | 12-13 | 4-6GB | Snapdragon 695 | ✅ Tốt (depth 4-5) |
| **Budget** (Redmi 9, Galaxy A13) | 11-12 | 3-4GB | Helio G85 | ⚠️ Giảm depth xuống 3 |
| **Cũ** (Samsung J7, Xiaomi Mi A1) | 7-9 | 2-3GB | Snapdragon 625 | ⚠️ Có thể lag, depth 2 |

---

## 🧪 Kịch Bản Test Đầy Đủ

### Test 1: Cài đặt cơ bản
```bash
# 1. Build APK
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug

# 2. Cài đặt
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 3. Khởi chạy
adb shell am start -n com.thanco.docmieng/.MainActivity
```

### Test 2: Kiểm tra hiệu năng
```bash
# Monitor memory
adb shell dumpsys meminfo com.thanco.docmieng

# Monitor CPU
adb shell top -m 10 | grep docmieng

# Monitor FPS
adb shell dumpsys gfxinfo com.thanco.docmieng
```

### Test 3: Kiểm tra crash logs
```bash
# Realtime logs
adb logcat -c && adb logcat | grep -E "AndroidRuntime|FATAL|ERROR"

# Tombstone crashes
adb shell ls /data/tombstones/
```

### Test 4: Test offline mode
```bash
# Tắt mạng
adb shell svc wifi disable
adb shell svc data disable

# Khởi động app
adb shell am start -n com.thanco.docmieng/.MainActivity

# Bật lại mạng
adb shell svc wifi enable
adb shell svc data enable
```

---

## 🔧 Cấu Hình Tối Ưu Theo Thiết Bị

### Thiết bị RAM < 3GB
```typescript
// Trong App.tsx, giảm depth
const AI_PERSONALITIES = {
  baby: { depth: 1 },
  student: { depth: 2 },
  elder: { depth: 2 },
  master: { depth: 3 },
  demon: { depth: 3 },
  // ...
};
```

### Thiết bị Android < 10
```gradle
// Trong android/app/build.gradle
android {
    defaultConfig {
        minSdkVersion 24
        targetSdkVersion 33  // Hạ xuống 33 cho thiết bị cũ
    }
}
```

---

## 📊 Checklist Trước Khi Release

- [ ] Test trên ít nhất 3 thiết bị khác nhau (flagship, mid, budget)
- [ ] Test cả online và offline mode
- [ ] Kiểm tra không có ANR trong 5 phút chơi liên tục
- [ ] Verify tất cả AI personalities hoạt động
- [ ] Kiểm tra âm thanh và BGM
- [ ] Test rotation (portrait/landscape)
- [ ] Verify font chữ Trung Quốc hiển thị đúng
- [ ] Test cài đặt trên thiết bị chưa có app
- [ ] Test update từ version cũ
- [ ] Kiểm tra APK size < 50MB

---

## 🚨 Lỗi Nghiêm Trọng Cần Fix Ngay

### CRITICAL: API Key bị hardcode
```typescript
// ❌ NGUY HIỂM - Đừng commit API key thật
const apiKey = 'AIzaSyABC123...';

// ✅ AN TOÀN - Dùng environment variable
const apiKey = process.env.VITE_GEMINI_API_KEY || '';
```

### CRITICAL: Worker bundle không tồn tại
- Vite cần cấu hình đúng để bundle worker
- Kiểm tra file `dist/assets/engine.worker-*.js` có tồn tại không

---

## 📞 Hỗ Trợ Debug

Nếu gặp lỗi trên thiết bị cụ thể, thu thập thông tin:

```bash
# Device info
adb shell getprop | grep -E "ro.build|ro.product"

# Full logcat
adb logcat -d > logcat.txt

# App info
adb shell dumpsys package com.thanco.docmieng > app_info.txt
```

Gửi 3 file trên kèm mô tả lỗi để được hỗ trợ.
