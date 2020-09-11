---
layout: blogPost.njk
date: 2018-10-24
title: "BASH: Minifying and combining JavaScript files"
mastheadImage: "/images/Zhuangzi_Tian_Yun_Ms.jpg"
mastheadAlt: "Tang dynasty Zhuangzi manuscript."
excerpt: "How to write a BASH script to minify and combine source code files from scratch."
tags: ['blog', 'BASH', 'Linux', 'Scripting']
---

[Sass](http://sass-lang.com/) has the nice feature of taking a group of source files and putting them together as a single CSS file, with the advantage of reducing the number of HTTP connections the web browser has to open when loading your webpage, thus speeding it up. It also has the option to *minify* the code—taking out any characters that are purely cosmetic. In this article we will perform a similar task for JavaScript files, using BASH and a JavaScript minifier program.

I will be using `yui-compressor`, but it should be very easy to substitute any other CLI JavaScript minifier in to this script.

### Step 1: Checking for Arguments

Our script will take the files to be combined as arguments. Thus we will start by checking that arguments have been given:

```bash
if [ $# -eq 0 ]
then
    echo "Please specify one or more input JavaScript files."
else
    # Steps 2 - 4 go here
fi
```

We are using a simple *if-else* statement to check if there are zero arguments. `$#` evaluates to the number of arguments given when the script is run. If there are zero arguments, then we print a message and then we let the script end. Otherwise, we will do the actual compressing.

### Step 2: Combining Files

Combining files in Unix-like systems is trivial. We just use `cat`:

```bash
    cat "$@" > /tmp/jsopt_combined.js
```

`$@` expands to all the arguments specified on the command line, except for the name of the program itself, which is argument zero. So this line concatenates each of the files specified on the command line, and then redirects to output to a temporary file using the `>` operator.

### Step 3: Minifying

Now we have all of our JavaScript source files combined into a single temporary file called `jsopt_combined.js`. Now we run that in our minifier of choice:

```bash
yui-compressor /tmp/jsopt_combined.js > scripts.js
```

Just like the last step, we are redirecting the output of the command, this time to a file called `scripts.js` in the current working directory.

### Step 4: Cleaning Up

```bash
rm /tmp/jsopt_combined.js
```

Finally, we remove the temporary file we created to hold the combined source files. This isn't strictly necessary, but it certainly doesn't hurt.

### In Conclusion

Here's what our final script looks like:

```bash
if [ $# -eq 0 ]
then
    echo "Please specify one or more input JavaScript files."
else
    cat "$@" > /tmp/jsopt_combined.js
    yui-compressor /tmp/jsopt_combined.js > scripts.js
    rm /tmp/jsopt_combined.js
fi
```

I've called the file `jsopt.sh`, short for *JavaScript Optimiser*. Give the script execute permissions with `chmod u+x jsopt.sh` and run it with `./jsopt.sh`, specifying some JavaScript files as arguments.

This script is very limited and has considerable room for improvement. For example, one might add an option to specify the path and name of the  output file.
