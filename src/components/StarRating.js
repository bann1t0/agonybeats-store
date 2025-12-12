/**
 * Star Rating Component
 * Used for displaying and interacting with ratings (1-5 stars)
 */

export default function StarRating({ rating = 0, maxStars = 5, interactive = false, size = 20, onRatingChange }) {
    const handleClick = (value) => {
        if (interactive && onRatingChange) {
            onRatingChange(value);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            {[...Array(maxStars)].map((_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= rating;
                const isHalfFilled = starValue - 0.5 === rating;

                return (
                    <svg
                        key={index}
                        onClick={() => handleClick(starValue)}
                        xmlns="http://www.w3.org/2000/svg"
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill={isFilled ? "#fbbf24" : isHalfFilled ? "url(#half)" : "none"}
                        stroke="#fbbf24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            cursor: interactive ? 'pointer' : 'default',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (interactive) {
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (interactive) {
                                e.currentTarget.style.transform = 'scale(1)';
                            }
                        }}
                    >
                        <defs>
                            <linearGradient id="half">
                                <stop offset="50%" stopColor="#fbbf24" />
                                <stop offset="50%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            })}
        </div>
    );
}
