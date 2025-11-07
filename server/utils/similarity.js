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
    const vocab = Object.entries(termCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxVocab)
    .map((term) => term);

    //document frequency for idf
    const df = {};
    vocab.forEach(term => {
        df[term] = docTokens.reduce((acc, d) => acc + (d.counts[term] ? 1 : 0), 0);
    });

    return { vocab, docTokens, df };
}

// Compute TF-IDF vector for a document (vocab order)
function computeTfidfVector(docToken, vocab, df, N) {
    const vec = new Array(vocab.length).fill(0);
    for (let i = 0; i < vocab.length; i++) {
        const term = vocab[i];
        const tf = (docToken.counts[term] || 0) / (docToken.length || 1);
        const idf = tf * idf;
        
    }
    return vec;
}

function cosineSimilarity(a, b) {
    let dot = 0; na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * getTopSimilar(docs, topN)
 * docs: [{ id, text, meta... }] - first doc is treated as query (the clicked blog)
 * returns: arrays of docs (excluding query) sorted by similaity descending
 */

export async function getTopSimilar(docs = [], topN = 6) {
    if (!docs || docs.length <= 1) return [];


    //build vocab & doc tokens
    const { vocab, docTokens, df } = buildVocabAndDocs(docs.map(d => ({ text: d.text})));
    const N = docs.length;

    //compute vectors
    const vectors = docTokens.map(dt => computeTfidfVector(dt, vocab, df, N));


    const queryVec = vectors[0]; // assume docs[0] is the clicked blog
    const similarities = [];
    for (let i = 1; i < docs.length; i++) {
        const sim = cosineSimilarity(queryVec, vectors[i]);
        similarities.push({
            index: i,
            id: docs[i].id,
            sim,
            doc: docs[i]
        });
    }

    // Sort  by similarity desc, return topN items
    similarities.sort((a, b) => b.sim - a.sim);
    const top = similarities.slice(0, topN).map(s => ({ ...s.doc, similarity: s.sim}));
    return top;

};

