-- Create Purchase table for analytics tracking
CREATE TABLE IF NOT EXISTS Purchase (
    id TEXT PRIMARY KEY,
    beatId TEXT NOT NULL,
    userId TEXT,
    licenseId TEXT,
    price REAL NOT NULL,
    buyerEmail TEXT,
    buyerName TEXT,
    status TEXT DEFAULT 'completed',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (beatId) REFERENCES Beat(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL,
    FOREIGN KEY (licenseId) REFERENCES License(id) ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_purchase_beatId ON Purchase(beatId);
CREATE INDEX IF NOT EXISTS idx_purchase_userId ON Purchase(userId);
CREATE INDEX IF NOT EXISTS idx_purchase_createdAt ON Purchase(createdAt);
