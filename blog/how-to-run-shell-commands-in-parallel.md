---
layout: blogPost.njk
date: 2020-09-13
title: "Run Commands in Parallel with xargs"
mastheadImage: "/images/Rongo_Analects_02.jpg"
mastheadAlt: "A page from The Analects of Confucius, in Chinese script."
excerpt: "How to use xargs to run the same command with different arguments in parallel on Linux."
tags: ['blog', 'BASH', 'Scripting', 'Linux']
---

Many common shell commands on Linux only run in a single thread - meaning that if you want to run that command many times with different arguments, they have to be executed one-after-the-other (in *serial*), rather than executing multiple instances of the command at the same time (in *parallel*). Since multi-core processors are now a given on modern computers, running these commands in parallel can offer a significant speed boost. This can be achieved using `xargs`.

### Basic Usage

```
xargs [options] [command [initial-arguments]]
```

`xargs` takes the arguments to apply to `command` from standard input by default. Each argument should be separated by whitespace, and we can tell `xargs` how many whitespace-separated arguments it should pass to each command with the `-n` or `-L` options (more on that below). To instruct `xargs` to run the commands in parallel, we use the `-P` option, specifying the maximum number of processes that `xargs` should run at one time. `-P 0` tells `xargs` to run as many as possible in parallel.

Here is a trivial example using `echo`:

```
xargs -P 0 -n 1 echo
```

When you run that command `xargs` will wait for input. If you type in some words separated by spaces and then hit return, you will see each word printed on it's own line.
