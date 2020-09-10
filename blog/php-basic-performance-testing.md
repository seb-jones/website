---
layout: blogPost.njk
date: 2018-11-23
title: "PHP: Basic Performance Testing"
mastheadImage: "/images/honami_koetsu_100_poets_anthology_section.jpg"
mastheadAlt: "Calligraphy by Honami Koetsu."
excerpt: "In a [previous article](https://sebj.co.uk/blog/post/c-basic-performance-testing-on-linux) we looked at how you can test the performance of a C Program by using a high resolution timer. PHP has a similar capability, made available through the [microtime](https://secure.php.net/manual/en/function.microtime.php) function."
tags: ['blog', 'PHP', 'Scripting', 'Performance']
---

#### Getting the Current Time

The following listing shows all the code we use to record a timestamp.

```php
$function_timings = [];

function seconds_since_request_start()
{
    return microtime(true) - $_SERVER["REQUEST_TIME_FLOAT"];
}

function store_timing($function_name)
{
    global $function_timings;

    $function_timings[] = [
        "name" => $function_name,
        "time" => seconds_since_request_start()
    ];
}
```

First we declare a global variable called `$function_timings`, and we initialize it as an empty array using the short-hand `[]` syntax.

Then we add a function to get the amount of seconds that have elapsed since the server began processing the request. Passing `true` as the argument of `microtime` causes it to return us a floating point value representing the current Unix time in seconds. the `REQUEST_TIME_FLOAT` entry in the `$_SERVER` super-global holds equivalent value for when the server started processing the request.

`store_timing` takes a name and uses our previous function to record a timing in an array with it, and pushes that array to our global `$function_timings` variable. We will call `store_timing` from any function where we want to find how long it took.

#### Writing Functions to be Measured

Now we will write some slow functions that we can test for speed.

```php
function powers()
{
    for ($i = 0; $i < 1000; ++$i)
        for ($j = 0; $j < 1000; ++$j)
            $power = $i ** $j;

    store_timing(__FUNCTION__);
}

function roots()
{
    for ($i = 0; $i < 1000000; ++$i)
            $root = sqrt($i);

    store_timing(__FUNCTION__);
}

powers();
roots();
```

Both the `powers` function and the `roots` function do a lot of computationally-expensive operations using loops. The important part is at the end of each function, where we use our `store_timing` function to record how long the function took. Also notice that we use the `__FUNCTION__` constant, which always evaluates to the name of the function in which execution is currently taking place.

#### Output Results

Finally, we will output the timings we have recorded as a HTML table.

```php
<table>
    <thead> 
        <tr>
            <th>Function name</th> 
            <th>MS since request start</th>
            <th>MS since last recorded timing</th>
        </tr>
    </thead>

    <tbody>
<?php
$prev_time = NULL;
foreach ($function_timings as $timing)
{
    $name = $timing['name'];
    $ms_since_request_start = $timing['time'] * 1000.0;

    if ($prev_time == NULL)
    {
        $ms_since_previous_recorded_time = "N/A";
    }
    else
    {
        $ms_since_previous_recorded_time = 
            $ms_since_request_start - $prev_time;
    }

    echo "
         <tr>
             <td>$name</td>
             <td>$ms_since_request_start</td>
             <td>$ms_since_previous_recorded_time</td>
         </tr>
         ";

    $prev_time = $ms_since_request_start;
}
?>
    </tbody>
</table>
```

We want to output not only the time since the start of the request, but also the time since the last recorded timing, so we can see how long each individual function took to run. So we start by declaring a variable called `$prev_time`, which we set to `NULL`, to tell us that this is the first iteration  of the data.

Next we start iterating over the timings. Notice that we multiply `$timing['time']` by `1000.0`. This is to convert it into Milliseconds. Then we check if `$prev_time` is `NULL`. If it is, we will print `N/A`. Otherwise, we calculate the difference between the time we are currently printing and that previous time.

Then we simply echo a table with all the data from this timing record.

Finally, and importantly, we set `$prev_time` to the time of this timing record, so that on the next iteration this time will be considered the previous time.

#### In Conclusion

The following is a listing of our entire PHP program:

```php
<?php

$function_timings = [];

function seconds_since_request_start()
{
    return microtime(true) - $_SERVER["REQUEST_TIME_FLOAT"];
}

function store_timing($function_name)
{
    global $function_timings;

    $function_timings[] = [
        "name" => $function_name,
        "time" => seconds_since_request_start()
    ];
}

function powers()
{
    for ($i = 0; $i < 1000; ++$i)
        for ($j = 0; $j < 1000; ++$j)
            $power = $i ** $j;

    store_timing(__FUNCTION__);
}

function roots()
{
    for ($i = 0; $i < 1000000; ++$i)
            $root = sqrt($i);

    store_timing(__FUNCTION__);
}

powers();
roots();
?>

<table>
    <thead> 
        <tr>
            <th>Function name</th> 
            <th>MS since request start</th>
            <th>MS since last recorded timing</th>
        </tr>
    </thead>

    <tbody>
<?php
$prev_time = NULL;
foreach ($function_timings as $k => $v)
{
    $name = $v['name'];
    $ms_since_request_start = $v['time'] * 1000.0;

    if ($prev_time == NULL)
    {
        $ms_since_previous_recorded_time = "N/A";
    }
    else
    {
        $ms_since_previous_recorded_time = 
            $ms_since_request_start - $prev_time;
    }

    echo "
         <tr>
             <td>$name</td>
             <td>$ms_since_request_start</td>
             <td>$ms_since_previous_recorded_time</td>
         </tr>
         ";

    $prev_time = $ms_since_request_start;
}
?>
    </tbody>
</table>
```
