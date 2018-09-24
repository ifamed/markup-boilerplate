# markup-boilerplate

## Environment

Clone this repo and then in command line type:

* `npm install gulp-cli -g` - install gulp-cli
* `npm install` or `yarn install` - install all dependencies
* `gulp` - run dev-server and let magic happen, or `gulp --open`
* `gulp build` or `gulp build --prod` - build project from sources

NPM tasks:

* `npm run start` - run `gulp --open`
* `npm run build` - run `gulp build --production`

### Flags

We have several useful flags.

* `gulp --open` - open current project in browser
* `gulp --tunnel projectName` - to make project available over https://projectName.localtunnel.me
* `gulp [task_name] --prod` or `gulp [task_name] --production` - run task in production mode. Some of the tasks (like, sass or js compilation) have additional settings for production mode (such as code minification), so with this flag you can force production mode.

### Not necessary (env)

Install **canvassmith** engine to **gulp.spritesmith** package (macOS).

An engine can greatly improve the speed of your build (e.g. canvassmith) or support obscure image formats (e.g. gmsmith).

* `npm install -g node-gyp`
* `brew install cairo`
* `npm install canvassmith`

Use flag `--canvassmith`:

* `gulp build --canvassmith --prod` - use this engine when building a sprite