import { spawn } from 'child_process';
import chalk from 'chalk';

const [inputFile, option, outputName] = process.argv.slice(2);

const childProcess = spawn('mkvmerge', [inputFile, option, outputName]);

function updateProgressBar(progress) {
  const progressBarLength = 50;
  const filledBars = Math.round(progressBarLength * progress / 100);
  const emptyBars = progressBarLength - filledBars;

  const progressBarr = chalk.green('█'.repeat(filledBars)) + chalk.gray('░'.repeat(emptyBars));
  const progressPercetage = `${progress}%`;

  process.stdout.write(`\r${outputName} - ${progressBarr} ${progressPercetage}`);
}

childProcess.stdout.on('data', (chunk) => {
  const regex = /Progress: (\d+)/;
  const output = chunk.toString();
  const match = output.match(regex);
  if (match) {
    updateProgressBar(parseInt(match[1]))
  }
});

childProcess.stderr.on('data', (chunk) => {
  console.error(chunk.toString());   
});

childProcess.on('close', (code) => {
  // process.stdout.clearLine()
  console.log("\r");
});