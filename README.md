# Evolving Art Generator

## Description

The Evolving Art Generator is a tool designed to capture the evolution of generative art over time. Specifically, it works with the "Life and Love and Nothing" series by Nat Sarkissian, generating images at specified intervals to showcase how the artwork evolves. The tool automates the process of taking screenshots and compiles them into a GIF, providing a unique perspective on generative art.

## Installation

To use this tool, clone the repository and run:

```bash
npm install
```

or if you're using Yarn:

```bash
yarn install
```

## Usage

Run the tool using the command artevolve. You can customize its behavior using various command-line options:

```bash
artevolve [options]
```

### Options

- `--url`: URL of the art generator. Default is "https://generator.artblocks.io/0x99a9b7c1116f9ceeb1652de04d5969cce509b069/476000025".
- `--startDateTime`: Start date and time in ISO format. Default is "2023-11-02T00:00:00Z".
- `--endDateTime`: End date and time in ISO format. Default is "2023-11-15T00:00:00Z".
- `--interval`: Interval between screenshots in seconds. Default is 86400 (1 day).
- `--maxConcurrentBrowsers`: Maximum number of concurrent browser instances. Default is 5.
- `--deletePNGs`: Set to `true` to delete PNG files after creating the GIF. Default is `true`.
- `--height`: Height of the browser window in pixels. Default is 1003.
- `--width`: Width of the browser window in pixels. Default is 1337.
- `--gifQuality`: Quality of the generated GIF, ranging from 1 (highest quality) to 20. Default is 5.

  ### Example

  To run the toll with custom settings, use:
  
  ```bash
  artevolve --startDateTime "2023-11-02T00:00:00Z" --endDateTime "2023-11-15T00:00:00Z" --interval 43200
  ```

  This command will generate images from November 2nd to November 15th, 2023, with a 12-hour interval between each snapshot.

  ## License

  This project is licensed under the MIT Liecense - see the LICENSE file for details.
