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
      runCmd = ['python', `/app/${fileName}`];
    } else if (language === 'javascript') {
      fileName = 'solution.js';
      image = 'node:18-alpine';
      runCmd = ['node', `/app/${fileName}`];
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }

    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, code);

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
        Tty: false,
        AttachStdout: true,
        AttachStderr: true,
        OpenStdin: true,
        StdinOnce: true
      });

      await container.start();

      // Write input to stdin if provided
      if (input) {
        const stream = await container.attach({stream: true, stdin: true, stdout: true, stderr: true});
        stream.write(input + '\\n');
        stream.end();
      }

      // Wait for container to exit with a timeout
      // Note: A real implementation needs more robust timeout handling
      const result = await container.wait();

      const logs = await container.logs({
        stdout: true,
        stderr: true
      });

      // Simple parsing of docker logs (multiplexed stream)
      // Docker attaches an 8-byte header to each log line.
      // We will just do a rough clean for this example, but in prod you'd use docker-modem demux.
      let outputBuffer = Buffer.from(logs);
      let parsedLogs = '';
      let offset = 0;
      while (offset < outputBuffer.length) {
        // header is 8 bytes
        // type = outputBuffer[offset]
        let length = outputBuffer.readUInt32BE(offset + 4);
        offset += 8;
        parsedLogs += outputBuffer.toString('utf8', offset, offset + length);
        offset += length;
      }

      await container.remove();
      await fs.rm(tempDir, { recursive: true, force: true });

      return {
        exitCode: result.StatusCode,
        output: parsedLogs.trim()
      };

    } catch (error) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
      throw error;
    }
  }
}

module.exports = new DockerExecutionService();
