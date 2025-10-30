---
title: Discord-Applikation erstellen
date: 30.10.2025
author: emergencyforge-team
---

Für die neuesten Versionen wird Discord als Methode zur Benutzer-Authentifizierung verwendet. Hierfür wird eine Applikation mit einer bestimmten Konfiguration benötigt.

## Discord-Applikation erstellen und konfigurieren

### 1. Neue Applikation erstellen

Öffne das [Discord Developers Portal](https://discord.com/developers/applications){.external}, klicke auf „New Application" und gib den gewünschten Namen deiner Applikation ein.

### 2. OAuth2 konfigurieren

Klicke links in der Auswahl auf den Tab „OAuth2", kopiere die Client-ID und lasse dir einen neuen Client-Secret (über die Funktion „Reset Secret") generieren.

Füge diese entsprechend in deine `.env` Datei an der entsprechenden Stelle ein:

```env
DISCORD_CLIENT_ID=deine-client-id
DISCORD_CLIENT_SECRET=dein-client-secret
```

### 3. Redirect URL einrichten

Auf derselben Seite unter „Redirects" musst du die Callback-URL deiner Seite hinterlegen. Gib hierfür die URL deiner Seite mit `http://` bzw. `https://` und dem Pfad `/auth/callback.php` an.

**Beispiel:** `https://intrarp.de/auth/callback.php`

::: error
Diese Schritte sind zwingend erforderlich. Ohne Discord-Applikation ist kein Login in das System möglich.
:::

## Nächste Schritte

Jetzt kannst du mit dem weiteren Setup von intraRP fortfahren. Prüfe die [Systemanforderungen](#wiki:systemanforderungen) und folge der [Installationsanleitung](#wiki:installation).

## Häufige Probleme

### Fehler: "Invalid OAuth2 redirect_uri"

Stelle sicher, dass die Redirect-URL exakt mit der eingetragenen URL übereinstimmt:

- Protokoll muss stimmen (http vs. https)
- Keine zusätzlichen Slashes
- Pfad muss exakt sein

### Client Secret funktioniert nicht

Falls du einen Fehler beim Login erhältst:

1. Generiere ein neues Client Secret im Discord Developer Portal
2. Aktualisiere die `.env` Datei
3. Versuche es erneut
