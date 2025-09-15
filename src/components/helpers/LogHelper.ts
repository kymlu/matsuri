import { formatExportDate } from "./DateHelper.ts";
import { downloadFile } from "./ExportHelper.ts";

type LogLevel = 'LOG' | 'WARN' | 'ERROR';
const MAX_LOG_ENTRIES = 500;
const logs: string[] = [];

function logInterceptor(
  level: LogLevel,
  originalFn: (...args: any[]) => void
): (...args: any[]) => void {
  return (...args: any[]) => {
    const message = args
      .map(arg => {
        try {
          return typeof arg === 'string' ? arg : JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(' ');

    const timestamp = new Date().toISOString();
    logs.push(`[${timestamp}] [${level}] ${message}`);
    if (logs.length > MAX_LOG_ENTRIES) {
      logs.shift(); // Remove oldest log to stay within limit
    }

    // Forward the call to the original console method
    originalFn.apply(console, args);
  };
}

// Override global console methods
console.log = logInterceptor('LOG', console.log);
console.warn = logInterceptor('WARN', console.warn);
console.error = logInterceptor('ERROR', console.error);

export function downloadLogs() {
  downloadFile(logs.join("\n"), "text/plain", `matsuri_logs_${formatExportDate(new Date())}.txt`);
}