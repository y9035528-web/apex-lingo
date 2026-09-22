@echo off
echo ========================================================
echo   APEX LINGO - ANDROID APK BUILDER
echo ========================================================
echo.

where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java JDK is not detected in your PATH.
    echo Please install OpenJDK 17 or Android Studio.
    echo.
    echo Alternative options:
    echo 1. Open the 'android' folder in Android Studio and click 'Build APK'.
    echo 2. Push to GitHub to trigger the automated GitHub Actions APK builder.
    echo 3. Use PWABuilder (https://www.pwabuilder.com) to generate an instant APK.
    echo.
    pause
    exit /b 1
)

cd android
echo Building Apex Lingo APK via Gradle...
call gradlew.bat assembleDebug

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo   BUILD SUCCESSFUL!
    echo   APK Location:
    echo   android\app\build\outputs\apk\debug\app-debug.apk
    echo ========================================================
) else (
    echo.
    echo [ERROR] Build failed. Check the error log above.
)

pause
