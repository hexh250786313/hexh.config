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
