-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Uniform" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "costPrice" REAL NOT NULL,
    "stock" INTEGER NOT NULL,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "schoolId" INTEGER NOT NULL,
    "supplierId" INTEGER,
    "image" BLOB,
    "imageUrl" TEXT,
    CONSTRAINT "Uniform_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Uniform_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Uniform" ("costPrice", "id", "image", "imageUrl", "lowStockThreshold", "name", "price", "schoolId", "size", "stock", "supplierId") SELECT "costPrice", "id", "image", "imageUrl", "lowStockThreshold", "name", "price", "schoolId", "size", "stock", "supplierId" FROM "Uniform";
DROP TABLE "Uniform";
ALTER TABLE "new_Uniform" RENAME TO "Uniform";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
