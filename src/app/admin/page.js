"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [beats, setBeats] = useState([]);
    const [editingBeat, setEditingBeat] = useState(null); // If set, we are in "Edit Mode"
    const [coverPreview, setCoverPreview] = useState(null); // Preview for cover upload

    // Icons
    const RocketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>;
    const StarIcon = ({ filled }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
    const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path><path d="M7 7h.01"></path></svg>;
    const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

    // Discount State
    const [discounts, setDiscounts] = useState([]);
    const [newDiscountCode, setNewDiscountCode] = useState("");
    const [newDiscountPercent, setNewDiscountPercent] = useState("");

    const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
    const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;

    // Soundkit State
    const [soundkits, setSoundkits] = useState([]);
    const [editingSoundkit, setEditingSoundkit] = useState(null);
    const [soundkitCoverPreview, setSoundkitCoverPreview] = useState(null);
    const [loadingSoundkit, setLoadingSoundkit] = useState(false);

    // License State
    const [licenses, setLicenses] = useState([]);
    const [beatLicenses, setBeatLicenses] = useState({}); // { [licenseId]: { enabled: bool, price: number } }
    const [newLicenseName, setNewLicenseName] = useState("");
    const [newLicensePrice, setNewLicensePrice] = useState("");
    const [newLicenseFeatures, setNewLicenseFeatures] = useState(""); // JSON array as text? Maybe separate inputs?
    const [newLicenseRecommended, setNewLicenseRecommended] = useState(false);

    // Newsletter State
    const [view, setView] = useState("beats"); // "beats", "kits", "discounts", "licenses", "newsletter"
    // Email Send State
    // Email Send State
    const [subscribers, setSubscribers] = useState([]);
    const [selectedEmails, setSelectedEmails] = useState(new Set()); // Track selected emails
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [sendingEmail, setSendingEmail] = useState(false);

    // Attachment State
    const [featuredBeatId, setFeaturedBeatId] = useState("");
    const [attachment, setAttachment] = useState(null);

    // Icons (New)
    const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.55 4.24"></path><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>;
    const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>;
    const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

    // Fetch beats on load
    async function fetchBeats() {
        const res = await fetch("/api/beats");
        if (res.ok) {
            setBeats(await res.json());
        }
    }

    async function fetchSoundkits() {
        const res = await fetch("/api/soundkits");
        if (res.ok) {
            setSoundkits(await res.json());
        }
    }

    async function fetchLicenses() {
        const res = await fetch("/api/licenses");
        if (res.ok) {
            setLicenses(await res.json());
        }
    }

    async function fetchSubscribers() {
        const res = await fetch("/api/newsletter");
        if (res.ok) {
            setSubscribers(await res.json());
        }
    }

    function copyEmails() {
        const emails = subscribers.map(s => s.email).join(", ");
        navigator.clipboard.writeText(emails);
        navigator.clipboard.writeText(emails);
        setMessage("Emails copied to clipboard! 📋");
    }

    function toggleEmail(email) {
        setSelectedEmails(prev => {
            const newSet = new Set(prev);
            if (newSet.has(email)) {
                newSet.delete(email);
            } else {
                newSet.add(email);
            }
            return newSet;
        });
    }

    function selectAllEmails() {
        setSelectedEmails(new Set(subscribers.map(s => s.email)));
    }

    function deselectAllEmails() {
        setSelectedEmails(new Set());
    }

    async function sendNewsletter(e) {
        e.preventDefault();
        const recipientCount = selectedEmails.size > 0 ? selectedEmails.size : subscribers.length;
        const recipientText = selectedEmails.size > 0 ? `${selectedEmails.size} selected subscriber(s)` : `all ${subscribers.length} subscribers`;

        if (!confirm(`Send this email to ${recipientText}?`)) return;

        setSendingEmail(true);
        try {
            const formData = new FormData();
            formData.append("subject", emailSubject);
            formData.append("message", emailBody);
            if (featuredBeatId) formData.append("featuredBeatId", featuredBeatId);
            if (attachment) formData.append("file", attachment);

            // Add selected emails if any are selected
            if (selectedEmails.size > 0) {
                formData.append("selectedEmails", JSON.stringify(Array.from(selectedEmails)));
            }

            const res = await fetch("/api/newsletter/send", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send");

            setMessage(data.message);
            setEmailSubject("");
            setEmailBody("");
            setFeaturedBeatId("");
            setAttachment(null);
            setSelectedEmails(new Set()); // Clear selection after sending
            // Reset file input by ID just to be safe
            const fileInput = document.getElementById('newsletter-file-input');
            if (fileInput) fileInput.value = '';

        } catch (error) {
            alert(error.message);
        } finally {
            setSendingEmail(false);
        }
    }

    // Fetch beats on load
    useEffect(() => {
        fetchBeats();
        fetchBeats();
        fetchSoundkits();
        fetchSoundkits();
        fetchLicenses();
        fetchDiscounts();
        fetchSubscribers();
    }, []);

    // Redirect non-admin users
    useEffect(() => {
        if (status !== "loading" && (!session || session.user.role !== "admin")) {
            router.push("/");
        }
    }, [session, status, router]);

    if (status === "loading") return <p>Loading...</p>;

    if (!session || session.user.role !== "admin") {
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const formData = new FormData(e.target);

        try {
            let coverPath = editingBeat?.cover;
            let audioPath = editingBeat?.audio;
            let taggedAudioPath = editingBeat?.taggedAudio;
            let wavPath = editingBeat?.wav;
            let stemsPath = editingBeat?.stems;

            // 1. Upload Cover (only if new file selected)
            const coverFile = formData.get("cover");
            if (coverFile && coverFile.size > 0) {
                const coverData = new FormData();
                coverData.append("file", coverFile);
                const coverRes = await fetch("/api/upload", { method: "POST", body: coverData });
                const coverJson = await coverRes.json();
                if (coverJson.error) throw new Error(coverJson.error);
                coverPath = coverJson.path;
            }

            // 2. Upload Audio (only if new file selected)
            const audioFile = formData.get("audio");
            if (audioFile && audioFile.size > 0) {
                const audioData = new FormData();
                audioData.append("file", audioFile);
                const audioRes = await fetch("/api/upload", { method: "POST", body: audioData });
                const audioJson = await audioRes.json();
                if (audioJson.error) throw new Error(audioJson.error);
                audioPath = audioJson.path;
            }

            // 3. Upload Tagged Audio (optional)
            const taggedFile = formData.get("taggedAudio");
            if (taggedFile && taggedFile.size > 0) {
                const taggedData = new FormData();
                taggedData.append("file", taggedFile);
                const taggedRes = await fetch("/api/upload", { method: "POST", body: taggedData });
                const taggedJson = await taggedRes.json();
                if (taggedJson.error) throw new Error(taggedJson.error);
                taggedAudioPath = taggedJson.path;
                taggedAudioPath = taggedJson.path;
            }

            // 4. Upload WAV (optional)
            const wavFile = formData.get("wav");
            if (wavFile && wavFile.size > 0) {
                const wavData = new FormData();
                wavData.append("file", wavFile);
                const wavRes = await fetch("/api/upload", { method: "POST", body: wavData });
                const wavJson = await wavRes.json();
                if (wavJson.error) throw new Error(wavJson.error);
                wavPath = wavJson.path;
            }

            // 5. Upload Stems (optional)
            const stemsFile = formData.get("stems");
            if (stemsFile && stemsFile.size > 0) {
                const stemsData = new FormData();
                stemsData.append("file", stemsFile);
                const stemsRes = await fetch("/api/upload", { method: "POST", body: stemsData });
                const stemsJson = await stemsRes.json();
                if (stemsJson.error) throw new Error(stemsJson.error);
                stemsPath = stemsJson.path;
            }

            // 3. Create OR Update Beat Entry
            const beatData = {
                title: formData.get("title"),
                bpm: formData.get("bpm"),
                key: formData.get("key"),
                genre: formData.get("genre"),
                // price is handled by license selection now
                // Wait, if no license is selected, maybe default price? Or use one of the licenses?
                // Let's assume price field on Beat model is basic display price (min price).
                // We'll calculate it from selected licenses or just send 0 if none.
                price: Object.values(beatLicenses).filter(l => l.enabled).reduce((min, cur) => cur.price && cur.price < min ? Number(cur.price) : min, 999999) === 999999 ? 0 : Object.values(beatLicenses).filter(l => l.enabled).reduce((min, cur) => cur.price && cur.price < min ? Number(cur.price) : min, 999999),

                cover: coverPath,
                audio: audioPath,
                taggedAudio: taggedAudioPath,
                wav: wavPath,
                stems: stemsPath,
                licenses: Object.entries(beatLicenses)
                    .filter(([_, v]) => v.enabled)
                    .map(([id, v]) => ({
                        licenseId: id,
                        price: v.price
                    }))
            };

            const url = editingBeat ? `/api/beats/${editingBeat.id}` : "/api/beats";
            const method = editingBeat ? "PUT" : "POST";

            const dbRes = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(beatData),
            });

            if (!dbRes.ok) {
                const errData = await dbRes.json();
                throw new Error(errData.error || "Failed to save beat");
            }

            setMessage(editingBeat ? "Beat Updated Successfully!" : "Beat Uploaded Successfully!");

            e.target.reset();
            setEditingBeat(null); // Exit edit mode
            setBeatLicenses({});
            fetchBeats(); // Refresh list

        } catch (error) {
            console.error(error);
            setMessage("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this beat?")) return;

        try {
            const res = await fetch(`/api/beats/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            fetchBeats();
        } catch (e) {
            alert(e.message);
        }
    }

    function startEdit(beat) {
        setEditingBeat(beat);
        setCoverPreview(beat.cover); // Set preview to existing cover

        // Populate Licenses
        const licState = {};
        if (beat.licenses) {
            beat.licenses.forEach(bl => {
                licState[bl.licenseId] = { enabled: true, price: bl.price !== null ? bl.price : undefined };
            });
        }
        setBeatLicenses(licState);

        setMessage("Editing: " + beat.title);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function toggleFeature(id) {
        try {
            const res = await fetch(`/api/beats/${id}/feature`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to set featured beat");
            await fetchBeats(); // Refresh to see update
            setMessage("Featured Beat Updated! 🌟");
        } catch (e) {
            alert(e.message);
        }
    }

    // Handle File Preview
    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setCoverPreview(null);
        }
    };

    /* --- DISCOUNT FUNCTIONS --- */
    async function fetchDiscounts() {
        const res = await fetch("/api/discounts");
        if (res.ok) setDiscounts(await res.json());
    }

    async function createDiscount(e) {
        e.preventDefault();
        try {
            const res = await fetch("/api/discounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: newDiscountCode, percentage: newDiscountPercent })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create code");
            }

            setMessage("Code Created! 🎉");
            setNewDiscountCode("");
            setNewDiscountPercent("");
            fetchDiscounts();
        } catch (e) {
            alert(e.message);
        }
    }

    /* --- LICENSE FUNCTIONS --- */
    async function createLicense(e) {
        e.preventDefault();
        try {
            // Parse features: assume comma separated
            const featuresList = newLicenseFeatures.split(',').map(f => f.trim()).filter(f => f);

            const res = await fetch("/api/licenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newLicenseName,
                    defaultPrice: newLicensePrice,
                    features: featuresList,
                    isRecommended: newLicenseRecommended
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create license");
            }

            setMessage("License Created! 📜");
            setNewLicenseName("");
            setNewLicensePrice("");
            setNewLicenseFeatures("");
            setNewLicenseRecommended(false);
            fetchLicenses();
        } catch (e) {
            alert(e.message);
        }
    }

    async function deleteLicense(id) {
        if (!confirm("Are you sure you want to delete this license? This cannot be undone.")) return;

        try {
            const res = await fetch(`/api/licenses/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to delete license");
            }
            setMessage("License Deleted! 🗑️");
            fetchLicenses();
        } catch (e) {
            alert(e.message);
        }
    }

    /* --- SOUNDKIT FUNCTIONS --- */
    async function handleSoundkitSubmit(e) {
        e.preventDefault();
        setLoadingSoundkit(true);
        setMessage("");

        const formData = new FormData(e.target);

        try {
            let coverPath = editingSoundkit?.cover;
            let audioPath = editingSoundkit?.audioPreview;
            let mainFilePath = editingSoundkit?.file;

            // 1. Upload Cover
            const coverFile = formData.get("cover");
            if (coverFile && coverFile.size > 0) {
                const coverData = new FormData();
                coverData.append("file", coverFile);
                const coverRes = await fetch("/api/upload", { method: "POST", body: coverData });
                const coverJson = await coverRes.json();
                if (coverJson.error) throw new Error(coverJson.error);
                coverPath = coverJson.path;
            }

            // 2. Upload Audio Preview
            const audioFile = formData.get("audioPreview");
            if (audioFile && audioFile.size > 0) {
                const audioData = new FormData();
                audioData.append("file", audioFile);
                const audioRes = await fetch("/api/upload", { method: "POST", body: audioData });
                const audioJson = await audioRes.json();
                if (audioJson.error) throw new Error(audioJson.error);
                audioPath = audioJson.path;
            }

            // 3. Upload Main File
            const mainFile = formData.get("file");
            if (mainFile && mainFile.size > 0) {
                const mainData = new FormData();
                mainData.append("file", mainFile);
                const mainRes = await fetch("/api/upload", { method: "POST", body: mainData });
                const mainJson = await mainRes.json();
                if (mainJson.error) throw new Error(mainJson.error);
                mainFilePath = mainJson.path;
            }

            // 4. Construct JSON Payload
            const soundkitData = {
                title: formData.get("title"),
                genre: formData.get("genre"),
                description: formData.get("description"),
                price: formData.get("price"),
                cover: coverPath,
                audioPreview: audioPath,
                file: mainFilePath
            };

            const url = editingSoundkit ? `/api/soundkits/${editingSoundkit.id}` : "/api/soundkits";
            const method = editingSoundkit ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(soundkitData)
            });

            if (!res.ok) {
                console.error("Server Error Status:", res.status);
                const text = await res.text();
                console.error("Server Error Text:", text);
                try {
                    const err = JSON.parse(text);
                    throw new Error(err.error || "Failed to save soundkit");
                } catch (e) {
                    throw new Error(`Server error (${res.status}): ${text || "Unknown error"}`);
                }
            }

            setMessage(editingSoundkit ? "Soundkit Updated! 📦" : "Soundkit Created! 📦");
            e.target.reset();
            setEditingSoundkit(null);
            fetchSoundkits();

        } catch (error) {
            console.error(error);
            setMessage("Error: " + error.message);
        } finally {
            setLoadingSoundkit(false);
        }
    }

    async function handleDeleteSoundkit(id) {
        if (!confirm("Delete this soundkit?")) return;
        try {
            const res = await fetch(`/api/soundkits/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            fetchSoundkits();
        } catch (e) {
            alert(e.message);
        }
    }

    function startEditSoundkit(kit) {
        setEditingSoundkit(kit);
        setSoundkitCoverPreview(kit.cover);
        setMessage("Editing Soundkit: " + kit.title);
        // Scroll to form
        const form = document.getElementById("soundkitForm");
        if (form) form.scrollIntoView({ behavior: 'smooth' });
    }

    const handleSoundkitCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSoundkitCoverPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setSoundkitCoverPreview(null);
        }
    };

    return (
        <div className={styles.adminContainer}>
            <div style={{ marginBottom: "1rem" }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#888', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.9rem' }}>
                    <ArrowLeftIcon /> BACK TO STORE
                </Link>
            </div>
            <h1 className={styles.heroTitle}>Admin Dashboard</h1>
            <p style={{ marginBottom: "2rem", color: "#888" }}>Manage your cosmic sound library.</p>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setView("beats")}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: view === "beats" ? '#0ea5e9' : '#222',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: view === "beats" ? '0 0 15px rgba(14, 165, 233, 0.4)' : 'none'
                    }}
                >
                    Store Management
                </button>
                <button
                    onClick={() => { setView("newsletter"); fetchSubscribers(); }}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: view === "newsletter" ? '#d946ef' : '#222',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: view === "newsletter" ? '0 0 15px rgba(217, 70, 239, 0.4)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <MailIcon /> Newsletter
                </button>
            </div>

            {message && <p style={{ color: message.includes("Error") ? "red" : "lime", marginBottom: "1rem" }}>{message}</p>}

            {view === "beats" && (
                <>

                    <form onSubmit={handleSubmit} className={styles.uploadForm}>
                        <h3 style={{ color: 'white', marginBottom: '1rem' }}>{editingBeat ? "Edit Beat" : "Upload New Beat"}</h3>

                        <div className={styles.formGroup}>
                            <label>Title</label>
                            <input name="title" defaultValue={editingBeat?.title} required className={styles.searchInput} placeholder="e.g. Nebula Walk" />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                            <div className={styles.formGroup}>
                                <label>BPM</label>
                                <input name="bpm" type="number" defaultValue={editingBeat?.bpm} required className={styles.searchInput} placeholder="140" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Key</label>
                                <input name="key" defaultValue={editingBeat?.key} required className={styles.searchInput} placeholder="Cm" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Genre</label>
                                <input name="genre" defaultValue={editingBeat?.genre} required className={styles.searchInput} placeholder="Trap" />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Cover Image {editingBeat && "(Leave empty to keep current)"}</label>
                            <input name="cover" type="file" accept="image/*" required={!editingBeat} className={styles.fileInput} onChange={handleCoverChange} />
                            {coverPreview && (
                                <div style={{ marginTop: '1rem', width: '100px', height: '100px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #333' }}>
                                    <img src={coverPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Audio File (Streaming/Untagged) {editingBeat && "(Leave empty to keep current)"}</label>
                            <input name="audio" type="file" accept="audio/*" required={!editingBeat} className={styles.fileInput} />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Tagged File (Free Download) {editingBeat && "(Leave empty to keep current)"}</label>
                            <input name="taggedAudio" type="file" accept="audio/*" className={styles.fileInput} />
                        </div>

                        <div className={styles.formGroup}>
                            <label>WAV File (Premium License) {editingBeat && "(Leave empty to keep current)"}</label>
                            <input name="wav" type="file" accept=".wav,audio/wav" className={styles.fileInput} />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Stems (Trackout License - ZIP) {editingBeat && "(Leave empty to keep current)"}</label>
                            <input name="stems" type="file" accept=".zip,application/zip" className={styles.fileInput} />
                        </div>

                        {/* Licenses Selection */}
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #333' }}>
                            <label style={{ display: 'block', color: 'white', marginBottom: '1rem', fontWeight: 'bold' }}>Enabled Licenses</label>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {licenses.map(lic => {
                                    const isEnabled = beatLicenses[lic.id]?.enabled;
                                    const price = beatLicenses[lic.id]?.price !== undefined ? beatLicenses[lic.id]?.price : lic.defaultPrice;

                                    return (
                                        <div key={lic.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: isEnabled ? 'rgba(14, 165, 233, 0.1)' : 'transparent' }}>
                                            <input
                                                type="checkbox"
                                                checked={!!isEnabled}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setBeatLicenses(prev => {
                                                        const newState = { ...prev };
                                                        if (checked) {
                                                            newState[lic.id] = {
                                                                enabled: true,
                                                                price: prev[lic.id]?.price || lic.defaultPrice
                                                            };
                                                        } else {
                                                            // Remove the license entirely when unchecked
                                                            delete newState[lic.id];
                                                        }
                                                        return newState;
                                                    });
                                                }}
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                            <div style={{ flex: 1, color: isEnabled ? 'white' : '#888' }}>
                                                <strong>{lic.name}</strong>
                                            </div>
                                            {isEnabled && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ color: '#888' }}>$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={price}
                                                        onChange={(e) => {
                                                            setBeatLicenses(prev => ({
                                                                ...prev,
                                                                [lic.id]: { ...prev[lic.id], price: e.target.value }
                                                            }));
                                                        }}
                                                        style={{ width: '80px', background: '#222', border: '1px solid #444', color: 'white', padding: '0.2rem' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" disabled={loading} className={styles.ctaButton} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                {loading ? "Processing..." : (editingBeat ? <>Update Beat <StarIcon filled={true} /></> : <>Publish Beat <RocketIcon /></>)}
                            </button>
                            {editingBeat && (
                                <button type="button" onClick={() => { setEditingBeat(null); setCoverPreview(null); setMessage(""); setBeatLicenses({}); }} className={styles.ctaButton} style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <div className={styles.chromaticSeparator} style={{ margin: '3rem 0' }}></div>

                    <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Your Beats ({beats.length})</h2>
                    <div className={styles.catalogueList} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {beats.map(beat => (
                            <div key={beat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <img src={beat.cover} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                    <div>
                                        <span style={{ fontWeight: 'bold', color: 'white', display: 'block' }}>{beat.title}</span>
                                        <span style={{ color: '#888', fontSize: '0.8rem' }}>{beat.bpm} BPM • {beat.key}</span>
                                        {beat.stems ? (
                                            <span style={{ marginLeft: '1rem', fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 4px', borderRadius: '4px' }}>STEMS OK</span>
                                        ) : (
                                            <span style={{ marginLeft: '1rem', fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '2px 4px', borderRadius: '4px' }}>NO STEMS</span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => toggleFeature(beat.id)} style={{ padding: '0.5rem', background: beat.isFeatured ? '#eab308' : '#333', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}>
                                        <StarIcon filled={beat.isFeatured} />
                                    </button>
                                    <button onClick={() => startEdit(beat)} style={{ padding: '0.5rem 1rem', background: '#3b82f6', border: 'none', color: 'white', cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDelete(beat.id)} style={{ padding: '0.5rem 1rem', background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.chromaticSeparator} style={{ margin: '3rem 0' }}></div>

                    {/* --- SOUNDKIT MANAGEMENT SECTION --- */}
                    <h2 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Soundkits <PackageIcon /></h2>

                    <form id="soundkitForm" onSubmit={handleSoundkitSubmit} className={styles.uploadForm}>
                        <h3 style={{ color: 'white', marginBottom: '1rem' }}>{editingSoundkit ? "Edit Soundkit" : "Upload Soundkit"}</h3>

                        <div className={styles.formGroup}>
                            <label>Title</label>
                            <input name="title" defaultValue={editingSoundkit?.title} required className={styles.searchInput} placeholder="e.g. Spaced Out Drum Kit" />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Description (Visible in Store)</label>
                            <textarea name="description" defaultValue={editingSoundkit?.description} required className={styles.searchInput} style={{ minHeight: '100px', resize: 'vertical' }} placeholder="Describe the sounds, contents, and vibe..." />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Genre</label>
                            <input name="genre" defaultValue={editingSoundkit?.genre} className={styles.searchInput} placeholder="e.g. Trap, Lo-Fi" />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Price ($)</label>
                            <input name="price" defaultValue={editingSoundkit?.price} type="number" step="0.01" required className={styles.searchInput} placeholder="29.99" />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Cover Image</label>
                            <input name="cover" type="file" accept="image/*" required={!editingSoundkit} className={styles.fileInput} onChange={handleSoundkitCoverChange} />
                            {soundkitCoverPreview && (
                                <div style={{ marginTop: '1rem', width: '100px', height: '100px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #333' }}>
                                    <img src={soundkitCoverPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Audio Preview (MP3)</label>
                            <input name="audioPreview" type="file" accept="audio/*" required={!editingSoundkit} className={styles.fileInput} />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Main File (ZIP/RAR)</label>
                            <input name="file" type="file" accept=".zip,.rar,.7z" required={!editingSoundkit} className={styles.fileInput} />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" disabled={loadingSoundkit} className={styles.ctaButton} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                {loadingSoundkit ? "Processing..." : (editingSoundkit ? <>Update Soundkit <StarIcon filled={true} /></> : <>Upload Soundkit <RocketIcon /></>)}
                            </button>
                            {editingSoundkit && (
                                <button type="button" onClick={() => { setEditingSoundkit(null); setSoundkitCoverPreview(null); setMessage(""); }} className={styles.ctaButton} style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <div className={styles.catalogueList} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                        {soundkits.map(sk => (
                            <div key={sk.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <img src={sk.cover} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                    <div>
                                        <h4 style={{ margin: 0, color: 'white' }}>{sk.title}</h4>
                                        <span style={{ color: '#888', fontSize: '0.8rem' }}>${sk.price} • {sk.file ? "File Ready" : "No File"}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => startEditSoundkit(sk)} style={{ padding: '0.5rem 1rem', background: '#3b82f6', border: 'none', color: 'white', cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDeleteSoundkit(sk.id)} style={{ padding: '0.5rem 1rem', background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.chromaticSeparator} style={{ margin: '3rem 0' }}></div>

                    {/* --- LICENSE MANAGEMENT SECTION --- */}
                    <h2 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Global Licenses <FileTextIcon /></h2>

                    <form onSubmit={createLicense} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>License Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Basic MP3 Lease"
                                    value={newLicenseName}
                                    onChange={e => setNewLicenseName(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>Default Price ($)</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    placeholder="29.99"
                                    value={newLicensePrice}
                                    onChange={e => setNewLicensePrice(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>Features (comma separated)</label>
                            <textarea
                                required
                                placeholder="MP3 Untagged, Commercial Use, 100k Streams"
                                value={newLicenseFeatures}
                                onChange={e => setNewLicenseFeatures(e.target.value)}
                                className={styles.searchInput}
                                style={{ minHeight: '80px', resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="recCheck"
                                checked={newLicenseRecommended}
                                onChange={e => setNewLicenseRecommended(e.target.checked)}
                                style={{ width: '16px', height: '16px' }}
                            />
                            <label htmlFor="recCheck" style={{ color: 'white', cursor: 'pointer' }}>Set as "Best Value" / Recommended</label>
                        </div>
                        <button type="submit" className={styles.ctaButton} style={{ width: '100%' }}>Create Global License</button>
                    </form>

                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
                        {licenses.map(lic => (
                            <div key={lic.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', border: '1px solid #333' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{lic.name}</span>
                                        {lic.isRecommended && <span style={{ background: '#d946ef', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>BEST VALUE</span>}
                                    </div>
                                    <span style={{ color: '#d946ef', marginLeft: '0rem' }}>${lic.defaultPrice}</span>
                                    <p style={{ color: '#888', margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
                                        {(() => {
                                            try {
                                                return JSON.parse(lic.features || "[]").join(" • ");
                                            } catch (e) { return lic.features; }
                                        })()}
                                    </p>
                                </div>
                                <div style={{ color: '#fff' }}>
                                    <button onClick={() => deleteLicense(lic.id)} style={{ padding: '0.5rem', background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                        {licenses.length === 0 && <p style={{ color: '#666' }}>No global licenses yet.</p>}
                    </div>

                    <div className={styles.chromaticSeparator} style={{ margin: '3rem 0' }}></div>

                    {/* --- DISCOUNT MANAGEMENT SECTION --- */}
                    <h2 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Discount Codes <TagIcon /></h2>

                    <form onSubmit={createDiscount} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>Code Name</label>
                            <input
                                type="text"
                                required
                                placeholder="SUMMER25"
                                value={newDiscountCode}
                                onChange={e => setNewDiscountCode(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                        <div style={{ width: '150px' }}>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>% Off</label>
                            <input
                                type="number"
                                required
                                min="1" max="100"
                                placeholder="20"
                                value={newDiscountPercent}
                                onChange={e => setNewDiscountPercent(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                        <button type="submit" className={styles.ctaButton} style={{ height: '42px', padding: '0 2rem' }}>Create</button>
                    </form>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {discounts.map(d => (
                            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', border: '1px solid #333' }}>
                                <div>
                                    <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold', fontSize: '1.1rem' }}>{d.code}</span>
                                    <span style={{ color: '#888', marginLeft: '1rem' }}>{d.percentage}% OFF</span>
                                </div>
                                <div style={{ color: '#fff' }}>
                                    Used: <strong style={{ color: 'lime' }}>{d.uses}</strong> times
                                </div>
                            </div>
                        ))}
                        {discounts.length === 0 && <p style={{ color: '#666' }}>No active codes.</p>}
                    </div>
                </>
            )}

            {view === "newsletter" && (
                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>Newsletter Subscribers ({subscribers.length})</h2>

                    {/* Subscriber List */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden', marginBottom: '3rem' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <span style={{ color: '#888' }}>Recent Subscribers</span>
                                <button
                                    onClick={fetchSubscribers}
                                    style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}
                                >
                                    🔄 Refresh List
                                </button>
                                {selectedEmails.size > 0 && (
                                    <span style={{ color: '#0ea5e9', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        {selectedEmails.size} selected
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={selectAllEmails}
                                    className={styles.ctaButton}
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#10b981' }}
                                >
                                    ✓ Select All
                                </button>
                                <button
                                    onClick={deselectAllEmails}
                                    className={styles.ctaButton}
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#ef4444' }}
                                >
                                    ✗ Deselect All
                                </button>
                                <button onClick={copyEmails} className={styles.ctaButton} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                                    <CopyIcon /> Copy All
                                </button>
                            </div>
                        </div>
                        {subscribers.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No subscribers yet.</div>
                        ) : (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.05)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#888', fontWeight: 'normal', width: '50px' }}>Send</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontWeight: 'normal' }}>Email</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontWeight: 'normal' }}>Type</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontWeight: 'normal' }}>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscribers.map((sub, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEmails.has(sub.email)}
                                                        onChange={() => toggleEmail(sub.email)}
                                                        style={{
                                                            width: '18px',
                                                            height: '18px',
                                                            cursor: 'pointer',
                                                            accentColor: '#0ea5e9'
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '1rem', color: 'white' }}>{sub.email}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        background: sub.type === 'User' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                        color: sub.type === 'User' ? '#60a5fa' : '#34d399',
                                                        padding: '2px 8px',
                                                        borderRadius: '10px',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        {sub.type || 'Guest'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', color: '#888', fontSize: '0.9rem' }}>
                                                    {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className={styles.chromaticSeparator} style={{ margin: '3rem 0' }}></div>

                    {/* Compose Section */}
                    <div style={{ maxWidth: '800px' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MailIcon /> Compose Newsletter
                        </h3>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className={styles.formGroup}>
                                <label>Subject Line</label>
                                <input
                                    type="text"
                                    required
                                    className={styles.searchInput}
                                    placeholder="New Beat Drop: COSMOS 🌌"
                                    value={emailSubject}
                                    onChange={e => setEmailSubject(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Message (HTML sensitive, be careful)</label>
                                <textarea
                                    required
                                    className={styles.searchInput}
                                    style={{ minHeight: '300px', resize: 'vertical', fontFamily: 'monospace', lineHeight: '1.5' }}
                                    placeholder="Hey everyone, just uploaded a new track..."
                                    value={emailBody}
                                    onChange={e => setEmailBody(e.target.value)}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                                    Tip: You can use basic text. New lines will be converted to breaks.
                                </p>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #333' }}>
                                <label style={{ display: 'block', color: 'var(--neon-blue)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Feature a Beat <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal' }}>(Optional)</span>
                                </label>
                                <select
                                    value={featuredBeatId}
                                    onChange={e => setFeaturedBeatId(e.target.value)}
                                    className={styles.searchInput}
                                    style={{ marginBottom: '1rem' }}
                                >
                                    <option value="">None (No visual card)</option>
                                    {beats.map(b => (
                                        <option key={b.id} value={b.id}>{b.title} ({b.bpm} BPM)</option>
                                    ))}
                                </select>

                                {featuredBeatId && (
                                    <div style={{ marginBottom: '1rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                                        {/* Optional separation or info */}
                                    </div>
                                )}

                                <label style={{ display: 'block', color: 'white', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Attach File <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal' }}>(any file from your computer)</span>
                                </label>
                                <input
                                    id="newsletter-file-input"
                                    type="file"
                                    onChange={e => setAttachment(e.target.files[0])}
                                    className={styles.fileInput}
                                />
                                {attachment && (
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#34d399' }}>
                                        Ready to attach: {attachment.name} ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={sendNewsletter}
                            disabled={sendingEmail || subscribers.length === 0}
                            className={styles.ctaButton}
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}
                        >
                            {sendingEmail ? "Sending..." : <>
                                <SendIcon />
                                Send to {selectedEmails.size > 0 ? selectedEmails.size : subscribers.length} Subscriber{(selectedEmails.size > 0 ? selectedEmails.size : subscribers.length) !== 1 ? 's' : ''}
                            </>}
                        </button>
                    </div>
                </div >
            )}
        </div >
    );
}
