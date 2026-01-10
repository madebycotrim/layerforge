import JSZip from 'jszip';
import { parseGCode } from './gcodeParser';

export const parseProjectFile = async (file) => {
    const fileName = file.name.toLowerCase();

    // 1. G-CODE / GCO
    if (fileName.endsWith('.gcode') || fileName.endsWith('.gco')) {
        const text = await file.text();
        return parseGCode(text);
    }

    // 2. 3MF (ZIP Archive)
    if (fileName.endsWith('.3mf')) {
        try {
            const zip = await JSZip.loadAsync(file);
            let timeSeconds = 0;
            let weightGrams = 0;
            let found = false;

            // Strategy: Look for Metadata files
            // Orca/Bambu: Metadata/slice_info.xml or Metadata/project_settings.config
            // Cura: 3D/3dmodel.model (sometimes has metadata) or just Metadata folder

            // Try to find XMLs in Metadata folder
            const metadataFiles = Object.keys(zip.files).filter(path => path.startsWith('Metadata/') && (path.endsWith('.xml') || path.endsWith('.config')));

            for (const path of metadataFiles) {
                const content = await zip.files[path].async('string');

                // Parse XML content for standard Bambu/Orca tags
                // <prediction>...<filament_weight>12.34</filament_weight>...<print_time>1234</print_time>...</prediction>

                const weightMatch = content.match(/<filament_weight[^>]*>([\d.]+)<\/filament_weight>/i);
                if (weightMatch) {
                    weightGrams = parseFloat(weightMatch[1]); // Often in grams
                    found = true;
                }

                // Print Time: usually in seconds
                const timeMatch = content.match(/<print_time[^>]*>(\d+)<\/print_time>/i);
                if (timeMatch) {
                    timeSeconds = parseInt(timeMatch[1], 10);
                    found = true;
                }

                // Alternative tags
                const weightMatch2 = content.match(/consumeds_grams="([\d.]+)"/i); // Some slicers
                if (weightMatch2 && !weightGrams) {
                    weightGrams = parseFloat(weightMatch2[1]);
                    found = true;
                }
            }

            return {
                timeSeconds,
                weightGrams,
                success: found
            };

        } catch (error) {
            console.error("Error parsing 3MF:", error);
            return { timeSeconds: 0, weightGrams: 0, success: false };
        }
    }

    return { timeSeconds: 0, weightGrams: 0, success: false };
};
