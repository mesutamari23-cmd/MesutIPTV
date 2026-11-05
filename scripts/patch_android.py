#!/usr/bin/env python3
"""Adapte le projet Android généré par `npx cap add android` :
Android 10+ (minSdk 29), HTTP en clair (flux IPTV), support Android TV / TV Box."""
import re, pathlib, sys

root = pathlib.Path("android")
man = root / "app/src/main/AndroidManifest.xml"
var = root / "variables.gradle"
if not man.exists() or not var.exists():
    sys.exit("android/ introuvable : lancez d'abord `npx cap add android`")

v = var.read_text()
v = re.sub(r"minSdkVersion\s*=\s*\d+", "minSdkVersion = 29", v)
var.write_text(v)

m = man.read_text()
if "usesCleartextTraffic" not in m:
    m = m.replace("<application", '<application\n        android:usesCleartextTraffic="true"', 1)
if "android.software.leanback" not in m:
    feats = (
        '    <uses-feature android:name="android.software.leanback" android:required="false" />\n'
        '    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />\n'
    )
    m = m.replace("<application", feats + "    <application", 1)
if "LEANBACK_LAUNCHER" not in m:
    m = m.replace(
        '<category android:name="android.intent.category.LAUNCHER" />',
        '<category android:name="android.intent.category.LAUNCHER" />\n'
        '                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />',
        1,
    )
if "WAKE_LOCK" not in m:
    m = m.replace("</manifest>", '    <uses-permission android:name="android.permission.WAKE_LOCK" />\n</manifest>')
if "PlayerActivity" not in m:
    act = (
        '        <activity android:name=".PlayerActivity" android:exported="false"\n'
        '            android:screenOrientation="sensorLandscape"\n'
        '            android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout|uiMode"\n'
        '            android:theme="@style/AppTheme.NoActionBar" />\n'
    )
    m = m.replace("</application>", act + "    </application>", 1)
man.write_text(m)

# Lecteur natif Media3 : dépendances + sources Java
import shutil
gradle = root / "app/build.gradle"
g = gradle.read_text()
if "media3-exoplayer" not in g:
    deps = ("dependencies {\n"
            '    implementation "androidx.media3:media3-exoplayer:1.5.1"\n'
            '    implementation "androidx.media3:media3-exoplayer-hls:1.5.1"\n'
            '    implementation "androidx.media3:media3-ui:1.5.1"\n'
            '    implementation "androidx.media3:media3-datasource:1.5.1"\n')
    g = g.replace("dependencies {\n", deps, 1)
    gradle.write_text(g)
dest = root / "app/src/main/java/com/mesut/iptv"
dest.mkdir(parents=True, exist_ok=True)
for f in pathlib.Path("native/java/com/mesut/iptv").glob("*.java"):
    shutil.copy(f, dest / f.name)
print("AndroidManifest + variables.gradle + lecteur Media3 patchés")
