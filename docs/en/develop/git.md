# Git EOL

### Git EOL

**EOL use `LF`**

[Refer1](https://docs.github.com/en/get-started/getting-started-with-git/configuring-git-to-handle-line-endings#about-line-endings)

set a `.gitattributes`  file,

Save your current files in Git, so that none of your work is lost.

```sh
git add . -u
git commit -m "Saving files before refreshing line endings"
```

Add all your changed files back and normalize the line endings.

```sh
git add --renormalize .
```

Show the rewritten, normalized files.

```sh
git status
```

Commit the changes to your repository.

```sh
git commit -m "Normalize all the line endings"
```

Or [Refer2](https://www.aleksandrhovhannisyan.com/blog/crlf-vs-lf-normalizing-line-endings-in-git/#a-simple-gitattributes-config):

set a `.gitattributes`  file like `Refer1`

```sh
git config --global core.autocrlf false
git rm --cached -r .
git reset --hard
```

Check eol: 

```sh
git ls-files --eol
```