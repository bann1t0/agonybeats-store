/**
 * License Comparison Component - Redesigned
 * Clean comparison with key features only
 */

'use client';

export default function LicenseComparison({ licenses }) {
    if (!licenses || licenses.length === 0) {
        return null;
    }

    // Sort licenses by price
    const sortedLicenses = [...licenses].sort((a, b) => a.defaultPrice - b.defaultPrice);

    // Key comparison features - less is more
    const comparisonFeatures = [
        { label: 'File Format', values: ['MP3 + Stems', 'WAV + Stems', 'WAV + MP3 + Stems', 'WAV + MP3 + Stems', 'All Formats + Stems'] },
        { label: 'Streaming Limit', values: ['5,000', '20,000', '100,000', 'Unlimited', 'Unlimited'] },
        { label: 'Download Limit', values: ['2,000', '5,000', '10,000', 'Unlimited', 'Unlimited'] },
        { label: 'Music Videos', values: ['1', '2', '5', 'Unlimited', 'Unlimited'] },
        { label: 'Radio Broadcasting', values: [false, false, true, true, true] },
        { label: 'TV Broadcasting', values: [false, false, false, true, true] },
        { label: 'Paid Performances', values: [false, false, false, true, true] },
        { label: 'Exclusive Rights', values: [false, false, false, false, true] },
        { label: 'Credit Required', values: [true, true, true, false, false] }
    ];

    return (
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
            <h2 style={{
                color: 'white',
                marginBottom: '3rem',
                textAlign: 'center',
                fontSize: '2.5rem',
                fontWeight: 'bold'
            }}>
                Compare Licenses
            </h2>

            {/* Comparison Table */}
            <div style={{
                overflowX: 'auto',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '800px'
                }}>
                    {/* Header */}
                    <thead>
                        <tr>
                            <th style={{
                                padding: '1.5rem 1rem',
                                textAlign: 'left',
                                color: '#888',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                Features
                            </th>
                            {sortedLicenses.map((license) => (
                                <th
                                    key={license.id}
                                    style={{
                                        padding: '1.5rem 1rem',
                                        textAlign: 'center',
                                        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                                        position: 'relative',
                                        background: license.isRecommended ? 'rgba(217, 70, 239, 0.05)' : 'transparent',
                                        border: license.isRecommended ? '2px solid #d946ef' : 'none',
                                        borderRadius: license.isRecommended ? '12px 12px 0 0' : '0'
                                    }}
                                >
                                    {license.isRecommended && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                                            color: 'white',
                                            fontSize: '0.65rem',
                                            padding: '4px 14px',
                                            borderRadius: '12px',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.5)',
                                            whiteSpace: 'nowrap',
                                            zIndex: 10
                                        }}>
                                            BEST VALUE
                                        </div>
                                    )}
                                    <div style={{
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {license.name}
                                    </div>
                                    <div style={{
                                        color: license.isRecommended ? '#d946ef' : getColorForPrice(license.defaultPrice),
                                        fontSize: '1.8rem',
                                        fontWeight: '800'
                                    }}>
                                        €{license.defaultPrice}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {comparisonFeatures.map((feature, idx) => (
                            <tr
                                key={idx}
                                style={{
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                    background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                                }}
                            >
                                <td style={{
                                    padding: '1.25rem 1rem',
                                    color: '#ccc',
                                    fontWeight: '500',
                                    fontSize: '0.95rem'
                                }}>
                                    {feature.label}
                                </td>
                                {feature.values.map((value, licenseIdx) => (
                                    <td
                                        key={licenseIdx}
                                        style={{
                                            padding: '1.25rem 1rem',
                                            textAlign: 'center',
                                            color: 'white',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {typeof value === 'boolean' ? (
                                            value ? (
                                                <CheckIcon />
                                            ) : (
                                                <MinusIcon />
                                            )
                                        ) : (
                                            <span style={{
                                                color: value === 'Unlimited' || value.includes('All') ? '#10b981' : '#fff'
                                            }}>
                                                {value}
                                            </span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Helper function for pricing colors
function getColorForPrice(price) {
    if (price >= 300) return 'linear-gradient(135deg, #c0c0c0 0%, #ffffff 50%, #c0c0c0 100%)';
    if (price >= 140) return '#ffc107';
    if (price >= 80) return '#d946ef';
    return '#0ea5e9';
}

// Icon Components - Clean SVG, no emojis
function CheckIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: '0 auto', display: 'block' }}
        >
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );
}

function MinusIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#555"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ margin: '0 auto', display: 'block' }}
        >
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}
