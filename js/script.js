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

            // --- Letterboxd Logic ---
            const letterboxdFilmElement = document.getElementById('letterboxd-film');
            const letterboxdUsername = 'stuart_foy';
            const diaryUrl = `https://letterboxd.com/${letterboxdUsername}/films/diary/`;
            const selector = 'tr.diary-entry-row:first-of-type';
            const scraperUrl = `https://web.scraper.workers.dev/?url=${encodeURIComponent(diaryUrl)}&selector=${encodeURIComponent(selector)}&scrape=text&spaced=true`;

            fetch(scraperUrl)
                .then(response => {
                     if (!response.ok) { throw new Error(`Scraper worker responded with status: ${response.status}`); }
                     return response.json();
                })
                .then(data => {
                    const scrapedText = data.result[selector] && data.result[selector][0];
                    if (scrapedText) {
                        const parts = scrapedText.split(/\s+/);
                        let titleParts = [];
                        let foundYear = false;
                        for(let i = 3; i < parts.length; i++) {
                           if (/^\d{4}$/.test(parts[i]) && !foundYear) {
                               foundYear = true;
                           }
                           if(!foundYear){
                               titleParts.push(parts[i]);
                           }
                        }
                        
                        const filmTitle = titleParts.join(' ');
                        const ratingIndex = scrapedText.indexOf('★');
                        const filmRating = ratingIndex !== -1 ? scrapedText.substring(ratingIndex).split(' ')[0] : 'No rating';

                        if (filmTitle) {
                             letterboxdFilmElement.textContent = `Last Watched: ${filmTitle} (${filmRating})`;
                        } else {
                             letterboxdFilmElement.textContent = 'Could not parse film title.';
                        }

                    } else {
                        console.error("Scraper response did not contain expected data:", data);
                        letterboxdFilmElement.textContent = 'Could not fetch recent film (scraper failed).';
                    }
                })
                .catch(error => {
                    console.error('Error scraping Letterboxd data:', error);
                    letterboxdFilmElement.textContent = 'Error fetching film data.';
                });
        });