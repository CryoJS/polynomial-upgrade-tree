import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Check if environment variables are loaded
console.log('🔍 Checking Supabase environment variables:');
console.log('VITE_SUPABASE_URL exists:', !!supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ERROR: Supabase environment variables are missing!');
    console.error('Please check your .env.local file');
    console.error('Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false
    }
});

// Test connection function
export const testSupabaseConnection = async () => {
    try {
        console.log('🔄 Testing Supabase connection...');

        // Simple query to test connection
        const { data, error, count } = await supabase
            .from('players')
            .select('*', { count: 'exact', head: true })
            .limit(1);

        if (error) {
            console.error('❌ Supabase connection error:', error.message);
            return false;
        }

        console.log('✅ Supabase connected successfully!');
        console.log(`📊 Database has ${count || 0} players`);
        return true;
    } catch (error) {
        console.error('❌ Unexpected error testing Supabase:', error);
        return false;
    }
};

// Helper function to save player data
export const savePlayerToSupabase = async (playerData) => {
    try {
        const { data, error } = await supabase
            .from('players')
            .upsert({
                username: playerData.username,
                points: playerData.points,
                points_per_sec: playerData.pointsPerSec,
                upgrade_ids: playerData.upgradeIds,
                upgrade_count: playerData.upgradeCount,
                variables: playerData.variables,
                solved_questions: playerData.solvedQuestions,
                last_updated: new Date().toISOString()
            }, {
                onConflict: 'username'
            });

        if (error) throw error;

        console.log('✅ Player saved to Supabase:', playerData.username);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error saving to Supabase:', error.message);
        return { success: false, error };
    }
};

// Helper function to get leaderboard
export const getLeaderboardFromSupabase = async (limit = 100) => {
    try {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .order('points', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('❌ Error fetching leaderboard:', error.message);
        return { success: false, error };
    }
};