import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase Project Settings -> API
const supabaseUrl = 'https://qmcdunvxyzmhuguooell.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtY2R1bnZ4eXptaHVndW9vZWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMDkzOTksImV4cCI6MjEwNDU4NTM5OX0.8YiVMODGRfIv5-8k-sgh2-ANbKXbHWBWjscTl7t6rwI';

export const supabase = createClient(supabaseUrl, supabaseKey);