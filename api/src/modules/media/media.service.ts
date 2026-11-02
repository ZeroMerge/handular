export class MediaService {
  /**
   * Transforms an image URL to Cloudinary auto-AVIF format
   * Formula: f_avif,q_auto:good,w_1200
   */
  formatAvifUrl(url: string, width = 1200): string {
    if (!url) return '';
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    // If already a Cloudinary URL, inject AVIF transformation
    if (url.includes('res.cloudinary.com')) {
      return url.replace('/upload/', `/upload/f_avif,q_auto:good,w_${width}/`);
    }

    // If Cloudinary is configured, proxy remote image through fetch URL
    if (cloudName && !cloudName.includes('placeholder')) {
      return `https://res.cloudinary.com/${cloudName}/image/fetch/f_avif,q_auto:good,w_${width}/${encodeURIComponent(url)}`;
    }

    // Unsplash or other CDNs: append modern format parameters
    if (url.includes('images.unsplash.com')) {
      return `${url.split('?')[0]}?auto=format&fit=crop&w=${width}&q=80&fm=avif`;
    }

    return url;
  }
}

export const mediaService = new MediaService();
