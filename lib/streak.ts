import { supabase } from "@/lib/supabase";

export async function updateActivityStreak(userId: string): Promise<number | null> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("streak, last_login")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile for streak:", error.message || error);
      return null;
    }

    if (!profile) {
      console.error("No profile found for user:", userId);
      return null;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const lastLoginStr = profile.last_login;

    // Agar aaj pehle hi login/activity update ho chuki hai
    if (lastLoginStr === todayStr) {
      console.log("Streak already updated for today.");
      return profile.streak || 0;
    }

    const currentStreak = profile.streak || 0;
    const newStreak = currentStreak + 1;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        streak: newStreak,
        last_login: todayStr,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating streak in database:", updateError.message);
      return profile.streak || 0;
    }

    console.log("Streak successfully updated to:", newStreak);
    return newStreak;

  } catch (error) {
    console.error("Error in updateActivityStreak:", error);
    return null;
  }
}