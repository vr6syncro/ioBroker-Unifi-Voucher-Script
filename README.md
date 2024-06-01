# UniFi Voucher Erstellung Script

Dieses Skript erstellt UniFi Vouchers basierend auf Konfigurations- und Trigger-Datenpunkten. Es verwendet das `node-unifi` Modul, um sich mit einem UniFi-Controller zu verbinden und Vouchers zu erstellen.

## Voraussetzungen

- `node-unifi` Paket installiert im Javascript Adapter
- UniFi Controller mit API-Zugriff sowie ein Wifi Operator Account

## Installation

- Kopiere das Script und füge es in ein Javascript in deinem Adapter ein.
- Ändere die Konfigurationsdatei sowie bei bedarf die Datenpunkte.

## Konfiguration

Bearbeite die Konfigurationsparameter im Skript:

```javascript
const config = {
    hostname: "192.168.2.1", // IP Adresse des Controllers
    port: '443', // 443 für UDM Pro, 8443 für andere Controller
    username: 'User',
    password: 'Password',
    sslverify: false
};

// Konfigurationsdatenpunkte
0_userdata.0.Unifi.Voucher.config.minutes (number): Anzahl der Minuten für den Voucher.
0_userdata.0.Unifi.Voucher.config.count (number): Anzahl der zu erstellenden Vouchers.
0_userdata.0.Unifi.Voucher.config.quota (number): Quota für den Voucher.
0_userdata.0.Unifi.Voucher.config.note (string): Notiz für den Voucher.
0_userdata.0.Unifi.Voucher.config.up (number, optional): Upload-Geschwindigkeit in kbps.
0_userdata.0.Unifi.Voucher.config.down (number, optional): Download-Geschwindigkeit in kbps.
0_userdata.0.Unifi.Voucher.config.megabytes (number, optional): Datenvolumen in MB.

// Voucherdatenpunkte
0_userdata.0.Unifi.Voucher.data.latestJson (string): JSON-Daten des neuesten Vouchers.
0_userdata.0.Unifi.Voucher.data.code (string): Voucher-Code.
0_userdata.0.Unifi.Voucher.data.duration (number): Dauer des Vouchers in Minuten.
0_userdata.0.Unifi.Voucher.data.qos_overwrite (boolean): QoS-Überschreibung.
0_userdata.0.Unifi.Voucher.data.note (string): Notiz des Vouchers.
0_userdata.0.Unifi.Voucher.data.for_hotspot (boolean): Für Hotspot verwendet.
0_userdata.0.Unifi.Voucher.data.create_time (number): Erstellungszeit des Vouchers.
0_userdata.0.Unifi.Voucher.data.quota (number): Quota des Vouchers.
0_userdata.0.Unifi.Voucher.data.site_id (string): Site-ID des Vouchers.
0_userdata.0.Unifi.Voucher.data.admin_name (string): Admin-Name des Vouchers.
0_userdata.0.Unifi.Voucher.data.used (number): Anzahl der verwendeten Vouchers.
0_userdata.0.Unifi.Voucher.data.status (string): Status des Vouchers.
0_userdata.0.Unifi.Voucher.data.status_expires (number): Ablaufzeit des Status.

// Trigger
0_userdata.0.Unifi.Voucher.trigger (boolean): Trigger zur Erstellung eines neuen Vouchers.

```

## Verwendung

Stelle sicher, dass die Konfigurationsdatenpunkte entsprechend deinen Anforderungen gesetzt sind.
Setze den Trigger-Datenpunkt 0_userdata.0.Unifi.Voucher.trigger auf true, um einen neuen Voucher zu erstellen.

## Fehlerbehandlung

Fehler und Debugging-Informationen werden in der Konsole ausgegeben. Überprüfe die Konsolenausgabe für detaillierte Fehlermeldungen und Debug-Informationen.
Es wirden standartmäßig nur Error Meldungen in den Log geschrieben. Für weitere Meldungen bitte das Script/Adapter auf debug stellen.
