export class Router {
  constructor(){
    this.routes = new Map();
    this.current = null;
    this.started = false;
    window.addEventListener("popstate", event => {
      const route = event.state?.route || this.routeFromLocation();
      const params = event.state?.params || {};
      this.go(route, params, { history:false, source:"popstate" });
    });
  }
  register(id, handler){ this.routes.set(id, handler); }
  routeFromLocation(){
    const hash = window.location.hash.replace(/^#\/?/, "");
    return hash.split("?")[0] || "dashboard";
  }
  go(id, params={}, options={}){
    const handler = this.routes.get(id);
    if(!handler) throw new Error(`Route not registered: ${id}`);
    const historyEnabled = options.history !== false;
    const replace = options.replace === true || !this.started;
    this.current = { id, params };
    handler(params);
    document.documentElement.dataset.route = id;
    if(historyEnabled){
      const method = replace ? "replaceState" : "pushState";
      window.history[method]({ route:id, params }, "", `#/${id}`);
    }
    this.started = true;
    window.scrollTo({ top:0, behavior: options.source === "popstate" ? "auto" : "smooth" });
  }
  start(fallback="dashboard"){
    const requested = this.routeFromLocation();
    this.go(this.routes.has(requested) ? requested : fallback, {}, { replace:true });
  }
}
