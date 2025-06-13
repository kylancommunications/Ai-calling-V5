-- Add INSERT policy for profiles to allow profile creation
CREATE POLICY "Users can insert own profile" ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Also allow the trigger to work by adding a policy for the service role
CREATE POLICY "Service role can insert profiles" ON profiles 
FOR INSERT 
TO service_role
WITH CHECK (true);