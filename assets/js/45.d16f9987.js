(window.webpackJsonp=window.webpackJsonp||[]).push([[45],{466:function(s,t,a){"use strict";a.r(t);var r=a(2),e=Object(r.a)({},(function(){var s=this,t=s._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("h2",{attrs:{id:"初步搭建"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#初步搭建"}},[s._v("#")]),s._v(" 初步搭建")]),s._v(" "),t("p",[t("a",{attrs:{href:"https://vuejs.press/zh/guide/getting-started.html",target:"_blank",rel:"noopener noreferrer"}},[s._v("Vuepress官网-快速上手"),t("OutboundLink")],1)]),s._v(" "),t("h2",{attrs:{id:"基本配置"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#基本配置"}},[s._v("#")]),s._v(" 基本配置")]),s._v(" "),t("p",[s._v("在docs目录下创建.vuepress目录，并在.vuepress下添加config.js文件，内容是：")]),s._v(" "),t("div",{staticClass:"language-js :collapsed-lines=10 line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-js"}},[t("code",[s._v("module"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("exports "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 添加标题和描述")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token literal-property property"}},[s._v("title")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"MY BLOG"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token literal-property property"}},[s._v("description")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"description of my blog"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token literal-property property"}},[s._v("themeConfig")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 顶部导航栏")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token literal-property property"}},[s._v("nav")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token literal-property property"}},[s._v("text")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"首页"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token literal-property property"}},[s._v("link")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"/"')]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token literal-property property"}},[s._v("text")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"CSDN"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token literal-property property"}},[s._v("link")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('""')]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token literal-property property"}},[s._v("text")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Github"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token literal-property property"}},[s._v("link")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('""')]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 侧边栏")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token literal-property property"}},[s._v("sidebar")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v(" \n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br"),t("span",{staticClass:"line-number"},[s._v("12")]),t("br"),t("span",{staticClass:"line-number"},[s._v("13")]),t("br"),t("span",{staticClass:"line-number"},[s._v("14")]),t("br"),t("span",{staticClass:"line-number"},[s._v("15")]),t("br")])]),t("p",[s._v("这样我们就有一个有模有样的主页模板了！")]),s._v(" "),t("h2",{attrs:{id:"页面部署"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#页面部署"}},[s._v("#")]),s._v(" 页面部署")]),s._v(" "),t("p",[s._v("部署到 GithubPages")]),s._v(" "),t("p",[t("a",{attrs:{href:"https://vuejs.press/zh/guide/deployment.html",target:"_blank",rel:"noopener noreferrer"}},[s._v("Vuepress官网-部署"),t("OutboundLink")],1)]),s._v(" "),t("p",[s._v("在项目 vuepress-starter 目录下建立一个脚本文件：deploy.sh，注意修改一下对应的用户名和仓库名：")]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token shebang important"}},[s._v("#!/usr/bin/env sh")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 确保脚本抛出遇到的错误")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("set")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-e")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 生成静态文件")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("npm")]),s._v(" run docs:build\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 进入生成的文件夹")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("cd")]),s._v(" docs/.vuepress/dist\n\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" init\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("add")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-A")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" commit "),t("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-m")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'deploy'")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 如果发布到 https://<USERNAME>.github.io/<REPO>")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" push "),t("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-f")]),s._v(" git@github.com:yourname/yourrepository.git main:gh-pages\n\n"),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("cd")]),s._v(" -\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br"),t("span",{staticClass:"line-number"},[s._v("12")]),t("br"),t("span",{staticClass:"line-number"},[s._v("13")]),t("br"),t("span",{staticClass:"line-number"},[s._v("14")]),t("br"),t("span",{staticClass:"line-number"},[s._v("15")]),t("br"),t("span",{staticClass:"line-number"},[s._v("16")]),t("br"),t("span",{staticClass:"line-number"},[s._v("17")]),t("br"),t("span",{staticClass:"line-number"},[s._v("18")]),t("br"),t("span",{staticClass:"line-number"},[s._v("19")]),t("br")])]),t("p",[s._v("然后命令行切换到 vuepress-starter 目录下，执行 sh deploy.sh，就会开始构建，然后提交到远程仓库，注意这里提交到了 gh-pages 分支，我们查看下对应仓库分支的代码：")]),s._v(" "),t("h2",{attrs:{id:"插件使用"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#插件使用"}},[s._v("#")]),s._v(" 插件使用")]),s._v(" "),t("h3",{attrs:{id:"修改颜色"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#修改颜色"}},[s._v("#")]),s._v(" 修改颜色")]),s._v(" "),t("p",[s._v("创建.vuepress/styles/palette.styl文件，文件代码如下：")]),s._v(" "),t("div",{staticClass:"language-styl line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-styl"}},[t("code",[t("span",{pre:!0,attrs:{class:"token variable-declaration"}},[t("span",{pre:!0,attrs:{class:"token variable"}},[s._v("$accentColor")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token hexcode"}},[s._v("#3178c6")])]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("h3",{attrs:{id:"侧边栏自动生成"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#侧边栏自动生成"}},[s._v("#")]),s._v(" "),t("a",{attrs:{href:"https://github.com/YuArtian/vuepress-auto-sidebar-script",target:"_blank",rel:"noopener noreferrer"}},[s._v("侧边栏自动生成"),t("OutboundLink")],1)]),s._v(" "),t("h3",{attrs:{id:"katex数学公式支持"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#katex数学公式支持"}},[s._v("#")]),s._v(" "),t("a",{attrs:{href:"https://github.com/maginapp/vuepress-plugin-katex",target:"_blank",rel:"noopener noreferrer"}},[s._v("katex数学公式支持"),t("OutboundLink")],1)]),s._v(" "),t("h3",{attrs:{id:"代码复制"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#代码复制"}},[s._v("#")]),s._v(" "),t("a",{attrs:{href:"https://github.com/raomaiping/vuepress-plugin-copy-copyright",target:"_blank",rel:"noopener noreferrer"}},[s._v("代码复制"),t("OutboundLink")],1)]),s._v(" "),t("h3",{attrs:{id:"代码行号"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#代码行号"}},[s._v("#")]),s._v(" 代码行号")]),s._v(" "),t("div",{staticClass:"language-js line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-js"}},[t("code",[s._v("module"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("exports "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token literal-property property"}},[s._v("markdown")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token literal-property property"}},[s._v("lineNumbers")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token boolean"}},[s._v("true")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br")])]),t("h3",{attrs:{id:"代码折叠"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#代码折叠"}},[s._v("#")]),s._v(" 代码折叠")]),s._v(" "),t("p",[s._v("正在写:)")]),s._v(" "),t("h3",{attrs:{id:"导航栏图标"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#导航栏图标"}},[s._v("#")]),s._v(" 导航栏图标：")]),s._v(" "),t("p",[s._v("我没配置呀？为啥自动给我使用github头像了？怪事")]),s._v(" "),t("h2",{attrs:{id:"参考文献"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#参考文献"}},[s._v("#")]),s._v(" 参考文献")]),s._v(" "),t("p",[t("a",{attrs:{href:"https://theme-hope.vuejs.press/zh/get-started/",target:"_blank",rel:"noopener noreferrer"}},[s._v("Vuepress-Get Started"),t("OutboundLink")],1)]),s._v(" "),t("p",[t("a",{attrs:{href:"https://blog.csdn.net/qq_52395343/article/details/142761549",target:"_blank",rel:"noopener noreferrer"}},[s._v("白桃与猫的CSDN博客"),t("OutboundLink")],1)]),s._v(" "),t("p",[t("a",{attrs:{href:"https://github.com/mqyqingfeng/Blog/issues/235",target:"_blank",rel:"noopener noreferrer"}},[s._v("冴羽的博客"),t("OutboundLink")],1)])])}),[],!1,null,null,null);t.default=e.exports}}]);