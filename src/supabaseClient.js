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

// ==================== ADMIN FUNCTIONS ====================

export const verifyAdminPassword = async (password) => {
    try {
        console.log('🔐 Checking admin password...');

        const { data, error } = await supabase
            .from('admin_settings')
            .select('setting_value')
            .eq('setting_key', 'admin_password')
            .single();

        if (error) {
            console.error('❌ Error fetching admin password:', error);
            return false; // Just return false, don't try to create
        }

        console.log('🔍 Comparing:', password, '==', data.setting_value);
        return data.setting_value === password;
    } catch (error) {
        console.error('❌ Error in admin check:', error);
        return false;
    }
};

// ==================== USER AUTHENTICATION ====================

// Check user credentials (login)
export const checkUserPassword = async (username, password) => {
    try {
        console.log(`🔐 Checking credentials for: ${username}`);

        const { data, error } = await supabase
            .from('players')
            .select('password')
            .eq('username', username)
            .single();

        if (error) {
            console.log('❌ User not found:', error.message);
            return { success: false, error: 'User not found' };
        }

        if (data.password === password) {
            console.log('✅ Password correct for:', username);
            return { success: true };
        } else {
            console.log('❌ Password incorrect for:', username);
            return { success: false, error: 'Incorrect password' };
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        return { success: false, error: 'Login failed' };
    }
};

// Create new user (register)
export const createNewUser = async (username, password) => {
    try {
        console.log(`👤 Creating new user: ${username}`);

        const { data: existing } = await supabase
            .from('players')
            .select('username')
            .eq('username', username)
            .maybeSingle();

        if (existing) {
            console.log('❌ Username already exists:', username);
            return { success: false, error: 'Username already exists' };
        }

        const { data, error } = await supabase
            .from('players')
            .insert({
                username: username,
                password: password,
                points: 0,
                points_per_sec: 0,
                upgrade_ids: [],
                upgrade_count: 0,
                variables: { x: 1, a0: 0, a1: 0, a2: 0 },
                solved_questions: [],
                created_at: new Date().toISOString(),
                last_updated: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error creating user:', error);
            throw error;
        }

        console.log('✅ User created successfully:', username);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Create user error:', error);
        return { success: false, error: error.message };
    }
};

// Load user data (their save file)
export const loadUserData = async (username) => {
    try {
        console.log(`📥 Loading data for: ${username}`);

        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('username', username)
            .single();

        if (error) {
            console.error('❌ Error loading user data:', error);
            return { success: false, error: 'User not found' };
        }

        console.log('✅ User data loaded:', username);

        return {
            success: true,
            data: {
                points: data.points || 0,
                upgradeIds: data.upgrade_ids || [],
                variables: data.variables || { x: 1, a0: 0, a1: 0, a2: 0 },
                solvedQuestions: data.solved_questions || []
            }
        };
    } catch (error) {
        console.error('❌ Load user error:', error);
        return { success: false, error: error.message };
    }
};

// Save user data - PROPER VERSION
export const saveUserData = async (username, playerData) => {
    try {
        console.log(`💾 Saving data for: ${username}`);

        // First get the user's current password
        const { data: existingUser } = await supabase
            .from('players')
            .select('password')
            .eq('username', username)
            .maybeSingle();

        // If user doesn't exist, we can't save - this shouldn't happen
        if (!existingUser) {
            console.error('❌ User not found in database, cannot save');
            return { success: false, error: 'User not found' };
        }

        // Update only the game data, keep the password as is
        const { error } = await supabase
            .from('players')
            .update({
                points: Math.floor(playerData.points),
                points_per_sec: playerData.pointsPerSec || 0,
                upgrade_ids: playerData.upgradeIds || [],
                upgrade_count: (playerData.upgradeIds || []).length,
                variables: playerData.variables || { x: 1, a0: 0, a1: 0, a2: 0 },
                solved_questions: playerData.solvedQuestions || [],
                last_updated: new Date().toISOString()
            })
            .eq('username', username);

        if (error) {
            console.error('❌ Save error:', error);
            throw error;
        }

        console.log('✅ Save successful:', username);
        return { success: true };
    } catch (error) {
        console.error('❌ Save failed:', error);
        return { success: false, error: error.message };
    }
};

// Force save - ONLY for login page to create initial user
export const forceSaveUser = async (username, playerData, password) => {
    try {
        console.log(`🚀 Force creating initial user: ${username}`);

        const { data, error } = await supabase
            .from('players')
            .upsert({
                username: username,
                password: password, // Use the provided password
                points: Math.floor(playerData.points),
                points_per_sec: playerData.pointsPerSec || 0,
                upgrade_ids: playerData.upgradeIds || [],
                upgrade_count: (playerData.upgradeIds || []).length,
                variables: playerData.variables || { x: 1, a0: 0, a1: 0, a2: 0 },
                solved_questions: playerData.solvedQuestions || [],
                last_updated: new Date().toISOString(),
                created_at: new Date().toISOString()
            }, {
                onConflict: 'username'
            })
            .select();

        if (error) {
            console.error('❌ Force save error:', error);
            throw error;
        }

        console.log('✅ Force save successful');
        return { success: true, data };
    } catch (error) {
        console.error('❌ Force save failed:', error);
        return { success: false, error: error.message };
    }
};

// Test connection function
export const testSupabaseConnection = async () => {
    try {
        console.log('🔄 Testing Supabase connection...');

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

// Get leaderboard data
export const getLeaderboardData = async () => {
    try {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .order('points', { ascending: false })
            .limit(100);

        if (error) throw error;

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('❌ Error fetching leaderboard data:', error);
        return { success: false, error: error.message };
    }
};

// Debug: Check database status
export const debugDatabase = async () => {
    console.log('🔍🔍🔍 DEBUG DATABASE STATUS');

    try {
        const { count, error: countError } = await supabase
            .from('players')
            .select('*', { count: 'exact', head: true });

        console.log(`📊 Total players in database: ${count || 0}`);

        const { data: players, error: playersError } = await supabase
            .from('players')
            .select('username, points, last_updated')
            .order('last_updated', { ascending: false })
            .limit(5);

        if (playersError) {
            console.error('❌ Error fetching players:', playersError);
        } else {
            console.log('📝 Last 5 players:', players);
        }

        return { success: true, count, players };
    } catch (error) {
        console.error('❌ Debug error:', error);
        return { success: false, error };
    }
};