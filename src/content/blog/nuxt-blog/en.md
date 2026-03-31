---
title: "Building a Markdown-Based Blog with Nuxt + Express"
date: "2019-10-13"
tags: ["Nuxt.js", "Vue.js", "Microservices", "TypeScript"]
excerpt: ""
lang: "en"
postSlug: "nuxt-blog"
ai_translated: true
---

I launched this blog last month. While the goal was to build it quickly, there were a few areas where I put in extra effort, so I'd like to share them here.

The full source code is available [here](https://github.com/kazukiyoshida/nuxt-blog).

## TL;DR

- **Went with a Nuxt + Express architecture.**
    - It served as a personal example of a Backend For Frontend (BFF) in a Microservices architecture
    - Keeping resources on the server and doing Server Side Rendering (SSR) led to better speed and efficiency
- **Built a Markdown-based blog that makes full use of GitHub.**
    - I write posts in GitHub's Markdown editor and display them in a similar style
    - Some parts were solved with brute-force approaches..
- **Paid attention to a few smaller details**
    - Cached data fetched via API in the browser
    - Added multi-language support
    - Tried using Kubernetes and Ingress for the infrastructure

<br>

## Adopting the Nuxt + Express Architecture

### What Does a Nuxt + Express Architecture Look Like?

Nuxt, the framework that extends Vue into a universal application, is widely used. But did you know that Nuxt can also "run as Express middleware"? At least for me, I didn't know this until fairly recently -- I remember being surprised when I read about it in [Practical TypeScript](https://note.mu/takepepe/n/nba34ed1ae401).

A conceptual diagram of the Nuxt + Express architecture looks like the figure below. Express can also serve as an API server, which means the Vue application running in the browser can call APIs provided by Express.

![Figure 1. Nuxt + Express Architecture](/images/blog/20191013/nuxt%2Bexpress.png "Figure 1. Nuxt + Express Architecture")
Figure 1. Nuxt + Express Architecture

<br>

### What Are the Benefits?

By placing Express at the center, things that weren't possible with Nuxt alone become achievable.
(The examples below are based on challenges I felt while developing and operating with Nuxt alone, along with proposed solutions -- I haven't actually done large-scale development with the Nuxt + Express architecture.)

#### Example 1) When a separate API server handles business logic and manages master data (like product category lists or region name lists)

With Nuxt alone, master data has to be fetched via the API on every initial request from the user. Since the master data might have been updated, a network call happens every time.

With the Express + Nuxt architecture, on the other hand, you can periodically refresh master data with a nightly batch job, or update it in response to notifications from the API server. You also have the flexibility to keep that master data in memory or in Redis. During SSR, the master data is used directly, eliminating round trips.

#### Example 2) When the server-side is built with Microservices

If there's a single backend server, the client-side Vue can call it directly. But when the backend uses a Microservices architecture, things change. BFF architecture is often discussed in the context of Microservices, and I personally think the Express + Nuxt architecture is a great fit for it.

Conceptually, it looks like the diagram below. The Express server provides frontend-specific APIs, and the client-side Vue calls those Express APIs. When a request comes in, Express communicates with the backend Microservices via gRPC or similar protocols to complete the business logic.

![Figure 2. BFF and Microservices](/images/blog/20191013/bff.png "Figure 2. BFF and Microservices")

Figure 2. BFF and Microservices
(Source: [TRACK WRESTLING MOBILE APP](https://trackwrestlingmobileapp.blogspot.com/2018/06/mobile-app-backend-architecture.html))


<br>

### Benefits for a Personal Blog

As described above, the Express + Nuxt architecture enables an attractive setup that can scale to reasonably large web applications and also function as a BFF.
My blog is a small application that doesn't really need any of that, but I set it up this way dreaming of someday building a large application with Microservices.

That said, the following points were genuinely beneficial even for a personal blog:

- During SSR, data is read directly from the server, so no API calls are needed
- Vue and the Express API can reference shared interfaces

<br>

## Building a Markdown-Based Blog That Makes Full Use of GitHub

From the start, I wanted to write posts in Markdown. There are several tools for generating HTML from Markdown files (cf. [Building a Blog with Nuxt.js and Markdown](https://jmblog.jp/posts/2018-01-17/build-a-blog-with-nuxtjs-and-markdown-1/)). However, getting everything including code snippets to display nicely required a lot of CSS work. Since the goal this time was rapid development, I decided to cut this part entirely and use GitHub as an alternative.

GitHub has an excellent Markdown editor and viewer. Importantly, a [repository](https://github.com/sindresorhus/github-markdown-css) providing GitHub's Markdown CSS under the MIT license is available. [GitHub has also given permission](https://github.com/sindresorhus/github-markdown-css/issues/24), so the licensing issue is clearly resolved. (Pretty cool of GitHub..)

Given all this, the workflow goes like this:

1. Edit Markdown on GitHub
2. Check the finished look in Preview
3. Retrieve the HTML with classes that correspond to markdown-css

For step 3, I couldn't find a clean solution, so as a brute-force approach I open dev tools and grab the HTML directly.

So this blog is written using GitHub. It's incredibly comfortable once you try it. You can even save drafts by creating branches and committing to them.

<br>

![Figure 3. Writing in the GitHub Markdown Editor](/images/blog/20191013/github%20%2B%20markdown.png "Figure 3. Writing in the GitHub Markdown Editor")
Figure 3. Writing in the GitHub Markdown Editor

<br>

## A Few Smaller Details I Cared About

Nothing major, but I put some thought into a few parts of the application.

<br>

### Caching API-Fetched Data in the Browser

By using the Nuxt + Express architecture, this blog doesn't make API requests during SSR. However, during CSR, it does call the APIs provided by Express. To avoid fetching the same data more than once, I implemented an in-memory caching mechanism.

In this Vue project, all data fetched from APIs is stored in the Store. The file store/post.ts is the store responsible for fetching and saving blog post data.

store/post.ts
```ts
export interface IState {
  posts: IPostSummary[]
  post: Record<number, IPost>
}

export const state = (): IState => ({
  posts: [],
  post: {}
})

...

export const actions = {
  async fetchPost(
    this: Vue,
    { state, commit }: any,
    id: number
  ): Promise<void> {
    // Return early if cache exists
    if (_.keys(state.post).indexOf(String(id)) >= 0) return
...

```

The state.post in the Store uses TypeScript's built-in utility type `Record`. This defines state.post as an object with key-value pairs where the key is a post ID (number) and the value is data fetched via the API.

(Since number type and post IDs don't have a one-to-one correspondence, a more rigorous approach would be to declare a PostId type and use `Record<PostId, IPost>`, but I took a shortcut here..)

By saving data in the store using this Record pattern, when fetching a post with id = N via the API, the system first checks whether the store already contains a post with id = N and only sends the API request if it doesn't.

<br>

### Adding Multi-Language Support

I wanted to support multiple languages if I was going to build a blog, so I implemented it. Using a library called [vue-i18n](https://github.com/kazupon/vue-i18n), adding multi-language support was straightforward. It's an OSS tool created by kazupon -- much appreciated.

I'll skip the detailed usage since there's plenty of documentation available online.

<br>

### Using Kubernetes and Ingress for Infrastructure

I had been interested in and gradually learning about Kubernetes for a while, and I wanted to try running it in production, so I used it for this personal project. I deployed it on GKE on GCP, but since I'm still a beginner with Kubernetes, the configuration is mostly defaults. I'd like to find the time to learn more about YAML configuration going forward.

<br>

## Conclusion

That's an overview of the blog I built. I've developed blogs a few times before, but each time I ran into the same problem: "I can't dedicate enough time to building CMS features." This made writing posts difficult and led to a vicious cycle where I'd put off posting altogether. This time, I think I ended up with a blog application that's simple to implement, easy to maintain, and achieves good quality by leveraging tools like GitHub.

While I consider the blog complete, there's still plenty I'd like to do, and there are parts of the code that I'm not happy with. I hope to improve these gradually over time.

I'm not particularly experienced in either frontend or server-side development, so there may be inaccuracies in this article. If you have any feedback, I'd appreciate hearing from you via Twitter or GitHub.
