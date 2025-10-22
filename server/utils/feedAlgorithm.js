export const calculateBlogScore = (blog, userInterests = []) => {
    const now = new Date();
    const blogAge = (now - new Date(blog.createdAt)) / (1000 * 60 * 60 * 24); //in days


    //base score from likes (weight: 40%)
    const likesScore = (blog.likes.length / Math.max(blogAge, 1)) * 0.4;

    // recency score (weight: 30%)
    const recencyScore = (1 / Math.log(blogAge + 1)) * 0.3;

    //interest match score (weight: 30%)
    let interestScore = 0;
    if (userInterests.length > 0) {
        userInterests.forEach(interest => {
            if (blog.categories.includes(interest.category)) {
                interestScore += interest.score;
            }
            if (blog.tags) {
                
                blog.tags.forEach(tag => {
                    if (interest.tags && interest.tags.includes(tag)) {
                        interestScore += interest.score * 0.5;
                    }
                });
            }
        });
        interestScore = userInterests.length > 0 ? (interestScore / userInterests/length) * 0.3: 0;
    }

    return likesScore + recencyScore + interestScore;
};