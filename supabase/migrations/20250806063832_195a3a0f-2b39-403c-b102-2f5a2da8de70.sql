-- Update the handle_new_user function to make arif@ideas2it.com an employee instead of super_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_email TEXT;
BEGIN
    user_email := NEW.email;
    
    -- Only allow ideas2it.com email addresses
    IF user_email NOT LIKE '%@ideas2it.com' THEN
        RAISE EXCEPTION 'Only ideas2it.com email addresses are allowed';
    END IF;
    
    -- Insert into profiles table with proper role assignment
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id, 
        user_email,
        NEW.raw_user_meta_data ->> 'first_name',
        NEW.raw_user_meta_data ->> 'last_name',
        'employee'::app_role  -- Make all new users employees by default
    );
    
    RETURN NEW;
END;
$$;