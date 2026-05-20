-- Backfill media rows for posts created before multi-file uploads existed.
INSERT INTO "PostMedia" ("id", "url", "type", "order", "postId", "createdAt")
SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
       substr(lower(hex(randomblob(2))), 2) || '-' ||
       substr('89ab', abs(random()) % 4 + 1, 1) ||
       substr(lower(hex(randomblob(2))), 2) || '-' ||
       lower(hex(randomblob(6))),
       "mediaUrl",
       "mediaType",
       0,
       "id",
       "createdAt"
FROM "Post"
WHERE NOT EXISTS (
    SELECT 1 FROM "PostMedia" WHERE "PostMedia"."postId" = "Post"."id"
);

CREATE INDEX IF NOT EXISTS "PostMedia_postId_order_idx" ON "PostMedia"("postId", "order");
