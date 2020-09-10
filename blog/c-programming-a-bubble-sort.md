---
layout: blogPost.njk
date: 2018-12-20
title: "C: Programming a Bubble Sort"
mastheadImage: "/images/mencius.jpg"
mastheadAlt: "A manuscript of the book of Mencius."
excerpt: "A bubble sort is one of the most basic ways to sort data. It is not efficient but the simplicity makes it a good place to start understanding the concepts. Today we will be implementing a bubble sort in C."
tags: ['blog', 'C', 'Programming', 'Algorithms']
---

#### Step 1: Defining our function

```c
// Step 4 Goes Here

void bubble_sort(char **list, size_t size, bool descending)
{
    if (!list || size == 0) 
        return;

    bool changed;

    do 
    {
        // Steps 2 - 3 Go Here
    }
    while (changed);
}
```

Our function takes a list of strings and the size of said list, and a boolean value to determine whether we sort in descending order or ascending order. If any of the parameters are invalid, we use `return` to end the function without doing anything.

A bubble sort works by iterating over the list repeatedly, comparing the values of each consecutive item and switching them if necessary, until an iteration takes place with no switching. To implement this behaviour, we start by creating a `do...while` loop that keeps iterating as long as the variable `changed` is set to true.

#### Step 2: Iterating over our list

```c
changed = false;

for (size_t i = 1; i < size; ++i)
{
    // Step 3 Goes Here
}
```

On each iteration, we first set the `changed` variable to false, and then we start a `for` loop to iterate over each item in the list. Notice that `i` is initialised to 1, not 0. This is because we will be comparing each item with the item *before* it.

#### Step 3: Comparing and switching items

```c
if (bubble_sort_test(list[i], list[i - 1], descending))
{
    char *temp = list[i - 1];
    list[i - 1] = list[i];
    list[i] = temp;

    changed = true;
}
```

We use a function that we will define in step 4 called `bubble_sort_test`, which will return true if we should switch the two items.

If we should switch, we create a temporary variable that is set to the previous item in the list. We then set that previous item to the current item, and then set the current item to the previous item, which was stored in that temporary variable. Thus, our the items are switched.

We then set changed to true, so that the `do...while` loop will iterate again.

#### Step 4: Defining our test function

```c
bool bubble_sort_test(char *a, char *b, bool descending)
{
    return (descending && strcmp(a, b) > 0) ||
        (!descending && strcmp(a, b) < 0);
}
```

If our list is sorted in descending order, then we return the boolean value evaluated by `strcmp(a, b) > 0`. Otherwise we do the opposite.

#### In Conclusion

Here is a complete program that uses these functions to sort a list of C source files by name.

```c
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

bool bubble_sort_test(char *a, char *b, bool descending)
{
    return (descending && strcmp(a, b) > 0) ||
        (!descending && strcmp(a, b) < 0);
}

void bubble_sort(char **list, size_t size, bool descending)
{
    if (!list || size == 0) 
        return;

    bool changed;

    do 
    {
        changed = false;

        for (size_t i = 1; i < size; ++i)
        {
            if (bubble_sort_test(list[i], list[i - 1], descending))
            {
                char *temp = list[i - 1];
                list[i - 1] = list[i];
                list[i] = temp;

                changed = true;
            }
        }
    }
    while (changed);
}

int main(int argc, char **argv)
{
#define FILENAMES_SIZE 6
    char *filenames[FILENAMES_SIZE] = 
    {
        "render.c",
        "audio.c",
        "files.c",
        "game.c",
        "strings.c",
        "maths.c",
    };

    bubble_sort(filenames, FILENAMES_SIZE, false);

    for (size_t i = 0; i < FILENAMES_SIZE; ++i)
        printf("%s\n", filenames[i]);

    return 0;
}
```
