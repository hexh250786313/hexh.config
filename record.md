1. `sudo systemctl enable vmtoolsd.service && sudo systemctl restart vmtoolsd.service`
2. `mkdir -p /home/hexh/desktop`
3. `git clone https://github.com/hexh250786313/hexh.config /home/hexh/desktop/hexh.config`
4. [ip](https://myip.ms/): `echo "185.199.108.133 raw.githubusercontent.com" | sudo tee -a /etc/hosts`
5. [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
6. `source ~/.bashrc`
7. `nvm install v16.10.0`
8. `npm install -g yarn`
9. `cd /home/hexh/desktop/hexh.config`
10. `yarn && npm link`
11. `hexh-config manjaro proxy`
12. `source ~/.bashrc`
13. `clash`
14. `firefox`
15. [clash](https://clash.razord.top/)
16. `hexh-config manjaro basic resetPacmanKey`
17. `hexh-config manjaro basic needed`
18. `yay -Syu --devel`
19. `hexh-config manjaro basic dkms`
20. `hexh-config manjaro git`
21. [gh ssh keys](https://github.com/settings/keys)
22. `ssh -T git@github.com`: input `yes`
23. `hexh-config manjaro git ln`
24. `hexh-config manjaro basic dotfiles`
25. `hexh-config manjaro zsh`
26. `sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"`
27. back to bash
28. `hexh-config manjaro zsh ln`
29. `hexh-config manjaro zsh colorls`
30. `zsh`
31. `rbenv shell 3.1.0 && rbenv global 3.1.0 && rbenv local 3.1.0`
32. `gem install colorls`
33. `hexh-config manjaro zsh fzf`: `~/.fzf/install`
34. `hexh-config manjaro proxy ln`
35. 重启
36. `sudo systemctl restart vmtoolsd.service`
37. `curl www.google.com.hk`
38. `hexh-config manjaro node`
39. `npm list -g --depth=0`
40. `hexh-config manjaro editor`
41. `hexh-config manjaro editor ln`
42. `hexh-config manjaro hosts`
43. `nvim`: `:TSInstall css scss json lua tsx javascript dot bash yaml vim markdown regex html jsdoc vue rust typescript python`
44. `nvim ~/.desktop/test.md`: `:CocCommand markdown-preview-enhanced.openKaTeXConfig`, `hexh-config manjaro editor latexConfig`
45. `:Copilot setup`, `cd /home/hexh/.local/share/nvim/site/pack/packer/opt/nvim-spectre/ && sh -c './build.sh'`
46. `hexh-config manjaro pamac config`
47. 重启
48. `hexh-config manjaro pamac flatpak`
49. `flatpak update`
50. `hexh-config manjaro pamac snap`
51. `hexh-config manjaro nutstore` 登录, ~/桌面/share
52. `hexh-config manjaro nutstore config`
53. `hexh-config manjaro nutstore clipman`: 同步路径 ~/.cache/xfce4/clipman
54. `hexh-config manjaro inputMethod`
55. `hexh-config manjaro tmux`
56. `hexh-config manjaro basic software`
57. `hexh-config manjaro system config`
58. `hexh-config manjaro system init`
59. `hexh-config manjaro system link`
60. 重启
61. 启动 vmware, 再 `hexh-config manjaro basic vmware`
62. 启动 code, 同步, 再执行 `Enable Monkey Patch`
63. `hexh-config manjaro howdy`
64. `src/env/manjaro/modules/howdy/config.ts` 改变设备路径, 然后
65. `hexh-config manjaro howdy config`
66. `hexh-config manjaro asus`: https://github.com/mohamed-badaoui/asus-touchpad-numpad-driver
67. `hexh-config basic samba`
68. 重启
