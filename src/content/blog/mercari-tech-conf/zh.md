---
title: "Mercari Tech Conf 2018 参会报告"
date: "2018-10-09"
tags: ["Conference", "Microservices"]
excerpt: ""
lang: "zh"
postSlug: "mercari-tech-conf"
ai_translated: true
---

*本文最初于2018年10月9日发布在 Hatena Blog 上，现已迁移至此。*

10月4日（周四），我参加了在六本木举办的 [Mercari Tech Conf 2018](https://techconf.mercari.com/2018)。以下是我用一天时间了解到的 Mercari 工程实践内容总结。

## 整体感想

本次会议主要围绕 Microservices 和 Machine Learning 两大主题展开。由于我一直对 Mercari 在 Microservices 方面的实践很感兴趣，所以无论是演讲还是海报展示，我都侧重关注了这个方向。

我参会时对 Microservices 几乎没有什么了解，但通过聆听以下内容：

* Mercari 最初是如何构建系统的
* 随着系统规模扩大，出现了哪些问题
* 他们是如何决定转向 Microservices 的

这样的脉络让我对整个过程有了具体的认识，后续的分享也更容易理解了。

在可以直接提问的展台环节，我也请教了不少问题，比如分布式数据库的事务怎么处理、是否使用了 Service Mesh 等。这些都是我一直好奇但不太清楚的内容，收获非常大。


## 印象深刻的演讲内容

### Microservices Platform at Mercari ... by Taichi Nakashima

[幻灯片](https://speakerdeck.com/mercari/mtc2018-microservices-platform-at-mercari)

这是 [SOTA 博客](https://deeeet.com/) 和 [@deeeet](https://twitter.com/deeeet) 的作者的演讲，我经常从他的分享中受益。

* 选择 Microservices 的原因
    * 为了在组织扩大的同时保持高效的生产力，采用了 Microservices 架构
    * 用每天每位工程师的部署次数来量化组织生产力，研究表明高效能组织的部署次数呈指数级增长（参见 [Accelerate](https://www.amazon.com/Accelerate-Software-Performing-Technology-Organizations/dp/1942788339)）

* Microservices 架构要点
    * API gateway
        * 为了在保持单体系统运行的同时将部分请求路由到新的 Microservices 系统，搭建了 API Gateway
        * <img src="/images/blog/20181009/mercariTechConf1.jpg" alt="mercariTechConf1" width="500">
    * Golang & gRPC
        * 从 PHP 迁移到了 Golang
        * 准备了 service 模板仓库，通过复制粘贴即可快速启动新的 Microservice 开发（看起来使用了 echo 框架）
    * 各 service 的管理权限
        * 按 namespace 划分 k8s，让负责某个 service 的团队可以自由使用对应的 namespace
    * 培养 DevOps 文化
        * 由开发者自己编写 Terraform 代码，Platform 团队通过 PR 进行审查。据说利用了 GitHub 的 code owners 功能来管理这个流程（具体细节我没太听明白）
        * 各团队使用 Spinnaker 向自己管理的 k8s namespace 进行部署
        * <img src="/images/blog/20181009/mercariTechConf2.jpg" alt="mercariTechConf2" width="500">
        * k8s 的 YAML 使用 Kubernetes v2 provider

* 未来的课题
    * 目前生产环境运行约 20 个 Microservices，开发环境约 80 个，需要加速从开发到生产的推进
    * 为各 service 设定 SLI/SLO 等定量指标和目标值
    * 进行 Chaos Testing，验证监控和告警是否正常运作
    * 引入 Service Mesh，提升网络的可靠性

---

### Customer Experiment ... by Shingo Ichikawa


[幻灯片](https://speakerdeck.com/mercari/mtc2018-customer-experience-improvement)

* Mercari 与客户体验
    * 有一个专门的团队致力于提供超越客户期望的体验
    * 他们负责检查上架商品是否违规等工作，并且为此开发了相应的运营工具

* 与 Microservices 的关联
    * 过去只需要对中央数据库执行 SQL 查询即可，但 Microservices 架构下各 service 各自拥有独立的数据库，因此无法再进行跨表 join 等操作
    * 通过采用 GraphQL 解决了上述问题

---

### Web Application As a Microservice Tech Lead Backend ... by Sota Sugiura

[幻灯片](https://speakerdeck.com/mercari/mtc2018-web-application-as-a-microservice)

* 目标是构建对变化有强适应力的灵活架构
    * 前端生态以 npm 为核心，新技术层出不穷。从一开始就选择了 TypeScript、Next.js & React 和 GraphQL
    * Mercari 旗下有 Mercari、Mercari Box、Mercari Guide 等多个服务，组织的理想状态是各服务团队可以自由选择技术栈

* Mercari 的前端架构
    * 采用 Fastly 作为 CDN，并开发了一个 Web Gateway 服务来接收来自 Fastly 的请求
   * <img src="/images/blog/20181009/mercariTechConf3.png" alt="mercariTechConf3" width="500">
   * 由于 SSL 需要与多个 Microservices 进行通信，因此采用了 Backend For Frontend 架构，使用 GraphQL 来实现
    * <img src="/images/blog/20181009/mercariTechConf4.png" alt="mercariTechConf4" width="500">

---

### leveraging billions of data items and ML to map the future ... by Takuma Yamaguchi

[幻灯片](https://speakerdeck.com/mercari/mtc2018-leveraging-billions-of-data-items-and-machine-learning-to-map-the-future)

* Mercari 与 Machine Learning
    * 拥有数十亿规模的数据集（图片、商品描述、购买记录等），相比 ImageNet 约 120 万张图片，这个规模相当庞大
    * 他们还在 Kaggle 上举办了商品价格估算等竞赛

* ML 在实际服务中的应用
    * 检测违规商品和交易
    * 通过图片推测商品信息：拍摄商品照片即可推测品牌名等信息，减少卖家手动输入的负担
    * 通过图片推测商品重量：从商品图片推测发货时所需的重量信息

* ML 模型
    * 采用了多模态 Neural Network
    * 作为单独的 service 运行在 GCP 上的 k8s 中

* 个人感想
    * 他们提到 Microservices 和 ML 很契合，这一点让我印象深刻


## Microservices 团队问答

<img src="/images/blog/20181009/mercariTechConf5.jpg" alt="mercariTechConf5" width="500">

* Services
    * 目前正在替换单体架构，约 20 个 service 已在生产环境运行
    * 所有 service 都部署在 GCP 上
    * 每个 service 作为一个独立的 GCP 项目来管理
    * 团队规模目标是遵循 2-pizza 原则（5-9人），但目前实际约 4-5 人
    * 希望每个 service 的规模控制在 2 周内可以完成开发的程度，这样更便于在需要时废弃 service

* DB
    * 各 service 根据自身特性持有适合的数据库
    * 数据库采用 sharding，并不持有物理实例
    * 不强制保证跨 service 的数据一致性，以 "Don't trust each other" 原则为前提

* CI
    * 运行 prod、dev、lab 三个环境
    * 对于 canary 发布等复杂部署场景，只有 Spinnaker 能胜任
