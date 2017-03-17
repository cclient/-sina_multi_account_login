## Sina Refresh Token
## Stack
* [phantomjs](http://phantomjs.org/)
* [nodejs](https://nodejs.org/en/)
* [typescript](http://www.typescriptlang.org/)
* [gm.js](https://www.npmjs.com/package/gm)
* [jquery](http://jquery.com/)

## Quick Start

#### start server
1. cd ./server
2. npm install 
3. npm run server

#### start client
* 单项刷新(server目录下 cd server/)
 * npm run test [email] [passwd] 

* 批量刷新(client目录下 cd client/)
 1. 修改client/src/cron/sinaRefreshToken.ts accountObj
 2. 修改client/src/config/index.ts
 3. npm install
 4. gulp build
 5. 执行
     * 执行一次 node lib/cron/sinaRefreshToken.js
     * 作为后台定时服务 node lib/cron/index.js
  

###补充说明
账号刷新token受限于io，以串行方式运行，如需并行，需要修改server的cookies清除策略，和client。

验证码识别服务采用阿里的[here](https://market.aliyun.com/products/57124001/cmapi011148.html?spm=5176.8216963.522267.4.LFGKZ1#sku=yuncode514800004).
同服务只需修改client/src/config内appcode,若要变更,则需重写getCodeImgB64fromImgB64方法

###utils

* tool/html/drag/ImgGetLayout.html 列出选中区域坐标(列出验证码部分坐标)
* tool/gmcropimg.js 截图测试
* tool/showimage.html 输入base64查看img

###server
* server/server.js 新浪小号刷新token server
* server/client.js 新浪小号刷新token client 单项账号

###client
* client/src/cron/sinaRefreshToken.ts 批量刷新(在客户端作100%保证，每执行一次检查所有账号状态，所有成功都则退出，否则一直执行)
* client/src/cron/index.ts 定时后台(如果上次的任务还未运行完，则下次定时不会新启任务，以任务名标识)

###遇到的问题
1. 计划通过canvas 拿验证码图片转为base64，但toDataURL方法无法跨域，失败
2. 先拿html页，再单独打开验证码，用新页的验证码验证，chrome里成功，但phantomjs设cookies依然失败，失败，应是不同page的跨域cookies有问题。
3. 拿html,整页截图，按坐标，截取出验证验部分，成功。

现项目采用方案3。



