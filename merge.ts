import chalk from "chalk";

async function main() {
	const [inputFile, outputName, options] = process.argv.slice(2);

	if (!inputFile || !outputName) {
		console.error(chalk.red("Error: Missing input or output file arguments."));
		console.error(
			`Usage: bun merge.ts ${chalk.cyan("<inputFile>")} ${chalk.yellow(
				'"<options>"',
			)} ${chalk.green("<outputName>")}`,
		);
		process.exit(1);
	}

	// Split options string into an array for spawn
	const mkvmergeArgs = [
		"mkvmerge",
		"-o",
		outputName,
		...(options?.split(" ") ?? []),
		inputFile,
	];

	const childProcess = Bun.spawn(mkvmergeArgs);

	const updateProgressBar = (progress: number) => {
		const progressBarLength = 50;
		const filledBars = Math.round((progressBarLength * progress) / 100);
		const emptyBars = progressBarLength - filledBars;

		const progressBar =
			chalk.green("█".repeat(filledBars)) + chalk.gray("░".repeat(emptyBars));
		const progressPercentage = `${progress}%`;
		const icon = chalk.blueBright("  ");
		const videoTitle = chalk.greenBright(outputName);

		process.stdout.write(
			`\r Muxing${icon}${videoTitle} ${progressBar} ${progressPercentage}`,
		);
	};

	// Bun.spawn uses web streams. We can read them asynchronously.
	const readStream = async (
		stream: ReadableStream<Uint8Array>,
		callback: (chunk: string) => void,
	) => {
		const reader = stream.getReader();
		const decoder = new TextDecoder();
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			callback(decoder.decode(value));
		}
	};

	readStream(childProcess.stdout, (output) => {
		const regex = /Progress: (\d+)%/;
		const match = output.match(regex);
		if (match) updateProgressBar(parseInt(match[1], 10));
	});

	// readStream(childProcess.stderr, (error) => console.error(chalk.red(error)));

	const exitCode = await childProcess.exited;
	process.stdout.write("\n");
	if (exitCode === 0) {
		console.log(chalk.green("Muxing completed successfully!"));
		process.exit(0);
	} else {
		console.error(chalk.red(`\nmkvmerge exited with error code ${exitCode}`));
		process.exit(1);
	}
}

main();
