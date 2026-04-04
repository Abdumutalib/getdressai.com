const { execSync } = require("child_process");

function getRequestedPort() {
  const rawPort = process.argv[2] || process.env.PORT || "3000";
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid port value: ${rawPort}`);
  }

  return port;
}

function readWindowsPortStatus(port) {
  try {
    const lines = execSync(`netstat -ano -p tcp | findstr :${port}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => line.includes(`:${port}`));

    const listeningLine = lines.find((line) => /LISTENING/i.test(line));

    if (!listeningLine) {
      return { occupied: false };
    }

    const parts = listeningLine.split(/\s+/);
    const pid = parts[parts.length - 1];
    let processDetails = null;

    try {
      processDetails = execSync(
        `powershell -NoProfile -Command "Get-Process -Id ${pid} | Select-Object Id, ProcessName, Path, StartTime | Format-List | Out-String"`,
        {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        }
      ).trim();
    } catch {
      processDetails = null;
    }

    return {
      occupied: true,
      pid,
      listeningLine,
      processDetails,
    };
  } catch {
    return { occupied: false };
  }
}

function main() {
  const port = getRequestedPort();
  const result = readWindowsPortStatus(port);

  if (!result.occupied) {
    console.log(`Port ${port} is free.`);
    return;
  }

  console.log(`Port ${port} is occupied.`);
  console.log(result.listeningLine);

  if (result.processDetails) {
    console.log(result.processDetails);
  }
}

main();