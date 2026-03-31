---
title: "使用TensorFlow读取数据"
date: "2016-06-27"
tags: ["TensorFlow"]
excerpt: ""
lang: "zh"
postSlug: "tensorflow-data"
ai_translated: true
---

*本文最初于2016年6月27日发布在Qiita上。*

---

我将TensorFlow中从文件读取数据的机制拆解为一系列步骤进行了分析。希望这能帮助大家理解CIFAR-10二进制图像数据是如何被加载的、Queue是如何被利用的，以及tensor是如何在Session中被送入计算图的。

总结如下：
- 正如官方文档 [Reading data](https://www.tensorflow.org/versions/r0.9/how_tos/reading_data/index.html) 中所述，从文件读取数据遵循七个步骤。
- 使用FilenameQueue是为了实现数据的shuffle和多线程处理，采用如下结构：

```python
tf.Graph().as_default()

    sess=tf.Session()
    tf.train.start_queue_runners(sess=sess)

    for i in range():
        sess.run([ .. ])
```

另外，[使用TensorFlow的Reader类](http://qiita.com/knok/items/2dd15189cbca5f9890c5) 这篇文章讲解了处理JPEG图像最关键的部分，建议一并参考。

假设CIFAR-10数据已保存在 /tmp/cifar10_data/.. 路径下。运行以下代码即可将图像数据以tensor形式输出。这个脚本从CIFAR-10 tutorial的大量函数中提取了数据读取和预处理的基本部分。如需进行更多处理，请参考 cifar10_input.py。


```python
#coding:utf-8

# Cifar10の image file を読み込んでテンソルに変換するまで.
import tensorflow as tf

FLAGS = tf.app.flags.FLAGS
tf.app.flags.DEFINE_integer('max_steps', 1,
                            """Number of batches to run.""")
tf.app.flags.DEFINE_integer('batch_size', 128,
                            """Number of images to process in a batch.""")
NUM_EXAMPLES_PER_EPOCH_FOR_TRAIN = 50000

with tf.Graph().as_default(): 
	# 1. 文件名列表
	filenames = ['/tmp/cifar10_data/cifar-10-batches-bin/data_batch_1.bin',
		'/tmp/cifar10_data/cifar-10-batches-bin/data_batch_2.bin',
        '/tmp/cifar10_data/cifar-10-batches-bin/data_batch_3.bin', 
        '/tmp/cifar10_data/cifar-10-batches-bin/data_batch_4.bin', 
        '/tmp/cifar10_data/cifar-10-batches-bin/data_batch_5.bin']
    # 2. 不进行文件名shuffle
    # 3. 不设置epoch限制


    # 4. 创建文件名列表的queue
	filename_queue = tf.train.string_input_producer(filenames)


	# 5. 创建与数据格式匹配的reader
	class CIFAR10Record(object):
		pass
	result = CIFAR10Record()

	label_bytes = 1 
	result.height = 32
	result.width = 32
	result.depth = 3
	image_bytes = result.height * result.width * result.depth
	record_bytes = label_bytes + image_bytes

	reader = tf.FixedLengthRecordReader(record_bytes=record_bytes)

	## 将queue传递给reader以打开文件
	result.key, value = reader.read(filename_queue)


	# 6. 从读取结果中decode数据
	record_bytes = tf.decode_raw(value, tf.uint8)


    # 7. 数据整形
    # 7-1. 基本整形
	result.label = tf.cast(tf.slice(record_bytes, [0], [label_bytes]), tf.int32)
	depth_major = tf.reshape(tf.slice(record_bytes, [label_bytes], [image_bytes]),
                                [result.depth, result.height, result.width])
	result.uint8image = tf.transpose(depth_major, [1, 2, 0])

	read_input = result
	reshaped_image = tf.cast(read_input.uint8image, tf.float32)
	float_image = reshaped_image

	# 7-2. 准备数据shuffle
	min_fraction_of_examples_in_queue = 0.4
	min_queue_examples = int(NUM_EXAMPLES_PER_EPOCH_FOR_TRAIN *
                            min_fraction_of_examples_in_queue)
	print ('Filling queue with %d CIFAR images before starting to train. '
            'This will take a few minutes.' % min_queue_examples)

    # 7-3. 创建batch（带shuffle）
	batch_size = FLAGS.batch_size
	num_preprocess_threads = 16
	images, label_batch = tf.train.shuffle_batch(
	[float_image, read_input.label],
        batch_size=batch_size,
        num_threads=num_preprocess_threads,
        capacity=min_queue_examples + 3 * batch_size,
        min_after_dequeue=min_queue_examples)

	images=images
	labels = tf.reshape(label_batch, [batch_size])


	# 8. 执行
	sess = tf.Session()
	tf.train.start_queue_runners(sess=sess)
	for step in xrange(FLAGS.max_steps):
		img_label = sess.run([images, labels])
		print(img_label)
	print("FIN.")
```
