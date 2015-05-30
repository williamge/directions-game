git stash
git checkout gh-pages
git pull --rebase origin gh-pages
git merge master
npm run postinstall
git add main.js
git commit -m "Automatic autopublish"
git push origin gh-pages
git checkout master
git stash pop