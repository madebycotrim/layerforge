export const parseGCode = (content) => {
    let timeSeconds = 0;
    let weightGrams = 0;
    let foundTime = false;
    let foundWeight = false;

    const lines = content.split('\n');

    // Limit lines to scan (usually info is at end or beginning)
    // Scanning all lines in browser might be heavy if file is huge, 
    // but usually headers/footers are within first/last 500 lines.
    // However, some slicers put it at the very end. 
    // We will scan the last 5000 chars and first 5000 chars first for performance logic if needed, 
    // but for now, simple regex on the whole string might be okay for typical files < 50MB. 
    // Actually, splitting by line for a 50MB file is memory heavy.
    // Better to use Regex on the string directly or partial scan.

    // Optimized approach: Scan specific patterns

    // --- TIME PARSING ---
    // Cura: ;TIME:660 (seconds)
    const curaTime = content.match(/;TIME:(\d+)/);
    if (curaTime) {
        timeSeconds = parseInt(curaTime[1], 10);
        foundTime = true;
    }

    // Prusa/Orca/Bambu: ; estimated printing time = 1h 30m 15s  OR 10m 5s
    if (!foundTime) {
        const prusaTime = content.match(/; estimated printing time = (.*)/);
        if (prusaTime) {
            const timeStr = prusaTime[1];
            // Parse "1h 30m 15s" or "1d 2h 30s"
            const d = timeStr.match(/(\d+)d/);
            const h = timeStr.match(/(\d+)h/);
            const m = timeStr.match(/(\d+)m/);
            const s = timeStr.match(/(\d+)s/);

            if (d) timeSeconds += parseInt(d[1]) * 86400;
            if (h) timeSeconds += parseInt(h[1]) * 3600;
            if (m) timeSeconds += parseInt(m[1]) * 60;
            if (s) timeSeconds += parseInt(s[1]);
            foundTime = true;
        }
    }

    // --- WEIGHT PARSING ---
    // Cura: ;Filament weight: 3.76g
    const curaWeight = content.match(/;Filament weight: ([0-9.]+)/);
    if (curaWeight) {
        weightGrams = parseFloat(curaWeight[1]);
        foundWeight = true;
    }

    // Prusa/Orca/Bambu: ; filament used [g] = 3.5
    if (!foundWeight) {
        const prusaWeight = content.match(/; filament used \[g\] = ([0-9.]+)/);
        if (prusaWeight) {
            weightGrams = parseFloat(prusaWeight[1]);
            foundWeight = true;
        } else {
            // Fallback: ; filament used [mm] and calculate if diameter is known? 
            // Without density/diameter it's hard. Let's stick to grams if available.
            // Many slicers also output total filament used in mm.
            // Cura: ;Filament used: 1.25m
            // We can estimate standard PLA density (1.24g/cm3) and 1.75mm if weight is missing? 
            // Let's keep it simple for now, usually grams are there.
        }
    }

    return {
        timeSeconds,
        weightGrams,
        success: foundTime || foundWeight
    };
};
