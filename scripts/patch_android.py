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
man.write_text(m)
print("AndroidManifest + variables.gradle patchés")
