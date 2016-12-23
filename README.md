# Prerequisites

* Node >= 7.2.1
* Docker >= 1.12.5

And `server/settings.js` should look like:

```js
export const cookieSecret = '';

//TODO
```

…but with the correct values.

# To install

```sh
npm install # or yarn
npm run install-mongo
```

# To run

```sh
npm run serve
```

# Dokku setup

1. Install Dokku
1. Use vhosts, then:

```sh
# TODO: replace webwords with project name and domain
sudo dokku plugin:install https://github.com/dokku/dokku-mongo.git mongo
sudo dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git
sudo dokku apps:create webwords
sudo dokku mongo:create webwords
sudo dokku mongo:link webwords webwords
sudo dokku domains:add webwords webwords.com
sudo dokku domains:remove webwords webwords.webwords.com
sudo dokku config:set --no-restart webwords DOKKU_LETSENCRYPT_EMAIL=jaffathecake@gmail.com
# then push the app (yarn run deploy), then:
sudo dokku letsencrypt webwords
sudo dokku letsencrypt:cron-job --add
```

Then up the connection limits in `/etc/nginx/nginx.conf`.

```
worker_rlimit_nofile 90000;

events {
        worker_connections 90000;
        # multi_accept on;
}
```

…then restart nginx.