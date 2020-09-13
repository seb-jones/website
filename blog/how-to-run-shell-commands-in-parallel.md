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

When you run that command `xargs` will wait for input. If you type in some words separated by spaces and then hit return, you will see each word printed on it's own line. That is `echo` being called once for each word, with the single word as an argument. Press `CTRL + d` to tell `xargs` you are done.

In this example `-n 1` is specified, which tells `xargs` that each time it executes `command` it should pass one of the given arguments to that command. In other words, it specifies the maximum number of arguments per command-line.

### A Real-world Example

The following example uses the `pngquant` program to apply lossy compression to all of the PNG images in the current directory, in parallel.

```
ls *.png | xargs -P 0 -n 1 pngquant --speed 1
```

`ls` provides a whitespace-separated list of all the PNG files in the current working directory, which is then piped to `xargs`. `xargs` then calls `pngquant` (the `--speed 1` option tells it to use maximum compression) separately with each whitespace-separated file name as a single argument. If you run this command in a directory with some PNG files in it you should get compressed versions of each file with the suffix `-fs8.png` created.

The above example does have a flaw, however. If any of the PNG file names have a space in them, `xargs` will read that file name as two separate files, and the `pngquant` calls will throw an error because they can't find the files that `xargs` passes to them as arguments. 

We can get around this by using `find` instead of `ls`. `find` has a `-print0` option which separates it's output by the null terminator byte (specified as `'\0'` in C programs) instead of whitespace, and `xargs` can read this format using the `-0` option.

```
find . -maxdepth 1 -name '*.png' -print0 | xargs -0 -P 0 -n 1 pngquant --speed 1
```

The `find` syntax is quite inconsistent with other Linux tools so it can be confusing. The first argument, `.`, instructs it to start searching from the current directory. By default `find` searches recursively, so to mimick the behaviour of `ls` we use `-maxdepth 1` to prevent it from also listing PNG files from subdirectories - although this might be something you want. `-name '*.png'` simply matches any files that end with `.png`, like the `ls` call above, but be aware that the quotes around it are **required**, because otherwise the shell would expand the `*.png` into a sequence of file names before calling `find`.

If you run this command in a directory with PNG files, any files with spaces in their name should now be correctly compressed to a file with the same name and a `-fs8.png` suffix.
