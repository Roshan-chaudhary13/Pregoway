import { supabase } from "./supabase";

export type RiskLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export async function calculateAndLogRisk(userId: string, answers: Record<string, any>) {
    let score = 0;
    let triggers: string[] = [];

    // Simple Logic based on symptoms
    if (answers.headache === true) {
        score += (answers.headache_severity || 5) * 5;
        triggers.push("Persistent Headache");
    }

    if (answers.symptoms && answers.symptoms.length > 0) {
        if (answers.symptoms.includes("Vision changes")) {
            score += 30;
            triggers.push("Vision Changes");
        }
        if (answers.symptoms.includes("Swelling in hands/feet")) {
            score += 15;
            triggers.push("Severe Swelling");
        }
        if (answers.symptoms.includes("Severe abdominal pain") || answers.symptoms.includes("Vaginal bleeding")) {
            score = 90;
            triggers.push("Critical Symptoms Reported");
        }
    }

    if (answers.kicks && Number(answers.kicks) < 10) {
        score += 20;
        triggers.push("Low Baby Movement");
    }

    let level: RiskLevel = 'GREEN';
    let insight = "Your metrics look stable. Keep tracking daily!";

    if (score >= 80) {
        level = 'RED';
        insight = "CRITICAL: Severe risk factors detected. Please contact your doctor immediately.";
    } else if (score >= 50) {
        level = 'ORANGE';
        insight = "WARNING: Elevating risk markers. Schedule a BP checkup soon.";
    } else if (score >= 25) {
        level = 'YELLOW';
        insight = "NOTE: Mild symptoms detected. Monitor closely and rest.";
    }

    // Log to database
    const { error } = await supabase.from('risk_logs').insert({
        user_id: userId,
        score,
        level,
        insight,
        created_at: new Date().toISOString()
    });

    return { score, level, insight, error };
}
