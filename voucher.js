// V0.1 initialer release
// V0.2 Fixed Login/Logout, THX to liv-in-sky. Changed Log output
// V0.3 moved logout, THX to liv-in-sky.
// V0.4 added awtrix sendto

const Unifi = require('node-unifi');

// Konfiguration
const config = {
    hostname: "192.168.2.1",
    port: '443', // 443 UDM Pro, 8443 für andere Controller
    username: 'User',
    password: 'Password!',
    sslverify: false
    awtrix: {
        enabled: true, // Schaltet die Benachrichtigungen für awtrix ein/aus
        repeat: 5,
        duration: 30,
        rainbow: true,
        stack: true,
        wakeup: true,
        hold: false
    }
};

// Erstelle die benötigten Datenpunkte für die Voucher-Konfiguration
createState("0_userdata.0.Unifi.Voucher.config.minutes", 123, { type: 'number', name: 'minutes', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.config.count", 1, { type: 'number', name: 'count', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.config.quota", 0, { type: 'number', name: 'quota', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.config.note", "testthis", { type: 'string', name: 'note', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.config.up", null, { type: 'number', name: 'up', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.config.down", null, { type: 'number', name: 'down', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.config.megabytes", null, { type: 'number', name: 'megabytes', read: true, write: true });

// Erstelle die benötigten Datenpunkte für die Voucher-Daten
createState("0_userdata.0.Unifi.Voucher.data.latestJson", "{}", { type: 'string', name: 'latestJson', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.data.code", "", { type: 'string', name: 'code', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.data.duration", 0, { type: 'number', name: 'duration', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.data.qos_overwrite", false, { type: 'boolean', name: 'qos_overwrite', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.data.note", "", { type: 'string', name: 'note', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.data.for_hotspot", false, { type: 'boolean', name: 'for_hotspot', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.data.create_time", 0, { type: 'number', name: 'create_time', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.data.quota", 0, { type: 'number', name: 'quota', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.data.site_id", "", { type: 'string', name: 'site_id', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.data.admin_name", "", { type: 'string', name: 'admin_name', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.data.used", 0, { type: 'number', name: 'used', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.data.status", "", { type: 'string', name: 'status', read: true, write: true });
createState("0_userdata.0.Unifi.Voucher.data.status_expires", 0, { type: 'number', name: 'status_expires', read: true, write: true });

// Erstelle den Datenpunkt für den Trigger
createState("0_userdata.0.Unifi.Voucher.trigger", false, { type: 'boolean', name: 'trigger', read: true, write: true });

let lastVoucherCreateTime = 0; // Speichert die create_time des letzten erstellten Vouchers

// Reagiere auf Änderungen des Datenpunkts "trigger"
on({ id: '0_userdata.0.Unifi.Voucher.trigger', change: 'ne', val: true }, async (obj) => {
    console.debug('Trigger-Datenpunkt geändert: ' + obj.state.val);

    console.debug('Versuche, mich bei UniFi anzumelden...');
    const unifi = new Unifi.Controller({ hostname: config.hostname, port: config.port, sslverify: config.sslverify });

    await unifi.login(config.username, config.password)
        .then(loginData => {
            console.debug('Login erfolgreich: ' + JSON.stringify(loginData));
        })
        .catch(error => {
            console.error('ERROR: ' + error);
        });

    try {
        // Lese die Konfigurationswerte aus den Datenpunkten
        const minutes = getState("0_userdata.0.Unifi.Voucher.config.minutes").val;
        const count = getState("0_userdata.0.Unifi.Voucher.config.count").val;
        const quota = getState("0_userdata.0.Unifi.Voucher.config.quota").val;
        const note = getState("0_userdata.0.Unifi.Voucher.config.note").val;
        const up = getState("0_userdata.0.Unifi.Voucher.config.up").val;
        const down = getState("0_userdata.0.Unifi.Voucher.config.down").val;
        const megabytes = getState("0_userdata.0.Unifi.Voucher.config.megabytes").val;

        // Erzeuge einen neuen Voucher
        console.debug('Trigger aktiviert, erstelle neuen Voucher...');
        const clientVoucher = await unifi.createVouchers(
            minutes,
            count,
            quota,
            note,
            up,
            down,
            megabytes
        ).catch(async error => {
            console.debug('Fehler beim Anlegen: ' + error);
            console.debug('Logout bei UniFi...');
            await unifi.logout().then(() => {
                console.debug('Logout erfolgreich.');
            }).catch(error => {
                console.error('Fehler beim Logout: ' + error);
            });
            setState('0_userdata.0.Unifi.Voucher.trigger', false);
        });

        console.debug('Voucher erstellt: ' + JSON.stringify(clientVoucher));

        // Erfasse die create_time des erstellten Vouchers
        const newVoucherCreateTime = clientVoucher[0].create_time;

        // Hole nur den neuesten Voucher basierend auf create_time
        console.debug('Hole den neuesten Voucher...');
        const myVoucher = await unifi.getVouchers(newVoucherCreateTime);
        console.debug("Neuester Voucher: " + JSON.stringify(myVoucher));

        console.debug('Logout bei UniFi...');
        await unifi.logout().then(() => {
            console.debug('Logout erfolgreich.');
        }).catch(error => {
            console.error('Fehler beim Logout: ' + error);
        });

        // Schreibe die Voucher-Daten in den Datenpunkt "latestJson"
        console.debug('Schreibe Voucher-Daten in den Datenpunkt "latestJson"...');
        setState('0_userdata.0.Unifi.Voucher.data.latestJson', JSON.stringify(myVoucher));

        // Extrahiere die Werte aus dem Voucher-Objekt und setze die Datenpunkte
        const voucher = myVoucher[0];
        setState('0_userdata.0.Unifi.Voucher.data.code', voucher.code);
        setState('0_userdata.0.Unifi.Voucher.data.duration', voucher.duration);
        setState('0_userdata.0.Unifi.Voucher.data.qos_overwrite', voucher.qos_overwrite);
        setState('0_userdata.0.Unifi.Voucher.data.note', voucher.note);
        setState('0_userdata.0.Unifi.Voucher.data.for_hotspot', voucher.for_hotspot);
        setState('0_userdata.0.Unifi.Voucher.data.create_time', voucher.create_time);
        setState('0_userdata.0.Unifi.Voucher.data.quota', voucher.quota);
        setState('0_userdata.0.Unifi.Voucher.data.site_id', voucher.site_id);
        setState('0_userdata.0.Unifi.Voucher.data.admin_name', voucher.admin_name);
        setState('0_userdata.0.Unifi.Voucher.data.used', voucher.used);
        setState('0_userdata.0.Unifi.Voucher.data.status', voucher.status);
        setState('0_userdata.0.Unifi.Voucher.data.status_expires', voucher.status_expires);

        // Sende die Benachrichtigung mit dem Voucher-Code, falls aktiviert
        if (config.awtrix.enabled) {
            sendTo('awtrix-light', 'notification', {
                text: `Wifi Code: ${voucher.code}`,
                sound: null,
                icon: null,
                repeat: parseInt(config.awtrix.repeat),
                duration: parseInt(config.awtrix.duration),
                rainbow: config.awtrix.rainbow,
                stack: config.awtrix.stack,
                wakeup: config.awtrix.wakeup,
                hold: config.awtrix.hold
            });
        }

        // Setze den Trigger wieder auf false
        console.debug('Setze den Trigger wieder auf false...');
        setState('0_userdata.0.Unifi.Voucher.trigger', false);
    } catch (error) {
        console.error('ERROR: ' + error);
    }
});
