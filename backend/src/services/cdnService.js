const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class CDNService {
  constructor() {
    this.cdnUrl = process.env.CDN_URL || 'https://cdn.proof.local';
    this.cdnApiKey = process.env.CDN_API_KEY;
    this.cdnProvider = process.env.CDN_PROVIDER || 'cloudflare'; // cloudflare, aws, bunny
    this.client = null;
  }

  async initialize() {
    if (!this.cdnApiKey) {
      console.warn('CDN API key not configured. CDN disabled.');
      return;
    }

    try {
      this.client = axios.create({
        baseURL: this.cdnUrl,
        headers: {
          'Authorization': `Bearer ${this.cdnApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`✓ CDN service initialized (${this.cdnProvider})`);
    } catch (error) {
      console.warn('Failed to initialize CDN:', error.message);
    }
  }

  async uploadFile(filePath, fileName, fileType = 'image') {
    if (!this.client) {
      console.warn('CDN not initialized');
      return null;
    }

    try {
      const fileContent = await fs.readFile(filePath);
      const formData = new FormData();
      formData.append('file', new Blob([fileContent]), fileName);
      formData.append('type', fileType);

      const response = await this.client.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        url: response.data.url,
        cdnUrl: `${this.cdnUrl}/${response.data.path}`,
        path: response.data.path,
      };
    } catch (error) {
      console.error('Failed to upload file to CDN:', error.message);
      return null;
    }
  }

  async deleteFile(filePath) {
    if (!this.client) {
      console.warn('CDN not initialized');
      return false;
    }

    try {
      await this.client.delete(`/files/${filePath}`);
      return true;
    } catch (error) {
      console.error('Failed to delete file from CDN:', error.message);
      return false;
    }
  }

  async purgeCache(paths = []) {
    if (!this.client) {
      console.warn('CDN not initialized');
      return false;
    }

    try {
      await this.client.post('/purge', {
        paths: paths.length > 0 ? paths : ['/*'],
      });

      return true;
    } catch (error) {
      console.error('Failed to purge CDN cache:', error.message);
      return false;
    }
  }

  async getStats() {
    if (!this.client) {
      console.warn('CDN not initialized');
      return null;
    }

    try {
      const response = await this.client.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to get CDN stats:', error.message);
      return null;
    }
  }

  async optimizeImage(imageUrl, options = {}) {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'webp',
    } = options;

    if (!this.cdnUrl) {
      return imageUrl;
    }

    // Construct CDN image optimization URL
    const params = new URLSearchParams({
      w: width,
      h: height,
      q: quality,
      f: format,
    });

    return `${this.cdnUrl}/image?url=${encodeURIComponent(imageUrl)}&${params.toString()}`;
  }

  getCDNUrl(filePath) {
    if (!filePath) return null;
    return `${this.cdnUrl}/${filePath}`;
  }

  isEnabled() {
    return this.client !== null;
  }
}

module.exports = new CDNService();
