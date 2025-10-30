---
title: Installation von intraRP
date: 30.10.2025
author: emergencyforge-team
---

Du willst intraRP auch für dein Projekt verwenden? Mit dieser Anleitung findest du heraus, welche Schritte dich zu einer anwendbaren Version von intraRP bringen.

::: warning
Große Teile des Setups können auch mittels einer fertigen Setup-Datei übersprüngen werden. Die Funktion der Setup-Datei befindet sich in der **BETA** und ist **experimentell** - es können Fehler auftreten.

Die Setup-Datei kann unter folgendem Link aufgerufen werden: [https://github.com/EmergencyForge/intraRP-Setup](https://github.com/EmergencyForge/intraRP-Setup){.external}
:::

## Voraussetzungen

Stelle sicher, dass alle [Systemanforderungen](#wiki:systemanforderungen) erfüllt sind, bevor du mit der Installation beginnst.

## Manuelle Installation

### 1. Repository klonen

Lade dir die neuste Version von GitHub herunter oder verbinde dich mit deinem Server und navigiere zum gewünschten Installationsverzeichnis:

```bash
cd /var/www/
git clone https://github.com/EmergencyForge/intraRP.git
cd intraRP
```

### 2. Konfiguration

Kopiere die Beispiel-Konfigurationsdatei und passe sie an:

```bash
cp .env.example .env
nano .env
```

Trage folgende Informationen ein:

- Datenbankverbindung (Host, Name, Benutzer, Passwort)
- Discord OAuth Credentials (Client ID, Client Secret)

**Beispiel `.env` Datei:**

```env
# Datenbank
DB_HOST=localhost
DB_NAME=intrarp
DB_USER=intrarp
DB_PASS=sicheres-passwort

# Discord OAuth
DISCORD_CLIENT_ID=deine-client-id
DISCORD_CLIENT_SECRET=dein-client-secret
```

In der Konfigurationsdatei unter `/assets/config/config.php` lassen sich weitere Anpassungen (wie z.B. Art der Institution, Stadtname, Systemname usw.) vornehmen.

### 3. Datenbank einrichten

Erstelle eine neue Datenbank und importiere die SQL-Struktur:

```bash
mysql -u root -p
```

In der MySQL-Console:

```sql
CREATE DATABASE intrarp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'intrarp'@'localhost' IDENTIFIED BY 'sicheres-passwort';
GRANT ALL PRIVILEGES ON intrarp.* TO 'intrarp'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Abhängigkeiten installieren

Installiere alle benötigten PHP-Abhängigkeiten mit Composer:

```bash
composer install --no-dev
```

::: info
Falls Composer nicht installiert ist, kannst du es mit folgendem Befehl installieren:

```bash
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
```

:::

### 5. Installation abschließen

Rufe deine Installation im Browser auf:

```
https://deine-domain.de
```

::: success
Geschafft! IntraRP ist nun installiert und einsatzbereit. Du kannst dich nun mit deinem Discord-Account einloggen.
:::

## Fehlerbehebung

### Fehler: "500 Internal Server Error"

**Mögliche Ursachen:**

- Falsche Dateiberechtigungen
- Fehler in der `.env` Datei
- PHP-Erweiterungen fehlen
- Composer wurde nicht oder nicht korrekt ausgeführt

### Fehler: "Database connection failed"

**Lösung:**

1. Prüfe die Datenbankverbindung in der `.env`
2. Stelle sicher, dass MySQL läuft: `systemctl status mysql`
3. Teste die Verbindung manuell: `mysql -u intrarp -p intrarp`

## Support

Bei Problemen:

- **GitHub Issues**: https://github.com/EmergencyForge/intraRP/issues
- **Discord**: https://discord.intrarp.de
- **Dokumentation**: https://emergencyforge.de/wiki.html
