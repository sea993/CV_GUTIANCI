# 谷天赐个人学术主页

完整中英文学术主页，以谷天赐提供的最新版简历为内容来源。

**公开网址：** https://sea993.github.io/CV_GUTIANCI/

## 功能

- 中文和English切换，语言选择保存在浏览器，并支持`?lang=en`直达。
- 个人简介、学术成果、科研项目、奖励荣誉及经历与服务分别使用独立页面。首页直接展示完整个人介绍、关键成果数字和精选成果入口；教育经历位于个人介绍下方，并在`cv.html`保留完整版本。手机端折叠联系信息，提供常驻的简介、成果和项目入口，以及完整导航菜单。
- 研究选读展示三篇论文及作者提供的图形摘要，并链接全部11篇精选成果。研究主题可以进入相关论文集合；可展开的研究图谱连接主题、公开论文和已确认的研究方法，支持鼠标与键盘操作，手机端提供论文列表。
- 学术成果页以环形图展示2025版中科院大类期刊分区，统计41篇已发表英文期刊论文：1区19篇、2区7篇、3区5篇、4区6篇、该版未列入3篇、尚未核实1篇。中文期刊论文4篇、已录用文章1篇和会议摘要2条不参与该分区统计。图环及标签均可筛选对应论文。项目概览按来源统计15个项目，可筛选主持、参与或项目来源。
- 完整的教育经历、48条公开成果记录、15项科研项目、23项奖励、研究技能及经历与服务。
- 学术成果页默认展示作者指定的11篇“精选成果”，可切换全部成果、作者角色、会议摘要或已录用论文，并检索中英文题名、作者和期刊。网页完整简历默认展示全部成果。
- 成果按第一及共同第一作者、通讯及共同通讯作者、导师一作本人二作、其他合作论文排列，会议摘要放在最后。各组内按期刊影响力及研究方向的相关性安排展示顺序，同一期刊较新的成果在前；Earth’s Future的耕地向高地扩张论文固定为通讯作者组首篇。此顺序用于个人主页展示，不作为定量期刊质量排名。
- Word简历下载；打印或保存当前语言的完整简历为PDF。网页和下载副本的邮箱统一为`gutc@mail.bnu.edu.cn`。
- 适配电脑、平板和手机，支持键盘操作与减少动态效果设置。

## 更新内容

1. 编辑`assets/content.json`里的`zh`（中文）和`en`（英文）内容。
2. 运行`python tools/sync_content.py`，再运行`python tools/build_pages.py`，同步浏览器内容和共享资源版本。页面导航、脚本及下载地址带有版本参数，避免浏览器沿用撤下条目前的旧缓存。
3. 更新照片时替换`assets/portrait.jpeg`；更新下载文件时替换`assets/tianci-gu-cv.docx`。
4. 提交并推送到`main`，GitHub Pages自动更新。

`researchThemes`定义研究主题，论文的`topics`支持多个主题；`researchMapPapers`只引用现有公开论文编号，`researchMethods`的论文关联须有论文原文或摘要依据。`methodsAndTools`列出实际使用的工具，不设置主观能力分数。项目的`role`区分主持与参与，`source`区分NSFC、国家重点研发课题、省部级、校级和委托项目。显示数量从共享内容生成，筛选条件保存到网址，支持分享、刷新、语言切换与浏览器返回。

英语导航与字段采用核对后的词表：Personal Profile、Publications、Research Projects、Honors and Awards、Academic Service and Experience、CV。期刊题名、作者顺序和官方论文原题名保持不变。MCM英文奖项暂用通用奖项描述，待核对证书中的COMAP等级后再补具体Designation。

`journalRankings`保存LetPub公开页面列出的2025年3月中科院期刊分区表大类分区与逐刊来源，2026年10月13日通过浏览器实际可见文字核对。网页提供可展开的统计口径与23种期刊的来源表，不混用小类分区、JCR分区或2026新锐分区。npj Heritage Science不借用更名前Heritage Science的分区；Environmental Science and Pollution Research的两篇论文与npj Heritage Science的一篇论文按该版未列入处理。Transactions in Earth, Environment, and Sustainability暂未核实分区，单独列出。网页查阅的是公开转载数据，未将其称为官方数据库核验。

文中论文状态、经费、年份及期刊信息取自所提供简历。个人简介和研究计划依据谷天赐补充的文字整理，统一使用第三人称。引用指标采用谷天赐提供的2026年10月12日Google Scholar数据：总引用1169次，2021年至今1165次，h指数20，i10指数26；不据此推断成果收录总数。Google Scholar个人资料链接由谷天赐提供。下载的Word副本已同步48条公开成果、引用指标、导师职称、邮箱、籍贯、项目数量和状态、奖励名称及简写的研究技能；删去旧的贡献、期刊分区和影响因子说明。用户原始文件未被改写。

网页公开数据包含45篇已发表期刊论文、1篇已录用论文及2篇EGU会议摘要，共48条。2026年10月13日依据作者提供的Google Scholar完整清单及4条中文论文信息补齐21条记录，包括按本次“补齐所有文章”要求恢复的已发表耕地破碎化论文。Google Scholar清单末尾的土壤保持服务记录与已有期刊论文重复，只保留一条；厦门大学学报论文已存在，也只保留一条。三篇在审稿件继续不写入公开数据、打印简历或下载副本。

新增题名、作者和年份以作者提供的清单为基础，已查到的DOI、页码与出版信息通过Crossref及期刊网站核对，未核实的卷期或链接留空。中文新增论文的英文题名用于辅助阅读，有期刊提供的英文题名时采用原文。会议摘要单独标记类型，可从“会议摘要”筛选查看，不计入期刊论文的作者角色筛选。网页完整简历、打印版本和Word下载均包含全部48条。Avian Research的鸟类多样性论文采用正式卷期年份2027、18(1)、100427，其DOI保留在线发表年份2026；Sustainable Cities and Society论文的英文题名保留出版方原文中的“non-shrinking cites”。

46条成果已核实DOI注册记录，网页直接展示可点击的DOI编号，并在新标签打开。已录用的城市化与生物多样性综述尚无DOI，标注“DOI待补充”。国土空间利用效率论文的期刊主页提供DOI `10.11870/cjlyzyyhj202601008`，但2026年10月13日DOI解析服务尚未激活，暂使用期刊主页链接，并将编号保存为`doiIdentifier`。期刊原文页面保存为`articleUrl`，题名检索地址保存为`searchUrl`，均不冒充可解析的DOI链接。

出版信息核对参考：[资源开发与市场的城镇化耦合协调论文](https://ztkb.cbpt.cnki.net/portal/journal/portal/client/paper/d4c5afb353534711bd8c93967b0de2c2)、[地理研究的全球生态系统健康论文](https://www.dlyj.ac.cn/CN/lexeme/showArticleByLexeme.do?articleID=73744)、[EGU25-6392](https://meetingorganizer.copernicus.org/EGU25/EGU25-6392.html)、[EGU25-5566](https://meetingorganizer.copernicus.org/EGU25/EGU25-5566.html)。其余已核实条目的原文链接保存于公开数据。

修改时应同步更新相关中英文条目。论文列表优先展示原文题名；英文界面为中文论文附上阅读辅助翻译。检索同时匹配中英文题名。期刊分区、影响因子及个人贡献描述不在页面中展示。

`publications`数组的顺序即网页展示顺序。新增成果应插入相应作者角色和期刊位置；精选、全部、作者筛选及网页完整简历均保留这个顺序，不再按年份混排。排序参考[AGU期刊统计](https://www.agu.org/publications/authors/journals/journal-statistics)、[Nature Portfolio期刊指标](https://www.nature.com/npjheritagesci/journal-impact)等官方信息，并结合研究主线和作者指定优先级；网页不显示分值或影响因子。

个人简介依据2026年10月13日补充的材料分为个人背景、学术成果、项目与政策建议、研究路径、后续计划五段，并同步英文版本及网页完整简历。籍贯更新为山东巨野。用户确认继续使用1169次引用、h指数20，省略成果收录总数。`pageSummaries`保存五个栏目的中英文主旨句，分别概括教育背景与博士阶段、研究主题与成果期刊、主持与参与项目、国家级与校院级荣誉、学生学术服务与政策建议。

项目和奖励的`displayTitle`及日期用于简洁展示；原始`text`保留来源信息。完整简历保留项目经费和承担工作。博士期间的校内奖励补全北京师范大学及相应学部、学院名称，不依据网络信息新增未经证实的个人获奖事实。

2026年10月13日全站审查依据作者提供的材料、Crossref及期刊公开记录进行。北京市科技新星交叉合作课题20220484163由作者确认已结题，网页和下载简历同步修正；不变更其原有期限。论文链接注册核对、书目信息检查和浏览器验证分别进行，公开成果总数包含会议摘要及已录用记录，不等同于全部已发表期刊论文数。

官方名称核对参考：[第九届研究生学术能力竞赛及二等奖名单](https://geo.bnu.edu.cn/xwzx/5c952ac9b7264176ba3bf575afb67eea.html)、[地理科学学部第五届微党课大赛](https://geo.bnu.edu.cn/xwzx/79291516e7184292a8e555700ae85de8.html)、[2025年学术年会通知中的个人简介](https://geo.bnu.edu.cn/tzgg/5480204dbde34811ad1b1cc280ff4a01.html)。微党课公告用于核对赛事名称，获奖等级沿用用户简历；未查到个人公开获奖记录的条目也沿用简历，不推测等级或年份。

页面共用`assets/app.js`及`assets/style.css`。修改共同页面结构后，运行`python tools/build_pages.py`重新生成HTML文件。原来的栏目书签（如`?lang=zh#projects`）会转到对应独立页面；旧的`education.html`转到首页教育经历，首页`#education`直接定位教育部分，`cv.html#education`继续定位完整简历中的教育经历，`skills.html`会转到简历技能部分，均保留所选语言。

## 本地预览

在项目文件夹运行`python -m http.server 8765 --bind 127.0.0.1`，然后访问 http://127.0.0.1:8765/ 。网站不需要安装前端依赖或进行框架构建。

内容检查：`node --test tests/content.test.cjs`。浏览器检查：在本地预览运行时，使用安装了Playwright的Node环境运行`node tests/browser_smoke.cjs`；可通过`PLAYWRIGHT_MODULE_PATH`指定模块位置，通过`BROWSER_CHANNEL=msedge`使用Microsoft Edge。检查覆盖六个页面、中英文、论文检索、简历下载、打印、旧链接转跳及六种屏幕宽度。

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

字体分为三种用途：Georgia用于主要英文标题，Microsoft YaHei用于中文，Segoe UI用于英文正文、导航、控件和数字。强调色`#004DA3`取自用户提供的北京师范大学校徽图片主色。页底参考张震主页的站点入口与署名布局，提供邮箱、学术主页、成果及简历导航、仓库链接和返回顶部入口；背景为浅蓝灰色，中英文随页面切换，简历打印时隐藏。

本项目采用独立HTML、CSS和JavaScript实现；未使用上述项目的模板文件或Nature商标。

新增的视觉元素包括用户提供的北京师范大学校徽、项目内编写的语义图标，以及作者亲自指定的三篇论文图形摘要。`assets/research/people-oriented-urbanization-ga.jpg`用于以人为本城镇化论文，`cropland-footprint-ga.png`用于食物消费耕地足迹论文，`landscape-ecosystem-health-ga.jpg`用于景观格局与生态系统健康论文。三张图片均按作者提供的文件原样复制，保持完整内容和原始比例，不裁剪或改色。首页研究选读同步展示这三张图。没有复制参考主页作者的论文图。

图片可以点击放大查看，论文标题及全文链接指向原文。新增图片配有中英文替代文本，手机上采用纵向排布。完整简历及打印版本保留紧凑的论文条目，不插入研究缩略图。
