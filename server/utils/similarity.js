/**
 * Lightweight content-similarity utility.
 * no external Ml provider used.
 * builds a small vocabulary from candidate docs, computes TF-IDF style weights,
 * AND returns cosine-similarity ranked items.
 * 
 * NOTE: not for large datasets
 */

function tokenize(text = '') {
    return text
    .toLowerCase()
    .replace(/[\W_]+/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

// Build vocabulary and document-term counts
function buildVocabAndDocs(docs, maxVocab = 2000) {
    const termCounts = {};
    const docTokens = docs.map(doc => {
        const tokens = tokenize(doc.text || '');
        const counts = {};
        tokens.forEach(t => {
            counts[t] = (counts[t] || 0) + 1;
        });
        return { tokens, counts, length: tokens.length };
    });

    //keep most frequent terms to limit vocab size
}