---
layout: blogPost.njk
date: 2018-11-17
title: "BASH: Writing a simple Backup Script"
mastheadImage: "/images/gilgamesh_tablet.jpg"
mastheadAlt: "Epic of Gilgamesh Tablet"
excerpt: "Today we will be looking at how to write a simple Backup script using BASH and various Unix tools. Our script will determine the destination path and input file names by reading a plain-text file. It will then compress the input files into an archive in the destination path."
tags: ['blog', 'BASH', 'Linux', 'Scripting']
---

### Step 1: Prerequisite Functions

Firstly, we are going to need a function to help parse our destination and input file paths correctly:

```bash
expand_tildes()
{
    if [ $# -gt 0 ]
    then
        for i in $*
        do
            eval echo $i
        done
    fi
}
```

This function first checks if there are any arguments, in which case it loops through each argument and uses `eval` to evaluate `echo $i` as BASH code, thus printing the full directory if the argument contained a tilde (~) character. We need this function because BASH performs Tilde Expansion before Variable Expansion, and we will be storing our destination and input file paths in variables later.

### Step 2: Determine Input File Paths

```bash
src_list_file=~/etc/backup/src.files
dst_path_file=~/etc/backup/dst.path

if [ -f "$src_list_file" ]
then
    src_filenames=$(tr < "$src_list_file" "\n" " ")

    # Steps 3 - 4 go here
else
    echo "Error: Source list not found at '$src_list_file'" 2>&1
fi
```

First we declare some variables to store the paths of `src_list_file`, which contains the paths of our input files, and `dst_path_file`, which contains a single path denoting the location to store the archive of backed-up files.

We then make sure that our src list file exists using the `-f` operator in an `if` statement. Our `src_list_file` will contain a list of paths, where each path is on it's own line. So we send the contents of the file to the `tr` program using the input redirection operator (<), specifying that we want newline (\n) characters to be replaced with spaces. The `$( )` syntax is used to store the output of that `tr` command in the `src_filenames` variable.

If `src_list_file` does not contain the path of a valid file, we echo a message and use `2>&1` to redirect it to Standard Error.

### Step 3: Determine the Destination Path

```bash
if [ -f "$dst_path_file" ]
then
    dst_path=$(expand_tildes $(cat "$dst_path_file"))

    # Step 4 goes here
else
    echo "Error: Destination path file not found at '$dst_path_file'" 2>&1
fi
```

This is more or less the same as above, apart from how we parse the file data. We first use `cat` to print the contents of the file at `dst_path_file` to Standard Output. We surround this with `$( )` to send this to the `expand_tildes` function we defined earlier. We then surround that code with another `$( )` to send the output of the `expand_tildes` function to the `dst_path` variable. Thus, we will have a path extracted from `dst_file_path`, with tilde character expanded if it was present.

### Step 4: Archive Input Files to Destination

Now that we have our input file paths and our destination path, we can do the actual backing up by archiving the input files.

```bash
if [ -d "$dst_path" ]
then
    dst_filename=$(date +%F)
    tar -czvf "$dst_path/$dst_filename.tar.gz" $(expand_tildes $src_filenames)
else
    echo -e "Error: Destination path '$dst_path' does not exist.\n" \
        "Have you connected the backup medium?" 2>&1
fi
```

First we use the `-d` operator with `if` to make sure that the path stored in the `dst_path` variable is an existing directory on the system. if not, we print an error message.

If the path does exist, we generate a name for the destination file using `date +%F`. The `%F` format code gives us a date in the format `yyyy-mm-dd`. This is a nice format for backup files because it means that when you list files by name, which is usually the default in file explorers, it will also list by date.  

Finally, we use the `tar` program to compress the input files into a single archive. The options we give to `tar` are as follows:


* c - Create a new archive

* z - Compress archive with gzip

* v - Verbose output (you may want to turn this one off)

* f - Use the file given as an argument


We provide the full path of the destination file as the first argument, and the (tilde-expanded) input file paths as the second argument.

### In Conclusion

Here is a full listing of our script:

```bash
expand_tildes()
{
    if [ $# -gt 0 ]
    then
        for i in $*
        do
            eval echo $i
        done
    fi
}

src_list_file=~/etc/backup/src.files
dst_path_file=~/etc/backup/dst.path

if [ -f "$src_list_file" ]
then
    src_filenames=$(tr < "$src_list_file" "\n" " ")

    if [ -f "$dst_path_file" ]
    then
        dst_path=$(expand_tildes $(cat "$dst_path_file"))

        if [ -d "$dst_path" ]
        then
            dst_filename=$(date +%F)
            tar -czvf "$dst_path/$dst_filename.tar.gz" $(expand_tildes $src_filenames)
        else
            echo -e "Error: Destination path '$dst_path' does not exist.\n" \
                "Have you connected the backup medium?" 2>&1
        fi
    else
        echo "Error: Destination path file not found at '$dst_path_file'" 2>&1
    fi
else
    echo "Error: Source list not found at '$src_list_file'" 2>&1
fi
```
