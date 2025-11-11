import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Find and kill process using a specific port (Windows)
 */
export async function killProcessOnPort(port) {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port} | findstr LISTENING`);
    
    if (!stdout.trim()) {
      return { killed: false, message: `Port ${port} is free` };
    }

    // Extract PID from output
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        pids.add(pid);
      }
    }

    // Kill all processes
    const killedPids = [];
    for (const pid of pids) {
      try {
        await execAsync(`taskkill /F /PID ${pid}`);
        killedPids.push(pid);
        console.log(`✅ Killed process ${pid} on port ${port}`);
      } catch (error) {
        if (!error.message.includes('not found')) {
          console.warn(`⚠️  Could not kill process ${pid}:`, error.message);
        }
      }
    }
    
    // Wait for port to be released
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { 
      killed: killedPids.length > 0, 
      pids: killedPids,
      message: `Killed ${killedPids.length} process(es) on port ${port}`
    };
  } catch (error) {
    if (error.code === 1 || error.message.includes('findstr')) {
      return { killed: false, message: `Port ${port} is free` };
    }
    throw error;
  }
}

/**
 * Check if a port is available
 */
export async function isPortAvailable(port) {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port} | findstr LISTENING`);
    return !stdout.trim();
  } catch (error) {
    if (error.code === 1 || error.message.includes('findstr')) {
      return true; // Port is free
    }
    throw error;
  }
}

/**
 * Find the next available port starting from a base port
 */
export async function findAvailablePort(startPort = 3001, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  throw new Error(`No available port found in range ${startPort}-${startPort + maxAttempts - 1}`);
}


