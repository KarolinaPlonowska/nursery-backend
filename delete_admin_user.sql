-- SQL script to safely delete user karolinaplonowska1@gmail.com from database
-- Execute these commands in pgAdmin4 in the exact order shown

-- First, get the user ID to confirm it exists
SELECT id, email, role, "firstName", "lastName" FROM users WHERE email = 'karolinaplonowska1@gmail.com';

-- Begin transaction for safety
BEGIN;

-- Step 1: Delete messages where user is sender or receiver
DELETE FROM messages WHERE "senderId" = (SELECT id FROM users WHERE email = 'karolinaplonowska1@gmail.com');
DELETE FROM messages WHERE "receiverId" = (SELECT id FROM users WHERE email = 'karolinaplonowska1@gmail.com');

-- Step 2: Remove user from announcement views
DELETE FROM announcement_views WHERE "userId" = (SELECT id FROM users WHERE email = 'karolinaplonowska1@gmail.com');

-- Step 3: Update announcements where user is author (set authorId to null instead of deleting)
UPDATE announcements 
SET "authorId" = NULL 
WHERE "authorId" = (SELECT id FROM users WHERE email = 'karolinaplonowska1@gmail.com');

-- Step 4: Remove user as caregiver from groups (set caregiverId to null)
UPDATE groups 
SET "caregiverId" = NULL 
WHERE "caregiverId" = (SELECT id FROM users WHERE email = 'karolinaplonowska1@gmail.com');

-- Step 5: Finally delete the user
DELETE FROM users WHERE email = 'karolinaplonowska1@gmail.com';

-- Verify deletion
SELECT id, email, role, "firstName", "lastName" FROM users WHERE email = 'karolinaplonowska1@gmail.com';

-- If everything looks good, commit the transaction
COMMIT;

-- If something went wrong, you can rollback instead:
-- ROLLBACK;