/**
 * Key-Value mapping for Audio References.
 * 
 * Key: Reference text displayed on the website (e.g., "Vach.Sā.1")
 * Value: Path to the blob inside the container (e.g., "Class 1/V_Sa_1.m4a")
 */
export const AUDIO_MAPPING: Record<string, string> = {
    // Class 1
    "Vach.Sā.1": "Class 1/V_SA_1.m4a",
    "Swā.Vāto: 1/19": "Class 1/SV_1.19.m4a",
    "Swā.Vāto: 1/26": "Class 1/SV_1.26.m4a",
    "Swā.Vāto: 6/77": "Class 1/SV_6.77.m4a",

    // Class 2
    "Swā.Vāto: 1/14": "Class 2/SV_1.14.m4a",
    "Swā.Vāto: 2/19": "Class 2/SV_2.19.m4a",
    "Swā.Vāto: 4/99": "Class 2/SV_4.99.m4a",
    "Vach.Ga.Pr.21": "Class 2/V_GP_21.m4a",
    "Vach.Ga.An.30": "Class 2/V_GA_30.m4a",

    // Add more mappings here as needed
};
