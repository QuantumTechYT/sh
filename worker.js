addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Serve the main page
  if (path === '/' || path === '/index.html') {
    return new Response(generateHTML(), {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    })
  }

  // Handle dictionary API requests
  if (path.startsWith('/dictionary/')) {
    try {
      const term = decodeURIComponent(path.slice(12))
      
      // Check if it's a URL
      if (term.includes('.') || term.startsWith('http')) {
        return Response.redirect('https://browser-aarush-ric.workers.dev', 302)
      }

      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${term}`)
      const data = await response.json()
      
      return new Response(JSON.stringify(data), {
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
        },
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Dictionary lookup failed' }), {
        status: 500,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
        },
      })
    }
  }

  return new Response('Not found', { status: 404 })
}

function generateHTML() {
  return `<!DOCTYPE html>
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

            // Check if it's a URL
            if (term.includes('.') || term.startsWith('http')) {
                window.location.href = 'https://browser-aarush-ric.workers.dev';
                return;
            }

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
</html>`
} 