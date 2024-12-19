-- CreateTable
CREATE TABLE "StockAdjustment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uniformId" INTEGER NOT NULL,
    "adjustment" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    CONSTRAINT "StockAdjustment_uniformId_fkey" FOREIGN KEY ("uniformId") REFERENCES "Uniform" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
