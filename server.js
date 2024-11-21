const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static HTML
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dictionary</title>
    <style>
        :root {
            --background-color: #1a1b26;
            --card-background: #24283b;
            --text-color: #c0caf5;
            --border-color: #414868;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--background-color);
            color: var(--text-color);
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }

        .search-bar {
            position: sticky;
            top: 0;
            z-index: 1000;
            display: flex;
            gap: 10px;
            background: var(--card-background);
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            margin-bottom: 20px;
        }

        #searchInput {
            flex-grow: 1;
            padding: 12px 15px;
            font-size: 16px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            background: var(--background-color);
            color: var(--text-color);
        }

        #searchInput:focus {
            outline: none;
            border-color: #5cbbf6;
        }

        button {
            padding: 8px 20px;
            background-color: #5cbbf6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            min-width: 100px;
        }

        button:hover {
            background-color: #4a9ed6;
        }

        #dictionaryResults {
            padding: 10px 0;
        }

        .word-card {
            background: var(--card-background);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .word-title {
            font-size: 32px;
            margin-bottom: 15px;
            color: #5cbbf6;
        }

        .phonetic {
            color: #888;
            margin-bottom: 20px;
            font-size: 18px;
        }

        .meaning {
            margin-bottom: 20px;
        }

        .meaning strong {
            color: #7aa2f7;
            font-size: 20px;
            display: block;
            margin-bottom: 10px;
        }

        .meaning ul {
            list-style-position: inside;
            padding-left: 20px;
        }

        .meaning li {
            margin-bottom: 10px;
            line-height: 1.5;
        }

        .meaning em {
            display: block;
            margin-top: 5px;
            color: #888;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="search-bar">
        <input 
            type="text" 
            id="searchInput" 
            placeholder="Enter a word..."
            autocomplete="off"
        >
        <button onclick="searchWord()">Search</button>
    </div>
    <div id="dictionaryResults"></div>

    <script>
        async function searchWord() {
            const term = document.getElementById('searchInput').value.trim();
            if (!term) return;

            const resultsDiv = document.getElementById('dictionaryResults');
            resultsDiv.innerHTML = '<p>Searching...</p>';
            
            try {
                const response = await fetch('/dictionary/' + encodeURIComponent(term));
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    const html = data.map(entry => {
                        const phoneticHtml = entry.phonetic ? 
                            '<div class="phonetic">' + entry.phonetic + '</div>' : '';
                        
                        const meaningsHtml = entry.meanings.map(meaning => {
                            const definitionsHtml = meaning.definitions.map(def => {
                                const exampleHtml = def.example ? 
                                    '<br><em>Example: ' + def.example + '</em>' : '';
                                return '<li>' + def.definition + exampleHtml + '</li>';
                            }).join('');

                            return '<div class="meaning">' +
                                '<strong>' + meaning.partOfSpeech + '</strong>' +
                                '<ul>' + definitionsHtml + '</ul>' +
                                '</div>';
                        }).join('');

                        return '<div class="word-card">' +
                            '<div class="word-title">' + entry.word + '</div>' +
                            phoneticHtml +
                            meaningsHtml +
                            '</div>';
                    }).join('');

                    resultsDiv.innerHTML = html;
                } else {
                    resultsDiv.innerHTML = '<p>No definitions found.</p>';
                }
            } catch (error) {
                resultsDiv.innerHTML = '<p>Error fetching definition.</p>';
            }
        }

        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchWord();
            }
        });
    </script>
</body>
</html>`);
});

// Dictionary API endpoint
app.get('/dictionary/:word', async (req, res) => {
    try {
        const word = req.params.word;
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Dictionary lookup failed' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 