---
title: "使用 Nuxt + Express 开发了基于 Markdown 的博客"
date: "2019-10-13"
tags: ["Nuxt.js", "Vue.js", "Microservices", "TypeScript"]
excerpt: ""
lang: "zh"
postSlug: "nuxt-blog"
ai_translated: true
---

上个月发布了这个博客，虽然目标是短时间内完成开发，但有几个地方还是花了不少心思，在这里介绍一下。

源代码已全部公开在[这里](https://github.com/kazukiyoshida/nuxt-blog)。

## TL;DR

- **采用了 Nuxt + Express 架构。**
    - 成为了 Microservices 架构中 Backend For Frontend（BFF）的个人实践样本
    - 在服务器内持有资源并进行 Server Side Rendering（SSR），提升了速度和效率
- **构建了充分利用 GitHub 的基于 Markdown 的博客。**
    - 使用 GitHub 的 Markdown 编辑器撰写文章，显示效果也尽量接近
    - 有些地方还是靠硬办法解决的..
- **在一些细节上下了功夫**
    - 在浏览器中缓存了通过 API 获取的数据
    - 实现了多语言支持
    - 基础设施采用了 Kubernetes 和 Ingress

<br>

## 采用 Nuxt + Express 架构

### Nuxt + Express 架构是什么？

Nuxt 是一个将 Vue 扩展为通用应用程序的框架，已经被广泛使用。但你知道 Nuxt 可以"作为 Express 的中间件运行"吗？至少我自己直到不久前才知道这一点，记得是读了[《实践 TypeScript》](https://note.mu/takepepe/n/nba34ed1ae401)之后才恍然大悟的。

Nuxt + Express 架构的概念图如下所示。Express 还可以作为 API 服务器使用，因此在浏览器中运行的 Vue 可以调用 Express 提供的 API。

![图1. Nuxt + Express 架构](/images/blog/20191013/nuxt%2Bexpress.png "图1. Nuxt + Express 架构")
图1. Nuxt + Express 架构

<br>

### 这样做有什么好处？

以 Express 为核心，可以实现仅靠 Nuxt 无法做到的事情。
（以下示例基于我单独使用 Nuxt 进行开发和运维时遇到的问题及其解决方案，并非实际进行过大规模的 Nuxt + Express 开发。）

#### 例1）业务逻辑由另一个 API 服务器负责，并且由它管理主数据（如商品分类列表、地区名称列表等）的情况

在这种情况下，如果只使用 Nuxt，每次用户的初始请求都需要通过 API 获取主数据。由于主数据可能已经更新，每次都会产生网络通信。

而采用 Express + Nuxt 架构，则可以通过夜间批处理定期更新主数据，也可以在收到 API 服务器的通知后进行更新。主数据既可以保存在内存中，也可以使用 Redis，灵活性很高。SSR 时直接使用这些主数据，无需额外的往返通信。

#### 例2）服务器端采用 Microservices 架构的情况

如果后端只有一个服务器，客户端的 Vue 直接调用即可。但当后端采用 Microservices 架构时，情况就不同了。在 Microservices 的语境中经常会提到 BFF 架构，我个人认为 Express + Nuxt 架构非常适合这种模式。

概念上如下图所示，Express 服务器提供面向前端的专用 API，客户端的 Vue 调用 Express 的 API。收到请求后，Express 通过 gRPC 等方式与后端的 Microservices 通信，完成业务逻辑。

![图2. BFF 与 Microservices](/images/blog/20191013/bff.png "图2. BFF 与 Microservices")

图2. BFF 与 Microservices
（来源：[TRACK WRESTLING MOBILE APP](https://trackwrestlingmobileapp.blogspot.com/2018/06/mobile-app-backend-architecture.html)）


<br>

### 对个人博客的好处

如上所述，采用 Express + Nuxt 架构，可以构建出既能应对较大规模 Web 应用程序、又能作为 BFF 使用的极具吸引力的架构。我的博客只是一个完全不需要这些的小型应用程序，但抱着有朝一日用 Microservices 构建大型应用的梦想，还是这样做了。

话虽如此，以下几点即使对个人博客来说也确实有所帮助：

- SSR 时直接读取服务器上保存的数据，不需要 API 通信
- Vue 和 Express 的 API 可以引用共同的 Interface

<br>

## 构建了充分利用 GitHub 的基于 Markdown 的博客

从一开始我就想用 Markdown 来写文章。虽然有一些工具可以从 Markdown 文件生成 HTML（参考：[使用 Nuxt.js 构建基于 Markdown 的博客](https://jmblog.jp/posts/2018-01-17/build-a-blog-with-nuxtjs-and-markdown-1/)），但要让代码片段等内容也能漂亮地显示，需要在 CSS 上花很多功夫。这次的目标是快速开发，所以这部分果断省略了，转而使用 GitHub 作为替代方案。

GitHub 拥有出色的 Markdown 编辑器和查看器。重要的是，GitHub 的 Markdown CSS 已经以 MIT 许可证开源在了这个[仓库](https://github.com/sindresorhus/github-markdown-css)中。[GitHub 也已经给出了使用许可](https://github.com/sindresorhus/github-markdown-css/issues/24)，所以许可证问题确实已经解决了。（GitHub 的这种开放精神真的很酷..）

综合以上考虑，工作流程如下：

1. 在 GitHub 上编辑 Markdown
2. 在 Preview 中确认效果
3. 获取带有 markdown-css 对应 class 的 HTML

其中第3步没能找到优雅的解决方案，不得已采用了硬办法——打开 dev tools 直接获取 HTML。

总之，这个博客是用 GitHub 来撰写的。实际用起来非常舒适。创建分支并 commit 就能实现草稿保存功能。

<br>

![图3. 在 GitHub Markdown 编辑器中撰写文章的样子](/images/blog/20191013/github%20%2B%20markdown.png "图3. 在 GitHub Markdown 编辑器中撰写文章的样子")
图3. 在 GitHub Markdown 编辑器中撰写文章的样子

<br>

## 在一些细节上下了功夫

虽然不是什么大事，但应用程序的一些部分还是用心开发了。

<br>

### 在浏览器中缓存通过 API 获取的数据

由于采用了 Nuxt + Express 架构，这个博客在 SSR 时不会发起 API 请求。但在 CSR 时会调用 Express 提供的 API。为了避免重复获取已经获取过的数据，实现了内存缓存机制。

在这个 Vue 项目中，所有通过 API 获取的数据都存储在 Store 中。store/post.ts 是负责获取和保存博客文章数据的 store。

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
    // 如果存在缓存则提前返回
    if (_.keys(state.post).indexOf(String(id)) >= 0) return
...

```

Store 的 state.post 使用了 TypeScript 的内置工具类型 `Record`。这样就将 state.post 定义为一个键值对对象，其中 key 是文章 ID（number 类型），value 是通过 API 获取的数据。

（由于 number 类型和文章 ID 并不是一一对应的，更严谨的做法应该是声明一个文章 ID 类型，使用 `Record<PostId, IPost>`，但这次偷懒了..）

通过以 Record 类型的方式保存到 store 中，下次需要获取 id = N 的文章时，系统会先检查 store 中是否已经保存了 id = N 的文章，只有在不存在时才发送 API 请求。

<br>

### 实现了多语言支持

既然要做博客，就想做多语言支持，所以实现了！这次使用了 [vue-i18n](https://github.com/kazupon/vue-i18n) 这个库，轻松实现了多语言支持。这是 kazupon 创建的 OSS 工具，非常感谢。

详细用法网上有很多资料，这里就不赘述了。

<br>

### 基础设施采用了 Kubernetes 和 Ingress

这是我很久以前就感兴趣并一直在慢慢学习的内容。一直想在实际环境中运行 Kubernetes，所以这次在个人项目中使用了。部署在 GCP 的 GKE 上，但由于我在 Kubernetes 方面还是新手，配置基本上都是默认的。今后想找时间好好学习 YAML 配置。

<br>

## 总结

以上就是我开发的博客的介绍。之前也开发过几次博客，但每次都面临"没有足够的时间来打磨 CMS 功能"的困扰，导致写文章变得困难，久而久之就懒得发布了——形成了恶性循环。这次通过简洁的实现确保了可维护性，并且利用 GitHub 等工具，轻松地构建出了高质量的博客应用。

虽然博客已经算是完成了，但还有很多想做的事情，代码中也有不少不满意的地方。这些方面希望能随着时间慢慢改进。

我在前端和服务器端方面都算不上经验丰富，所以这篇文章的内容可能有不准确的地方。如果有任何指正，欢迎通过 Twitter 或 GitHub 留言。
