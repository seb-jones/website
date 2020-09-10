---
layout: blogPost.njk
date: 2018-10-19
title: "BASH: Making a simple 'Yes/No' Prompt"
mastheadImage: "/images/odyssey.jpg"
mastheadAlt: "A fifteenth-century manuscript of The Odyssey."
excerpt: "On Linux I often use the `shutdown now` command to shut down my computer, so I thought I would alias it to `sdn`. However, I was concerned that it might be too easy to accidentally type these three characters and end up losing unsaved work, so I decided to implement a prompt to confirm the shutdown. In this article we shall be looking at how I implemented this with a simple BASH script."
tags: ['blog', 'BASH', 'Linux', 'Scripting']
---

We will make a function and put it in our `~/.bashrc` file. This will make it usable from any terminal we open henceforth.

### Step 1: Declare Our Function
```bash
function sdn()
{
    # Steps 2 - 4 go here
}
```

This simply tells BASH that when we run the `sdn` command it should execute the statements between the curly brackets.

### Step 2: Create an Input Loop

```bash
input=""

while [ "$input" != "n" -a "$input" != "y" ]
do
    #Step 3 goes here
done
```

First we create a variable called `input` and set it to the empty string. The user input will be stored in this variable.

We then create a `while` loop. This will execute each command we place between `do` and `done` while the condition given in the square brackets is true. The condition we give will evaluate to true when the variable `input` does not equal "n" and does not equal "y". The `-a` token means 'and'.

### Step 3: Reading Input

Now we actually read the user input.

```bash
read -n 1 -p "Really shutdown? (y/n) " input
echo ""
```

`read` is a BASH built-in function that reads user input into a variable, in this case our `input` variable. The option `-n 1` tells bash to stop reading input after 1 character has been entered. The `-p` prompts the user with the given string.

We also echo the empty string to add a newline after the user's input.

Now we have a loop that asks for user input on each cycle and then checks the given value to see if it is either "n" or "y". It will keep prompting the user until they give one of these characters. Now we need to decide what happens when the user enters "y".

### Step 4: Checking Input

```bash
if [ "$input" = "y" ]
then
    shutdown now
fi
```

At this point, the `input` variable should either hold "n" or "y". So, if it holds "y", we shutdown, and if it doesn't, we can just do nothing. Here we use an `if` statement to check this condition. If `input` *does* equal "y", then the statements between `then` and `fi` are executed. The `shutdown now` command does exactly what you'd expect.

### In Conclusion

Here is what our complete function looks like:

```bash
sdn()
{
    input=""

    while [ "$input" != "n" -a "$input" != "y" ]
    do
        read -n 1 -p "Really shutdown? (y/n) " input
        echo ""
    done

    if [ "$input" = "y" ]
    then
        shutdown now
    fi
}
```

When we enter `sdn` into a BASH terminal, it prompts us with the following:

```bash
Really shutdown? (y/n)
```

If we type `y`, the computer shuts down. If we type `n`, the script simply ends with no response. If we type any other character (other than CTRL-C, which would force the script to end), then the script prompts us with the same message.
