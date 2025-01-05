// Contient les informations de configuration de l'application côté client
export const SERVER_CONFIG = {
    address: '192.168.43.110',
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