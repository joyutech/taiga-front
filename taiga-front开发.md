# taiga-front开发

原地址：https://github.com/taigaio/taiga-front

注意这个项目用的是angularjs而不是angular

## 最简单的部署方法

1. 装好sass(https://sass-lang.com/install)。在windows下先装chocolatey。这个步骤只要按照教程基本没问题。
2. 全局装gulp
3. 项目目录下安装其他依赖。这里主要是node-sass和gulp-sass的问题，要根据node版本来选择。node(v10.11.0)测试把node-sass改成(4.12.0)和gulp-sass改成(4.0.2)可以通过安装成功。
4. 修改api地址。把conf目录下的conf.example.json里的api地址和app-loader目录下的app-loader.coffee里的api地址改成(`http://222.44.104.36:88/api/v1/`)或者(`https://api.taiga.io/api/v1`)，也就是现网和官方那个，原本是个loaclhost来的。不确定还有没有其他地方要改，打开前端看看请求是否正常就知道了。
5. gulp，然后打开(http://localhost:9001/)
6. 有个css加载的问题，下载这个文件(http://ftp.joyutech.com:88/v-1557327234628/styles/theme-taiga.css)，丢到gulp生成的dist/v-xxxxxxx/styles目录下。这个是gulp-scss-lint的问题，在gulpfile.js里把scss-lint的任务注释掉就好了。
7. `gulp deploy`时，模块gulp-imagemin有问题(node10下)，把它升级到6.0.0可以解决。

## 代码结构说明

### dist目录

* dist/：打包后的目录
  * v-xxxxxxxxxx/：
    * js/：
      * app-loader.js：这个对应`/app-loader/app-loader.coffee`，是前端的启动程序，index.html直接加载。里面包含了默认配置，但是如果有conf.json文件(也就是把conf.example.json重命名)，会读取并且覆盖app-loader.js里的配置。
      * templates.js：这个是angularjs的模板缓存文件，index.html直接加载。
      * app.js：这个打包后的程序主体，由app-loader.js加载。`/app`目录下的的各种代码，除了第三方库之外的文件应该都是编译并且塞到这里了。看下面对app目录的说明。

### app目录

* app/：代码主体
  * coffee/：
    * app.coffee：angularjs的路由(route)定义在这里。
  * modules/：angularjs模块定义，看下面举例说明。
  * partials/：这里是html模板(jade格式)，会先编译成html(存放到tmp目录里)，然后缓存到templates.js里。有一部分模板在modules里面。在app.coffee里定义路由的时候，templateUrl指向对应模板，然后从templates.js里取。

### tmp目录

* tmp/：临时文件
  * modules/：存放app目录里modules的临时文件，关注html文件就好了
  * partials/：存放app目录里partials的临时文件，关注html文件就好了

## angularjs
原文档：https://docs.angularjs.org

中文文档比较残缺：https://www.angularjs.net.cn/

### 举wiki这个页面做例子
这里目录结构很混乱，先把涉及的目录和文件列出来。

* app\partials\wiki\：这里是部分模板文件
* app\modules\wiki\history\：这里应该是跟history相关的文件，这里把模板还有代码都放一起了。还好它把module、controller、directive都是分开定义的。
* app\coffee\modules\wiki.coffee：这个文件是单独定义wiki这个module的。
* app\coffee\modules\wiki\：这里的代码也是定义controller、directive，这里没有特意分开controller、directive来定义。反正最后代码粘到一起，只要模块在前，应该都是一样的。看angularjs例子通常都是先controller再directive。

#### module、controller、directive、component

这个几个概念最好去看angularjs的文档。这里只大概描述下。

* module：可以理解成包含controller、directive、component的一个集合体
* component：理解成vue里的一个component就好了，包含一个模板和一个controller。然而这个项目里不是用component来定义component的。
* controller：包含一些方法和数据理解成写vue文件的时候下面那些js代码就好了，另外angularjs还有service这个概念，这里不仔细区分了。
* directive：指令。angularjs里ngIf、ngRepeat这些（这两个对应vue的v-if、v-for），就叫指令。另外，angularjs里，你使用的组件标签，也叫做指令，比如`<my-component>`，它也是一个指令。所以这个项目里定义component，是用directive来定义的。

#### 实际代码举例

##### 添加一个读取本地markdown的功能

`app\partials\common\components\wysiwyg-toolbar.jade`里添加一个按钮。这里的tg-file-change事件(指令)是tagai这个项目定义的。

```jade
.tools(ng-class="{\"visible\": editMode}")
    a.e2e-save-editor(
        ng-class="{disabled: required && !markdown.length}"
        tg-loading="saving"
        href="#",
        ng-click="save($event)"
    )
        tg-svg(svg-icon="icon-save")
    a.e2e-cancel-editor(
        href="#",
        ng-click="cancelWithConfirmation($event)"
        title="{{ 'COMMON.CANCEL' | translate }}"
    )
        tg-svg(svg-icon="icon-close")
    //- 下面是添加部分
    label(style="cursor:pointer;")
        tg-svg(svg-icon="icon-upload")
        input(type="file" tg-file-change="upload(files)" style="display:none;")
```

`app\modules\components\wysiwyg\wysiwyg.directive.coffee`里添加一个upload方法。也就是上面tg-file-change事件注册的函数。

```coffee
$scope.upload = (files) ->
    $scope.mode = 'markdown'
    ## 不清楚这个editableBlur有什么用，但感觉添加了之后读取文件后页面刷新快一点
    mediumInstance.trigger('editableBlur', {}, editorMedium[0])
    if window.FileReader
        file = files[0]
        reader = new FileReader
        reader.onload = () ->
            $scope.markdown = @result
            ## 不清楚这个editableBlur有什么用，但感觉添加了之后读取文件后页面刷新快一点
            mediumInstance.trigger('editableBlur', {}, editorMedium[0])

        reader.readAsText(file)
    else
        alert('浏览器不支持读取本地文件')
```

上面的这个wysiwyg.directive.coffee，就定义了一个tgWysiwyg组件，这个组件在`app\partials\wiki\wiki.jade`里使用了，标签名是`tg-wiki-wysiwyg`。wysiwyg-toolbar.jade是这个组件的模板，在wysiwyg.directive.coffee里可以看到`templateUrl: "common/components/wysiwyg-toolbar.html"`，这个就是定义使用的模板的地方(最后是编译成html并且缓存在templates.js里读取的)。