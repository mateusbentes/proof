const axios = require('axios');

class LoadBalancerService {
  constructor() {
    this.servers = [];
    this.currentIndex = 0;
    this.healthCheckInterval = 30000; // 30 seconds
    this.healthCheckTimer = null;
  }

  async initialize(serverList = []) {
    try {
      // Parse server list from environment or parameter
      const servers = serverList.length > 0
        ? serverList
        : (process.env.LOAD_BALANCER_SERVERS || '').split(',').filter(s => s.trim());

      if (servers.length === 0) {
        console.warn('No servers configured for load balancing');
        return;
      }

      this.servers = servers.map((server) => ({
        url: server.trim(),
        healthy: true,
        requestCount: 0,
        responseTime: 0,
        lastHealthCheck: null,
      }));

      // Start health checks
      this.startHealthChecks();
      console.log(`✓ Load balancer initialized with ${this.servers.length} servers`);
    } catch (error) {
      console.warn('Failed to initialize load balancer:', error.message);
    }
  }

  getNextServer() {
    if (this.servers.length === 0) {
      return null;
    }

    // Get healthy servers
    const healthyServers = this.servers.filter(s => s.healthy);

    if (healthyServers.length === 0) {
      console.warn('No healthy servers available');
      return null;
    }

    // Round-robin selection
    const server = healthyServers[this.currentIndex % healthyServers.length];
    this.currentIndex += 1;

    return server;
  }

  getServerByLeastConnections() {
    if (this.servers.length === 0) {
      return null;
    }

    const healthyServers = this.servers.filter(s => s.healthy);

    if (healthyServers.length === 0) {
      return null;
    }

    // Return server with least requests
    return healthyServers.reduce((prev, current) =>
      prev.requestCount < current.requestCount ? prev : current
    );
  }

  getServerByResponseTime() {
    if (this.servers.length === 0) {
      return null;
    }

    const healthyServers = this.servers.filter(s => s.healthy);

    if (healthyServers.length === 0) {
      return null;
    }

    // Return server with best response time
    return healthyServers.reduce((prev, current) =>
      prev.responseTime < current.responseTime ? prev : current
    );
  }

  async recordRequest(server, responseTime) {
    if (!server) return;

    server.requestCount += 1;
    server.responseTime = (server.responseTime + responseTime) / 2; // Moving average
  }

  async checkServerHealth(server) {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${server.url}/health`, {
        timeout: 5000,
      });

      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        server.healthy = true;
        server.responseTime = responseTime;
        server.lastHealthCheck = new Date();
        return true;
      }

      server.healthy = false;
      return false;
    } catch (error) {
      server.healthy = false;
      server.lastHealthCheck = new Date();
      return false;
    }
  }

  startHealthChecks() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(async () => {
      for (const server of this.servers) {
        await this.checkServerHealth(server);
      }

      const healthyCount = this.servers.filter(s => s.healthy).length;
      console.log(`Health check: ${healthyCount}/${this.servers.length} servers healthy`);
    }, this.healthCheckInterval);
  }

  stopHealthChecks() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  getStats() {
    return {
      totalServers: this.servers.length,
      healthyServers: this.servers.filter(s => s.healthy).length,
      servers: this.servers.map(s => ({
        url: s.url,
        healthy: s.healthy,
        requestCount: s.requestCount,
        avgResponseTime: Math.round(s.responseTime),
        lastHealthCheck: s.lastHealthCheck,
      })),
    };
  }

  isEnabled() {
    return this.servers.length > 0;
  }
}

module.exports = new LoadBalancerService();
