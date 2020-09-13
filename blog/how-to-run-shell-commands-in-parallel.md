---
layout: blogPost.njk
date: 2020-09-13
title: "Run Commands in Parallel with xargs"
mastheadImage: "/images/Rongo_Analects_02.jpg"
mastheadAlt: "A page from The Analects of Confucius, in Chinese script."
excerpt: "How to use xargs to run the same command with different arguments in parallel on Linux."
tags: ['blog', 'BASH', 'Scripting', 'Linux']
---

Many common shell commands on Linux only run in a single thread - meaning that if you want to run that command many times with different arguments, they usually have to be executed one-after-the-other (in *serial*), rather than executing multiple instances of the command at the same time (in *parallel*). Since multi-core processors are now a given on modern computers, running these commands in parallel can be a big time-saver. This can be achieved using `xargs`.

### Basic Usage

```bash
xargs [options] [command [initial-arguments]]
```

`xargs` takes the arguments to apply to `command` from standard input by default. Each argument should be separated by whitespace, and we can tell `xargs` how many whitespace-separated arguments it should pass to each command with the `-n` or `-L` options (more on that below). To instruct `xargs` to run the commands in parallel, we use the `-P` option, specifying the maximum number of processes that `xargs` should run at one time. `-P 0` tells `xargs` to run as many as possible in parallel.

Here is a trivial example using `echo`:

```bash
xargs -P 0 -n 1 echo
```

When you run that command `xargs` will wait for input. If you type in some words separated by spaces and then hit return, you will see each word printed on it's own line. That is `echo` being called once for each word, with the single word as an argument. Press `CTRL + d` to tell `xargs` you are done.

In this example `-n 1` is specified, which tells `xargs` that each time it executes `command` it should pass one of the given arguments to that command. In other words, it specifies the maximum number of arguments per command-line.

### A Real-world Example

The following example uses the `pngquant` program to apply lossy compression to all of the PNG images in the current directory, in parallel.

```bash
ls *.png | xargs -P 0 -n 1 pngquant --speed 1
```

`ls` provides a whitespace-separated list of all the PNG files in the current working directory, which is then piped to `xargs`. `xargs` then calls `pngquant` (the `--speed 1` option tells it to use maximum compression) separately with each whitespace-separated file name as a single argument. If you run this command in a directory with some PNG files in it you should get compressed versions of each file with the suffix `-fs8.png` created.

The above example does have a flaw, however. If any of the PNG file names have a space in them, `xargs` will read that file name as two separate files, and the `pngquant` calls will throw an error because they can't find the files that `xargs` passes to them as arguments. 

We can get around this by using `find` instead of `ls`. `find` has a `-print0` option which separates it's output by the null terminator byte (specified as `'\0'` in C programs) instead of whitespace, and `xargs` can read this format using the `-0` option.

```bash
find . -maxdepth 1 -name '*.png' -print0 | xargs -0 -P 0 -n 1 pngquant --speed 1
```

The `find` syntax is quite inconsistent with other Linux tools so it can be confusing. The first argument, `.`, instructs it to start searching from the current directory. By default `find` searches recursively, so to mimick the behaviour of `ls` we use `-maxdepth 1` to prevent it from also listing PNG files from subdirectories - although this might be something you want. `-name '*.png'` simply matches any files that end with `.png`, like the `ls` call above, but be aware that the quotes around it are **required**, because otherwise the shell would expand the `*.png` into a sequence of file names before calling `find`.

If you run this command in a directory with PNG files, any files with spaces in their name should now be correctly compressed to a file with the same name and a `-fs8.png` suffix.

### An Advanced Example

Now we will do a similar thing with `guetzli`, a program that compresses JPEG images. Unlike `pngquant`, `guetzli` requires you to specify both the input and the output filenames, so our method above won't work. Instead we will use `sed` to transform the file names from `find` into an input and output argument, and then use `tr` to transform newlines into null terminator characters.

```bash
find . -maxdepth 1 -name '*.jpg' | \
    sed -E -e 's/^(.*)(\.jpg)$/\0\n\1-compressed\2/g' | \
    tr '\n' '\0' | \
    xargs --verbose -0 -P 0 -n 2 guetzli
```

This time we don't use `-print0` with `find`, since we transform the newlines into null terminator characters later.

The `sed` command takes each line from `find`, which will be a file name, and adds a new line with the file name plus a `-compressed` suffix, so if `find` outputs the following files:

```text
hello.jpg
world.jpg
foo.jpg
```

The output from `sed` will be this:

```text
hello.jpg
hello-compressed.jpg
world.jpg
world-compressed.jpg
foo.jpg
foo-compressed.jpg
```

The `sed` command is a substition, specified by `s/pattern/replacement/g`, that works by capturing two parts of the input string using brackets: `^(.*)` captures zero or more characters from the start (`^`) of the line up until `(\.jpg)$`, which is the extension at the end (`$`) of the string. These are then used in the replacement part of the sed command: The `\0` is the whole of the original input line, the `\1` is whatever got captured in `(.*)` and the `\2` is whatever got captured in `(\.jpg)`. The second capture is not strictly necessary since it would always be `.jpg`, but if we wanted to do something more fancy like `(\.jpe?g)` to match either `jpg` or `jpeg` then it would be needed.

We then use `tr` to transform all the newlines into null terminator characters which `xargs` will use to separate each argument. The final `xargs` call is more-or-less the same as before, except that we now use two arguments for each command line that is executed (`-n 2`), and obviously the command being executed is now `guetzli`.

If you run this in a directory with JPEG files they should get compressed into files with a `-compressed.jpg` suffix, in parallel.

### One Final Hint 

Since Linux commands tend to be silent by default, it can sometimes be hard to know exactly what is being run by `xargs`. Passing it the `--verbose` option makes it print each command line that it is executing to standard error, so you can see exactly what arguments are being passed to each command line.
