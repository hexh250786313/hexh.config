1. `sudo sh -c 'echo 0 > /proc/sys/vm/compaction_proactiveness' && cat /proc/sys/vm/compaction_proactiveness`
2. [20.04](https://releases.ubuntu.com/20.04/)
3. 最小安装 + 安装时更新
4. 输密码时选 wayland 进入
5. `echo "export https_proxy=http://192.168.199.116:4780" >> ~/.bashrc`
6. `echo "export http_proxy=http://192.168.199.116:4780" >> ~/.bashrc`
7. `echo 'Defaults env_keep += "*_proxy *_PROXY"' | sudo tee /etc/sudoers.d/05_proxy`
8. 重开终端: `sudo apt update`
9. `sudo apt upgrade`
10. `sudo apt remove open-vm-tools-desktop && sudo apt install open-vm-tools-desktop`
11. 重启
12. `sudo apt install git curl`
13. `git clone https://github.com/hexh250786313/hexh.config /home/hexh/桌面/hexh.config`
14. [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
15. `source ~/.bashrc`
16. `nvm install v16.17.0`
17. `npm install -g yarn`
18. `cd /home/hexh/桌面/hexh.config`
19. `yarn && npm link`
20. `firefox` 登录 同步
21. onetab / gnome shell / adblock / switchyomega
22. SwitchyOmega: https://dev.azure.com/hexuhua/f6126346-6e87-4d62-aa80-ff9b88293af0/_apis/git/repositories/ebd79495-5cbb-4565-8573-fa73ee451b5e/items?path=/SwitchyOmega/OmegaOptions.bak&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=main&resolveLfs=true&%24format=octetStream&api-version=5.0&download=true
23. `hexh-config vmUbuntu basic needed`
24. `hexh-config vmUbuntu basic dotfiles`
25. `hexh-config vmUbuntu zsh`
26. back to bash
27. `hexh-config vmUbuntu zsh ln`
28. `zsh`
29. 重启
30. `hexh-config vmUbuntu editor sublime`
31. https://community-packages.deepin.com/deepin/pool/main/d/deepin-elf-verify/
32. https://vpn.91jkys.com:8443/portal/#!/login
33. `sudo apt-get install chrome-gnome-shell`
34. `https://extensions.gnome.org/extension/1031/topicons/`
35. `sudo apt install gnome-tweak-tool`
36. `gnome-tweaks`
37. 图标居于右边并清除桌面图标
37. https://www.spark-app.store/download 先依赖再客户端, `proxy_unset`
38. `sudo apt --fix-broken install`
39. 设置 spark 的更新和面密
49. `editor /usr/share/applications/com.qq.weixin.spark.desktop`
50. `editor /usr/share/applications/com.qq.tim.spark.desktop`
51. https://alidocs.dingtalk.com/i/p/nb9XJlJ7QbxN8GyA/docs/ROGpvEna5YQWmaPgQ156W4ykmK3zoB27
52. https://shurufa.sogou.com/linux
53. `sudo subl /etc/environmen`
54. https://www.programminghunter.com/article/45992191624/
55. `sudo rm -rf /etc/xdg/autostart/com.alibabainc.dingtalk.desktop`
56. https://github.com/jesseduffield/lazygit#ubuntu
57. 复制 ssh keys: `ssh-keygen -t rsa -C "250786313@qq.com"`
58. 关机
59. 设置分享文件夹 desktop 和 workspace
60. 取消 alt+tab 快捷键
61. `git config --global oh-my-zsh.hide-info 1`
62. tinyproxy
63. [microsocks](https://github.com/rofl0r/microsocks): `sudo make && sudo make install`
