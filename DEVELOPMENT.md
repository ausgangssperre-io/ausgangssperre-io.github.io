# ausgangssperre.io

Haupt-Repository für ausgangssperre.io.

-   `index.html`: Entry-point für die App

## Local Development

To start a local server and run the app, `cd` into the repository and use any
local web server, e.g.,

```shell
$ python3 -m http.server 8000
```

Then access the app at `localhost:8000`.

To simulate a phone, use the
[Device Mode](https://developers.google.com/web/tools/chrome-devtools/device-mode)
in Chrome Dev Tools.

### Best practices

Please keep code formatted according to our style guide :)

```shell
$ clang-format --style=Google -i src/*.js
```

### Working with Git

To start a development branch for your new feature:

```shell
$ git checkout master            # Go to the main branch
$ git pull                       # Ensure you have the latest version
$ git checkout -b my-feature     # Create a new branch called my-feature
$ git push -u origin my-feature  # Publish it on GitHub.
```

Then, work on your branch and create your commits.

Once you're ready to publish:

```shell
$ git pull --rebase origin master  # Get the newest master and rebase your changes on it.
```

If that creates merge conflicts, you can either resolve them or use `git rebase
--abort` to go back to where you were, and ask your local Git guru.

Then, `git push` your branch again (you'll need to use `git push -f` to force
the push if the branch has been rebased. This is OK since it's your personal
branch). Create a pull request and assign it to another team member.

For simple changes, you can also directly merge them in master without a code
review.

To merge the pull request, use GitHub's UI or:

```shell
$ git checkout master             # Go to master
$ git merge --ff-only my-feature  # Merge while keeping hte history linear. Should
                                  # work if you rebased your branch before.
$ git push                        # publish the changes.
```

## Dependencies

*   clang-format: `sudo apt install clang-format`

##  Open Source Libs used
* [Navigo js router](https://github.com/krasimir/navigo) MIT-License - THX @ Krasimir Tsonev
* [Signature pad](https://github.com/szimek/signature_pad)  MIT-License - THX @ Szymon Nowak
* [jQuery](https://github.com/jquery) MIT-License - THX @ The jQuery Foundation
* [popper.js](https://popper.js.org/) MIT-License - THX @ The Popper Js Foundation
* [boostrap meterial Design](https://fezvrasta.github.io/bootstrap-material-design/) MIT-License - THX @ Federico Zivolo
* [twitter boostrap](https://getbootstrap.com/) MIT-License - THX @ Twitter.com

