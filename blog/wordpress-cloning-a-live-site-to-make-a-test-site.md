---
layout: blogPost.njk
date: 2019-01-21
title: "WordPress: Cloning a Live Site to make a Test Site"
featuredImage: "/images/Rongo_Analects_02.jpg"
featuredImageAltTag: "A page from The Analects of Confucius, in Chinese script."
excerpt: "A common task when administrating WordPress is to set up a copy of an existing site in a sub-directory of the same server, which can be used to test potentially site-breaking changes (such as plugin updates). I recently had to do this on a website with a particularly large amount of data, and my usual technique of cloning a WordPress site was not sufficient. In this article I will be documenting what I learned from this job."
tags: ['blog', 'PHP', 'WordPress']
---

#### Using 'All-in-One WP Migration'

My usual process of cloning a site looks something like this:

1. Export the site using the [All-in-One WP Migration](https://wordpress.org/plugins/all-in-one-wp-migration/) plugin and download the file it outputs.

2. Use FTP or CPanel File Manager to create a sub-directory in the `public_html` folder of the site.

3. Do a fresh WordPress installation in the new sub-directory.

4. Install All-in-One WP Migration and import the site.

So, first of all I exported the site. It ended up taking a long time, because there was over a gigabyte of data to be exported and downloaded. This was the first warning sign that I might have some difficulty using this method.

I then created a folder called `testing` in the `public_html` folder of the site and installed WordPress in it. Now I had a fresh, working version of WordPress accessible at `[domain name]/testing`.

The next step was where I came across a problem. The file was over a gigabyte in size, but the file upload limit was only two hundred megabytes. I looked in the CPanel of the site and checked the host's documentation, but for whatever reason there did not appear to be any easy way to change the file upload size. Normally you would changed the `php.ini` file, but no way of accessing this file was forthcoming.

I could have contacted their support and asked them to change it, but since it was my client who was the account holder of the website, I felt that it might be complicated, so I left that option as a last resort.

#### Using 'Duplicator'

The [Duplicator](https://wordpress.org/plugins/duplicator/) plugin serves a similar purpose to All-in-One WP Migration, but it does not require you to have a fresh installation of WordPress. Instead, it exports you an archive of the data and an installer that can be used on the server. You can upload this archive and installer script using FTP, thus avoiding the maximum upload limit of the website.

However, it turned out this plugin was a non-starter, literally. I ran the export process and it timed out.

#### Using 'WP Staging'

The final plugin I tried, and the one that worked, was [WP Staging](https://wordpress.org/plugins/wp-staging/). It pretty much did exactly what I set out to do: it created a clone of the site in a sub-directory. It did end up taking a long time to work, but that was probably more to do with the amount of data being copied and the available server resources, rather than the plugin itself.

#### In Conclusion

All-in-One WP Migration and Duplicator have their uses. Both are viable solutions for performing backups or migrating WordPress sites to another server. Both have their weak points: Duplicator seems to fail when you ask it to do too much, and All-in-One WP Migration relies on you having control of the maximum file upload size of the server you are targeting.

WP Staging seems to be built specifically for creating test sites on the same server as the live site, so it is not surprising that in this case it was the plugin that ended up doing the job.
