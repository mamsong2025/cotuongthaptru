@echo off
REM Script kiểm tra tương thích thiết bị Android cho Windows
REM Chạy: test-device-compatibility.bat

echo.
echo ========================================
echo    KIEM TRA TUONG THICH THIET BI ANDROID
echo ========================================
echo.

REM Kiểm tra ADB
where adb >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] ADB khong duoc cai dat. Vui long cai Android SDK Platform Tools.
    pause
    exit /b 1
)

REM Kiểm tra thiết bị kết nối
adb devices | find "device" >nul
if %errorlevel% neq 0 (
    echo [ERROR] Khong tim thay thiet bi Android.
    echo Vui long ket noi thiet bi va bat USB Debugging.
    pause
    exit /b 1
)

echo [OK] Tim thay thiet bi
echo.

REM Lấy thông tin thiết bị
echo ========================================
echo    THONG TIN THIET BI
echo ========================================
for /f "delims=" %%i in ('adb shell getprop ro.product.manufacturer') do set MANUFACTURER=%%i
for /f "delims=" %%i in ('adb shell getprop ro.product.model') do set MODEL=%%i
for /f "delims=" %%i in ('adb shell getprop ro.build.version.release') do set ANDROID_VERSION=%%i
for /f "delims=" %%i in ('adb shell getprop ro.build.version.sdk') do set SDK_VERSION=%%i
for /f "delims=" %%i in ('adb shell getprop ro.product.cpu.abi') do set ABI=%%i

echo Hang: %MANUFACTURER%
echo Model: %MODEL%
echo Android: %ANDROID_VERSION% (API %SDK_VERSION%)
echo CPU ABI: %ABI%
echo.

REM Kiểm tra tương thích
echo ========================================
echo    KIEM TRA TUONG THICH
echo ========================================

REM 1. Kiểm tra Android version
if %SDK_VERSION% LSS 24 (
    echo [ERROR] Android version qua thap (can ^>= 7.0 / API 24^)
    set COMPATIBLE=false
) else (
    echo [OK] Android version: OK
    set COMPATIBLE=true
)

REM 2. Kiểm tra ABI
if "%ABI%"=="armeabi-v7a" (
    echo [OK] CPU Architecture: Supported (32-bit ARM^)
) else if "%ABI%"=="arm64-v8a" (
    echo [OK] CPU Architecture: Supported (64-bit ARM^)
) else if "%ABI%"=="x86" (
    echo [OK] CPU Architecture: Supported (x86^)
) else if "%ABI%"=="x86_64" (
    echo [OK] CPU Architecture: Supported (x86_64^)
) else (
    echo [WARNING] CPU Architecture: %ABI% (co the khong tuong thich^)
    set COMPATIBLE=false
)

echo.

REM Kiểm tra app đã cài chưa
echo ========================================
echo    KIEM TRA UNG DUNG
echo ========================================
adb shell pm list packages | find "com.thanco.docmieng" >nul
if %errorlevel% neq 0 (
    echo [INFO] App chua duoc cai dat
    
    REM Tìm APK
    if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
        set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
        echo [INFO] Tim thay APK: !APK_PATH!
        
        set /p INSTALL_NOW="Cai dat ngay? (y/n): "
        if /i "!INSTALL_NOW!"=="y" (
            echo Dang cai dat...
            adb install -r "!APK_PATH!"
            if !errorlevel! equ 0 (
                echo [OK] Cai dat thanh cong!
            ) else (
                echo [ERROR] Cai dat that bai.
            )
        )
    ) else (
        echo [ERROR] Khong tim thay file APK. Vui long build truoc.
    )
) else (
    echo [OK] App da duoc cai dat
)

echo.

REM Test khởi động
echo ========================================
echo    TEST KHOI DONG
echo ========================================
set /p RUN_TEST="Khoi dong app de test? (y/n): "
if /i "%RUN_TEST%"=="y" (
    echo Dang khoi dong app...
    adb shell am start -n com.thanco.docmieng/.MainActivity
    timeout /t 3 >nul
    echo [OK] App da khoi dong
    echo.
    echo Kiem tra tren thiet bi xem app co hoat dong binh thuong khong.
    echo Neu gap loi, chay: adb logcat ^| findstr "AndroidRuntime ERROR"
)

echo.
echo ========================================
echo    KET LUAN
echo ========================================
if "%COMPATIBLE%"=="true" (
    echo [OK] THIET BI TUONG THICH
) else (
    echo [ERROR] THIET BI KHONG TUONG THICH hoac CAN DIEU CHINH
    echo Vui long kiem tra cac loi o tren
)

echo.
echo Xem chi tiet tai: DEVICE_COMPATIBILITY_CHECKLIST.md
echo ========================================
echo.
pause
