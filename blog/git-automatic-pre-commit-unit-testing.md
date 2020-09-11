---
layout: blogPost.njk
date: 2019-06-29
title: "Git: Automatic Pre-Commit Unit Testing"
mastheadImage: "/images/qingming_festival.jpg"
mastheadAlt: "Close-up detail of the Chinese cityscape handscroll Along the River During Qingming Festival."
excerpt: "How to use Git hooks to run scripts such as unit tests automatically when code is committed."
tags: ['blog', 'BASH', 'Scripting', 'Git']
---

Git allows the user to run custom scripts at various points in it's workflow. This is done through hooks. Here we will use hooks to ensure that unit tests are passing before allowing a commit.

This example will be in the context of PHP development, but it should be
trivial to adapt them to any language that has testing tools with a command
line interface. Also note that I am writing this on Linux - I don't see any
reason why this method wouldn't work on something like Git For Windows, but
I will not be testing it on that.

### A brief introduction to Git Hooks

Simply put, Git Hooks are scripts that are placed in `.git/hooks` by the user
and are executed by Git at various times. They can use any scripting language
on the system, assuming it can be invoked using a [hashbang](https://en.wikipedia.org/wiki/Hashbang). In this
article I will be using Bash.

The name of the script file determines when Git will execute it. For example,
`.git/hooks/pre-commit` will be called when `git commit` is run by the user, just
before Git carries out the committing process.

The exit status of the script determines whether git should proceed with the
action in question. In this example, if the script exits with a non-zero return
code then Git will not continue with the commit.

For a more in-depth treatment of Git hooks, have a look at [the Git documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks). For a
reference of all available hooks, see the [githooks reference page](https://git-scm.com/docs/githooks).

### A contrived example

Before we hook up unit testing, lets look at a very basic example. Create the
`.git/hooks/pre-commit` file and add this to it:

```bash
#!/bin/bash

echo "This commit will fail!"

exit 1
```

As mentioned above, the hashbang (`#!`) at the start tells Git what interpreter
should be used to execute this script. In this case it's bash. The rest of the
script should be obvious - we simply output a message to the screen and then
exit with a non-zero return code to cancel the commit.

We also need to make sure that the script file has permission to be executed:

```bash
chmod u+x .git/hooks/pre-commit
```

This command adds complete execution permissions to the file.

Now, lets give our hook a try. Run the following commands to create a new file, add it to
staging and then commit:

```bash
echo "Hello, World" > test.txt

git add test.txt

git commit -m "Test commit"
```

You should see the following output:

```text
This commit will fail!
```

You can confirm that the commit didn't run by doing `git status`.

### Implementing Pre-Commit Tests

Now that we have the basics down, we can implement unit testing in our
pre-commit hook. This script will perform two functions. First it will run
[PHPUnit](https://phpunit.de/) and abort the commit if there are any failed tests. If there are
no failures, it will then run [PHP Code Sniffer](https://github.com/squizlabs/PHP_CodeSniffer) to make the code
[PSR-compliant](https://www.php-fig.org/psr/psr-2/).

For this example, my working directory is set up as follows:

```text
.
├── src
│   └── main.php
├── tests
│   └── ExampleTest.php
└── vendor
```

The `src` directory contains a badly-formatted source code file that will be
cleaned up by PHP Code Sniffer. The `tests` folder contains a unit test that
will be run by PHPUnit. The `vendor` folder is where the PHPUnit and PHP Code
Sniffer packages are stored by the Composer package manager - don't worry if
you don't know what that is.

Onto the script! We will start by running our unit tests:

```bash
./vendor/bin/phpunit tests
```

Now, we need to check if `phpunit` exited with a non-zero return code. One way
to do that would be as follows:

```bash
if [ $? -ne 0 ]
then
    exit 1
fi
```

`$?` is an example of what Bash calls a *special parameter*. It expands to the
return code of the previously-executed command. `-ne` means 'Not Equals', and
the rest of this `if` statement should be fairly self-explanatory.

We can, however, use a different method. Consider this:

```bash
./vendor/bin/phpunit tests || exit 1
```

The `||` operator is sort of like a logical 'exclusive-or' (also known as XOR).
The command on the right of `||` will only be executed if the command on the
left fails.

For simple situations like this, I prefer to use the `||` operator over an `if`
statement. However, if you need to run many commands conditionally, an `if`
statement may be a better choice for clarity.

### Adding PHP Code Sniffer

Implementing our code sniffer is a bit more complicated. Because it can
potentially modify files, we have to stage them again before letting the commit
proceed. Otherwise, the commit would not include those modifications.

```bash
phpcbf src/

MODIFIED_FILES=$(git status -s | sed -E -e 's/^...//g')

git add $MODIFIED_FILES

exit 0
```

First, we simply run `phpcbf` on the directory containing our source code.
`phpcbf` is a tool provided by PHP Code Sniffer that attempts to fix errors
that would be found by the `phpcs` sniffer tool.

Then we have to get the names of any modified files. `git status -s` provides
a more concise listing of the currently-modified files. The output looks like
this:

```text
A  .gitignore
A  composer.json
A  composer.lock
A  main.php
A  src/main.php
A  tests/ExampleTest.php
```

The first three characters (e.g. 'A  ') indicate the state, such as staged,
modified, deleted, etc. We are going to ignore that and re-add all the modified
files, so we pipe the output to `sed`, where we perform a regular-expression
substitution to remove the first three characters of each line. This gets
stored in the `MODIFIED_FILES` variable. Finally, we invoke `git add` on those
files.

### In Conclusion

My unit test is set to always fail for testing purposes. When I do a
`git commit`, I see the following:

```text
PHPUnit 8.2.3 by Sebastian Bergmann and contributors.

F                                                                   1 / 1 (100%)

Time: 13 ms, Memory: 4.00 MB

There was 1 failure:

1) ExampleTest::testExample
Failed asserting that false is true.

/home/seb/git-hooks-test/code/tests/ExampleTest.php:10

FAILURES!
Tests: 1, Assertions: 1, Failures: 1.
```

When I do `git status` I also observe that a commit has not taken place.

After fixing the test, I try the commit again. This time, I get more output:

```text
PHPUnit 8.2.3 by Sebastian Bergmann and contributors.

.                                                                   1 / 1 (100%)

Time: 13 ms, Memory: 4.00 MB

OK (1 test, 1 assertion)

PHPCBF RESULT SUMMARY
----------------------------------------------------------------------
FILE                                                  FIXED  REMAINING
----------------------------------------------------------------------
/home/seb/git-hooks-test/code/src/main.php            2      3
----------------------------------------------------------------------
A TOTAL OF 2 ERRORS WERE FIXED IN 1 FILE
----------------------------------------------------------------------

Time: 26ms; Memory: 4MB


[master (root-commit) 9239de9] Test
6 files changed, 1588 insertions(+)
create mode 100644 .gitignore
create mode 100644 composer.json
create mode 100644 composer.lock
create mode 100644 main.php
create mode 100644 src/main.php
create mode 100644 tests/ExampleTest.php
```

As you can see, the PHPUnit tests reported 'OK', and the PHP Code Sniffer was
able to fix some errors in the file. You can also see the commit report at the
bottom of the output, and invoking `git status` confirms the success of the
commit.

Here is the full contents of my `.git/hooks/pre-commit` file:

```bash
#!/bin/bash

./vendor/bin/phpunit tests || exit 1

phpcbf src/

MODIFIED_FILES=$(git status -s | sed -E -e 's/^...//g')

git add $MODIFIED_FILES

exit 0
```
