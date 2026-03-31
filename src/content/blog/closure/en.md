---
title: "Problem Solving with Closures"
date: "2019-07-31"
tags: ["TypeScript", "Vue.js"]
excerpt: ""
lang: "en"
postSlug: "closure"
ai_translated: true
---

*This article was originally posted on Qiita on July 31, 2019, and has been revised and edited.*

## Introduction

When I first learned about the concept of closures, my reaction was "How would I actually use this?" Since then, I had implemented closure examples in various languages, but never really used a closure to solve a real problem elegantly. Then just recently, while implementing a UI feature, I found the perfect problem that closures could solve. It's a bit tricky, but I was quite pleased with the result, so I'd like to walk through it with a brief explanation of closures.

## What Is a Closure?

A closure is ~~though I may be slightly off, I understand it as "a function that has variables outside of itself that nothing else can access."~~
(2021 update) More precisely, a closure is "a combination of a function and a reference to its surrounding state (the lexical environment)." Using this mechanism, you can create functions with the properties described above.

Here's a simple closure in practice:

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

The `createClosure` function returns an anonymous function, and this anonymous function is the closure. The closure has no internal variables of its own -- instead, it accesses the variable `str` that exists outside of it. Only the closure itself (and the `createClosure` function) can access this `str` variable.

In this way, despite being a function, a closure can hold state,
~~essentially allowing you to work with pseudo-private variables -- that's how I understand closures.~~
(Strictly speaking, closures can be defined without functions, and the concept of closures can also be introduced in purely functional languages like Haskell.)

## A Concrete Example: Problem Solving with Closures

While implementing a UI, I needed to build a "Select All" button, and closures turned out to be the perfect tool. Here I've recreated a simplified version of that implementation.

### Implementing the "Select All" Button

![sample.gif](/images/blog/20190731/closure1.gif)

The UI looks like the image above. I used my recent interest in weight training as the theme. Since the data displayed on screen is fetched via an API:

- The number of items changes dynamically
- Items are grouped into multiple categories, so the number of "Select All" buttons also needs to change dynamically

These requirements needed to be met. If there were only a single "Select All" button, any implementation would be straightforward. But **because so much of the content was dynamic, closures really showed their strength**.

### Why "Select All" Buttons and Closures Are a Good Match

A "Select All" button has two different behaviors: 1) checking all items when they are unchecked, and 2) unchecking all items when they are checked.

![sample.png](/images/blog/20190731/closure2.png)

In other words, the "Select All" button adds all items when called once, removes all items the next time, adds all items again the next time, and so on -- this is exactly the kind of functionality that can be expressed with a closure.

### The Actual Code

The logic of "adding all items or removing all items" was implemented as a closure named `check`, which is held inside an `allChecker` object. The `check` closure maintains internal state representing "whether items are currently checked." It combines both behavior and state -- a textbook use of closures.

Since we need a "Select All" button for each category (upper body, lower body, etc.), we create a corresponding number of `allChecker` objects.

The `createAllChecker` function is responsible for creating these `allChecker` objects.

`@click="allCheckers[part.bodyPartsName].check()`
As shown in this line, every time the "Select All" checkbox is clicked, the `allChecker`'s `check` function is called. The `check` function is a closure that alternates its behavior with each invocation.

Because there were so many dynamic elements this time, implementing this without closures would have required a lot of extra variables and matching logic.

With that, here is the final code. The full source code for the sample app is available here:
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

  // Data fetched via API is stored in the store, so we retrieve it from there
  public get menu(): ITrainingMenu[] | null {
    return this.$store.state.training.menu
  }

  // List of selected muscles
  public checkedMusclesByParts = {}

  // Collection of allChecker objects for all body part categories
  public allCheckers = {}

  // Creates an allChecker that performs "select all muscles"
  public createAllChecker(partsName: string) {
    // Flag indicating whether items are currently checked
    let isChecked = false
    // List of all muscles for the specified body part
    const allMuscles = _.find(this.menu, ['bodyPartsName', partsName]).muscles

    return {
      // The check function is a closure
      check: (): void => {

        // Unchecked -> Checked: add elements
        if (!isChecked) {
          const diff = _.difference(
            allMuscles,
            this.checkedMusclesByParts[partsName]
          )
          this.checkedMusclesByParts[partsName].push(...diff)

        // Checked -> Unchecked: remove elements
        } else {
          this.checkedMusclesByParts[partsName] = _.without(
            this.checkedMusclesByParts[partsName],
            ...allMuscles
          )
        }

        // Finally, toggle the checked state
        isChecked = !isChecked
      }
    }
  }

  // Lifecycle
  public async mounted() {
    // Fetch training data
    await this.$store.dispatch('training/fetchTrainingMenu', {})

    _.forEach(this.menu, (parts) => {
      // Create an allChecker for each body part
      this.$set(
        this.allCheckers,
        parts.bodyPartsName,
        this.createAllChecker(parts.bodyPartsName)
      )

      // Create "selected muscles list" for each body part
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

## Conclusion

This was a rather niche example, but I hope it gave you a concrete illustration of problem solving with closures. I'm still learning, so if you have any corrections or feedback, I'd love to hear them.

Thank you for reading to the end.
