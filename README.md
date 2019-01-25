Ubuntu 14.04.5 LTS
```bash
$ nodejs --version
v8.15.0
$ npm --version
6.4.1
$ gulp --version
[20:39:00] CLI version 2.0.1
[20:39:00] Local version 4.0.0
```
https://gulpjs.com/plugins/

## Demo Gulp
Install gulp
```bash
$ sudo npm install -g gulp
```


Install gulp in your proyect
If you use VM in host windows execute this, into proyect directory:
```bash
	$ ln -s ~/gulp/node_modnpm
```
You should now have a minified file, dist/jquery-2.1.1.min.js
```bash
$ find . -iname 'jquery*' | xargs ls -gG
$ npm install jshint gulp-jshint --save-dev
```

### Sources
https://github.com/spalger/gulp-jshint
https://jshint.com/about/
https://markgoodyear.com/2014/01/getting-started-with-gulp/
https://gulpjs.com/plugins/
https://fettblog.eu/gulp-4-parallel-and-series/


