git stash
git checkout -f gh-pages
git merge master --strategy-option theirs
npm run postinstall
git add main.js
git commit -m "Automatic autopublish"
git push origin gh-pages
git checkout master
git stash pop