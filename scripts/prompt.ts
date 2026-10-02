// Terminal prompts for the account scripts. In hidden mode the typed text is
// echoed as asterisks, so a password never appears on screen, in a scrollback
// buffer, or in shell history.

const ctrlC = "\u0003";
const backspaceKeys = new Set(["\u007f", "\b"]);

type AskOptions = { hidden?: boolean };

export function ask(
  question: string,
  { hidden = false }: AskOptions = {}
): Promise<string> {
  const stdin = process.stdin;

  if (!stdin.isTTY) {
    return Promise.reject(
      new Error("هذا الأمر يحتاج إلى طرفية تفاعلية.")
    );
  }

  return new Promise((resolve, reject) => {
    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let value = "";

    const stop = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      process.stdout.write("\n");
    };

    const onData = (chunk: Buffer | string) => {
      const text = typeof chunk === "string" ? chunk : chunk.toString("utf8");

      for (const char of text) {
        if (char === "\r" || char === "\n") {
          stop();
          resolve(value);
          return;
        }

        if (char === ctrlC) {
          stop();
          reject(new Error("أُلغيت العملية."));
          return;
        }

        if (backspaceKeys.has(char)) {
          if (value.length > 0) {
            value = value.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }

        value += char;
        process.stdout.write(hidden ? "*" : char);
      }
    };

    stdin.on("data", onData);
  });
}
