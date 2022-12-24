export class EpConfig {
    public static getControllerUrl(controllerName: string, actionName?: string) {
        return this.getApiUrl() + '/' + controllerName + (actionName ? '/' + actionName : '');
    }
    public static getApiUrl() {
        return this.getServerUrl();
    }
    public static getServerUrl() {
        return ''; //environment url
        // you can also import your environments file here
    }
}
