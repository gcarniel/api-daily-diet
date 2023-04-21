/*
  Warnings:

  - You are about to drop the column `usersId` on the `meals` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_meals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "hour" DATETIME NOT NULL,
    "is_target" BOOLEAN NOT NULL,
    "users_id" TEXT,
    CONSTRAINT "meals_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_meals" ("date", "description", "hour", "id", "is_target", "name") SELECT "date", "description", "hour", "id", "is_target", "name" FROM "meals";
DROP TABLE "meals";
ALTER TABLE "new_meals" RENAME TO "meals";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
