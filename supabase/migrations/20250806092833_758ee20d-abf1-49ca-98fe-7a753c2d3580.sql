-- Update the current user to super_admin role for testing
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'arif@ideas2it.com';