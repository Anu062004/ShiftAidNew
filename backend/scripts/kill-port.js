import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function killPort(port) {
  try {
    // Find process using the port
    let stdout = '';
    try {
      const result = await execAsync(`netstat -ano | findstr :${port} | findstr LISTENING`);
      stdout = result.stdout || '';
    } catch (error) {
      // No process found - port is free
      if (error.code === 1 || error.message.includes('findstr')) {
        console.log(`✅ Port ${port} is free`);
        return;
      }
      throw error;
    }
    
    if (!stdout.trim()) {
      console.log(`✅ Port ${port} is free`);
      return;
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
    for (const pid of pids) {
      try {
        await execAsync(`taskkill /F /PID ${pid}`);
        console.log(`✅ Killed process ${pid} on port ${port}`);
      } catch (error) {
        // Process might already be dead
        if (!error.message.includes('not found')) {
          console.warn(`⚠️  Could not kill process ${pid}:`, error.message);
        }
      }
    }
    
    // Wait a moment for the port to be released
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ Port ${port} is now free`);
  } catch (error) {
    // No process found or port is free
    if (!error.message.includes('findstr')) {
      console.log(`✅ Port ${port} is free`);
    } else {
      console.error(`❌ Error checking port ${port}:`, error.message);
    }
  }
}

const port = process.argv[2] || '3001';
killPort(port).then(() => process.exit(0)).catch(() => process.exit(1));

