    // --- Theme Toggle Logic ---
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
        const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
        const htmlElement = document.documentElement;

        function setButtonIcon() {
            if (htmlElement.classList.contains('dark')) {
                themeToggleLightIcon.classList.remove('hidden');
                themeToggleDarkIcon.classList.add('hidden');
            } else {
                themeToggleDarkIcon.classList.remove('hidden');
                themeToggleLightIcon.classList.add('hidden');
            }
        }
        themeToggleBtn.addEventListener('click', function() {
            htmlElement.classList.toggle('dark');
            const isDarkMode = htmlElement.classList.contains('dark');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            setButtonIcon();
        });
        setButtonIcon();

        // --- About Section Toggle Logic ---
        const aboutToggleBtn = document.getElementById('about-toggle');
        const aboutContent = document.getElementById('about-content');
        const aboutArrow = document.getElementById('about-arrow');

        aboutToggleBtn.addEventListener('click', function() {
            const isExpanded = aboutContent.classList.toggle('expanded');
            aboutArrow.textContent = isExpanded ? '↑' : '↓';
        });

        // --- Image Hover Logic ---
        const aboutImage = document.getElementById('about-image');
        const originalImageSrc = 'images/stu.webp';
        const hoverImageSrc = 'images/pickles.webp'; // A different image for hover

        aboutImage.addEventListener('mouseenter', () => {
            aboutImage.src = hoverImageSrc;
        });

        aboutImage.addEventListener('mouseleave', () => {
            aboutImage.src = originalImageSrc;
        });

        // --- Work Section Toggle Logic ---
        const workToggleBtn = document.getElementById('work-toggle');
        const workContent = document.getElementById('work-content');
        const workArrow = document.getElementById('work-arrow');

        workToggleBtn.addEventListener('click', function() {
            const isExpanded = workContent.classList.toggle('expanded');
            workArrow.textContent = isExpanded ? '↑' : '↓';
        });

        // --- Project Toggles Logic ---
        const projectToggleBtns = document.querySelectorAll('.project-toggle');

        projectToggleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const arrow = this.querySelector('.project-arrow');
                const isExpanded = content.classList.toggle('expanded');
                
                arrow.textContent = isExpanded ? '↑' : '↓';
            });
        });

        // --- Colophon Toggle Logic ---
        const colophonToggleBtn = document.getElementById('colophon-toggle-btn');
        const colophonContent = document.getElementById('colophon-content');

        colophonToggleBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default button behavior
            colophonContent.classList.toggle('expanded');
        });

        // --- Anchor Link & API Logic ---
        window.addEventListener('load', () => {
            // --- Anchor Link Logic ---
            const hash = window.location.hash;
            if (hash) {
                const projectDiv = document.querySelector(hash);
                if (projectDiv && projectDiv.closest('#work-content')) {
                    if (!workContent.classList.contains('expanded')) {
                        workContent.classList.add('expanded');
                        workArrow.textContent = '↑';
                    }
                    const toggleButton = projectDiv.querySelector('.project-toggle');
                    const projectContent = toggleButton.nextElementSibling;
                    const projectArrow = toggleButton.querySelector('.project-arrow');
                    if (projectContent && !projectContent.classList.contains('expanded')) {
                        projectContent.classList.add('expanded');
                        projectArrow.textContent = '↑';
                    }
                    setTimeout(() => {
                        projectDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 500);
                }
            }

            // --- Last.fm Logic ---
            const lastfmWorkerUrl = 'https://lastfm-proxy-rem1xed.beangamer.workers.dev/'; 
            const trackElement = document.getElementById('lastfm-track');

            fetch(lastfmWorkerUrl)
                .then(response => {
                    if (!response.ok) { throw new Error(`Worker responded with status: ${response.status}`); }
                    return response.json();
                })
                .then(data => {
                    if (data.recenttracks && data.recenttracks.track && data.recenttracks.track.length > 0) {
                        const track = data.recenttracks.track[0];
                        const artist = track.artist['#text'];
                        const song = track.name;
                        const isNowPlaying = track['@attr'] && track['@attr'].nowplaying;
                        trackElement.textContent = isNowPlaying ? `Now Playing: ${song} by ${artist}` : `Last Played: ${song} by ${artist}`;
                    } else {
                        trackElement.textContent = 'Could not fetch recent track.';
                    }
                })
                .catch(error => {
                    console.error('Error fetching Last.fm data via Worker:', error);
                    trackElement.textContent = 'Error fetching song data.';
                });



            // --- Steam Logic ---
            const steamGameElement = document.getElementById('steam-game');
            // IMPORTANT: Replace this URL with your actual Cloudflare Worker URL.
            const steamWorkerUrl = 'https://steam-proxy.beangamer.workers.dev/';

            fetch(steamWorkerUrl)
                .then(response => {
                    if (!response.ok) { throw new Error(`Worker responded with status: ${response.status}`); }
                    return response.json();
                })
                .then(data => {
                    // The Steam API returns an empty response object if the user has no recent games
                    // or their profile is private.
                    if (data.response && data.response.games && data.response.games.length > 0) {
                        const topGame = data.response.games[0]; // API sorts by playtime_2weeks descending
                        const playtimeMinutes = topGame.playtime_2weeks;
                        const playtimeHours = (playtimeMinutes / 60).toFixed(1);

                        steamGameElement.innerHTML = `Currently playing: <b>${topGame.name}</b> (${playtimeHours} hours in last 2 weeks)`;
                    } else {
                        steamGameElement.textContent = 'No recent game data available.';
                    }
                })
                .catch(error => {
                    console.error('Error fetching Steam data via Worker:', error);
                    steamGameElement.textContent = 'Error fetching game data.';
                });
        });


            // --- Letterboxd Logic ---
    const letterboxdFilmElement = document.getElementById('letterboxd-film');
    const letterboxdWorkerUrl = 'https://letterboxd-proxy.beangamer.workers.dev/'; // <-- Replace with your worker URL

    fetch(letterboxdWorkerUrl)
        .then(response => {
             if (!response.ok) { throw new Error(`Scraper worker responded with status: ${response.status}`); }
             return response.json();
        })
        .then(data => {
            if(data && data.title) {
                const filmTitle = data.title;
                const filmRating = data.rating ? data.rating.trim() : 'No rating';
                letterboxdFilmElement.textContent = `Last Watched: ${filmTitle} (${filmRating})`;
            } else {
                console.error("Letterboxd scraper response did not contain expected data:", data);
                letterboxdFilmElement.textContent = 'Could not fetch recent film.';
            }
        })
        .catch(error => {
            console.error('Error scraping Letterboxd data:', error);
            letterboxdFilmElement.textContent = 'Error fetching film data.';
        });
