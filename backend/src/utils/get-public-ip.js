import axios from 'axios';

let cachedPublicIP = null;
let ipFetchPromise = null;

/**
 * Get the server's public IP address
 * Useful for development when localhost IPs are rejected by APIs
 * @returns {Promise<string>} Public IP address
 */
export async function getPublicIP() {
  // Return cached IP if available
  if (cachedPublicIP) {
    return cachedPublicIP;
  }

  // If already fetching, return the same promise
  if (ipFetchPromise) {
    return ipFetchPromise;
  }

  // Fetch public IP from a reliable service
  ipFetchPromise = (async () => {
    try {
      // Try ipify.org first (fast and reliable)
      const response = await axios.get('https://api.ipify.org?format=json', {
        timeout: 3000, // Shorter timeout
      });
      
      if (response.data && response.data.ip) {
        cachedPublicIP = response.data.ip;
        console.log('✅ Fetched public IP for development:', cachedPublicIP);
        return cachedPublicIP;
      }
    } catch (error) {
      console.warn('⚠️  Failed to fetch IP from ipify.org:', error.message);
    }

    try {
      // Fallback to another service
      const response = await axios.get('https://api64.ipify.org?format=json', {
        timeout: 3000,
      });
      
      if (response.data && response.data.ip) {
        cachedPublicIP = response.data.ip;
        console.log('✅ Fetched public IP from fallback service:', cachedPublicIP);
        return cachedPublicIP;
      }
    } catch (error) {
      console.warn('⚠️  Failed to fetch public IP from fallback service:', error.message);
    }

    try {
      // Another fallback - httpbin.org
      const response = await axios.get('https://httpbin.org/ip', {
        timeout: 3000,
      });
      
      if (response.data && response.data.origin) {
        const ip = response.data.origin.split(',')[0].trim();
        cachedPublicIP = ip;
        console.log('✅ Fetched public IP from httpbin:', cachedPublicIP);
        return cachedPublicIP;
      }
    } catch (error) {
      console.warn('⚠️  Failed to fetch public IP from httpbin:', error.message);
    }

    // If all else fails, return null
    console.error('❌ Failed to fetch public IP from all services');
    return null;
  })();

  const result = await ipFetchPromise;
  ipFetchPromise = null; // Clear promise after completion
  return result;
}

/**
 * Get a valid IP address for API requests
 * Returns the provided IP if valid, otherwise fetches public IP
 * @param {string} userIP - User IP from request
 * @returns {Promise<string>} Valid IP address
 */
export async function getValidIPForAPI(userIP) {
  const isLocalhost = !userIP || 
                     userIP === '0.0.0.0' || 
                     userIP === '::1' || 
                     userIP === '127.0.0.1' || 
                     userIP.startsWith('::ffff:127.0.0.1');

  if (!isLocalhost) {
    return userIP;
  }

  // In development, try to use cached IP first (fast)
  if (cachedPublicIP) {
    return cachedPublicIP;
  }

  // If no cached IP, try to get it quickly with timeout
  if (process.env.NODE_ENV === 'development') {
    try {
      // Use Promise.race to timeout quickly if IP fetch is slow
      const ipPromise = getPublicIP();
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve(null), 2000); // 2 second timeout
      });
      
      const publicIP = await Promise.race([ipPromise, timeoutPromise]);
      if (publicIP) {
        return publicIP;
      }
      
      // If timeout, use a fallback IP that SideShift might accept
      // This is a public IP that should work for development
      console.warn('⚠️  IP fetch timed out, using fallback IP for development');
      return '8.8.8.8'; // Google DNS - a valid public IP
    } catch (error) {
      console.error('Error fetching public IP:', error.message);
      // Use fallback IP
      return '8.8.8.8';
    }
  }

  // If we can't get a valid IP, return null (caller should handle)
  return null;
}

