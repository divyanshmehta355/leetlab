const Docker = require('dockerode');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid'); // Will need to install uuid

const docker = new Docker(); // connects to local docker daemon

class DockerExecutionService {
  async execute(language, code, input) {
    const jobId = uuidv4();
    const tempDir = path.join(os.tmpdir(), `leetlab-${jobId}`);
    
    await fs.mkdir(tempDir, { recursive: true });

    let fileName, image, runCmd;

    if (language === 'python') {
      fileName = 'solution.py';
      image = 'python:3.9-slim';
      runCmd = ['sh', '-c', `python /app/${fileName} < /app/input.txt`];
    } else if (language === 'javascript') {
      fileName = 'solution.js';
      image = 'node:18-alpine';
      runCmd = ['sh', '-c', `node /app/${fileName} < /app/input.txt`];
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }

    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, code);

    const inputPath = path.join(tempDir, 'input.txt');
    await fs.writeFile(inputPath, input || '');

    try {
      // Ensure image exists
      await new Promise((resolve, reject) => {
        docker.pull(image, (err, stream) => {
          if (err) return reject(err);
          docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
        });
      });

      const container = await docker.createContainer({
        Image: image,
        Cmd: runCmd,
        HostConfig: {
          Binds: [`${tempDir}:/app`],
          Memory: 256 * 1024 * 1024, // 256MB limit
          NetworkMode: 'none', // Disable network access
        },
        Tty: false
      });

      await container.start();
      const result = await container.wait();

      const logsStream = await container.logs({ stdout: true, stderr: true, follow: false });
      
      let parsedLogs = '';
      let parsedErr = '';
      
      // logsStream from follow: false is a Buffer, but dockerode docs say it can be a stream.
      // If it's a stream (buffer has no length), we must demux it. 
      // Actually, if we use callback, it is a Buffer. Let's use the callback approach for safety.
      const logsBuffer = await new Promise((resolve, reject) => {
        container.logs({ stdout: true, stderr: true, follow: false }, (err, buffer) => {
          if (err) return reject(err);
          resolve(buffer);
        });
      });

      // Simple parse of 8-byte headers
      if (logsBuffer && logsBuffer.length > 0) {
        let offset = 0;
        while (offset < logsBuffer.length) {
          const type = logsBuffer[offset];
          const length = logsBuffer.readUInt32BE(offset + 4);
          offset += 8;
          const content = logsBuffer.toString('utf8', offset, offset + length);
          if (type === 1) parsedLogs += content;
          if (type === 2) parsedErr += content;
          offset += length;
        }
      }

      try {
        await container.remove({ force: true });
      } catch (e) {
        // Ignore 409 already in progress errors
      }
      
      await fs.rm(tempDir, { recursive: true, force: true });

      return {
        exitCode: result.StatusCode,
        output: (parsedLogs || parsedErr).trim()
      };

    } catch (error) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
      throw error;
    }
  }
}

module.exports = new DockerExecutionService();
