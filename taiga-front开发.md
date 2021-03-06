# taiga-front开发

原地址：https://github.com/taigaio/taiga-front

注意这个项目用的是angularjs而不是angular

## 最简单的部署方法

1. 装好sass(https://sass-lang.com/install)。在windows下先装chocolatey。这个步骤只要按照教程基本没问题。
2. 全局装gulp
3. 项目目录下安装其他依赖。这里主要是node-sass和gulp-sass的问题，要根据node版本来选择。node(v10.11.0)测试把node-sass改成(4.12.0)和gulp-sass改成(4.0.2)可以通过安装成功。
4. 修改api地址。把conf目录下的conf.example.json里的api地址和app-loader目录下的app-loader.coffee里的api地址改成(`http://ftp.joyutech.com:88/api/v1/`)或者(`https://api.taiga.io/api/v1`)，也就是现网和官方那个，原本是个loaclhost来的。不确定还有没有其他地方要改，打开前端看看请求是否正常就知道了。
5. gulp，然后打开(http://localhost:9001/)
6. 有个css加载的问题，下载这个文件(http://ftp.joyutech.com:88/v-1557327234628/styles/theme-taiga.css)，丢到gulp生成的dist/v-xxxxxxx/styles目录下。这个是gulp-scss-lint的问题，在gulpfile.js里把scss-lint的任务注释掉就好了。
7. `gulp deploy`时，模块gulp-imagemin有问题(node10下)，把它升级到6.0.0可以解决。

## 现网部署方法

### 首次部署步骤：

    参考文档(http://taigaio.github.io/taiga-doc/dist/setup-production.html)

1. 进入现网服务器的taiga目录，把taiga的部署工程拷贝下来：
```javascript
# cd /home/taiga
# git clone https://github.com/taigaio/taiga-front-dist.git taiga-front-dist
# cd taiga-front-dist
// 切换到stable分支
# git checkout stable
// 安装脚本运行所需要的node_module依赖库
# yarn
```

2. 编辑 dist.js 文件，修改如下：
```javascript
// 把脚本编译的工程指向我们自己的工程代码库
-var repo = 'https://github.com/taigaio/taiga-front';
+var repo = 'https://github.com/joyutech/taiga-front';

// npm install 安装容易出错，改为yarn
-return exec('cd ' + local + ' && npm install && gulp deploy');
+return exec('cd ' + local + ' && yarn && gulp deploy');

// 最后，还要把后面几步的git操作注释掉，不需要。
```

3. 执行 ./generate.sh 脚本编译工程，第一次执行因为要clone工程和安装node_module依赖库，所以会很慢。

4. 生成conf.json配置文件，并修改成自己需要的配置。如果没有conf.json，则会走默认配置。
```
cp dist/conf.example.json dist/conf.json
```

### 后续升级步骤：
1. taiga-front工程，在master分支修改并提交代码。再合并到stable分支。（记得push到github）
2. 登陆现网服务器，执行 ./generate.sh 脚本编译工程。
3. 执行 cp dist/conf.example.json dist/conf.json 命令。

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

### 简单的说明依赖注入

```coffee
# 来自app\coffee\modules\resources\wiki.coffee
resourceProvider = ($repo, $http, $urls) ->
# 中间省略
module.factory("$tgWikiResourcesProvider", ["$tgRepo", "$tgHttp", "$tgUrls", resourceProvider])
```

看上面这两行，resourceProvider的三个参数($repo, $http, $urls)，其实就是下面那行的这三个服务(可注入的不只是服务)的别称(`"$tgRepo", "$tgHttp", "$tgUrls"`)。而(`"$tgRepo", "$tgHttp", "$tgUrls"`)这三个服务，是在其他地方注册的。至于在哪个文件里，只能通过编辑器搜索这三个名字来找到了。下面列一下这个三个服务所在文件。

* $tgRepo：app\coffee\modules\base\repository.coffee
* $tgHttp：app\coffee\modules\base\http.coffee
* $tgUrls：app\coffee\modules\base\urls.coffee

通过class定义的service，也是一个道理，是通过@.$inject来定义依赖注入。下面这个constructor里的`@config`就是`$tgConfig`

```coffee
# 来自app\coffee\modules\base\urls.coffee
class UrlsService extends taiga.Service
    @.$inject = ["$tgConfig"]

    constructor: (@config) ->
        @.urls = {}
        @.mainUrl = @config.get("api")
```

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

### 访问后端API
api可以查看：http://taigaio.github.io/taiga-doc/dist/api.html

taiga把http访问后端的逻辑都封装了。不过看起来比较绕。下面对涉及到数据操作的文件进行介绍。先列出具体路径，后提及的时候只用文件名。

* app\coffee\modules\base\model.coffee：封装数据。利用getter和setter进行一些特殊处理。比如修改了一个属性的值，会标记这个model的哪个属性被修改过。
* app\coffee\modules\base\repository.coffee：和后端通讯。获取数据后，会在这里封装成对应的model。要修改数据，就把model传到这个模块的方法里，这里进行处理后对后端数据进行修改。
* app\coffee\modules\resources.coffee：这里定义了各个model对应的url。这里的url前面的key，就是各个model所使用的名字。
* app\coffee\modules\resources\wiki.coffee：这是一个具体的resource，会在resources.coffee里注册到总的resource里(也就是`$tgResources`)。
* app\coffee\modules\wiki\main.coffee：wiki页的代码。下面作为例子。
* app\coffee\modules\wiki\nav.coffee：wiki页的代码。下面作为例子。

例子如下：

wiki.coffee这个文件是一个service的工厂函数，注意它的返回，是一个函数，它把service用wiki这个key添加到instance里了，而这里的instance，其实就是下面提及的`$tgResources`

```coffee
# 来自 wiki.coffee
return (instance) ->
    instance.wiki = service
```

它是在resources.coffee的一下这段代码里注册到`$tgResources`的

```coffee
# 来自resources.coffee
initResources = ($log, $rs) ->
    $log.debug "Initialize resources"
    providers = _.toArray(arguments).slice(2)

    for provider in providers
        provider($rs)
```

注册好后，下面看看是怎么用wiki.coffee里的这个resource的。看main.coffee。里面的`@rs`，就是`$tgResources`的别名(依赖注入时起了别名，函数内部用的就是`@rs`)。这里使用的`getBySlug`函数，就是wiki.coffee里定义的那个。

```coffee
# 来自main.coffee
loadWiki: =>
    promise = @rs.wiki.getBySlug(@scope.projectId, @params.slug)
```

回头看看wiki.coffee的细节。下面的`$repo`就是repository.coffee定义的`$tgRepo`。`queryOne`这个方法查询数据后，封装成一个model返回(`queryOne`返回的是一个Promise，这里忽略这个细节)。然后页面代码里实际操作的，是这个封装后的model。

```coffee
# 来自 wiki.coffee
service.getBySlug = (projectId, slug) ->
    return $repo.queryOne("wiki", "by_slug?project=#{projectId}&slug=#{slug}")
```

另外，wiki.coffee里只定义了获取数据有关的方法。所以下面说明它是怎么修改后端数据的。事实上，它就是通过直接调用repository.coffee里的方法来和修改数据的。下面这段，就是直接调用remove这个方法来进行删除，注意这里是传入了一个model的。

```coffee
# 来自main.coffee
@repo.remove(@scope.wiki).then onSuccess, onError
```

举一个修改的例子。这个是修改wiki-link的标题。细节看下面注释了注意的两行。另外可以看看repository.coffee里save的逻辑。

```coffee
# 来自nav.coffee
$el.on "click", ".js-rename-link", (event) ->
    event.preventDefault()
    event.stopPropagation()
    target = angular.element(event.currentTarget)
    linkModel = $scope.wikiLinks[target.parents('.wiki-link').data('id')]
    linkId = linkModel.id
    linkTitle = linkModel.title

    newTitle = prompt('输入新名字', linkTitle)

    if newTitle && newTitle.trim() && newTitle != linkTitle
        linkModel.title = newTitle # 注意，这里修改了title后，因为它是个setter，model会记录这个title被修改过
        promise = $tgrepo.save(linkModel) # 注意，然后这里直接调save，细节的逻辑都是在save这个方法里了，它会把修改的title通过patch(默认)发到后端
        promise.then ->
            promise = $ctrl.loadWikiLinks()
            promise.then ->
                render($scope.wikiLinks)
        promise.then null, ->
            $confirm.notify("error")
```
