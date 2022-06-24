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
12. `echo 'export all_proxy="socks5://127.0.0.1:4780"' >> /home/hexh/.bashrc`
13. `echo 'export http_proxy="socks5://127.0.0.1:4780"' >> /home/hexh/.bashrc`
14. `echo 'export https_proxy="socks5://127.0.0.1:4780"' >> /home/hexh/.bashrc`
13. `source ~/.bashrc`
