import chalk from "chalk";

/** update progress bar every time progress get update
 * @param {number} progress - progress update
 */
const updateProgress = (progress) => {
  const barLength = 50;
  const filledBar = Math.floor((progress * barLength) / 100);
  const emptyBar = barLength - filledBar;
  const percent = `${progress}%`;

  const progressBar = chalk.green(
    "=".repeat(filledBar) + chalk.gray("=".repeat(emptyBar)),
  );
  const titleFile = "Example title.ts";
  process.stdout.write(`\r${titleFile} ${progressBar} ${percent}`);
};

let progress = 0;
(() => {
  setInterval(() => {
    if (progress >= 100) {
      return process.exit(1);
    }
    progress += 1;
    updateProgress(progress);
  }, 100);
})();
