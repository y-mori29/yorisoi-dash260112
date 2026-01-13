import { ClinicalData } from '../types';

export const generateAiSummary = (data: ClinicalData): string => {
    const { soap } = data;

    // Helper to get first sentence
    const getFirstSentence = (text: string) => {
        const match = text.match(/^[^。]+。/);
        return match ? match[0] : text.substring(0, 15) + '...';
    };

    let generated = '';

    // 1. Smart Mock for specific demo case (Diabetic Ulcer)
    // Checks for keywords to allow dynamic updates based on user edits
    const isDiabeticCase = soap.s.includes('糖尿病') || soap.s.includes('足裏');

    if (isDiabeticCase) {
        // S: Construct based on keywords
        let s = 'S:糖尿病性潰瘍と診断。';
        if (soap.s.includes('切断') || soap.a.includes('切断')) {
            s += '下肢切断リスクあり。';
        }

        // A: Construct based on keywords
        let a = 'A:';
        if (soap.a.includes('デブリードマン') || soap.s.includes('デブリードマン')) {
            a += 'デブリードマン・外用・服薬で治療。';
        } else {
            // Fallback if keywords removed
            a += getFirstSentence(soap.a);
        }

        // P: Construct based on keywords, specifically looking for frequency changes
        let p = 'P:';
        let p_parts = [];
        if (soap.p.includes('軟膏')) p_parts.push('軟膏継続。');

        // Dynamic Frequency Detection (e.g., "週2回")
        const freqMatch = soap.p.match(/週[0-9０-９]+回/);
        if (freqMatch) {
            p_parts.push(`${freqMatch[0]}訪問。`);
        } else if (soap.p.includes('週1回') || soap.p.includes('週１回')) {
            p_parts.push('週1回訪問。');
        }

        if (p_parts.length === 0) {
            p += getFirstSentence(soap.p);
        } else {
            p += p_parts.join('');
        }

        generated = `${s} ${a} ${p}`;

    } else {
        // 2. General Fallback: Extract first sentence of each section
        const s = getFirstSentence(soap.s);
        const o = getFirstSentence(soap.o);
        const a = getFirstSentence(soap.a);
        const p = getFirstSentence(soap.p);
        generated = `S:${s} O:${o} A:${a} P:${p}`;
    }

    // Truncate if > 100 chars
    if (generated.length > 100) {
        generated = generated.substring(0, 99) + '…';
    }

    return generated;
};
