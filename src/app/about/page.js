import React from 'react';

export const metadata = {
    title: "About | AgonyBeats",
    description: "Learn more about the producer behind the sounds.",
};

export default function AboutPage() {
    return (
        <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '8rem 2rem 4rem 2rem',
            color: '#fff',
            fontFamily: 'sans-serif'
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    marginBottom: '1rem',
                    fontFamily: 'var(--font-orbitron)',
                    color: 'var(--neon-purple)',
                    textShadow: '0 0 30px rgba(217, 70, 239, 0.3)'
                }}>
                    AGONYBEATS
                </h1>
                <p style={{ fontSize: '1.5rem', fontStyle: 'italic', color: '#aaa' }}>
                    "Sounds from the Cosmos"
                </p>
            </div>

            {/* Bio */}
            <div style={sectionStyle}>
                <h2 style={headerStyle}>THE VISION</h2>
                <p style={textStyle}>
                    AgonyBeats is not just about music; it's about creating an atmosphere.
                    Specializing in Dark Space Trap and Futuristic Hip-Hop, every beat is crafted to transport the listener to another dimension.
                    <br /><br />
                    Inspired by the vastness of space and the gritty energy of modern trap, we deliver sounds that are both ethereal and hard-hitting.
                    Whether you are an upcoming artist or an established veteran, our catalogue provides the sonic landscape you need to elevate your art.
                </p>
            </div>

            {/* Stats / Gear */}
            <div style={sectionStyle}>
                <h2 style={headerStyle}>Frequencies</h2>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={statBoxStyle}>
                        <span style={numberStyle}>5+</span>
                        <span style={labelStyle}>Years Experience</span>
                    </div>
                    <div style={statBoxStyle}>
                        <span style={numberStyle}>100+</span>
                        <span style={labelStyle}>Beats Created</span>
                    </div>
                    <div style={statBoxStyle}>
                        <span style={numberStyle}>∞</span>
                        <span style={labelStyle}>Vibes</span>
                    </div>
                </div>
            </div>

            {/* Contact CTA */}
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Ready to work?</h3>
                <a href="mailto:andreadelfoco5@gmail.com" style={{
                    display: 'inline-block',
                    padding: '1rem 2.5rem',
                    background: 'var(--neon-blue)',
                    color: '#000',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    borderRadius: '4px',
                    boxShadow: '0 0 20px rgba(14, 165, 233, 0.5)'
                }}>
                    CONTACT ME
                </a>
            </div>

        </div>
    );
}

const sectionStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    borderLeft: '4px solid var(--neon-purple)',
    padding: '2rem',
    marginBottom: '2rem',
    backdropFilter: 'blur(5px)',
};

const headerStyle = {
    fontSize: '2rem',
    marginBottom: '1rem',
    fontFamily: 'var(--font-orbitron)',
    color: '#fff'
};

const textStyle = {
    lineHeight: '1.8',
    color: '#ddd',
    fontSize: '1.1rem'
};

const statBoxStyle = {
    background: 'rgba(0,0,0,0.5)',
    padding: '1.5rem',
    minWidth: '150px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px'
};

const numberStyle = {
    display: 'block',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'var(--neon-blue)'
};

const labelStyle = {
    color: '#888',
    fontSize: '0.9rem',
    textTransform: 'uppercase'
};
