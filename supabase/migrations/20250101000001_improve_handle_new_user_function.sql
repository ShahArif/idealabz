-- Improve the handle_new_user function to handle null metadata and add better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    user_email TEXT;
    first_name TEXT;
    last_name TEXT;
BEGIN
    user_email := NEW.email;
    
    -- Only allow ideas2it.com email addresses
    IF user_email NOT LIKE '%@ideas2it.com' THEN
        RAISE EXCEPTION 'Only ideas2it.com email addresses are allowed';
    END IF;
    
    -- Safely extract metadata with null checks
    first_name := COALESCE(NEW.raw_user_meta_data ->> 'first_name', '');
    last_name := COALESCE(NEW.raw_user_meta_data ->> 'last_name', '');
    
    -- Insert into profiles table with proper role assignment
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id, 
        user_email,
        NULLIF(first_name, ''),  -- Convert empty string to NULL
        NULLIF(last_name, ''),   -- Convert empty string to NULL
        'employee'::public.app_role
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user registration
        RAISE WARNING 'Failed to create profile for user %: %', user_email, SQLERRM;
        RETURN NEW;
END;
$function$;
