-- Create the employee user directly in auth.users and profiles
DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
BEGIN
    -- Insert into auth.users (this simulates the signup process)
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES (
        new_user_id,
        'arif@ideas2it.com',
        crypt('test@1234', gen_salt('bf')), -- Hash the password
        now(),
        now(),
        now(),
        '{"first_name": "Arif", "last_name": "Khan"}'::jsonb,
        false,
        'authenticated'
    );
    
    -- Insert into profiles
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role
    ) VALUES (
        new_user_id,
        'arif@ideas2it.com',
        'Arif',
        'Khan',
        'employee'::app_role
    );
END $$;