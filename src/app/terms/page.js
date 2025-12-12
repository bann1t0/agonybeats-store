import React from 'react';

export const metadata = {
    title: "Terms & Licensing | AgonyBeats",
    description: "Read our beat leasing terms and conditions.",
};

export default function TermsPage() {
    return (
        <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '8rem 2rem 4rem 2rem',
            color: '#fff',
            fontFamily: 'sans-serif'
        }}>
            <h1 style={{
                fontSize: '3rem',
                marginBottom: '2rem',
                textAlign: 'center',
                fontFamily: 'var(--font-orbitron)',
                color: 'var(--neon-blue)',
                textShadow: '0 0 20px rgba(14, 165, 233, 0.3)'
            }}>
                LICENSING TERMS
            </h1>

            <div style={{ display: 'grid', gap: '2rem' }}>

                {/* Standard Lease */}
                <div style={cardStyle}>
                    <h2 style={licenseTitleStyle("var(--neon-blue)")}>STANDARD LEASE ($29.99)</h2>
                    <ul style={listStyle}>
                        <li>Untagged MP3 File</li>
                        <li>Sell up to 5,000 Units</li>
                        <li>50,000 Audio Streams</li>
                        <li>1 Music Video</li>
                        <li>For Profit Live Performances</li>
                        <li>Must Credit (Prod. AgonyBeats)</li>
                    </ul>
                </div>

                {/* Premium Lease */}
                <div style={cardStyle}>
                    <h2 style={licenseTitleStyle("var(--neon-purple)")}>PREMIUM LEASE ($49.99)</h2>
                    <ul style={listStyle}>
                        <li>Untagged WAV + MP3 Files</li>
                        <li>Sell up to 20,000 Units</li>
                        <li>200,000 Audio Streams</li>
                        <li>2 Music Videos</li>
                        <li>Radio Broadcasting Rights</li>
                        <li>Must Credit (Prod. AgonyBeats)</li>
                    </ul>
                </div>

                {/* Unlimited Lease */}
                <div style={cardStyle}>
                    <h2 style={licenseTitleStyle("gold")}>UNLIMITED LEASE ($149.99)</h2>
                    <ul style={listStyle}>
                        <li>Untagged WAV + MP3 + Track Stems</li>
                        <li>Unlimited Sales & Streams</li>
                        <li>Unlimited Projects</li>
                        <li>Full Broadcasting Rights</li>
                        <li>Must Credit (Prod. AgonyBeats)</li>
                    </ul>
                </div>

                <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '1rem' }}>General Terms</h3>
                    <p style={{ lineHeight: '1.6', color: '#ccc' }}>
                        All purchases are final and non-refundable. By purchasing a license, you agree to the terms listed above.
                        Ownership of the beat remains with AgonyBeats until an Executive Exclusive License is purchased (Contact specifically for this).
                        <br /><br />
                        You must credit the producer in all metadata and descriptions as "Prod. AgonyBeats".
                    </p>
                </div>

            </div>
        </div>
    );
}

const cardStyle = {
    background: 'rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '2rem',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s',
};

const licenseTitleStyle = (color) => ({
    color: color,
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    borderBottom: `1px solid ${color}`,
    paddingBottom: '0.5rem',
    fontFamily: 'var(--font-orbitron)'
});

const listStyle = {
    listStyle: 'none',
    padding: 0,
    lineHeight: '2',
    color: '#ddd'
};
