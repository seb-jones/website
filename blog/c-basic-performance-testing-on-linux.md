---
layout: blogPost.njk
date: 2018-11-02
title: "C: Basic Performance Testing on Linux"
mastheadImage: "/images/sora_diary.jpg"
mastheadAlt: "Diary of Sora, a disciple of the Japanese poet Basho."
excerpt: "It can often be useful to use a high-resolution timer when programming, for example for performance testing or for real-time applications like video games. In this article we will be looking at how to do this on Linux with `clock_gettime`."
tags: ['blog', 'C', 'Linux', 'Programming', 'Performance']
---

See [this article](https://docs.microsoft.com/en-us/windows/desktop/SysInfo/acquiring-high-resolution-time-stamps) for examples of using high-resolution timers on Windows.

### Getting the Current Time

```c
unsigned long get_time_in_microseconds()
{
    struct timespec ts;

    clock_gettime(CLOCK_MONOTONIC, &ts);

    return (ts.tv_sec * 1000000) + (ts.tv_nsec / 1000);
}
```

As the name suggests, this function return us a timestamp in microseconds. Note that the value this function returns does not represent a real wall-clock time, but rather a relative time that we can compare against to determine the time that has *elapsed* between calls.

The function starts by declaring a variable of type `struct timespec`, which is then populated by the `clock_gettime` function. The first argument, `CLOCK_MONOTONIC`, gives us a relative time stamp. `CLOCK_REALTIME` could be used to get wall-clock time. See the `clock_gettime` man-pages for more details.

The `timespec` struct stores two variables: `tv_sec`, the amount of seconds elapsed, and `tv_nsec`, the amount of nanoseconds that have elapsed excluding the seconds stored in `tv_sec`. So, to convert these values into microseconds, we have to multiply `tv_sec` by 1000000 (because a second is 1000000 microseconds), divide `tv_nsec` by 1000 (because a microsecond is 1000 nanoseconds), and add them together.

### Writing Functions to Test

Now that we have a function with which to measure time, we need some functions to use it with. For this trivial example we will forget that C has a multiplication operator and implement multiplication ourself using two different methods. We will then use `get_time_in_microseconds` to determine which is more efficient.

```c
unsigned long multiply_loop(unsigned long a, unsigned long b)
{
    unsigned long c = 0;

    while (b < 0)
    {
        c += a;
        --b;
    }

    return c;
}

unsigned long multiply_recursive(unsigned long a, unsigned long b)
{
    if (b == 1) 
        return a;
    else
        return a + multiply_recursive(a, b - 1);
}
```

These should be fairly easy to understand. The first function simply adds `a` to itself `b` times. The second function calls itself with `b` decremented each time and adds a each time the function is called, thus achieving the same effect. Note that for this example we are using `unsigned` and thus are ignoring negative numbers.

### Measuring the Performance of our Functions

```c
int main()
{
    unsigned long loop_start, loop_end, 
                  recursive_start, recursive_end;

    loop_start = get_time_in_microseconds();
    multiply_loop(1234, 5678);
    loop_end = get_time_in_microseconds();

    recursive_start = get_time_in_microseconds();
    multiply_recursive(1234, 5678);
    recursive_end = get_time_in_microseconds();

    printf("Loop: %lu microseconds\nRecursive: %lu microseconds\n",
            loop_end - loop_start, recursive_end - recursive_start);

    return 0;
}
```

We store a timestamp before and after each function is called. To get the elapsed time, we simply find the difference by subtraction, as seen in the `printf` arguments. Compile the code with optimisation disabled:

```bash
gcc -O0 measuring_perf.c
```

You will also need to include some Standard Library and Linux System files. Put this at the top of your source code file:

```c
#include <stdio.h>
#include <time.h>
```

### In Conclusion

If we run the compiled program using `./a.out` we get something like this:

```bash
Loop: 24 microseconds
Recursive: 262 microseconds
```
