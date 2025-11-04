---
title: Registrierungsmodus-Konfiguration
date: 04.11.2025
author: emergencyforge-team
---
## Übersicht

Das intraRP-System unterstützt drei verschiedene Registrierungsmodi, die über die Konfigurationsvariable `REGISTRATION_MODE` in `/assets/config/config.php` gesteuert werden.

## Verfügbare Modi

### 1. Open (Offen)

```php
define('REGISTRATION_MODE', 'open');
```

- **Verhalten**: Registrierung ist für jeden möglich
- **Verwendung**: Standard-Modus für offene Systeme
- Neue Benutzer werden automatisch mit der Standard-Rolle erstellt

### 2. Code (Mit Einladungscode)

```php
define('REGISTRATION_MODE', 'code');
```

- **Verhalten**: Registrierung nur mit gültigem Einladungscode möglich
- **Verwendung**: Für geschlossene Gruppen mit kontrolliertem Zugang
- Administratoren können Codes über die Benutzerverwaltung generieren
- Jeder Code kann nur einmal verwendet werden

### 3. Closed (Geschlossen)

```php
define('REGISTRATION_MODE', 'closed');
```

- **Verhalten**: Keine Registrierung für neue Benutzer möglich
- **Verwendung**: Für vollständig geschlossene Systeme
- Nur bestehende Benutzer können sich einloggen

## Registrierungscodes verwalten

### Zugriff

Benutzer mit den Berechtigungen `admin` oder `users.manage` können Registrierungscodes verwalten unter:

```
/benutzer/registration-codes.php
```

### Funktionen

- **Code generieren**: Erstellt einen neuen 16-stelligen Einladungscode
- **Code löschen**: Löscht unbenutzte Codes
- **Übersicht**: Zeigt alle Codes mit Status (verfügbar/verwendet)

## Hinweise

- Der erste Benutzer wird immer als Admin erstellt (unabhängig vom Modus)
- Änderungen an `REGISTRATION_MODE` erfordern keine Neustarts
- Codes sind einmalig verwendbar
- Verwendete Codes werden zur Historie gespeichert
