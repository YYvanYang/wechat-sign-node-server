# wechat-sign-node-server

## Required docker image
https://github.com/evertramos/docker-compose-letsencrypt-nginx-proxy-companion

## 注意事项

需要暴露端口给其他服务，否则其他服务无法发现该服务，会出现502错误！

```
    expose:
      - "10030"
```

Expose ports without publishing them to the host machine - they’ll only be accessible to linked services. Only the internal port can be specified.
