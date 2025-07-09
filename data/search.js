// Import dictionary data (using fetch since direct import may not work)
let dictionaryData = [];

// Load dictionary data
async function loadDictionaryData() {
    try {
        const response = await fetch('./data/dictionary.json');
        dictionaryData = await response.json();
        console.log("Dictionary data loaded:", dictionaryData); // Debug log
    } catch (error) {
        console.error("Error loading dictionary data:", error);
    }
}

// Load data immediately
loadDictionaryData();

// Search function
export function searchDictionary(query) {
    if (!query || !dictionaryData.length) return [];
    
    const queryStr = query.trim().toLowerCase();
    console.log("Searching in dictionary:", queryStr); // Debug log
    
    return dictionaryData.filter(entry => {
        // 1. Check Chinese character
        if (entry.char.includes(query)) return true;
        
        // 2. Check pinyin (with or without tones)
        const pinyinLower = entry.pinyin.toLowerCase();
        const pinyinWithoutTones = pinyinLower
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[āáǎà]/g, 'a')
            .replace(/[ēéěè]/g, 'e')
            .replace(/[īíǐì]/g, 'i')
            .replace(/[ōóǒò]/g, 'o')
            .replace(/[ūúǔù]/g, 'u')
            .replace(/[ǖǘǚǜ]/g, 'ü');
        
        if (pinyinLower.includes(queryStr) || 
            pinyinWithoutTones.includes(queryStr) ||
            pinyinWithoutTones.charAt(0) === queryStr) {
            return true;
        }
        
        // 3. Check Mongolian translations
        for (const def of entry.definitions) {
            for (const ex of def.examples || []) {
                if (ex.mongolian.toLowerCase().includes(queryStr)) {
                    return true;
                }
            }
        }
        
        return false;
    });
}