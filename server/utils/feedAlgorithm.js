// export const calculateBlogScore = (blog, userInterests = []) => {
//     const now = new Date();
//     const blogAge = (now - new Date(blog.createdAt)) / (1000 * 60 * 60 * 24); //in days


//     //base score from likes (weight: 40%)
//     const likesScore = (blog.likes.length / Math.max(blogAge, 1)) * 0.4;

//     // recency score (weight: 30%)
//     const recencyScore = (1 / Math.log(blogAge + 1)) * 0.3;

//     //interest match score (weight: 30%)
//     let interestScore = 0;
//     if (userInterests.length > 0) {
//         userInterests.forEach(interest => {
//             if (blog.categories.includes(interest.category)) {
//                 interestScore += interest.score;
//             }
//             if (blog.tags) {
                
//                 blog.tags.forEach(tag => {
//                     if (interest.tags && interest.tags.includes(tag)) {
//                         interestScore += interest.score * 0.5;
//                     }
//                 });
//             }
//         });
//         interestScore = userInterests.length > 0 ? (interestScore / userInterests/length) * 0.3: 0;
//     }

//     return likesScore + recencyScore + interestScore;
// };


// Weight parameters (tweak as desired)
const INTEREST_WEIGHT = 3; // importance of user's interests/categories matching
const RECENT_WEIGHT = 1.5; //recency (newer = higher score)
const LIKE_WEIGHT = 0.6; //how much 'likes' matter
const COMMENT_WEIGHT = 0.3; // how much 'comments' matter

export function calculateBlogScore(blog, userInterests = []) {
    let score = 0;

    //1. Interest/category match
    if (userInterests && userInterests.length) {
        blog.categories.forEach(cat => {
            const found = userInterests.find(i => i.category === cat);
            if (found) score += INTEREST_WEIGHT * (found.score || 1);
        });
    }

    //2. recency
    const now = Date.now();
    const blogTime = new Date(blog.createdAt).getTime();
    const daysOld = (now - blogTime) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 10 - daysOld); // blogs in last 10 days get max score
    score += recencyScore * RECENT_WEIGHT;

    //3. Unique views (not total views)
    score += (blog.viewsCount || 0) * LIKE_WEIGHT;

    //4. Comments
    score += (blog.comments ? blog.comments.length : 0) * COMMENT_WEIGHT;

    return score;
}
