---
title: "使用闭包解决问题"
date: "2019-07-31"
tags: ["TypeScript", "Vue.js"]
excerpt: ""
lang: "zh"
postSlug: "closure"
ai_translated: true
---

*本文最初于2019年7月31日发布在Qiita上，经过修订和编辑后转载于此。*

## 前言

第一次了解闭包（Closure）的概念时，我的反应是"这到底该怎么用？"。此后，虽然我在各种语言中实现过闭包的示例，但从来没有真正用闭包优雅地解决过实际问题。直到前不久，在实现一个界面功能时，我终于找到了一个恰好适合用闭包来解决的问题。虽然有些巧妙，但我自己还是挺开心的，所以想结合闭包的简单讲解来介绍一下。

## 什么是闭包

闭包是指，~~虽然可能理解上有偏差，但我将其理解为"一个在自身外部拥有只有自己才能访问的变量的函数"。~~
（2021年补充）更准确地说，闭包是"一个函数与其周围状态（词法环境）的引用的组合"。利用这个机制，可以创建具有上述特性的函数。

具体来说，一个简单的闭包如下所示：

```bash
$ ts-node
> function createClosure() {
    const str = "hello world"
    return () => {
      console.log(s)
    }
  }
undefined
> createClosure()
[Function]
> createClosure()()
hello world
undefined
```

`createClosure` 函数返回一个匿名函数，这个匿名函数就是闭包。这个闭包本身没有内部变量，它访问的是存在于自身外部的 `str` 变量。这个 `str` 变量只有闭包自身（以及 `createClosure` 函数）才能访问。

这样，尽管是一个函数，闭包却可以持有状态，
~~可以处理类似于私有变量的东西——这是我对闭包的理解。~~
（严格来说，闭包不一定需要函数才能定义，在 Haskell 等纯函数式语言中也可以引入闭包的概念。）

## 使用闭包解决问题的具体示例

在实现界面时，我需要实现一个"全选"按钮，闭包在这里发挥了很好的作用。以下是基于当时实现简化后的示例应用。

### 实现"全选"按钮

![sample.gif](/images/blog/20190731/closure1.gif)

界面如图所示。我以最近热衷的健身训练为主题。由于界面显示的数据是通过 API 获取的：

- 项目数量会动态增减
- 由于项目被分为多个类别，"全选"按钮的数量本身也需要动态增减

需要满足以上规格要求。如果只有一个"全选"按钮，无论怎么实现都会比较简单。但正是**因为动态内容很多，闭包才发挥了其威力**。

### "全选"按钮与闭包的契合之处

"全选"按钮有两种不同的行为：1）从未选中状态选中全部项目，2）从选中状态取消全部项目。

![sample.png](/images/blog/20190731/closure2.png)

也就是说，"全选"按钮在第一次调用时添加全部项目，下一次调用时删除全部项目，再下一次又添加全部项目……这正是可以用闭包来表达的功能。

### 实际代码

将"添加全部项目或删除全部项目"的逻辑实现为名为 `check` 的闭包，并将其包含在 `allChecker` 对象中。`check` 闭包内部持有"当前是否处于选中状态"的状态。它同时包含了处理逻辑和状态，正是闭包的典型应用。

由于需要为每个类别（上半身、下半身等）设置一个"全选"按钮，因此需要创建相应数量的 `allChecker` 对象。

`createAllChecker` 函数负责创建这些 `allChecker` 对象。

`@click="allCheckers[part.bodyPartsName].check()`
如这一行所示，每次点击"全选"复选框时，都会调用 `allChecker` 的 `check` 函数。`check` 函数是一个每次调用都会切换行为的闭包。

由于这次有很多动态元素，如果不使用闭包来实现，可能需要增加大量额外的变量和匹配逻辑。

最终代码如下。示例应用的完整源代码在这里：
[kazukiyoshida/sample-allchecker-vue](https://github.com/kazukiyoshida/sample-allchecker-vue)


```javascript
<template lang="pug">
.div.allWrap
  p >> AllCheckers
  p {{ this.allCheckers }}
  p >> 選択された筋肉（部位ごと）
  p {{ this.checkedMusclesByParts }}
  template(v-for="part in this.menu")
    .partWrap
      span.part 【部位】{{ part.bodyPartsName }}
      p
        input(
          type="checkbox"
          @click="allCheckers[part.bodyPartsName].check()"
        )
        span すべての筋肉を選択
        template(v-for="muscle in part.muscles")
          p
            input(
              type="checkbox"
              :value="muscle"
              v-model="checkedMusclesByParts[part.bodyPartsName]"
            )
            span {{ muscle }}
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import _ from 'lodash'
import {
ITrainingMenu
} from '../interfaces/menu'

@Component
export default class extends Vue {

  // 通过 API 获取的数据存储在 store 中，从 store 获取
  public get menu(): ITrainingMenu[] | null {
    return this.$store.state.training.menu
  }

  // 已选择的肌肉列表
  public checkedMusclesByParts = {}

  // 为所有身体部位收集的 allChecker 对象
  public allCheckers = {}

  // 创建执行"全选肌肉"功能的 allChecker
  public createAllChecker(partsName: string) {
    // 表示是否已选中的标志
    let isChecked = false
    // 指定部位的所有肌肉列表
    const allMuscles = _.find(this.menu, ['bodyPartsName', partsName]).muscles

    return {
      // check 函数是闭包
      check: (): void => {

        // 未选中 -> 选中：添加元素
        if (!isChecked) {
          const diff = _.difference(
            allMuscles,
            this.checkedMusclesByParts[partsName]
          )
          this.checkedMusclesByParts[partsName].push(...diff)

        // 选中 -> 未选中：删除元素
        } else {
          this.checkedMusclesByParts[partsName] = _.without(
            this.checkedMusclesByParts[partsName],
            ...allMuscles
          )
        }

        // 最后切换选中状态
        isChecked = !isChecked
      }
    }
  }

  // 生命周期
  public async mounted() {
    // 获取训练数据
    await this.$store.dispatch('training/fetchTrainingMenu', {})

    _.forEach(this.menu, (parts) => {
      // 为每个身体部位创建 allChecker
      this.$set(
        this.allCheckers,
        parts.bodyPartsName,
        this.createAllChecker(parts.bodyPartsName)
      )

      // 为每个身体部位创建"已选择肌肉列表"
      this.$set(
        this.checkedMusclesByParts,
        parts.bodyPartsName,
        []
      )
    })
  }
}
</script>

```

## 结语

这是一个相当小众的例子，但希望能为大家提供一个使用闭包解决实际问题的具体参考。我仍在不断学习中，如果有任何指正或建议，欢迎留言。

感谢您阅读到最后。
