---
title: "Ubuntu14.04 + GPU + TensorFlow 环境搭建"
date: "2016-06-19"
tags: ["TensorFlow", "GPU"]
excerpt: ""
lang: "zh"
postSlug: "ubuntu-gpu-tensorflow"
ai_translated: true
---

*本文最初于2016年6月19日发布在Qiita上。*

## 概述

**想必不少人在搭建 Ubuntu 14.04 LTS + GPU + TensorFlow 环境时都吃过不少苦头。**
说到用 GPU 跑 TensorFlow，Ubuntu 14.04 是最先被想到的操作系统之一。然而如果不注意配置细节，就会遇到各种各样的问题——GPU 无法识别、TensorBoard 无法正常显示等等。我成功搭建了一个能够充分利用 GPU 版 TensorFlow 的环境，在此记录下来，希望能帮到遇到同样问题的人。

遇到的部分错误：
- CUDA 和 cuDNN 版本不匹配会导致无法正常运行
- NVIDIA 驱动必须"正确地"安装最新版本才能工作（默认的开源驱动会造成干扰）
- 通过 pip 安装 TensorFlow v0.7 会导致 TensorBoard 不可用
- Firefox 中部分 TensorBoard 功能无法使用
- 出现 Ubuntu 的"登录循环"bug

使用环境：
- OS：Ubuntu 14.04 LTS
- GPU：NVIDIA GeForce Titan
- Python 2.7
- TensorFlow：Version master（截至2016年6月18日）
- CUDA 7.5
- cuDNN 4.0.7

目录：
1. 安装 Ubuntu 14.04
2. 安装 NVIDIA 驱动
3. 安装 CUDA 和 cuDNN
4. 安装 TensorFlow
5. TensorFlow 运行测试

## 1. 安装 Ubuntu 14.04 LTS

从全新安装操作系统开始，确保是一个干净的状态。

假设初始操作系统也是 Ubuntu，从[这里](https://www.ubuntulinux.jp/download/ja-remix)下载 ISO 镜像 ubuntu-ja-14.04-desktop-amd64.iso。
插入 USB 驱动器，使用"启动盘创建器"应用创建启动盘。
重启后，在 ASUS 启动画面出现时按 F2，进入 Ubuntu 安装流程。

*这部分应该不会遇到什么问题，请参考其他教程进行操作。*

## 2. 安装 NVIDIA 驱动

确认 NVIDIA GPU：

```
$ lspci | grep VGA
00:02.0 VGA compatible controller: Intel Corporation Xeon E3-1200 v3/4th Gen Core Processor Integrated Graphics Controller (rev 06)
01:00.0 VGA compatible controller: NVIDIA Corporation GK110 [GeForce GTX Titan] (rev a1)
$ 
```

然后从[这里](http://www.nvidia.co.jp/Download/index.aspx?lang=jp)搜索并下载适合自己的驱动。

```

$ ls ~/Downloads
NVIDIA-Linux-x86_64-367.27.run
$ mv ~/Downloads/NVIDIA-Linux-x86_64-367.27.run ~

```

接下来按 Ctrl+Alt+F1 进入控制台模式，按如下步骤操作。
*控制台模式：即以 CUI 方式运行操作系统。如需返回 GUI 模式，按 Ctrl+Alt+F7。*

```
$ sudo apt-get purge nvidia*
$ sudo service lightdm stop
$ sudo chmod 755 ~/Downloads/NVIDIA-Linux-x86_64-367.27.run
$ sudo ~/Downloads/NVIDIA-Linux-x86_64-367.27.run

```

执行后会出现一系列提示，基本上选择 yes 继续即可。
最后重启，确认系统能正常启动。


## 3. 安装 CUDA 和 cuDNN
CUDA 7.5：从[这里](https://developer.nvidia.com/cuda-downloads)下载 cuda-repo-ubuntu1404-7-5-local_7.5-18_amd64.deb。

cuDNN 4.0.7：需要在[这个网站](https://developer.nvidia.com/rdp/form/cudnn-download-survey)注册 NVIDIA 开发者账号。注册大约需要一天时间。获得账号后登录，完成问卷调查，从"cuDNN v4 Library for Linux"链接下载 cudnn-7.0-linux-x64-v4.0-prod.tgz。

```
$ cd ~
$ ls ~/Downloads
cuda-repo-ubuntu1404-7-5-local_7.5-18_amd64.deb 　cudnn-7.0-linux-x64-v4.0-prod.tgz 
$ mv ~/Downloads/* ~
CUDAのインストール
$ sudo dpkg -i cuda-repo-ubuntu1404-7-5-local_7.5-18_amd64.deb
$ sudo apt-get update
$ sudo apt-get install cuda
cuDNNのインストール
$ tar xvzf cudnn-7.0-linux-x64-v4.0-prod.tgz
$ sudo cp cuda/include/cudnn.h /usr/local/cuda/include
$ sudo cp cuda/lib64/libcudnn* /usr/local/cuda/lib64
$ sudo chmod a+r /usr/local/cuda/lib64/libcudnn*

```

配置路径。在 ~/.bashrc 中添加以下两行并保存：

```~/.bashrc

export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:/usr/local/cuda/lib64"
export CUDA_HOME=/usr/local/cuda

```

使设置生效：

```

$ . ~/.bashrc

```


## 4. 安装 TensorFlow
这里安装最新的稳定版 Version master。
首先安装必要的依赖，然后通过 pip 安装：

```
$ cd ~
$ sudo apt-get install python-pip python-dev
$ sudo pip install --upgrade https://storage.googleapis.com/tensorflow/linux/gpu/tensorflow-0.8.0-cp27-none-linux_x86_64.whl

```

*Ver. 0.9 可能也没问题。[官方网站](https://www.tensorflow.org/versions/r0.9/get_started/index.html)默认打开的是 version r0.9，但请注意我们这次安装的是 master 版本。*
*如果参考几个月前的日文文章安装了 v0.7 等旧版本，在 Ubuntu 环境下通过 pip 安装时会遇到 bug，导致 TensorBoard 什么也不显示。遇到同样问题的人非常多，Google 的开发者甚至亲自出现在讨论帖中回应。这个问题已经被修复了，所以不要纠结，直接安装最新版本就好。*
- [Tensorboard from pip installation broken](https://github.com/tensorflow/tensorflow/issues/530)
- [TensorBoard showing nothing!](https://github.com/tensorflow/tensorflow/issues/1421)

## 5. TensorFlow 运行测试

基本的运行验证。
确认 TensorFlow 已正确安装：

```
$ python
Python 2.7.6 (default, Jun 22 2015, 17:58:13) 
[GCC 4.8.2] on linux2
Type "help", "copyright", "credits" or "license" for more information.
..
>>> import tensorflow as tf
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcublas.so locally
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcudnn.so locally
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcufft.so locally
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcuda.so.1 locally
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcurand.so locally
>>> 

```

确认 GPU 被正确识别：

```

>>> sess=tf.Session()
I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:900] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
I tensorflow/core/common_runtime/gpu/gpu_init.cc:102] Found device 0 with properties: 
name: GeForce GTX TITAN
major: 3 minor: 5 memoryClockRate (GHz) 0.8755
pciBusID 0000:01:00.0
Total memory: 6.00GiB
Free memory: 5.92GiB
I tensorflow/core/common_runtime/gpu/gpu_init.cc:126] DMA: 0 
I tensorflow/core/common_runtime/gpu/gpu_init.cc:136] 0:   Y 
I tensorflow/core/common_runtime/gpu/gpu_device.cc:755] Creating TensorFlow device (/gpu:0) -> (device: 0, name: GeForce GTX TITAN, pci bus id: 0000:01:00.0)
>>> 

```


最后验证 TensorBoard 能否正常运行。[这篇文章](http://qiita.com/supersaiakujin/items/aa598c942c3ec82d0c8c)是一个很好的教程，保存并运行其中的第一段代码。

```

$ vim tensorboard_test.py

```


```tensorboard_test.py

import tensorflow as tf
import numpy as np

WW = np.array([[0.1, 0.6, -0.9], 
               [0.2, 0.5, -0.8], 
               [0.3, 0.4, -0.7],
               [0.4, 0.3, -0.6],
               [0.5, 0.2, -0.5]]).astype(np.float32)
bb = np.array([0.3, 0.4, 0.5]).astype(np.float32)
x_data = np.random.rand(100,5).astype(np.float32)
y_data = np.dot(x_data, WW) + bb

with tf.Session() as sess:

    W = tf.Variable(tf.random_uniform([5,3], -1.0, 1.0))
    # The zeros set to zero with all elements.
    b = tf.Vari......
  
出于对原作者的尊重，这里省略了完整代码。
请参考上述链接的文章。


```

运行并查看输出：

```

$ python tensorboard_test.py 
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcublas.so locally
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcudnn.so locally
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcufft.so locally
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcuda.so.1 locally
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcurand.so locally
I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:900] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
I tensorflow/core/common_runtime/gpu/gpu_init.cc:102] Found device 0 with properties: 
name: GeForce GTX TITAN
major: 3 minor: 5 memoryClockRate (GHz) 0.8755
pciBusID 0000:01:00.0
Total memory: 6.00GiB
Free memory: 5.92GiB
I tensorflow/core/common_runtime/gpu/gpu_init.cc:126] DMA: 0 
I tensorflow/core/common_runtime/gpu/gpu_init.cc:136] 0:   Y 
I tensorflow/core/common_runtime/gpu/gpu_device.cc:755] Creating TensorFlow device (/gpu:0) -> (device: 0, name: GeForce GTX TITAN, pci bus id: 0000:01:00.0)
WARNING:tensorflow:Passing a `GraphDef` to the SummaryWriter is deprecated. Pass a `Graph` object instead, such as `sess.graph`.
step = 0 acc = 3.11183 W = [[-0.82682753 -0.91292477  0.78230977]
 [ 0.43744874  0.24931121  0.13314748]
 [ 0.85035491 -0.87363863 -0.81964874]
 [-0.92295122 -0.27061844  0.15984011]
 [ 0.33148074 -0.4404459  -0.92110634]] b = [ 0.  0.  0.]
step = 10 acc = 0.127451 W = [[-0.44663835 -0.09265515  0.30599359]
 [ 0.56514043  0.63780373 -0.12373373]
....

```

运行后会创建一个名为 /tmp/tensorflow_log 的文件夹。
使用 tensorboard 命令可视化本次训练。如果看到以下输出就说明成功了。在浏览器中打开 http://0.0.0.0:6006 即可启动 TensorBoard。需要注意的是，Firefox 中存在无法显示 TensorBoard Graph 页面的已知 bug，请使用 Google Chrome 等浏览器。

```

$ tensorboard --logdir=/tmp/tensorflow_log
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcublas.so locally
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcudnn.so locally
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcufft.so locally
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcuda.so.1 locally
I tensorflow/stream_executor/dso_loader.cc:105] successfully opened CUDA library libcurand.so locally
Starting TensorBoard 16 on port 6006
(You can navigate to http://0.0.0.0:6006)

```

<img src="/images/blog/20160619/tensorboard.png" alt="tensorboard">


参考文章：

- [Ubuntu 启动盘创建器 - 创建 USB 启动盘](http://kledgeb.blogspot.jp/2012/10/ubuntu-1-usb.html)
- [在 Ubuntu 上安装最新的 NVIDIA 驱动](http://zondeel.hateblo.jp/entry/2014/08/29/202919)
- [在 Ubuntu 14.04 上安装 TensorFlow 0.8 GPU 版](http://qiita.com/akiraak/items/1c7fb452fb7721292071)
