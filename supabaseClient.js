// supabaseClient.js
const SUPABASE_URL = "https://dsyeqawcjnmrdefljjgg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeWVxYXdjam5tcmRlZmxqamdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5ODE2NDAsImV4cCI6MjA3NTU1NzY0MH0.M3yqrwKkWIB6rCo1UE2qXsKLzKxbSgA9F79eebJXciE";

window.supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
