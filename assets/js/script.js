document.addEventListener('DOMContentLoaded', () => {
    // --- Existing functionality ---

    // Helper function to fetch and update dynamic content like Last.fm, etc.
    async function fetchDynamicContent(elementId, apiEndpoint) {
        const element = document.getElementById(elementId);
        if (!element) return;

        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            // Assuming your worker returns { "content": "..." }
            const data = await response.json();
            element.innerHTML = data.content || 'Could not load data.';
        } catch (error) {
            console.error(`Error fetching data for ${elementId}:`, error);
            element.textContent = 'Error loading data.';
        }
    }

    // Generic toggle handler for sections like "my work"
    function setupToggles() {
        document.querySelectorAll('[id$="-toggle"]').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const content = document.getElementById(toggle.id.replace('-toggle', '-content'));
                const arrow = document.getElementById(toggle.id.replace('-toggle', '-arrow'));
                if (content) {
                    content.classList.toggle('expand-content');
                    if (arrow) arrow.textContent = content.classList.contains('expand-content') ? '↓' : '↑';
                }
            });
        });

        document.querySelectorAll('.project-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const content = toggle.nextElementSibling;
                const arrow = toggle.querySelector('.project-arrow');
                if (content && content.classList.contains('project-content')) {
                    content.classList.toggle('expand-content');
                    if (arrow) arrow.textContent = content.classList.contains('expand-content') ? '↓' : '↑';
                }
            });
        });
    }

    // --- New Roast Button Functionality ---

    function setupRoastButton() {
        const roastButton = document.getElementById('roast-button');
        const roastContent = document.getElementById('roast-content');
        const roastText = document.getElementById('roast-text');

        if (!roastButton || !roastContent || !roastText) return;

        roastButton.addEventListener('click', async () => {
            roastContent.classList.remove('hidden');
            roastText.textContent = 'Dialing up a roast...';

            // Gather data from the page
            const lastfm = document.getElementById('lastfm-data')?.innerText || 'nothing on Last.fm';
            const letterboxd = document.getElementById('letterboxd-data')?.innerText || 'nothing on Letterboxd';
            const steam = document.getElementById('steam-data')?.innerText || 'nothing on Steam';

            try {
                // This assumes a serverless function is available at this path
                const response = await fetch('/api/roast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lastfm, letterboxd, steam }),
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(`Roast API error: ${response.status} ${errorData}`);
                }

                const data = await response.json();
                roastText.innerHTML = data.roast || 'The roaster is on a coffee break. Try again later.';
            } catch (error) {
                console.error('Failed to get roast:', error);
                roastText.textContent = 'Could not generate roast. The machine is probably crying.';
            }
        });
    }

    // --- Initializations ---

    // Fetch dynamic data (update URLs to your actual worker endpoints)
    fetchDynamicContent('lastfm-data', 'https://workers.blackalice.io/lastfm');
    fetchDynamicContent('letterboxd-data', 'https://workers.blackalice.io/letterboxd');
    fetchDynamicContent('steam-data', 'https://workers.blackalice.io/steam');
    
    setupToggles();
    setupRoastButton();
});