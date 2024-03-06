const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const instaLoader = require('instaloader');

// Telegram Bot Token
const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

// Instagram Loader
const L = new instaLoader.Instaloader();

// Function to fetch basic profile information from Instagram
async function fetchInstagramProfile(username) {
    try {
        const profile = await instaLoader.Profile.from_username(L.context, username);
        return {
            username: profile.username,
            fullName: profile.full_name,
            biography: profile.biography,
            followers: profile.followers,
            following: profile.followees,
            posts: profile.mediacount
        };
    } catch (error) {
        console.error("Error fetching Instagram profile:", error);
        return null;
    }
}

// Function to fetch recent posts from Instagram
async function fetchRecentInstagramPosts(username) {
    try {
        const profile = await instaLoader.Profile.from_username(L.context, username);
        const posts = await profile.get_posts();
        return posts.slice(0, 5).map(post => {
            return { 
                url: post.url, 
                caption: post.caption || 'No Caption' 
            };
        });
    } catch (error) {
        console.error("Error fetching recent Instagram posts:", error);
        return null;
    }
}

// Command to fetch Instagram profile information
bot.onText(/\/insta_profile (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1];

    const profile = await fetchInstagramProfile(username);
    if (profile) {
        const message = `
            Username: ${profile.username}
            Full Name: ${profile.fullName}
            Bio: ${profile.biography}
            Followers: ${profile.followers}
            Following: ${profile.following}
            Posts: ${profile.posts}
        `;
        bot.sendMessage(chatId, message);
    } else {
        bot.sendMessage(chatId, 'Error fetching Instagram profile. Please try again later.');
    }
});

// Command to fetch recent Instagram posts
bot.onText(/\/insta_posts (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1];

    const posts = await fetchRecentInstagramPosts(username);
    if (posts) {
        posts.forEach(post => {
            const message = `${post.caption}\n${post.url}`;
            bot.sendMessage(chatId, message);
        });
    } else {
        bot.sendMessage(chatId, 'Error fetching recent Instagram posts. Please try again later.');
    }
});

// Command to post recent Instagram photos to Telegram channel
bot.onText(/\/post_insta_photos (.+)/, async (msg, match) => {
    const channelUsername = match[1];
    const username = 'instagram_username'; // Instagram username from which to fetch recent photos

    const posts = await fetchRecentInstagramPosts(username);
    if (posts) {
        posts.forEach(post => {
            const message = `${post.caption}\n${post.url}`;
            bot.sendMessage(channelUsername, message);
        });
    } else {
        bot.sendMessage(channelUsername, 'Error fetching recent Instagram posts. Please try again later.');
    }
});

console.log('Bot is running...');
