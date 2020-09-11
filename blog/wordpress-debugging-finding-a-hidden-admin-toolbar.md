---
layout: blogPost.njk
date: 2019-01-14
title: "WordPress Debugging: Finding a hidden Admin Toolbar"
mastheadImage: "/images/lotus_sutra.jpg"
mastheadAlt: "Sanskrit manuscript of the Lotus Sutra."
excerpt: "An explanation of a specific case where I had to debug a hidden admin bar in a WordPress installation."
tags: ['blog', 'PHP', 'Debugging', 'Web Development']
---

I was recently hired to fix an issue on a WordPress site where the Admin Toolbar would not show up when viewing front-end pages, even if you were logged in as an admin. In this article I will document the process by which I fixed the problem.

### Checking the Page Source

My first move was to have a look at the page source code to see if the HTML for toolbar even existed in the webpage that was being served. On Firefox you can use the `Control - U` shortcut to open the page source in a separate tab. A quick text search with `Control - F` for 'admin' did not bring up any results, and by looking at the footer, where the WordPress toolbar would normally be placed, I could clearly see that the toolbar wasn't there.

I know from experience that cache plugins can sometimes cached front-end pages to admin users, and these pages don't have the toolbar code, so this was my first suspicion. At the bottom of the HTML source I could also see the following comment, which furthered this theory.

```html
<!--
Performance optimized by W3 Total Cache. Learn more: https://www.w3-edge.com/products/

Object Caching 97/149 objects using disk
Page Caching using disk: enhanced 
Database Caching 19/33 queries in 0.010 seconds using disk

Served from: [URL REDACTED @ 2019-01-10 13:35:17 by W3 Total Cache
-->
```

A certain cache plugin that I have used in the past offered a setting that disabled caching for admins, so I checked the settings for this plugin. No dice. This was starting to look like a dead end.

I disabled this cache plugin completely and there was still no admin bar. It didn't look like any of the other plugins on the site would be responsible, so I chose not to spend any more time there for the time being.

### Looking at Theme Code

The website in question had a theme that was written from scratch, so there was potential for the problem to be found there. WordPress provides a basic editor for theme code, which can be accessed by going to 'Appearance > Editor'. This saved me the effort of having to clone the site on my system, which I would have had to do for more complicated code editing.

After some snooping around, I found the following line of code:

```php
add_filter('show_admin_bar', '__return_false');
```

The [__return_false](https://developer.wordpress.org/reference/functions/__return_false/) function is defined by WordPress so that you can easily disable a filter. In this case, it is being hooked to the show_admin_bar filter, and thus is preventing the admin toolbar from being shown. I commented this out, and included a message to let any future editors know why:

```php
// (Seb Jones): This line disables the admin bar on the front-end. I have commented it out to re-enable.
// add_filter('show_admin_bar', '__return_false');
```

Upon navigating to the front-end, I found that the problem was only partially solved. The admin toolbar was now appearing, but it had no styling.

### Restoring the WordPress styles

It is possible to disable the default WordPress styles and scripts, and this is not an unreasonable thing to do if you know they are not needed, because you can reduce the size of the served document and thus reduce bandwidth usage and transfer time. After some searching, I found the following code:

```php
/*
* Lose WP styles + Scripts
*/
if(!is_admin() && !isset($_GET['password-protected']) && !in_array( $_SERVER['PHP_SELF'], array( '/wp-login.php', '/wp-register.php' ))):
    add_action( 'init', 'deregister_styles', 100 );
    function deregister_styles()    { 
       wp_deregister_style( 'dashicons' ); 
       //wp_deregister_style( 'thickbox' );
       wp_deregister_script( 'thickbox' );
    }
endif;
```

As with the previous code snippet, I simply commented this out and left a little message in the the header comment.

```php
/*
* Lose WP styles + Scripts
* (Seb Jones): I have commented this to show the WordPress admin bar on the front end.
*/
/*
if(!is_admin() && !isset($_GET['password-protected']) && !in_array( $_SERVER['PHP_SELF'], array( '/wp-login.php', '/wp-register.php' ))):
    add_action( 'init', 'deregister_styles', 100 );
    function deregister_styles()    { 
       wp_deregister_style( 'dashicons' ); 
       //wp_deregister_style( 'thickbox' );
       wp_deregister_script( 'thickbox' );
    }
endif;
*/
```

With this code commented, the admin toolbar was styled as usual.

### In Conclusion

There was still one problem. The WordPress Admin Toolbar now overlapped the top of the site. This may have been why the original developer chose to disable it. In this case the client was fine with this small aesthetic issue since it didn't actually interfere with editing or affect the experience for the end user.
