---
title: "Reading Data with TensorFlow"
date: "2016-06-27"
tags: ["TensorFlow"]
excerpt: ""
lang: "en"
postSlug: "tensorflow-data"
ai_translated: true
---

*This article was originally posted on Qiita on June 27, 2016.*

---

I broke down the mechanism for reading data from files in TensorFlow into a series of steps. This should serve as a useful reference for understanding how CIFAR-10 binary image data is loaded, how Queues are utilized, and how tensors are fed into the graph within a Session.

Here's what I found:
- As described in the official [Reading data](https://www.tensorflow.org/versions/r0.9/how_tos/reading_data/index.html) guide, reading from files follows seven steps.
- A FilenameQueue is used to enable data shuffling and multi-threaded processing, using the following structure:

```python
tf.Graph().as_default()

    sess=tf.Session()
    tf.train.start_queue_runners(sess=sess)

    for i in range():
        sess.run([ .. ])
```

Also, [Using TensorFlow's Reader class](http://qiita.com/knok/items/2dd15189cbca5f9890c5) explains the most important aspects of handling JPEG images, so I recommend checking that out as well.

We assume that the CIFAR-10 data is stored at /tmp/cifar10_data/.. . Running the following code will output the image data as tensors. This script extracts the essential data loading and preprocessing portions from the many functions in the CIFAR-10 tutorial. For more extensive processing, refer to cifar10_input.py.


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
	# 1. List of filenames
	filenames = ['/tmp/cifar10_data/cifar-10-batches-bin/data_batch_1.bin',
		'/tmp/cifar10_data/cifar-10-batches-bin/data_batch_2.bin',
        '/tmp/cifar10_data/cifar-10-batches-bin/data_batch_3.bin', 
        '/tmp/cifar10_data/cifar-10-batches-bin/data_batch_4.bin', 
        '/tmp/cifar10_data/cifar-10-batches-bin/data_batch_5.bin']
    # 2. No filename shuffling
    # 3. No epoch limit setting


    # 4. Create a queue from the filename list
	filename_queue = tf.train.string_input_producer(filenames)


	# 5. Create a reader matching the data format
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

	## Pass the queue to the reader to open the file
	result.key, value = reader.read(filename_queue)


	# 6. Decode the data from the read result
	record_bytes = tf.decode_raw(value, tf.uint8)


    # 7. Reshape the data
    # 7-1. Basic reshaping
	result.label = tf.cast(tf.slice(record_bytes, [0], [label_bytes]), tf.int32)
	depth_major = tf.reshape(tf.slice(record_bytes, [label_bytes], [image_bytes]),
                                [result.depth, result.height, result.width])
	result.uint8image = tf.transpose(depth_major, [1, 2, 0])

	read_input = result
	reshaped_image = tf.cast(read_input.uint8image, tf.float32)
	float_image = reshaped_image

	# 7-2. Prepare for data shuffling
	min_fraction_of_examples_in_queue = 0.4
	min_queue_examples = int(NUM_EXAMPLES_PER_EPOCH_FOR_TRAIN *
                            min_fraction_of_examples_in_queue)
	print ('Filling queue with %d CIFAR images before starting to train. '
            'This will take a few minutes.' % min_queue_examples)

    # 7-3. Create batches (with shuffling)
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


	# 8. Execute
	sess = tf.Session()
	tf.train.start_queue_runners(sess=sess)
	for step in xrange(FLAGS.max_steps):
		img_label = sess.run([images, labels])
		print(img_label)
	print("FIN.")
```
