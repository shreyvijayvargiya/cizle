# Zoomable app architecture canvas

By @robinebers · Opus 5.5 · education

Original post: https://x.com/robinebers/status/2105309987983745060

Demo video: https://video.twimg.com/amplify_video/2105308444328923136/vid/avc1/1668x1080/t9rSq95R5oVcurST.mp4

```
here's the full prompt:

(obviously adjust the last part)

"I have a weird task for you. I want you to look at the app and create, for lack of a better word, a canvas that I can zoom in and zoom out and move around to see how our architecture actually works. A lot has changed, and I'm starting to lose an overview of everything that we're doing, especially with Model and Convex.

I want you to map out in a visual way what happens when a user signs up, pays, or gets a guest pass, and then they upload a file. What happens? We create, for example, right now. That's one of the things that I really want to understand. Right now, we're still creating a chat and a project, but the chats are actually independent, I believe, and the projects, I don't even know how the fuck that works. That's already where it starts.

A file is being uploaded, and then that file is being put somewhere into R2 storage, and then some modal workers are doing some things. There's a modal app, or one modal worker, but that has multiple apps. I don't really understand how that works either. I really want you to have a visualization of how this actually all works."
```

This prompt belongs to its creator. It is listed here with credit and a link to the original. To have it corrected or removed, email hello@cizle.dev.
