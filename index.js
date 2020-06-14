#!/usr/bin/env node

const { program } = require("commander");
const { prompt } = require("enquirer");

const { lorem_txt } = require("hipsum/lorem");
const LoremIpsum = require("lorem-ipsum").LoremIpsum;

const clipboardy = require("clipboardy");

program
  .name("lipsum")
  .option("-c, --copy", "copy output to clipboard")
  .option("-h, --html", "generate output in HTML format");

program.parse(process.argv);

(async () => {
  const response = await prompt([
    {
      type: "select",
      name: "language",
      message: "Language",
      choices: [
        { name: "en", message: "English" },
        { name: "ko", message: "한국어" },
      ],
    },
    {
      type: "numeral",
      name: "paragraphCount",
      message: "The number of paragraphs",
      initial: 3,
      min: 3, // ??
      float: false,
    },
    {
      type: "select",
      name: "paragraphLength",
      message: "The length of a paragraph",
      choices: [
        { name: "short", message: "Short" },
        { name: "medium", message: "Medium" },
        { name: "long", message: "Long" },
      ],
      initial: "medium",
    },
  ]);

  let result = "";

  if (response.language === "ko") {
    let wordCount;

    switch (response.paragraphLength) {
      case "short":
        wordCount = 20;
        break;
      case "medium":
        wordCount = 40;
        break;
      case "long":
        wordCount = 80;
        break;
    }

    result = lorem_txt(response.paragraphCount, wordCount);
  } else {
    let baseWordCount;

    switch (response.paragraphLength) {
      case "short":
        baseWordCount = 5;
        break;
      case "medium":
        baseWordCount = 10;
        break;
      case "long":
        baseWordCount = 20;
        break;
    }

    const lorem = new LoremIpsum({
      wordsPerSentence: {
        max: baseWordCount + 2,
        min: baseWordCount - 2,
      },
    });

    result = lorem.generateParagraphs(response.paragraphCount);
  }

  if (program.html) {
    result = result
      .split("\n")
      .map((p) => `<p>${p}</p>`)
      .join("\n");
  }

  if (program.copy) {
    clipboardy.writeSync(result);
  }

  console.log(
    "---------------------------\n" +
      result +
      "\n---------------------------" +
      (program.copy ? "\nCopied to clipboard!" : "")
  );
})().catch(() => {});
