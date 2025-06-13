# Database Setup Instructions

## Issue Identified
Your Supabase database has Row Level Security (RLS) policies that are blocking data access. The application can connect to the database and authenticate successfully, but cannot read or write vehicle data due to these security restrictions.

## Solution Steps

### Step 1: Configure Row Level Security Policies
In your Supabase dashboard, go to **Authentication > Policies** and add these policies for the `vehicles` table:

```sql
-- Allow authenticated users to read all vehicles
CREATE POLICY "Allow authenticated users to read vehicles" ON vehicles
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert vehicles
CREATE POLICY "Allow authenticated users to insert vehicles" ON vehicles
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update vehicles
CREATE POLICY "Allow authenticated users to update vehicles" ON vehicles
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete vehicles
CREATE POLICY "Allow authenticated users to delete vehicles" ON vehicles
FOR DELETE USING (auth.role() = 'authenticated');
```

### Step 2: Verify Table Structure
Ensure your `vehicles` table has these columns:
- `id` (bigint, primary key)
- `chassis_number` (text)
- `registration_number` (text)
- `depot` (text)
- `motor_number` (text)
- `dispatch_date` (text)
- `registration_date` (text)
- `manufacturing_date` (text)
- `model` (text)
- `colour` (text)
- `seating_capacity` (integer)
- `motor_power_kw` (numeric)
- `created_at` (timestamp)

### Step 3: Import Your Vehicle Data
Once the policies are set up, you can import your 50 vehicles using the SQL Editor in Supabase:

```sql
INSERT INTO vehicles (chassis_number, registration_number, depot, motor_number, model, colour, seating_capacity, motor_power_kw)
VALUES 
  ('CHASSIS001', 'KA01AB1234', 'Depot A', 'MOTOR001', 'Electric Bus', 'White', 50, 150),
  -- Add your remaining 49 vehicles here
  ;
```

### Step 4: Test the Application
After configuring the policies and importing data, refresh the application. The vehicle list should now load properly.

## Alternative: Disable RLS (Less Secure)
If you want to quickly test without policies, you can temporarily disable RLS:

```sql
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
```

**Note**: This makes your data publicly accessible and is not recommended for production.