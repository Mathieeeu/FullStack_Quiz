// Contient les informations de configuration de l'application côté client
export const SERVER_CONFIG = {
    address: '127.0.0.1',
    port: 3000,
    get baseUrl() {
      return `http://${this.address}:${this.port}/api`;
    },
    get userUrl() {
      return `${this.baseUrl}/user`;
    },
    get gameUrl() {
      return `${this.baseUrl}/game`;
    },
    get assetsUrl() {
      return `${this.baseUrl}/assets`;
    }
};