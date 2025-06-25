document.addEventListener('DOMContentLoaded', () => {
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
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            htmlElement.classList.toggle('dark');
            const isDarkMode = htmlElement.classList.contains('dark');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            setButtonIcon();
        });
        setButtonIcon();
    }

    // --- Reusable Toggle Logic ---
    function setupExpandableSection(toggleId, contentId, arrowId) {
        const toggleBtn = document.getElementById(toggleId);
        const content = document.getElementById(contentId);
        const arrow = document.getElementById(arrowId);

        if (toggleBtn && content && arrow) {
            toggleBtn.addEventListener('click', function() {
                content.classList.toggle('expanded');
                arrow.classList.toggle('rotated');
            });
        }
    }

    // --- About Section Toggle Logic ---
    setupExpandableSection('about-toggle', 'about-content', 'about-arrow');

    // --- Image Hover Logic ---
    const aboutImage = document.getElementById('about-image');
    if (aboutImage) {
        const originalImageSrc = aboutImage.src;
        const hoverImageSrc = '/images/pickles.webp';

        aboutImage.addEventListener('mouseenter', () => { aboutImage.src = hoverImageSrc; });
        aboutImage.addEventListener('mouseleave', () => { aboutImage.src = originalImageSrc; });
    }

    // --- Work Section Toggle Logic ---
    setupExpandableSection('work-toggle', 'work-content', 'work-arrow');

    // --- Project Toggles Logic ---
    document.querySelectorAll('.project-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const arrow = this.querySelector('.project-arrow');
            if (content && arrow) {
                content.classList.toggle('expanded');
                arrow.classList.toggle('rotated');
            }
        });
    });

    // --- Colophon Toggle Logic ---
    const colophonToggleBtn = document.getElementById('colophon-toggle-btn');
    const colophonContent = document.getElementById('colophon-content');
    if (colophonToggleBtn && colophonContent) {
        colophonToggleBtn.addEventListener('click', function(event) {
            event.preventDefault();
            colophonContent.classList.toggle('expanded');
        });
    }

    // --- API, and other logic that runs after page load ---
    window.addEventListener('load', () => {
        // --- Anchor Link Logic ---
        const hash = window.location.hash;
        if (hash) {
            const projectDiv = document.querySelector(hash);
            if (projectDiv && projectDiv.closest('#work-content')) {
                const workContent = document.getElementById('work-content');
                const workArrow = document.getElementById('work-arrow');
                if (workContent && workArrow && !workContent.classList.contains('expanded')) {
                    workContent.classList.add('expanded');
                    workArrow.classList.add('rotated');
                }
                const toggleButton = projectDiv.querySelector('.project-toggle');
                const projectContent = toggleButton.nextElementSibling;
                const projectArrow = toggleButton.querySelector('.project-arrow');
                if (projectContent && projectArrow && !projectContent.classList.contains('expanded')) {
                    projectContent.classList.add('expanded');
                    projectArrow.classList.add('rotated');
                }
                setTimeout(() => {
                    projectDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        }

        // --- Last.fm Logic ---
        const trackElement = document.getElementById('lastfm-track');
        if (trackElement) {
            fetch('https://lastfm-proxy-rem1xed.beangamer.workers.dev/')
                .then(response => { if (!response.ok) throw new Error(`Worker status: ${response.status}`); return response.json(); })
                .then(data => {
                    const track = data?.recenttracks?.track?.[0];
                    if (track) {
                        const isNowPlaying = track['@attr']?.nowplaying;
                        trackElement.textContent = `${isNowPlaying ? 'Now Playing' : 'Last Played'}: ${track.name} by ${track.artist['#text']}`;
                    } else { trackElement.textContent = 'Could not fetch recent track.'; }
                })
                .catch(error => { console.error('Error fetching Last.fm data:', error); trackElement.textContent = 'Error fetching song data.'; });
        }

        // --- Steam Logic ---
        const steamGameElement = document.getElementById('steam-game');
        if (steamGameElement) {
            fetch('https://steam-proxy.beangamer.workers.dev/')
                .then(response => { if (!response.ok) throw new Error(`Worker status: ${response.status}`); return response.json(); })
                .then(data => {
                    const topGame = data?.response?.games?.[0];
                    if (topGame) {
                        const playtimeHours = (topGame.playtime_2weeks / 60).toFixed(1);
                        steamGameElement.innerHTML = `Currently playing: <b>${topGame.name}</b> (${playtimeHours} hours in last 2 weeks)`;
                    } else { steamGameElement.textContent = 'No recent game data available.'; }
                })
                .catch(error => { console.error('Error fetching Steam data:', error); steamGameElement.textContent = 'Error fetching game data.'; });
        }

        // --- Letterboxd Logic ---
        const letterboxdFilmElement = document.getElementById('letterboxd-film');
        if (letterboxdFilmElement) {
            fetch('https://letterboxd-proxy.beangamer.workers.dev/')
                .then(response => { if (!response.ok) throw new Error(`Scraper status: ${response.status}`); return response.json(); })
                .then(data => {
                    if (data?.title) {
                        letterboxdFilmElement.textContent = `Last Watched: ${data.title} (${data.rating?.trim() || 'No rating'})`;
                    } else { console.error("Letterboxd scraper response missing data:", data); letterboxdFilmElement.textContent = 'Could not fetch recent film.'; }
                })
                .catch(error => { console.error('Error scraping Letterboxd data:', error); letterboxdFilmElement.textContent = 'Error fetching film data.'; });
        }
    });

    // --- Konami Code Easter Egg ---
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    const secretAudio = new Audio('/audio/secret.mp3');

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                document.body.classList.toggle('ddr-mode');
                secretAudio.play().catch(error => console.error("Audio play failed. User may need to interact with the page first.", error));
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
});
