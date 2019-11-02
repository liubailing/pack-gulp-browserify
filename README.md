
# 特殊需求，electron下的动态js代码实现代码安全的一种考虑
  自己开发的插件需要单独打包成一个文件。并且不影响外部对其调用。   
  electron下的动态代码实现代码安全的一种考虑
  

# glupbrowserify
gulp  browserify ,打包js插件，全代码打包.

### 打包流程
运行命令,   
**1、** 升级到需要的版本 
*   cd src, 进入文件夹
*   打开 package.json，加密模块，修改到相应的版本号
*   npm i 升级安装完成

**2、** 回到项目根目录
*   运行gulp 命令
*   修改文件 workflowengine.js,加入
    > var window = global ||{};
    备注：因为主进程没有window这个常量，（**考虑优化**）
*   mini化文件，目前是手动。

**3、** 完成
*  拷贝js文件到我们的加密工程去加密

### 结果
- dist 放上来，这是打包的结果。  

- 这里有个梗。开始使用的rollup，而且输出文件会更小。和他们的打包打包算法（利用 [tree-shake](https://blog.csdn.net/pansuyong/article/details/96132611) 特性来剔除项目中未使用的代码）,有一定关系，但是引用可能会[报错](https://www.haorooms.com/post/rollup_tips)。

- 最后用 gulp 打包文件，虽然文件大一点，但是文件能正常调用