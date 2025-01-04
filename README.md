# DUNNOT Bot

DUNNOT is a Discord bot designed to provide code-related assistance using advanced AI capabilities. The bot leverages both OpenAI and Deepseek APIs to provide helpful responses to programming questions.

## Features

- `/dunnot` - Ask code-related questions and receive detailed explanations with code examples
- Automatic code file attachments for longer code snippets
- Support for multiple programming languages
- Smart code formatting and syntax highlighting

## Prerequisites

- Node.js (v16.9.0 or higher)
- Discord Bot Token
- Deepseek API Key

## Setup

1. Clone the repository:

```bash
git clone <your-repository-url>
cd dunnotbot
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_GUILD_ID=your_guild_id
DEEPSEEK_API_KEY=your_deepseek_api_key
```

4. Deploy the bot commands:

```bash
node deploy-commands.js
```

5. Start the bot:

```bash
node index.js
```

## Usage

1. Invite the bot to your server using the OAuth2 URL generated from the Discord Developer Portal
2. Use the `/dunnot` command followed by your code-related question
3. The bot will respond with detailed explanations and code examples
4. For longer code snippets, the bot will automatically create file attachments

## Examples

```
/dunnot How do I create a simple HTTP server in Node.js?
/dunnot What's the difference between var, let, and const in JavaScript?
/dunnot Can you explain how to implement a binary search tree in Python?
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
