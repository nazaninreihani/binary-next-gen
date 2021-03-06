# Binary Next-Gen

[![Build Status](https://travis-ci.org/binary-com/binary-next-gen.svg?branch=master)](https://travis-ci.org/binary-com/binary-next-gen)
[![Coverage Status](https://coveralls.io/repos/github/binary-com/binary-next-gen/badge.svg?branch=master)](https://coveralls.io/github/binary-com/binary-next-gen?branch=master)
[![Code Climate](https://codeclimate.com/github/binary-com/binary-next-gen/badges/gpa.svg)](https://codeclimate.com/github/binary-com/binary-next-gen)

This repository contains the source code for the Binary Next-Gen [webapp](https://app.binary.com/) and [Android app](https://play.google.com/store/apps/details?id=app.binary.com).

> Note: As of Nov 2017, we no longer develop and publish the iOS version of next-gen, in accordance to App Store [Guideline 3.2.2 (viii)](https://developer.apple.com/app-store/review/guidelines/#unacceptable).

## Installation

Once you downloaded the repo, `cd` to project root and execute (you will need [yarn](https://yarnpkg.com)):
```
yarn install
yarn start
```
Now in your web browser go to http://localhost:3000 to see your app.

## Contribute

To contribute to Binary Next-Gen, fork this project and checkout the `dev` branch. When adding features or performing bug fixes, it is recommended you make a separate branch off `dev`. Prior to sending pull requests, make sure all unit tests passed (this project uses [Jest](https://facebook.github.io/jest/)):
```
yarn test
```
> Note: When you send pull requests, remember to set the base branch to `dev`.

Once your changes have been merged to `dev`, it will immediately deployed to [app.binary.com/beta](https://app.binary.com/beta). If the commit is also tagged, a new prerelease will appear in the [github releases page](https://github.com/binary-com/binary-next-gen/releases).

## Change Endpoint

If you are a QA engineer, what you may want to do is change the endpoint. You can do this by executing the following code in the developer console (where `www.binaryqa37.com` is your endpoint and `1003` is your appId):

```
setLocalEndpoint("www.binaryqa37.com", "1003")
```

To reset the endpoint to default values, execute:

```
resetLocalEndpoint()
```

## Deploy to Your Personal Github Pages

There may be cases when you want to visit your webapp on devices other than your development environment. To do this you can deploy on your personal github.io project page. 

This deployment process is automated using [gulp](https://gulpjs.com/) tasks in the `build` folder. After you have installed gulp globally (`npm install -g gulp`), execute the following from your project root:
```
cd build
yarn install # <- if you have not done so
gulp deploy:test --appId 11108
```
Replace `11108` above with your app id. If you do not have an app id, you can [register for a free app id here](https://developers.binary.com/applications/).

If the command executes successfully, the site will be hosted on `https://YOUR_USERNAME.github.io/binary-next-gen/`, where `YOUR_USERNAME` is your username. Note that if you login from there it will redirect you to `https://YOUR_USERNAME.github.io`. Just change the URL and your app will be up and running again.

Alternatively (not recommended as it is quite complicated), you can [use travis to deploy your github pages](docs/travis-github-pages.md).

## Documentation
 * [Build Instructions for iOS and Android](docs/build-instructions-ios-android.md)
 * [Dealing with Translations](docs/translations.md)
 * [Development Tools](docs/development-tools.md)
 * [Using Travis on Your Personal Github Page](docs/travis-github-pages.md)
 
## Legacy Documentation
*Documentation listed in this section will be either updated or replaced in the future.*
 * [Mobile App](docs/mobile-app.md)
 * [Binary Next-Gen Technical Presentation](https://binary-com.github.io/binary-next-gen-technical-presentation/)

## Useful Links
### Technologies Used
* [React](https://reactjs.org/) - JavaScript library for building user interfaces.
* [React Router](https://github.com/ReactTraining/react-router) - for routing, mapping urls to views.
* [Redux](https://github.com/reactjs/redux) - state management.
* [Reselect](https://github.com/reactjs/reselect) - data selection and computation.
* [Immutable.js](https://facebook.github.io/immutable-js/) - immutable data structures.

### Learning Resources
 * [Egghead](https://egghead.io/)
 * [ES6 Cheatsheet](https://www.youtube.com/watch?v=AfWYO8t7ed4)
 * [Live React: Hot Reloading with Time Travel](https://www.youtube.com/watch?v=xsSnOQynTHs)
 * [Immutable Data and React](https://www.youtube.com/watch?v=I7IdS-PbEgI)
 * [Immutable JavaScript: You can't change this](https://www.youtube.com/watch?v=wA98Coal4jk)
 * [react-router increases your productivity](https://www.youtube.com/watch?v=XZfvW1a8Xac)
 * [PERFORMANCE ENGINEERING WITH REACT](http://benchling.engineering/performance-engineering-with-react/)
 * [A DEEP DIVE INTO REACT PERF DEBUGGING](http://benchling.engineering/deep-dive-react-perf-debugging/)

[![forthebadge](http://forthebadge.com/images/badges/built-by-hipsters.svg)](http://forthebadge.com)
