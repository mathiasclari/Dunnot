const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const OpenAI = require('openai');
const { DEEPSEEK_API_KEY } = require('../../config.js');

// Initialize OpenAI client
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: DEEPSEEK_API_KEY,
});

// Language to file extension mapping
const languageExtensions = {
    'java': 'java',
    'python': 'py',
    'javascript': 'js',
    'typescript': 'ts',
    'cpp': 'cpp',
    'c': 'c',
    'csharp': 'cs',
    'php': 'php',
    'ruby': 'rb',
    'go': 'go',
    'rust': 'rs',
    'swift': 'swift',
    'kotlin': 'kt',
    'scala': 'scala',
    'html': 'html',
    'css': 'css',
    'sql': 'sql',
    'shell': 'sh',
    'bash': 'sh',
    'powershell': 'ps1',
    'yaml': 'yaml',
    'json': 'json',
    'xml': 'xml',
    'markdown': 'md',
    'plaintext': 'txt'
};

// Function to process code blocks in the text
function processCodeBlocks(text) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const segments = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        // Add text before code block
        if (match.index > lastIndex) {
            segments.push({
                type: 'text',
                content: text.slice(lastIndex, match.index).trim()
            });
        }

        // Add code block
        segments.push({
            type: 'code',
            language: match[1]?.toLowerCase() || 'plaintext',
            content: match[2].trim()
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        segments.push({
            type: 'text',
            content: text.slice(lastIndex).trim()
        });
    }

    return segments;
}

// Function to create a file name for the code
function createFileName(language, index = 1) {
    const ext = languageExtensions[language] || 'txt';
    if (language === 'java') {
        return `Main${index}.java`;
    }
    return `code${index}.${ext}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dunnot')
        .setDescription('Ask DUNNOT a code-related question.')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('The code-related question you want to ask.')
                .setRequired(true)
        ),
    async execute(interaction) {
        console.log(`Command "dunnot" triggered by ${interaction.user.tag}`);
        
        await interaction.deferReply();
        const question = interaction.options.getString('question');
        
        try {
            console.log('Creating OpenAI chat completion stream...');
            const stream = await openai.chat.completions.create({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that answers code-related questions. Provide detailed explanations and include code snippets when necessary. Format code snippets using Markdown code blocks with the appropriate language (e.g., ```java ... ```).'
                    },
                    {
                        role: 'user',
                        content: question
                    }
                ],
                stream: true,
                max_tokens: 2000
            });

            // Collect all chunks
            let fullResponse = '';
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                fullResponse += content;
            }

            // Process the response
            const segments = processCodeBlocks(fullResponse);
            let response = '';
            const files = [];
            let fileIndex = 1;

            for (const segment of segments) {
                if (segment.type === 'code') {
                    // If code is longer than 15 lines or 500 characters, create a file
                    const lines = segment.content.split('\n');
                    if (lines.length > 15 || segment.content.length > 500) {
                        const fileName = createFileName(segment.language, fileIndex++);
                        const attachment = new AttachmentBuilder(
                            Buffer.from(segment.content), 
                            { name: fileName }
                        );
                        files.push(attachment);
                        response += `\n📎 Code attached as ${fileName}\n`;
                    } else {
                        // For short code snippets, keep them in the message
                        response += `\n\`\`\`${segment.language}\n${segment.content}\n\`\`\`\n`;
                    }
                } else {
                    response += segment.content + '\n';
                }
            }

            // Split response into chunks if needed
            const chunks = response.match(/[\s\S]{1,1500}/g) || [response];
            
            // Send first chunk with files
            await interaction.editReply({
                content: chunks[0],
                files: files
            });

            // Send any remaining chunks
            for (let i = 1; i < chunks.length; i++) {
                await interaction.followUp(chunks[i]);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            console.log('Response complete');
            
        } catch (error) {
            console.error('Error in dunnot command:', error);
            const errorMessage = error.response?.data?.error?.message || error.message || 'An unknown error occurred';
            const userMessage = `Error: ${errorMessage}\nPlease try again later or contact support if the issue persists.`;
            await interaction.editReply(userMessage);
        }
    }
};