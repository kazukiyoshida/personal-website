---
title: "Mercari Tech Conf 2018 Report"
date: "2018-10-09"
tags: ["Conference", "Microservices"]
excerpt: ""
lang: "en"
postSlug: "mercari-tech-conf"
ai_translated: true
---

*This article was originally posted on Hatena Blog on October 9, 2018, and has been migrated here.*

I attended [Mercari Tech Conf 2018](https://techconf.mercari.com/2018), held on October 4th (Thursday) in Roppongi. Here's a summary of what I learned over the course of the day about the engineering behind Mercari.

## Overall Impressions

The conference centered around two main topics: Microservices and Machine Learning. I was particularly interested in Mercari's approach to Microservices, so I focused on presentations and poster sessions related to that area.

I went in with almost no prior knowledge of Microservices, but the sessions walked through:

* How Mercari originally built their system
* What problems emerged as the system grew in scale
* How they decided to move toward Microservices

Hearing this progression gave me a concrete picture of the journey, which made the rest of the talks much easier to follow.

I also got a lot out of the Q&A booths, where I could ask questions directly — things like how they handle transactions in distributed databases, whether they use a service mesh, and other topics I'd been curious about but didn't fully understand. It was an incredibly valuable learning experience.


## Highlights from the Presentations

### Microservices Platform at Mercari ... by Taichi Nakashima

[Slides](https://speakerdeck.com/mercari/mtc2018-microservices-platform-at-mercari)

A presentation by the person behind the [SOTA blog](https://deeeet.com/) and [@deeeet](https://twitter.com/deeeet), whose work I've frequently learned from.

* Why they chose Microservices
    * They adopted a Microservices architecture to maintain high productivity even as the organization scales
    * Using deploys per day per engineer as a metric for organizational productivity, it's been shown that high-performing organizations see exponential growth in deploy frequency (cf. [Accelerate](https://www.amazon.com/Accelerate-Software-Performing-Technology-Organizations/dp/1942788339))

* Key aspects of the Microservices architecture
    * API gateway
        * To keep the monolithic system running while routing some requests to the new Microservices-based system, they set up an API Gateway
        * <img src="/images/blog/20181009/mercariTechConf1.jpg" alt="mercariTechConf1" width="500">
    * Golang & gRPC
        * They migrated from PHP to Golang
        * They prepared a template repository for services so that new Microservices development could be kicked off with a simple copy-and-paste (it seems they use echo as the framework)
    * Service management permissions
        * They split k8s by namespace, allowing each team responsible for a service to freely use their own namespace
    * Fostering a DevOps culture
        * Developers themselves write Terraform code, which the Platform team reviews via PRs. They use GitHub's code owners feature to manage this workflow (though I didn't fully grasp the details)
        * Teams deploy to their own k8s namespace using Spinnaker
        * <img src="/images/blog/20181009/mercariTechConf2.jpg" alt="mercariTechConf2" width="500">
        * For k8s YAML, they use the Kubernetes v2 provider

* Future challenges
    * About 20 Microservices are running in production and about 80 in development — they want to accelerate the path from dev to production
    * Set quantitative SLI/SLO targets for each service
    * Conduct Chaos Testing to verify that monitoring and alerting are functioning properly
    * Introduce Service Mesh to improve network reliability

---

### Customer Experiment ... by Shingo Ichikawa


[Slides](https://speakerdeck.com/mercari/mtc2018-customer-experience-improvement)

* Mercari and Customer Experience
    * There is a dedicated team focused on delivering experiences that exceed customer expectations
    * They handle tasks like checking listed items for policy violations and also develop the tools used in those operations

* Relation to Microservices
    * Previously, they could simply issue SQL queries against a central database, but with Microservices each service has its own database, making things like joining across multiple tables impossible
    * They solved this problem by adopting GraphQL

---

### Web Application As a Microservice Tech Lead Backend ... by Sota Sugiura

[Slides](https://speakerdeck.com/mercari/mtc2018-web-application-as-a-microservice)

* Aiming for a flexible architecture that handles change well
    * The frontend ecosystem, centered around npm, sees new technologies emerge constantly. From the outset, they chose TypeScript, Next.js & React, and GraphQL
    * Mercari has multiple services — Mercari, Mercari Box, Mercari Guide, etc. — and ideally each service team should be free to choose its own tech stack

* Mercari's frontend architecture
    * They adopted Fastly as their CDN and developed a Web Gateway service to receive requests from Fastly
   * <img src="/images/blog/20181009/mercariTechConf3.png" alt="mercariTechConf3" width="500">
   * Since SSL required communicating with multiple Microservices, they adopted a Backend For Frontend architecture, implemented using GraphQL
    * <img src="/images/blog/20181009/mercariTechConf4.png" alt="mercariTechConf4" width="500">

---

### leveraging billions of data items and ML to map the future ... by Takuma Yamaguchi

[Slides](https://speakerdeck.com/mercari/mtc2018-leveraging-billions-of-data-items-and-machine-learning-to-map-the-future)

* Mercari and Machine Learning
    * They hold datasets on the scale of billions of items (images, product descriptions, purchase records, etc.), which is massive compared to ImageNet's roughly 1.2 million images
    * They've hosted Kaggle competitions, such as one for estimating product prices

* Applying ML to production services
    * Detecting policy-violating products and transactions
    * Estimating product information from images: by taking a photo of a product, the system infers the brand name and other details, saving sellers the effort of manual input
    * Estimating product weight from images: inferring the weight information required for shipping from the product image

* ML models
    * They employ multi-modal Neural Networks
    * These run as a single service on k8s on GCP

* Personal takeaway
    * It was particularly interesting when they mentioned that Microservices and ML are a good fit for each other


## Microservices Team Q&A

<img src="/images/blog/20181009/mercariTechConf5.jpg" alt="mercariTechConf5" width="500">

* Services
    * They are currently in the process of replacing the monolith, with about 20 services running in production
    * All services are deployed on GCP
    * Each service is treated as its own GCP project
    * The goal is to follow the 2-pizza rule (5-9 people) for teams managing each service, but currently they operate with around 4-5 members
    * They aim for each service to be something that can be built in about 2 weeks — this makes it easier to discard services when needed

* DB
    * Each service maintains its own database suited to its characteristics
    * Databases are sharded, so they don't own physical instances
    * Rather than trying to enforce data consistency across services, they operate on a "Don't trust each other" principle

* CI
    * They run three environments: prod, dev, and lab
    * For complex deployments like canary releases, Spinnaker is the only viable option
