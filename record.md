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
13. `source ~/.bashrc`
14. `clash`
15. `firefox`
16. [clash](https://clash.razord.top/)
17. `hexh-config manjaro basic resetPacmanKey`
18. `hexh-config manjaro basic needed`
19. `yay -Syu --devel`
20. `hexh-config manjaro basic dkms`
21. `hexh-config manjaro git`
22. [gh ssh keys](https://github.com/settings/keys)
23. `ssh -T git@github.com`: input `yes`
24. `hexh-config manjaro basic dotfiles`
25. `hexh-config manjaro zsh`
27. `sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"`
28. back to bash
29. `hexh-config manjaro zsh ln`
30. `hexh-config manjaro zsh colorls`
31. `zsh`
32. `rbenv shell 3.1.0 && rbenv global 3.1.0 && rbenv local 3.1.0`
33. `gem install colorls`
34. `hexh-config manjaro zsh fzf`: `git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf ~/.fzf/install`
35. `hexh-config manjaro proxy ln`
36. 重启
37. `sudo systemctl restart vmtoolsd.service`
38. `curl www.google.com.hk`
