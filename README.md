# 谷天赐个人学术主页 · Tianci Gu

完整中英文学术主页，以本人提供的最新版简历为内容来源。

**公开网址：** https://sea993.github.io/CV_GUTIANCI/

## 功能

- 中文 / English切换，语言选择保存在浏览器，并支持`?lang=en`直达。
- 完整的教育经历、31条论文记录、15项科研项目、24项奖励、研究技能及经历与服务。
- 论文按作者角色或发表状态筛选，并可检索中英文题名、作者和期刊。
- 原始完整Word简历下载；打印或保存当前语言的完整简历为PDF。
- 适配电脑、平板和手机，支持键盘操作与减少动态效果设置。

## 更新内容

1. 编辑`assets/content.json`里的`zh`（中文）和`en`（英文）内容。
2. 运行`python tools/sync_content.py`，同步浏览器使用的内容。
3. 更新照片时替换`assets/portrait.jpeg`；更新下载文件时替换`assets/tianci-gu-cv.docx`。
4. 提交并推送到`main`，GitHub Pages自动更新。

文中论文状态、引用指标、经费、年份及期刊信息取自所提供简历；修改时应同步更新相关中英文条目。论文的中文题名是阅读辅助翻译，英文论文原题名保留。中文论文的英文题名同样为阅读辅助翻译。

## 本地预览

在项目文件夹运行`python -m http.server 8765 --bind 127.0.0.1`，然后访问 http://127.0.0.1:8765/ 。网站不需要安装前端依赖或进行框架构建。

## GitHub Pages设置

仓库的`Settings → Pages → Build and deployment`：

- Source：`Deploy from a branch`
- Branch：`main`
- Folder：`/(root)`

仓库根目录的`.nojekyll`用于直接发布静态文件。

## 设计参考

- [Academic Pages](https://github.com/academicpages/academicpages.github.io)：参考内容与版式分离、学术栏目和论文条目的组织方式。
- [al-folio](https://github.com/alshedivat/al-folio)：参考出版记录分类和论文检索交互。
- [Nature](https://www.nature.com/)：参考编辑式标题层级、黑白版面、细分隔线与克制的深红色强调。

本项目采用独立HTML、CSS和JavaScript实现；未使用上述项目的模板文件或Nature品牌资产。
