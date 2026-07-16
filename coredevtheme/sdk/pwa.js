export class PWAService {
  constructor(storage, events){
    this.storage = storage;
    this.events = events;
    this.registration = null;
    this.deferredPrompt = null;
    this.updateReady = false;
    this.listenersBound = false;
  }

  async init(){
    if(this.listenersBound) return this.status();
    this.listenersBound = true;

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.events?.emit?.("pwa:install-available", {});
    });

    window.addEventListener("appinstalled", () => {
      this.deferredPrompt = null;
      this.storage.set("PWA_INSTALLED", true);
      this.events?.emit?.("pwa:installed", {});
    });

    if("serviceWorker" in navigator){
      try{
        this.registration = await navigator.serviceWorker.register("./service-worker.js", {scope:"./"});
        await navigator.serviceWorker.ready;
        this.watchRegistration(this.registration);
      }catch(error){
        console.error("CORE PWA registration failed", error);
        this.storage.set("PWA_LAST_ERROR", error.message || String(error));
      }
    }

    return this.status();
  }

  watchRegistration(registration){
    if(registration.waiting){
      this.updateReady = true;
      this.events?.emit?.("pwa:update-ready", {});
    }

    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if(!worker) return;
      worker.addEventListener("statechange", () => {
        if(worker.state === "installed" && navigator.serviceWorker.controller){
          this.updateReady = true;
          this.events?.emit?.("pwa:update-ready", {});
        }
      });
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if(this.storage.get("PWA_RELOAD_ON_UPDATE", false)){
        this.storage.set("PWA_RELOAD_ON_UPDATE", false);
        window.location.reload();
      }
    });
  }

  isStandalone(){
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  isIOS(){
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }

  canInstall(){
    return Boolean(this.deferredPrompt) && !this.isStandalone();
  }

  async promptInstall(){
    if(this.isStandalone()) return {outcome:"installed"};
    if(!this.deferredPrompt) return {outcome:"unavailable"};
    this.deferredPrompt.prompt();
    const result = await this.deferredPrompt.userChoice;
    if(result.outcome === "accepted") this.storage.set("PWA_INSTALLED", true);
    this.deferredPrompt = null;
    return result;
  }

  notificationPermission(){
    return "Notification" in window ? Notification.permission : "unsupported";
  }

  async requestNotifications(){
    if(!("Notification" in window)) return "unsupported";
    if(this.isIOS() && !this.isStandalone()) return "install-required";
    const permission = await Notification.requestPermission();
    this.storage.set("PWA_NOTIFICATION_PERMISSION", permission);
    return permission;
  }

  notificationPreferences(){
    return this.storage.get("PWA_NOTIFICATION_PREFS", {
      meetings:true,
      tasks:true,
      compliance:true,
      documents:true,
      approvals:true,
      announcements:false
    });
  }

  saveNotificationPreferences(value){
    this.storage.set("PWA_NOTIFICATION_PREFS", value);
    return value;
  }

  async testNotification(){
    const permission = this.notificationPermission();
    if(permission !== "granted") return {ok:false, reason:permission};
    const options = {
      body:"CORE notifications are enabled on this device.",
      icon:"assets/icons/core-192.png",
      badge:"assets/icons/core-192.png",
      tag:"core-test-notification",
      data:{url:"./#/pwa"}
    };
    if(this.registration?.showNotification){
      await this.registration.showNotification("CORE Notification Test", options);
    }else{
      new Notification("CORE Notification Test", options);
    }
    return {ok:true};
  }

  async applyUpdate(){
    const worker = this.registration?.waiting;
    if(!worker) return false;
    this.storage.set("PWA_RELOAD_ON_UPDATE", true);
    worker.postMessage({type:"SKIP_WAITING"});
    return true;
  }

  async checkForUpdate(){
    if(!this.registration) return false;
    await this.registration.update();
    return true;
  }

  status(){
    const online = navigator.onLine;
    return {
      supported:"serviceWorker" in navigator,
      registered:Boolean(this.registration),
      standalone:this.isStandalone(),
      installAvailable:this.canInstall(),
      isIOS:this.isIOS(),
      notificationSupported:"Notification" in window,
      notificationPermission:this.notificationPermission(),
      updateReady:this.updateReady,
      online,
      lastError:this.storage.get("PWA_LAST_ERROR", "")
    };
  }
}
