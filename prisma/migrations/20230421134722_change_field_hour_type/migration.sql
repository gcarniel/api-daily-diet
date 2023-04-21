/*
  Warnings:

  - You are about to alter the column `hour` on the `meals` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_meals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "hour" INTEGER NOT NULL,
    "is_target" BOOLEAN NOT NULL,
    "users_id" TEXT,
    CONSTRAINT "meals_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_meals" ("date", "description", "hour", "id", "is_target", "name", "users_id") SELECT "date", "description", "hour", "id", "is_target", "name", "users_id" FROM "meals";
DROP TABLE "meals";
ALTER TABLE "new_meals" RENAME TO "meals";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
