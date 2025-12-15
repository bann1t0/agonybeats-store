"use client";
import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { usePlayer } from "@/context/PlayerContext";
import styles from "./page.module.css";
import FallingComets from "@/components/FallingComets";
import FavoriteButton from "@/components/FavoriteButton";


/* --- SVG ICONS --- */
function SlidersIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>;
}
function DownloadIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
}


function HomeContent() {
  const { data: session } = useSession();
  const { addToCart } = useCart();

  // Player Context Hook
  const {
    currentBeat,
    setCurrentBeat,
    isPlaying,
    playTrack,
    togglePlay,
    currentTime,
    duration,
    handleSeek,
    handleVolume,
    volume
  } = usePlayer();

  const router = useRouter();
  const searchParams = useSearchParams();
  const licenseParam = searchParams.get("license");
  const licenseQuery = licenseParam ? `?license=${licenseParam}` : "";

  /* Main Component State */
  const [beatCatalogue, setBeatCatalogue] = useState([]);
  // Separate full catalogue state to keep track of all beats for filtering
  const [allBeats, setAllBeats] = useState([]);
  const [featuredBeatData, setFeaturedBeatData] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Filters (Pending State for Inputs)
  const [pendingGenre, setPendingGenre] = useState("");
  const [pendingBpmMin, setPendingBpmMin] = useState("");
  const [pendingBpmMax, setPendingBpmMax] = useState("");
  const [pendingKey, setPendingKey] = useState("");

  // Applied Filters (Actual Filtering)
  const [appliedFilters, setAppliedFilters] = useState({
    genre: "",
    bpmMin: "",
    bpmMax: "",
    key: ""
  });

  // Subscriber state for free downloads
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [downloading, setDownloading] = useState(null);

  // Extract unique genres for dropdown
  const genres = [...new Set(allBeats.map(b => b.genre).filter(Boolean))];

  // Fetch subscription data for logged-in users
  useEffect(() => {
    if (session?.user) {
      fetch('/api/subscription-downloads')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.hasSubscription) {
            setSubscriptionData(data);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  async function handleSubscriberDownload(beat) {
    const remaining = subscriptionData?.downloads?.remaining;
    const hasRemainingDownloads = remaining === 'Unlimited' || remaining === Infinity || (Number(remaining) > 0);
    if (!subscriptionData || !hasRemainingDownloads) {
      console.log('Cannot download:', { subscriptionData, remaining });
      return;
    }

    setDownloading(beat.id);
    try {
      const res = await fetch('/api/subscription-downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beatId: beat.id })
      });

      const data = await res.json();

      if (res.ok && data.downloadUrl) {
        // 1. Download the beat file
        const beatLink = document.createElement('a');
        beatLink.href = data.downloadUrl;
        beatLink.download = `${beat.title}.mp3`;
        document.body.appendChild(beatLink);
        beatLink.click();
        document.body.removeChild(beatLink);

        // 2. Download the license file
        const licenseType = data.licenseType || 'MP3_LEASE';
        const buyerName = session?.user?.name || session?.user?.email || 'Subscriber';
        const licenseUrl = `/api/license?beatTitle=${encodeURIComponent(beat.title)}&buyerName=${encodeURIComponent(buyerName)}&licenseType=${encodeURIComponent(licenseType)}&date=${encodeURIComponent(new Date().toLocaleDateString())}`;

        // Small delay to avoid browser blocking multiple downloads
        setTimeout(() => {
          const licenseLink = document.createElement('a');
          licenseLink.href = licenseUrl;
          licenseLink.download = `${beat.title} - ${licenseType} License.txt`;
          document.body.appendChild(licenseLink);
          licenseLink.click();
          document.body.removeChild(licenseLink);
        }, 500);

        // Update remaining count
        setSubscriptionData(prev => ({
          ...prev,
          downloads: {
            ...prev.downloads,
            remaining: data.remaining
          }
        }));
      } else {
        alert(data.error || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloading(null);
    }
  }

  // Fetch Beats
  useEffect(() => {
    async function fetchBeats() {
      try {
        const res = await fetch("/api/beats");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setAllBeats(data);

            // 1. Find Manual Featured Beat
            let selectedFeatured = data.find(b => b.isFeatured);

            // 2. Fallback: If no manual featured, pick random (or first)
            if (!selectedFeatured && data.length > 0) {
              const randomIndex = Math.floor(Math.random() * data.length);
              selectedFeatured = data[randomIndex];
            }

            if (selectedFeatured) {
              setFeaturedBeatData(selectedFeatured);
              // Filter catalogue to exclude the featured one
              const filteredCatalogue = data.filter(b => b.id !== selectedFeatured.id);
              setBeatCatalogue(filteredCatalogue);
            } else {
              // Should not happen if data.length > 0, but safe fallback
              setFeaturedBeatData(data[0]);
              setBeatCatalogue(data.slice(1));
            }

          } else {
            setAllBeats([]);
            setBeatCatalogue([]);
            setFeaturedBeatData(null);
          }
        }
      } catch (e) {
        console.error("Failed to load beats", e);
      }
    }
    fetchBeats();
  }, []); // Remove dependency on setCurrentBeat to avoid loop

  // Filter Logic (Triggered by appliedFilters)
  useEffect(() => {
    let result = allBeats;

    // 1. Exclude Featured
    if (featuredBeatData && featuredBeatData.id) {
      result = result.filter(b => b.id !== featuredBeatData.id);
    }

    // 2. Filter Genre
    if (appliedFilters.genre) {
      result = result.filter(b => b.genre === appliedFilters.genre);
    }

    // 3. Filter BPM
    if (appliedFilters.bpmMin) {
      result = result.filter(b => b.bpm >= parseInt(appliedFilters.bpmMin));
    }
    if (appliedFilters.bpmMax) {
      result = result.filter(b => b.bpm <= parseInt(appliedFilters.bpmMax));
    }

    // 4. Filter Key
    if (appliedFilters.key) {
      result = result.filter(b => b.key.toLowerCase().includes(appliedFilters.key.toLowerCase()));
    }

    // 5. Search Term (Keep Live)
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(lower) ||
        b.artist.toLowerCase().includes(lower) ||
        (b.genre && b.genre.toLowerCase().includes(lower))
      );
    }

    setBeatCatalogue(result);
  }, [allBeats, featuredBeatData, appliedFilters, searchTerm]);

  const applyFilters = () => {
    setAppliedFilters({
      genre: pendingGenre,
      bpmMin: pendingBpmMin,
      bpmMax: pendingBpmMax,
      key: pendingKey
    });
  };

  const resetFilters = () => {
    setPendingGenre("");
    setPendingBpmMin("");
    setPendingBpmMax("");
    setPendingKey("");
    setAppliedFilters({
      genre: "",
      bpmMin: "",
      bpmMax: "",
      key: ""
    });
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={styles.page}>

      {/* Sidebar Cart moved to Layout */}


      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      {/* Background Animation */}
      <FallingComets />

      {/* Header moved to Layout */}


      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>SOUNDS FROM<br />THE COSMOS</h1>
          <p>Elevate your tracks with beats that are out of this world.</p>

          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="SEARCH FOR BEATS..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
              aria-label="Search for beats"
              role="searchbox"
            />
          </div>

          <a href="#featured" className={styles.ctaButton}>BROWSE BEATS</a>
        </div>


        {/* Featured Beat Card */}
        {featuredBeatData ? (
          <div className={styles.beatCardWrapper} id="featured">
            <div className={styles.beatCard}>
              <div className={styles.beatImageContainer}>
                <img src={featuredBeatData.cover} alt="Beat Cover" className={styles.beatImage} />
                <div className={styles.featuredBadge}>FEATURED BEAT</div>
              </div>

              <div className={styles.beatInfo}>
                <h2 className={styles.beatTitle}>{featuredBeatData.title}</h2>
                <div className={styles.beatMeta}>
                  <span className={styles.metaItem}>{featuredBeatData.bpm} BPM</span>
                  <span className={styles.metaSeparator}>•</span>
                  <span className={styles.metaItem}>{featuredBeatData.key}</span>
                  <span className={styles.metaSeparator}>•</span>
                  <span className={styles.metaItem}>{featuredBeatData.genre || "N/A"}</span>
                </div>

                {/* Custom Player: Play Button, Time, Soundbar, Volume */}
                {(() => {
                  const isFeaturedActive = currentBeat && currentBeat.id === featuredBeatData.id;
                  return (
                    <div className={styles.customPlayer}>
                      <div className={`${styles.playCircle} ${isFeaturedActive && isPlaying ? styles.playing : ''}`} onClick={() => playTrack(featuredBeatData)}>
                        {isFeaturedActive && isPlaying ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        )}
                      </div>

                      <div className={styles.playerControlsRow}>
                        <div className={styles.timeDisplay}>{formatTime(isFeaturedActive ? currentTime : 0)}</div>

                        <div className={styles.soundbarContainer}>
                          <input
                            type="range"
                            min="0"
                            max={isFeaturedActive ? (duration || 0) : 0}
                            step="0.05"
                            value={isFeaturedActive ? currentTime : 0}
                            onChange={(e) => handleSeek(parseFloat(e.target.value))}
                            className={styles.soundbarInput}
                            style={{ backgroundSize: `${isFeaturedActive && duration ? ((currentTime / duration) * 100) : 0}% 100%` }}
                          />
                        </div>

                        <div className={styles.timeDisplay}>{formatTime(isFeaturedActive ? duration : 0)}</div>

                        <div className={styles.cardVolume}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isFeaturedActive ? volume : 1}
                            onChange={handleVolume}
                            className={styles.volumeInputSmall}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className={styles.beatActions}>
                  <span className={styles.beatPrice}>FROM $14.99</span>
                  <Link href={`/beats/${featuredBeatData.id}${licenseQuery}`} className={styles.ctaButton}>
                    VIEW OPTIONS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '4rem' }}>Upload beats in Admin Panel to see them here.</p>
        )}

        {/* Filter Panel */}
        <section className={styles.filterSection}>
          <h3 className={styles.filterTitle}>MISSION CONTROL <SlidersIcon /></h3>
          <div className={styles.filterGrid}>
            {/* Genre */}
            <div className={styles.filterGroup}>
              <label>GENRE</label>
              <select value={pendingGenre} onChange={e => setPendingGenre(e.target.value)} className={styles.filterSelect} aria-label="Filter by genre">
                <option value="">All Genres</option>
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* BPM */}
            <div className={styles.filterGroup}>
              <label>BPM RANGE</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={pendingBpmMin}
                  onChange={e => setPendingBpmMin(e.target.value)}
                  className={styles.filterInput}
                  aria-label="Minimum BPM"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={pendingBpmMax}
                  onChange={e => setPendingBpmMax(e.target.value)}
                  className={styles.filterInput}
                  aria-label="Maximum BPM"
                />
              </div>
            </div>

            {/* Key */}
            <div className={styles.filterGroup}>
              <label>KEY</label>
              <input
                type="text"
                placeholder="e.g. Cm"
                value={pendingKey}
                onChange={e => setPendingKey(e.target.value)}
                className={styles.filterInput}
                aria-label="Filter by musical key"
              />
            </div>

            {/* Actions */}
            <div className={styles.filterGroup} style={{ justifyContent: 'flex-end' }}>
              <label style={{ visibility: 'hidden' }}>ACTIONS</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={applyFilters}
                  className={styles.filterResetBtn}
                  style={{ borderColor: 'var(--neon-blue)', color: 'var(--neon-blue)', flex: 1 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--neon-blue)'; e.currentTarget.style.color = '#000'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--neon-blue)'; }}
                >
                  SEARCH
                </button>
                <button onClick={resetFilters} className={styles.filterResetBtn} style={{ flex: 1 }}>
                  RESET
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Full Catalogue Section */}
        <section className={styles.catalogueSection}>
          <h2 className={styles.catalogueTitle}>FULL CATALOGUE</h2>
          <div className={styles.catalogueList}>
            {beatCatalogue.map((beat) => {
              const isMinActive = currentBeat && currentBeat.id === beat.id;

              return (
                <div key={beat.id} className={`${styles.catalogueItem} ${isMinActive ? styles.catItemActive : ''}`}>
                  <div className={styles.catMainRow}>
                    <div className={styles.catLeft} onClick={() => playTrack(beat)}>
                      <div className={styles.catImageWrapper}>
                        <img src={beat.cover} alt={beat.title} className={styles.catImage} />
                        <div className={styles.catPlayOverlay} style={{ opacity: isMinActive && isPlaying ? 1 : undefined }}>
                          {isMinActive && isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                          )}
                        </div>
                      </div>
                      <div className={styles.catInfo}>
                        <h3 className={styles.catTitle} style={{ color: isMinActive ? 'var(--neon-blue)' : '#fff' }}>
                          {beat.title}
                        </h3>
                        <span className={styles.catMeta}>
                          {/* Metadata moved to right for cleaner look */}
                        </span>
                      </div>
                    </div>

                    <div className={styles.catRight}>
                      {beat.genre && (
                        <span style={{
                          width: '100px', // Fixed width for alignment
                          color: '#d946ef',
                          background: 'rgba(217, 70, 239, 0.1)',
                          border: '1px solid rgba(217, 70, 239, 0.2)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.4rem 0', // Reduced side padding, rely on width/center
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'inline-block',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {beat.genre}
                        </span>
                      )}

                      {/* BPM Badge */}
                      <span style={{
                        width: '80px', // Fixed width
                        color: '#38bdf8',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.4rem 0',
                        borderRadius: '12px',
                        textAlign: 'center',
                        letterSpacing: '0.5px',
                        display: 'inline-block'
                      }}>
                        {beat.bpm} BPM
                      </span>

                      {/* Key Badge */}
                      <span style={{
                        width: '60px', // Fixed width
                        color: '#34d399',
                        background: 'rgba(52, 211, 153, 0.1)',
                        border: '1px solid rgba(52, 211, 153, 0.2)',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.4rem 0',
                        borderRadius: '12px',
                        textAlign: 'center',
                        letterSpacing: '0.5px',
                        display: 'inline-block'
                      }}>
                        {beat.key}
                      </span>

                      <Link href={`/beats/${beat.id}${licenseQuery}`} className={styles.catPrice} onClick={(e) => e.stopPropagation()}>
                        OPTIONS
                      </Link>

                      {/* Subscriber FREE Download Button */}
                      {subscriptionData && (subscriptionData.downloads?.remaining === 'Unlimited' || subscriptionData.downloads?.remaining === Infinity || Number(subscriptionData.downloads?.remaining) > 0) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubscriberDownload(beat);
                          }}
                          disabled={downloading === beat.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1rem',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                            transition: 'all 0.3s',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.6)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.4)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title={`${subscriptionData.remaining} free downloads remaining`}
                        >
                          <DownloadIcon />
                          {downloading === beat.id ? 'Downloading...' : 'FREE'}
                          <span style={{
                            fontSize: '0.7rem',
                            background: 'rgba(255,255,255,0.2)',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '10px',
                            marginLeft: '0.25rem'
                          }}>
                            {subscriptionData.downloads?.remaining} left
                          </span>
                        </button>
                      ) : (
                        <Link href={`/beats/${beat.id}${licenseQuery}`} className={styles.catAddBtn} onClick={(e) => e.stopPropagation()}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                          BUY
                        </Link>
                      )}

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <FavoriteButton beatId={beat.id} size={20} />
                        <Link href={`/beats/${beat.id}`} className={styles.catAddBtn} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', width: 'auto' }} onClick={(e) => e.stopPropagation()}>
                          <DownloadIcon />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Mini Player Row for Description/Controls */}
                  {isMinActive && (
                    <div className={styles.catPlayerRow}>
                      <div className={styles.catTime}>{formatTime(currentTime)}</div>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.05"
                        value={currentTime}
                        onChange={handleSeek}
                        className={styles.catProgressBar}
                        style={{ backgroundSize: `${(currentTime / duration) * 100}% 100%` }}
                      />
                      <div className={styles.catTime}>{formatTime(duration)}</div>

                      <div className={styles.catVolume}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={handleVolume}
                          className={styles.catVolumeInput}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className={styles.chromaticSeparator}></div>


        <section className={styles.contactSection}>
          <h2>Ready for Liftoff?</h2>
          <p>Get exclusive beats and sound kits before they vanish into the void.</p>

          <div className={styles.contactLinks}>
            <a href="mailto:andreadelfoco5@gmail.com" className={styles.contactLink}>Email Us</a>
            <a href="https://instagram.com/andrea_delfoco" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>Instagram</a>
          </div>
        </section>

      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
        <FallingComets />
        <main className={styles.main}>
          <div className={styles.hero}>
            <h1>SOUNDS FROM<br />THE COSMOS</h1>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
