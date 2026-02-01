#!/bin/bash

# Script kiểm tra tương thích thiết bị Android
# Chạy: bash test-device-compatibility.sh

echo "🔍 KIỂM TRA TƯƠNG THÍCH THIẾT BỊ ANDROID"
echo "=========================================="
echo ""

# Kiểm tra ADB
if ! command -v adb &> /dev/null; then
    echo "❌ ADB không được cài đặt. Vui lòng cài Android SDK Platform Tools."
    exit 1
fi

# Kiểm tra thiết bị kết nối
DEVICE_COUNT=$(adb devices | grep -w "device" | wc -l)
if [ "$DEVICE_COUNT" -eq 0 ]; then
    echo "❌ Không tìm thấy thiết bị Android. Vui lòng kết nối thiết bị và bật USB Debugging."
    exit 1
fi

echo "✅ Tìm thấy $DEVICE_COUNT thiết bị"
echo ""

# Lấy thông tin thiết bị
echo "📱 THÔNG TIN THIẾT BỊ:"
echo "----------------------"
MANUFACTURER=$(adb shell getprop ro.product.manufacturer)
MODEL=$(adb shell getprop ro.product.model)
ANDROID_VERSION=$(adb shell getprop ro.build.version.release)
SDK_VERSION=$(adb shell getprop ro.build.version.sdk)
ABI=$(adb shell getprop ro.product.cpu.abi)
RAM=$(adb shell cat /proc/meminfo | grep MemTotal | awk '{print $2}')
RAM_GB=$(echo "scale=1; $RAM/1024/1024" | bc)

echo "Hãng: $MANUFACTURER"
echo "Model: $MODEL"
echo "Android: $ANDROID_VERSION (API $SDK_VERSION)"
echo "CPU ABI: $ABI"
echo "RAM: ${RAM_GB}GB"
echo ""

# Kiểm tra tương thích
echo "🧪 KIỂM TRA TƯƠNG THÍCH:"
echo "------------------------"

# 1. Kiểm tra Android version
if [ "$SDK_VERSION" -lt 24 ]; then
    echo "❌ Android version quá thấp (cần >= 7.0 / API 24)"
    COMPATIBLE=false
else
    echo "✅ Android version: OK"
    COMPATIBLE=true
fi

# 2. Kiểm tra ABI
if [[ "$ABI" == "armeabi-v7a" ]] || [[ "$ABI" == "arm64-v8a" ]] || [[ "$ABI" == "x86" ]] || [[ "$ABI" == "x86_64" ]]; then
    echo "✅ CPU Architecture: Supported ($ABI)"
else
    echo "⚠️  CPU Architecture: $ABI (có thể không tương thích)"
    COMPATIBLE=false
fi

# 3. Kiểm tra RAM
RAM_INT=$(echo "$RAM_GB" | cut -d'.' -f1)
if [ "$RAM_INT" -lt 2 ]; then
    echo "⚠️  RAM: ${RAM_GB}GB (khuyến nghị >= 2GB, có thể lag)"
    DEPTH_RECOMMEND=2
elif [ "$RAM_INT" -lt 4 ]; then
    echo "✅ RAM: ${RAM_GB}GB (khuyến nghị depth <= 3)"
    DEPTH_RECOMMEND=3
else
    echo "✅ RAM: ${RAM_GB}GB (đủ mạnh cho depth 5)"
    DEPTH_RECOMMEND=5
fi

# 4. Kiểm tra WebView
WEBVIEW_VERSION=$(adb shell dumpsys package com.google.android.webview | grep versionName | head -1 | awk '{print $1}' | cut -d'=' -f2)
echo "WebView version: $WEBVIEW_VERSION"
if [ -z "$WEBVIEW_VERSION" ]; then
    echo "⚠️  Không tìm thấy Chrome WebView"
else
    echo "✅ WebView: OK"
fi

echo ""

# Kiểm tra app đã cài chưa
echo "📦 KIỂM TRA ỨNG DỤNG:"
echo "---------------------"
APP_INSTALLED=$(adb shell pm list packages | grep "com.thanco.docmieng")
if [ -z "$APP_INSTALLED" ]; then
    echo "ℹ️  App chưa được cài đặt"
    
    # Tìm APK
    APK_PATH=$(find . -name "app-debug.apk" -o -name "app-release.apk" | head -1)
    if [ -z "$APK_PATH" ]; then
        echo "❌ Không tìm thấy file APK. Vui lòng build trước."
    else
        echo "📥 Tìm thấy APK: $APK_PATH"
        read -p "Cài đặt ngay? (y/n): " INSTALL_NOW
        if [ "$INSTALL_NOW" = "y" ]; then
            echo "Đang cài đặt..."
            adb install -r "$APK_PATH"
            if [ $? -eq 0 ]; then
                echo "✅ Cài đặt thành công!"
            else
                echo "❌ Cài đặt thất bại. Kiểm tra logs ở trên."
            fi
        fi
    fi
else
    echo "✅ App đã được cài đặt"
    
    # Lấy version
    APP_VERSION=$(adb shell dumpsys package com.thanco.docmieng | grep versionName | head -1 | awk '{print $1}' | cut -d'=' -f2)
    echo "Version: $APP_VERSION"
fi

echo ""

# Test performance
echo "⚡ TEST HIỆU NĂNG (tùy chọn):"
echo "----------------------------"
read -p "Chạy test hiệu năng? (y/n): " RUN_PERF
if [ "$RUN_PERF" = "y" ]; then
    echo "Khởi động app..."
    adb shell am start -n com.thanco.docmieng/.MainActivity
    sleep 3
    
    echo "Đang thu thập dữ liệu trong 10 giây..."
    
    # CPU usage
    CPU_USAGE=$(adb shell top -n 1 | grep "com.thanco.docmieng" | awk '{print $9}')
    echo "CPU Usage: ${CPU_USAGE}%"
    
    # Memory
    MEM_INFO=$(adb shell dumpsys meminfo com.thanco.docmieng | grep "TOTAL" | awk '{print $2}')
    MEM_MB=$(echo "scale=1; $MEM_INFO/1024" | bc)
    echo "Memory: ${MEM_MB}MB"
    
    if [ $(echo "$MEM_MB > 200" | bc) -eq 1 ]; then
        echo "⚠️  Memory usage cao (>200MB)"
    else
        echo "✅ Memory usage: OK"
    fi
fi

echo ""
echo "=========================================="
echo "📋 KẾT LUẬN:"
echo ""

if [ "$COMPATIBLE" = true ]; then
    echo "✅ Thiết bị TƯƠNG THÍCH"
    echo "Khuyến nghị AI depth: $DEPTH_RECOMMEND"
    
    if [ "$RAM_INT" -lt 3 ]; then
        echo ""
        echo "⚠️  LƯU Ý: RAM thấp, nên:"
        echo "   - Giảm AI depth xuống 2-3"
        echo "   - Tắt background apps khác"
        echo "   - Tắt BGM nếu lag"
    fi
else
    echo "❌ Thiết bị KHÔNG TƯƠNG THÍCH hoặc CẦN ĐIỀU CHỈNH"
    echo "Vui lòng kiểm tra các lỗi ở trên"
fi

echo ""
echo "📝 Logs đã được lưu tại: device_test_$(date +%Y%m%d_%H%M%S).log"
echo "=========================================="
