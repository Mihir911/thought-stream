import Blog from '../models/Blog.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const globalSearch = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.status(400).json({ success: false, message: "Query (q) is required" });

        const page = Math.max(1, parseInt(req.query.page || "1"));
        const limit = Math.min(50, Math.max(5, parseInt(req.query.limit || "12")));
        const sortBy = req.query.sort || "relevance"; // relevance | newest | popular
        const skip = (page - 1) * limit;

        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const words = q.split(/\s+/).filter(Boolean).map(w => escapeRegex(w));
        const phraseRegex = new RegExp(escapeRegex(q), "i");
        const wordRegex = new RegExp(words.join("|"), "i");

        const textPipeline = [
            {
                $match: { $text: { $search: q }, isPublished: true }
            },
            {
                $addFields: { textScore: { $meta: "textScore" } }
            },
            { $sort: { textScore: -1 } },
            { $limit: 200 }
        ];

        const textResults = await Blog.aggregate(textPipeline).allowDiskUse(true);


        const regexFilter = {
            isPublished: true,
            $or: [
                { title: { $regex: phraseRegex } },
                { title: { $regex: wordRegex } },
                { content: { $regex: phraseRegex } },
                { content: { $regex: wordRegex } },
                { excerpt: { $regex: wordRegex } },
                { tags: { $elemMatch: { $regex: wordRegex } } },
                { categories: { $elemMatch: { $regex: wordRegex } } }
            ]
        };


        const regexCandidates = await Blog.find(regexFilter)
            .populate("author", "username profilePicture")
            .populate("coverUpload")
            .lean()
            .limit(200);

        const candidateMap = new Map();

        const addCandidate = (b) => {
            const id = b._id.toString();
            if (!candidateMap.has(id)) candidateMap.set(id, b);
        };

        textResults.forEach(b => addCandidate(b));
        regexCandidates.forEach(b => addCandidate(b));

        if (candidateMap.size === 0) {
            const author = await User.findOne({ username: { $regex: phraseRegex } }).lean();
            if (author) {
                const byAuthor = await Blog.find({ author: author._id, isPublished: true })
                    .populate("author", "username profilePicture")
                    .populate("coverUpload")
                    .lean()
                    .limit(100);
                byAuthor.forEach(b => addCandidate(b));
            }
        }

        const candidates = Array.from(candidateMap.values()).map((b) => {
            // Normalized fields
            const title = (b.title || "").toLowerCase();
            const content = (b.content || "").toLowerCase();
            const excerpt = (b.excerpt || "").toLowerCase();
            const tags = (b.tags || []).map(t => String(t).toLowerCase());
            const categories = (b.categories || []).map(c => String(c).toLowerCase());
            const authorName = (b.author && b.author.username) ? String(b.author.username).toLowerCase() : "";

            // Score components (tune these weights to taste)
            let score = 0;

            if (b.textScore) score += b.textScore * 8; // textScore is important

            if (phraseRegex.test(b.title || "")) score += 60;
            if (phraseRegex.test(b.excerpt || "")) score += 25;
            if (phraseRegex.test(b.content || "")) score += 20;

            const qWords = words;
            let titleMatches = 0, contentMatches = 0;
            qWords.forEach(w => {
                const r = new RegExp(w, "i");
                if (r.test(b.title || "")) titleMatches++;
                if (r.test(b.content || "")) contentMatches++;
            });
            score += titleMatches * 8;
            score += contentMatches * 3;

            if (categories.some(c => wordRegex.test(c))) score += 18;
            if (tags.some(t => wordRegex.test(t))) score += 12;

            if (authorName && wordRegex.test(authorName)) score += 10;

            score += Math.min(50, (b.likes ? b.likes.length : 0) * 1.2);
            score += Math.min(40, (b.viewsCount || 0) * 0.02);

            if (b.createdAt) {
                const ageDays = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                if (ageDays < 7) score += 10;
                else if (ageDays < 30) score += 4;
            }

            return { ...b, __score: score };
        });

        if (sortBy === "newest") {
            candidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === "popular") {
            candidates.sort((a, b) => (b.viewsCount || 0) + (b.likes?.length || 0) - ((a.viewsCount || 0) + (a.likes?.length || 0)));
        } else {
            candidates.sort((a, b) => (b.__score || 0) - (a.__score || 0));
        }

        const total = candidates.length;
        const results = candidates.slice(skip, skip + limit);

        res.json({
            success: true,
            query: q,
            totalResults: total,
            page,
            limit,
            results
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}