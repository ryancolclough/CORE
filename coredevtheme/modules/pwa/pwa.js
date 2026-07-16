export default function register(ctx){
  const {router, renderShell, pwa, toast} = ctx;

  router.register("pwa", () => {
    const status = pwa.status();
    const prefs = pwa.notificationPreferences();
    const installCopy = status.standalone ? "Installed" : status.installAvailable ? "Ready to install" : status.isIOS ? "Use Add to Home Screen" : "Install prompt not available yet";
    const notificationCopy = status.notificationPermission === "granted" ? "Enabled" : status.notificationPermission === "denied" ? "Blocked" : status.notificationPermission === "unsupported" ? "Unsupported" : "Not enabled";

    const content = `
      <div class="backline"><button data-route="settings">‹ Settings</button></div>
      <section class="hero"><div class="eyebrow">Application Foundation</div><h1>PWA & Notifications</h1><p>Install CORE as an app, keep the essential shell available offline, manage updates, and prepare device notifications for every governance module.</p><div class="rule"></div></section>

      <section class="panel">
        <div class="panel-head"><div><h2>Device Status</h2><p>Current browser and installation health.</p></div></div>
        <div class="pwa-status-grid">
          ${statusCard("Service Worker", status.registered ? "Active" : status.supported ? "Starting" : "Unsupported", status.registered ? "good" : "warn")}
          ${statusCard("Installation", installCopy, status.standalone ? "good" : "warn")}
          ${statusCard("Notifications", notificationCopy, status.notificationPermission === "granted" ? "good" : "warn")}
          ${statusCard("Connection", status.online ? "Online" : "Offline", status.online ? "good" : "warn")}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><h2>App Controls</h2><p>Install, test, and update CORE.</p></div></div>
        <div class="pwa-action-grid">
          ${action("Install CORE", status.standalone ? "CORE is already running in standalone app mode." : status.isIOS && !status.installAvailable ? "On iPhone or iPad, use Safari’s Share button and choose Add to Home Screen." : "Install CORE to your home screen or desktop.", "Install", "pwa-install", status.standalone)}
          ${action("Enable Notifications", status.isIOS && !status.standalone ? "Apple requires CORE to be installed on the Home Screen before notification permission can be requested." : "Allow meeting, task, compliance, document, and approval alerts.", "Enable", "pwa-enable-notifications", status.notificationPermission === "granted")}
          ${action("Test Notification", "Send a private test notification to this device.", "Send Test", "pwa-test-notification", status.notificationPermission !== "granted")}
          ${action(status.updateReady ? "Update Available" : "Check for Updates", status.updateReady ? "A newer CORE build is ready to activate." : "Ask the service worker to check GitHub Pages for a newer build.", status.updateReady ? "Update Now" : "Check", status.updateReady ? "pwa-apply-update" : "pwa-check-update", false)}
        </div>
        ${status.isIOS && !status.standalone ? `<div class="pwa-note"><strong>Install on iPhone:</strong><ol class="ios-install-steps"><li>Open CORE in Safari.</li><li>Tap the Share button.</li><li>Choose <em>Add to Home Screen</em>.</li><li>Open CORE from the new Home Screen icon.</li><li>Return here and enable notifications.</li></ol></div>` : ""}
      </section>

      <section class="panel">
        <div class="panel-head"><div><h2>Notification Preferences</h2><p>These preferences will be used by Committee Manager and future CORE modules.</p></div></div>
        <div class="notification-pref-list">
          ${pref("meetings","Meetings","Meeting reminders, agenda changes, and cancellations",prefs.meetings)}
          ${pref("tasks","Committee Tasks","Assignments, due dates, and overdue actions",prefs.tasks)}
          ${pref("compliance","Compliance","Review dates, filing deadlines, and detected changes",prefs.compliance)}
          ${pref("documents","Documents","New minutes, reports, and controlled-document updates",prefs.documents)}
          ${pref("approvals","Approvals","Motions, amendments, and items awaiting authorization",prefs.approvals)}
          ${pref("announcements","Announcements","General organization-wide notices",prefs.announcements)}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><h2>Remote Push Readiness</h2><p>Frontend foundation complete; sending infrastructure is the next layer.</p></div></div>
        <div class="pwa-note">CORE can now install, cache its application shell, request notification permission, and receive service-worker push events. Actual remote delivery requires a secure backend or push provider to store each device subscription and send notifications. Committee Manager will create the events that feed that service.</div>
      </section>`;

    renderShell(content,"settings");
  });

  document.addEventListener("change", event => {
    const input = event.target.closest("input[data-pwa-pref]");
    if(!input) return;
    const prefs = pwa.notificationPreferences();
    prefs[input.dataset.pwaPref] = input.checked;
    pwa.saveNotificationPreferences(prefs);
    toast("Notification preference saved.");
  });

  document.addEventListener("click", async event => {
    const button = event.target.closest("button[data-pwa-action]");
    if(!button) return;
    event.preventDefault();
    button.disabled = true;
    try{
      const action = button.dataset.pwaAction;
      if(action === "pwa-install"){
        const result = await pwa.promptInstall();
        if(result.outcome === "accepted" || result.outcome === "installed") toast("CORE installed successfully.");
        else if(result.outcome === "unavailable") toast(pwa.isIOS() ? "Use Safari Share → Add to Home Screen." : "Install prompt is not available yet.");
      }
      if(action === "pwa-enable-notifications"){
        const result = await pwa.requestNotifications();
        if(result === "granted") toast("Notifications enabled.");
        else if(result === "install-required") toast("Install CORE to the Home Screen first.");
        else toast("Notification permission was not granted.");
      }
      if(action === "pwa-test-notification"){
        const result = await pwa.testNotification();
        toast(result.ok ? "Test notification sent." : "Enable notifications first.");
      }
      if(action === "pwa-check-update"){
        await pwa.checkForUpdate();
        toast("Update check completed.");
      }
      if(action === "pwa-apply-update"){
        const applied = await pwa.applyUpdate();
        toast(applied ? "Applying CORE update…" : "No waiting update was found.");
      }
    }catch(error){
      console.error(error);
      toast("That PWA action could not be completed.");
    }finally{
      setTimeout(() => { button.disabled = false; router.go("pwa", {}, {replace:true}); }, 400);
    }
  });

  function statusCard(label,value,tone){return `<div class="pwa-status-card" data-tone="${tone}"><small>${label}</small><strong>${value}</strong></div>`;}
  function action(title,copy,label,id,disabled){return `<div class="pwa-action"><span><strong>${title}</strong><small>${copy}</small></span><button class="btn" data-pwa-action="${id}" ${disabled?"disabled":""}>${label}</button></div>`;}
  function pref(id,title,copy,checked){return `<label class="notification-pref"><span><strong>${title}</strong><small>${copy}</small></span><input type="checkbox" data-pwa-pref="${id}" ${checked?"checked":""}></label>`;}
}
