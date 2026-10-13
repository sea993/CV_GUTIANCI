# 谷天赐个人学术主页

完整中英文学术主页，以谷天赐提供的最新版简历为内容来源。

**公开网址：** https://sea993.github.io/CV_GUTIANCI/

## 功能

- 中文和English切换，语言选择保存在浏览器，并支持`?lang=en`直达。
- 个人简介、教育经历、学术成果、科研项目、奖励荣誉及经历与服务分别使用独立页面。首页采用照片与联系信息侧栏、分段介绍、研究兴趣及近期动态。五个栏目在标题下显示一条概括核心两点的主旨句，详细指标、教育成绩和简写的研究技能集中在`cv.html`。
- 完整的教育经历、27条公开论文记录、15项科研项目、23项奖励、研究技能及经历与服务。
- 论文按作者角色或发表状态筛选，并可检索中英文题名、作者和期刊。
- Word简历下载；打印或保存当前语言的完整简历为PDF。网页和下载副本的邮箱统一为`gutc@mail.bnu.edu.cn`。
- 适配电脑、平板和手机，支持键盘操作与减少动态效果设置。

## 更新内容

1. 编辑`assets/content.json`里的`zh`（中文）和`en`（英文）内容。
2. 运行`python tools/sync_content.py`，再运行`python tools/build_pages.py`，同步浏览器内容和共享资源版本。页面导航、脚本及下载地址带有版本参数，避免浏览器沿用撤下条目前的旧缓存。
3. 更新照片时替换`assets/portrait.jpeg`；更新下载文件时替换`assets/tianci-gu-cv.docx`。
4. 提交并推送到`main`，GitHub Pages自动更新。

文中论文状态、经费、年份及期刊信息取自所提供简历。个人简介和研究计划依据谷天赐补充的文字整理，统一使用第三人称。引用指标采用谷天赐提供的2026年10月12日Google Scholar数据：总引用1169次，2021年至今1165次，h指数20，i10指数26；不据此推断成果收录总数。Google Scholar个人资料链接由谷天赐提供。下载的Word副本已同步导师职称、邮箱及奖项删除，并移除作者要求撤下的论文，网页指标单独更新，用户原始文件未被改写。

公开论文数据包含26篇已发表论文和1篇已录用论文。在审论文不写入当前公开的JSON、浏览器数据或下载简历；另有1篇已发表论文按作者要求撤下。恢复任何撤下条目前应由作者明确提供公开授权。

修改时应同步更新相关中英文条目。论文列表优先展示原文题名；英文界面为中文论文附上阅读辅助翻译。检索同时匹配中英文题名。期刊分区、影响因子及个人贡献描述不在页面中展示。

个人简介依据2026年10月13日补充的材料分为个人背景、学术成果、项目与政策建议、研究路径、后续计划五段，并同步英文版本及网页完整简历。籍贯更新为山东巨野。用户确认继续使用1169次引用、h指数20，省略成果收录总数。`pageSummaries`保存五个栏目的中英文主旨句，分别概括教育背景与博士阶段、研究主题与成果期刊、主持与参与项目、国家级与校院级荣誉、学生学术服务与政策建议。

项目和奖励的`displayTitle`及日期用于简洁展示；原始`text`保留来源信息。完整简历保留项目经费和承担工作。博士期间的校内奖励补全北京师范大学及相应学部、学院名称，不依据网络信息新增未经证实的个人获奖事实。

官方名称核对参考：[第九届研究生学术能力竞赛及二等奖名单](https://geo.bnu.edu.cn/xwzx/5c952ac9b7264176ba3bf575afb67eea.html)、[地理科学学部第五届微党课大赛](https://geo.bnu.edu.cn/xwzx/79291516e7184292a8e555700ae85de8.html)、[2025年学术年会通知中的个人简介](https://geo.bnu.edu.cn/tzgg/5480204dbde34811ad1b1cc280ff4a01.html)。微党课公告用于核对赛事名称，获奖等级沿用用户简历；未查到个人公开获奖记录的条目也沿用简历，不推测等级或年份。

页面共用`assets/app.js`及`assets/style.css`。修改共同页面结构后，运行`python tools/build_pages.py`重新生成HTML文件。原来的栏目书签（如`?lang=zh#projects`）会转到对应独立页面，旧的`skills.html`会转到完整简历中的技能部分。

## 本地预览

在项目文件夹运行`python -m http.server 8765 --bind 127.0.0.1`，然后访问 http://127.0.0.1:8765/ 。网站不需要安装前端依赖或进行框架构建。

内容检查：`node --test tests/content.test.cjs`。浏览器检查：在本地预览运行时，使用安装了Playwright的Node环境运行`node tests/browser_smoke.cjs`；可通过`PLAYWRIGHT_MODULE_PATH`指定模块位置，通过`BROWSER_CHANNEL=msedge`使用Microsoft Edge。检查覆盖七个页面、中英文、论文检索、简历下载、打印、旧链接转跳及六种屏幕宽度。

## GitHub Pages设置

仓库的`Settings → Pages → Build and deployment`：

- Source：`Deploy from a branch`
- Branch：`main`
- Folder：`/(root)`

仓库根目录的`.nojekyll`用于直接发布静态文件。

## 设计参考

- [Academic Pages](https://github.com/academicpages/academicpages.github.io)：参考内容与版式分离、学术栏目和论文条目的组织方式。
- [Zhen Zhang的学术主页](https://gis-zhangzhen.github.io/)：参考个人信息侧栏、简短介绍、近期动态及研究图像与论文配对的组织方式，全部个人内容依据谷天赐的材料重新编写。
- [al-folio](https://github.com/alshedivat/al-folio)：参考出版记录分类和论文检索交互。
- [Nature](https://www.nature.com/)：参考编辑式标题层级、简洁版面与细分隔线。

字体分为三种用途：Georgia用于主要英文标题，Microsoft YaHei用于中文，Segoe UI用于英文正文、导航、控件和数字。强调色`#004DA3`取自用户提供的北京师范大学校徽图片主色。页面不设置重复的个人信息页脚。

本项目采用独立HTML、CSS和JavaScript实现；未使用上述项目的模板文件或Nature商标。

新增的视觉元素包括用户提供的北京师范大学校徽、项目内编写的语义图标，以及作者亲自指定的三篇论文图形摘要。`assets/research/people-oriented-urbanization-ga.jpg`用于以人为本城镇化论文，`cropland-footprint-ga.png`用于食物消费耕地足迹论文，`landscape-ecosystem-health-ga.jpg`用于景观格局与生态系统健康论文。三张图片均按作者提供的文件原样复制，保持完整内容和原始比例，不裁剪或改色。首页研究选读同步使用以人为本城镇化论文的图形摘要。没有复制参考主页作者的论文图。

图片可以点击放大查看，论文标题及全文链接指向原文。新增图片配有中英文替代文本，手机上采用纵向排布。完整简历及打印版本保留紧凑的论文条目，不插入研究缩略图。
