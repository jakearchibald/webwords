/**
*
* Copyright 2016 Google Inc. All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import 'source-map-support/register';

import express from 'express';
import session from 'express-session';
import gzipStatic from 'connect-gzip-static';
import bodyParser from 'body-parser';
import multer from 'multer';
import mongoose from './mongoose-db';
import connectMongo from 'connect-mongo';
const MongoStore = connectMongo(session);

import {cookieSecret} from './settings'; 
import {production} from './utils';

import {userRoutes} from './user/routes';

const app = express();
const router = express.Router({
  caseSensitive: true,
  strict: true
});

// Middleware:
router.use(
  '/static',
  gzipStatic(__dirname + '/static', {
    maxAge: production ? 1000 * 60 * 60 * 24 * 365 : 0
  })
);

/*['presentation-sw.js'].forEach(jsUrl => {
  router.use(
    `/${jsUrl}`,
    gzipStatic(__dirname + `/static/js/${jsUrl}`, {
      maxAge: 0
    })
  );
});*/

router.use(session({
  secret: cookieSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 365
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    touchAfter: 24 * 3600
  })
}));

//router.use(userMiddleware);
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(multer().none());

// Routes:
router.use('/user', userRoutes);

app.use(router);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server up on port ${port}`);
});