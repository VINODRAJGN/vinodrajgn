-- SQL commands to fix vehicle data access in Supabase
-- Run these in your Supabase SQL Editor

-- 1. First, check what RLS policies exist on the vehicles table
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'vehicles';

-- 2. Check if there's a user_id column and what user IDs exist
SELECT DISTINCT user_id FROM vehicles WHERE user_id IS NOT NULL LIMIT 10;

-- 3. Get your current user ID (run this while logged in as vr@gmail.com)
SELECT auth.uid() as current_user_id;

-- 4. Option A: Update all vehicles to be owned by your current user
-- Your current user ID is: 0fbef89a-e8b0-4ca5-8be2-5edb5808b298
UPDATE vehicles SET user_id = '0fbef89a-e8b0-4ca5-8be2-5edb5808b298';

-- 5. Option B: Create a policy that allows access to all vehicles for authenticated users
DROP POLICY IF EXISTS "Allow authenticated users full access" ON vehicles;
CREATE POLICY "Allow authenticated users full access" ON vehicles
FOR ALL USING (auth.role() = 'authenticated');

-- 6. Alternative: Temporarily disable RLS for testing (LESS SECURE)
-- ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;

-- 7. Check vehicle count after applying policy
SELECT COUNT(*) as total_vehicles FROM vehicles;

-- 8. Sample query to verify access
SELECT chassis_number, registration_number, depot, model 
FROM vehicles 
LIMIT 5;