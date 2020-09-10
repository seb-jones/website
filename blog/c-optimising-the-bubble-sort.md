---
layout: blogPost.njk
date: 2019-01-07
title: "C: Optimising the Bubble Sort"
mastheadImage: "/images/Koku_Saitcho_shounin.jpg"
mastheadAlt: "Calligraphy by Emperor Saga"
excerpt: "In the [previous article](/blog/c-making-our-bubble-sort-flexible/) we upgraded our [basic bubble](/blog/c-programming-a-bubble-sort/) sort to work with any data type. Now we will make some small improvements to its performance."
tags: ['blog', 'C', 'Programming', 'Algorithms']
---

#### The Function

Here is the bubble sort function that we wrote last time and will be optimising today:

```c
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
```

#### Moving Variable Declarations out of Loops

The first simple change we will make is to pull any variable declarations out of loops, so they don't have to be allocated on the stack every iteration. This kind of thing would probably be done automatically by an optimising compiler, but we don't know for sure, so we might as well make certain of it.

```c
void bubble_sort(void *list, size_t size, size_t count, 
        int (* compare)(void *a, void *b), bool descending)
{
    bool    changed;
    char    *a;
    char    *b;
    int     cmp;
    size_t  i;
    char    *temp;

    char *items = list;

    do 
    {
        changed = false;

        for (i = 1; i < count; ++i)
        {
            a = items + (i - 1) * size;
            b = items + i * size;

            cmp = compare(a, b);

            if ((descending && cmp > 0) || (!descending && cmp < 0))
            {
                temp = malloc(size);

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
```

#### Avoiding repeated malloc calls

`malloc` can be a relatively slow function. Since we know that the size of the temporary buffer will remain the same throughout the lifetime of the `bubble_sort` function, we can `malloc` it once at the start of the function and free it once at the end:

```c
void bubble_sort(void *list, size_t size, size_t count, 
        int (* compare)(void *a, void *b), bool descending)
{
    bool    changed;
    char    *a;
    char    *b;
    int     cmp;
    size_t  i;

    char *items = list;
    char *temp  = malloc(size);

    do 
    {
        changed = false;

        for (i = 1; i < count; ++i)
        {
            a = items + (i - 1) * size;
            b = items + i * size;

            cmp = compare(a, b);

            if ((descending && cmp > 0) || (!descending && cmp < 0))
            {
                memcpy(temp, a, size);
                memcpy(a, b, size);
                memcpy(b, temp, size);

                changed = true;
            }
        }
    }
    while (changed);

    free(temp);
}
```

#### Reducing Iterations

Each iteration of the bubble sort puts at least one item in the right place. On the first iteration, the largest item is guaranteed to end up at the last index of the list. Likewise, on the second iteration, the second-largest item will definitely be placed in the second-to-last index. We can use this knowledge to optimise. We don't need to iterate over those indices because we know that the items they contain are already in the right place.

We can very easily implement this optimisation by performing a decrement operation on the `count` parameter after each iteration of the `for` loop:

```c
void bubble_sort(void *list, size_t size, size_t count, 
        int (* compare)(void *a, void *b), bool descending)
{
    bool    changed;
    char    *a;
    char    *b;
    int     cmp;
    size_t  i;

    char *items = list;
    char *temp  = malloc(size);

    do 
    {
        changed = false;

        for (i = 1; i < count; ++i)
        {
            a = items + (i - 1) * size;
            b = items + i * size;

            cmp = compare(a, b);

            if ((descending && cmp > 0) || (!descending && cmp < 0))
            {
                memcpy(temp, a, size);
                memcpy(a, b, size);
                memcpy(b, temp, size);

                changed = true;
            }
        }

        --count;
    }
    while (changed);

    free(temp);
}
```
