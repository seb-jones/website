---
layout: blogPost.njk
date: 2019-01-01
title: "C: Making our Bubble Sort Flexible"
featuredImage: "/images/Harley_MS_5694_Lucian_Pro_Imaginibus_Scholia_by_Arethas_from_the_British_Library.jpg"
featuredImageAltTag: "Manuscript of a commentary on the Meditations of Marcus Aurelius."
excerpt: "[Last time](https://sebj.co.uk/blog/post/c-programming-a-bubble-sort/) we implemented a basic bubble sort algorithm in C. It only worked on strings, and was thus very limited. In this article we will be making a more flexible bubble sort that can work on any type."
tags: ['blog', 'C', 'Programming', 'Algorithms']
---

#### Step 1: Defining a Sort Function

```c
void bubble_sort(void *list, size_t size, size_t count, 
        int (* compare)(void *a, void *b), bool descending)
{
    // Steps 2 - 3 go here
}
```

In order to sort a list of any type, our sort function needs to know the `size` of each item in the list. This can easily be obtained by using the `sizeof` operator, as we shall see later.

A custom comparison function is also required. It is defined as taking two `void` pointers, which will point to the two items being compared, and returns an `int` representing which value is larger, in the same way that the return value of `strcmp` does.

#### Step 2: Sort Loop

```c
bool changed;
char *items = list;

do 
{
    changed = false;

    for (size_t i = 1; i < count; ++i)
    {
        // Step 3 goes here
    }
}
while (changed);
```

This looks mostly the same as the basic bubble sort from the previous article. The main addition to note is that we cast our `list` parameter to a `char` pointer called `items`. We do this because pointer addition on `void` pointers is technically illegal in C, because a `void` variable has no defined size. Some compilers still allow pointer mathematics on `void` pointers, but Visual Studio does not allow it, so casting to a `char *` is more portable.

#### Step 3: Comparing Items

```c
char *a = items + (i - 1) * size;
char *b = items + i * size;

int cmp = compare(a, b);

if ((descending && cmp > 0) || (!descending && cmp < 0))
{
    char *temp = malloc(size);

    memcpy(temp, a, size);
    memcpy(a, b, size);
    memcpy(b, temp, size);

    free(temp);

    changed = true;
}
```

Although this looks different to the comparison code of the previous article, it uses the same principles, just operating on arrays of memory instead of variables.

We start by calculating the position in our `items` array of `a` and `b`, by multiplying the size of each item by the current index. We then compare the two items using the function given as the parameter `compare`, and store that result in a variable `cmp`, because we will potentially be doing multiple tests on that result.

An `if` statement is used to decide whether we should switch, based on whether we are sorting in ascending or descending order. If we are sorting in *descending* order, then we want to move the items that return a positive `cmp`. Otherwise we check for the opposite condition.

Now we have to actually switch the items. We have to allocate a temporary buffer using malloc, and then we do the switch using a series of `memcpy` calls. Finally, we free the temporary buffer and set `changed` to `true`.

#### Step 4: Defining a Compare Function

```c
int compare_ints(void *a, void *b)
{
    int i = *((int *)a);
    int j = *((int *)b);

    return j - i;
}

int compare_strings(void *a, void *b)
{
    char *s1 = *((char **)a);
    char *s2 = *((char **)b);

    return strcmp(s1, s2);
}
```

Here are two examples of compare functions, for `int` and `char *` (string) types.

The retrieval of the actual values from the `void *` parameters may look a little confusing. First, we cast the parameter as a pointer of the type we want. For example `(int *) a` casts the `a` parameter as a pointer to an `int`. We then *dereference* the pointer by wrapping it in `*( )`, which retrieves the `int` value that `a`, points to.

#### In Conclusion

Here is a complete program that serves an example for sorting both integers and strings with our new function:

```c
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int compare_ints(void *a, void *b)
{
    int i = *((int *)a);
    int j = *((int *)b);

    return j - i;
}

int compare_strings(void *a, void *b)
{
    char *s1 = *((char **)a);
    char *s2 = *((char **)b);

    return strcmp(s1, s2);
}

void bubble_sort(void *list, size_t size, size_t count, 
        int (* compare)(void *a, void *b), bool descending)
{
    bool changed;
    char *items = list;

    do 
    {
        changed = false;

        for (size_t i = 1; i < count; ++i)
        {
            char *a = items + (i - 1) * size;
            char *b = items + i * size;

            int cmp = compare(a, b);

            if ((descending && cmp > 0) || (!descending && cmp < 0))
            {
                char *temp = malloc(size);

                memcpy(temp, a, size);
                memcpy(a, b, size);
                memcpy(b, temp, size);

                free(temp);

                changed = true;
            }
        }
    }
    while (changed);
}

int main(int argc, char **argv)
{
    #define FILENAMES_COUNT 6
    char *filenames[FILENAMES_COUNT] = 
    {
        "render.c",
        "audio.c",
        "files.c",
        "game.c",
        "strings.c",
        "maths.c",
    };

    bubble_sort(filenames, sizeof(*filenames), FILENAMES_COUNT, 
            compare_strings, false);

    printf("\nAscending Strings:\n\n");
    for (size_t i = 0; i < FILENAMES_COUNT; ++i)
        printf("%s\n", filenames[i]);

    bubble_sort(filenames, sizeof(*filenames), FILENAMES_COUNT, 
            compare_strings, true);

    printf("\nDescending Strings:\n\n");
    for (size_t i = 0; i < FILENAMES_COUNT; ++i)
        printf("%s\n", filenames[i]);

    #define INTEGERS_COUNT 6
    int integers[FILENAMES_COUNT] = 
    {
        8,
        2,
        13,
        0,
        1,
        5
    };

    bubble_sort(integers, sizeof(*integers), INTEGERS_COUNT, 
            compare_ints, false);

    printf("\nAscending Integers:\n\n");
    for (size_t i = 0; i < INTEGERS_COUNT; ++i)
        printf("%i\n", integers[i]);

    bubble_sort(integers, sizeof(*integers), INTEGERS_COUNT, 
            compare_ints, true);

    printf("\nDescending Integers:\n\n");
    for (size_t i = 0; i < INTEGERS_COUNT; ++i)
        printf("%i\n", integers[i]);

    printf("\n");

    return 0;
}
```
