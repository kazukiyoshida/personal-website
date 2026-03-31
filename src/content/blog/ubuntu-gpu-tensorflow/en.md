---
title: "Setting Up Ubuntu 14.04 + GPU + TensorFlow"
date: "2016-06-19"
tags: ["TensorFlow", "GPU"]
excerpt: ""
lang: "en"
postSlug: "ubuntu-gpu-tensorflow"
ai_translated: true
---

*This article was originally posted on Qiita on June 19, 2016.*

## Overview

**If you've ever struggled to set up Ubuntu 14.04 LTS + GPU + TensorFlow, you're not alone.**
When it comes to running TensorFlow on a GPU, Ubuntu 14.04 is one of the first OS choices that comes to mind. However, without careful configuration, you'll run into all sorts of bugs -- the GPU won't be recognized, TensorBoard won't display properly, and so on. I managed to build an environment that fully utilizes GPU-accelerated TensorFlow, so I'm documenting the process here to help others avoid the same headaches.

Some of the errors I encountered:
- Things break if CUDA and cuDNN versions aren't aligned
- The NVIDIA driver won't work unless installed "correctly" with the latest version (the default OSS driver gets in the way)
- Installing TensorFlow v0.7 via pip causes TensorBoard to not work
- Some TensorBoard features don't work in Firefox
- The infamous Ubuntu "login loop" bug

Environment used:
- OS: Ubuntu 14.04 LTS
- GPU: NVIDIA GeForce Titan
- Python 2.7
- TensorFlow: Version master (as of June 18, 2016)
- CUDA 7.5
- cuDNN 4.0.7

Table of Contents:
1. Installing Ubuntu 14.04
2. Installing the NVIDIA driver
3. Installing CUDA and cuDNN
4. Installing TensorFlow
5. Testing TensorFlow

## 1. Installing Ubuntu 14.04 LTS

Start with a clean OS install from scratch.

Assuming the initial OS is also Ubuntu, download the ISO image ubuntu-ja-14.04-desktop-amd64.iso from [here](https://www.ubuntulinux.jp/download/ja-remix).
Insert a USB drive and use the "Startup Disk Creator" app to create a bootable disk.
Reboot, press F2 at the ASUS boot screen, and proceed with the Ubuntu installation.

*This part should go smoothly, so refer to other guides if needed.*

## 2. Installing the NVIDIA Driver

Verify the NVIDIA GPU:

```
$ lspci | grep VGA
00:02.0 VGA compatible controller: Intel Corporation Xeon E3-1200 v3/4th Gen Core Processor Integrated Graphics Controller (rev 06)
01:00.0 VGA compatible controller: NVIDIA Corporation GK110 [GeForce GTX Titan] (rev a1)
$ 
```

Next, search for and download the appropriate driver from [here](http://www.nvidia.co.jp/Download/index.aspx?lang=jp).

```

$ ls ~/Downloads
NVIDIA-Linux-x86_64-367.27.run
$ mv ~/Downloads/NVIDIA-Linux-x86_64-367.27.run ~

```

Then press Ctrl+Alt+F1 to enter console mode and proceed as follows.
*Console mode means running the OS in CUI mode. To return to GUI mode, press Ctrl+Alt+F7.*

```
$ sudo apt-get purge nvidia*
$ sudo service lightdm stop
$ sudo chmod 755 ~/Downloads/NVIDIA-Linux-x86_64-367.27.run
$ sudo ~/Downloads/NVIDIA-Linux-x86_64-367.27.run

```

The installer will walk you through several prompts -- just answer "yes" and proceed.
Finally, reboot and confirm that the system starts up normally.


## 3. Installing CUDA and cuDNN
CUDA 7.5: Download cuda-repo-ubuntu1404-7-5-local_7.5-18_amd64.deb from [here](https://developer.nvidia.com/cuda-downloads).

cuDNN 4.0.7: You need to register as an NVIDIA developer on [this site](https://developer.nvidia.com/rdp/form/cudnn-download-survey). Registration takes about a day. After getting your account, log in, complete the survey, and download cudnn-7.0-linux-x64-v4.0-prod.tgz from the "cuDNN v4 Library for Linux" link.

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

Set the paths. Add the following two lines to ~/.bashrc and save:

```~/.bashrc

export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:/usr/local/cuda/lib64"
export CUDA_HOME=/usr/local/cuda

```

Apply the settings:

```

$ . ~/.bashrc

```


## 4. Installing TensorFlow
Here we install the latest stable version: Version master.
First, install the prerequisites, then install via pip:

```
$ cd ~
$ sudo apt-get install python-pip python-dev
$ sudo pip install --upgrade https://storage.googleapis.com/tensorflow/linux/gpu/tensorflow-0.8.0-cp27-none-linux_x86_64.whl

```

*Ver. 0.9 might also work fine. The [official site](https://www.tensorflow.org/versions/r0.9/get_started/index.html) opens with version r0.9 by default, but note that we're installing the master version here.*
*If you install v0.7 by following older Japanese articles, you'll hit a bug where TensorBoard shows nothing when installed via pip on Ubuntu. This happened to so many people that Google developers showed up in the discussion threads. The issue has since been fixed, so just install the latest version without overthinking it.*
- [Tensorboard from pip installation broken](https://github.com/tensorflow/tensorflow/issues/530)
- [TensorBoard showing nothing!](https://github.com/tensorflow/tensorflow/issues/1421)

## 5. Testing TensorFlow

Basic sanity checks.
Confirm that TensorFlow is installed correctly:

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

Confirm that the GPU is recognized correctly:

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


Finally, verify that TensorBoard runs. [This article](http://qiita.com/supersaiakujin/items/aa598c942c3ec82d0c8c) is an excellent tutorial -- save and run the first code example from it.

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
  
The full code is omitted out of respect for the original author.
Please refer to the article linked above.


```

Run it and check the output:

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

After execution, a folder called /tmp/tensorflow_log will be created.
Use the tensorboard command to visualize the training. If you see the following output, it's working. Open http://0.0.0.0:6006 in your browser to launch TensorBoard. Note that there's a known bug where the Graph page doesn't render in Firefox, so use Google Chrome instead.

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


References:

- [Ubuntu Startup Disk Creator - Creating a USB startup disk](http://kledgeb.blogspot.jp/2012/10/ubuntu-1-usb.html)
- [Installing the latest NVIDIA Driver on Ubuntu](http://zondeel.hateblo.jp/entry/2014/08/29/202919)
- [Installing TensorFlow 0.8 GPU on Ubuntu 14.04](http://qiita.com/akiraak/items/1c7fb452fb7721292071)
