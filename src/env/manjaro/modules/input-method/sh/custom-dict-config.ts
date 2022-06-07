const _dictSpChar = "*hexh-dict*";

const _config = `
#!/bin/bash
DICT_IDS=(
  "11640"
  "11377"
  "11826"
  "11817"
  "4"
  "4504"
)
DICT_NAMES=(
  "搜狗标准词库" # 11640
  "搜狗标准大词库" # 11377
  "搜狗精选词库" # 11826
  "搜狗万能词库" # 11817
  "网络流行新词【官方推荐】" # 4
  "粤语小词库" # 4504
)
DICT_SHORTS=(
  "hexh-dict.sougoubiaozhunciku" # 搜狗标准词库
  "hexh-dict.sougoubiaozhundaciku" # 搜狗标准大词库
  "hexh-dict.sougoujingxuanciku" # 搜狗精选词库
  "hexh-dict.sougouwannengciku" # 搜狗万能词库
  "hexh-dict.wangluoliuxingxinci" # 网络流行新词【官方推荐】
  "hexh-dict.yueyuxiaociku" # 粤语小词库
)
DICT_PREFIX="luna_pinyin"
DICT_MASTER_NAME="custom"
COPY="$HOME/.config/fcitx/rime"
HOOK_AFTER="rime_deployer --build $COPY /usr/share/rime-data $HOME/.config/fcitx/rime/build"
SP_CHAR="${_dictSpChar}"
`;

export const dictSpChar = _dictSpChar;
export const customDictConfig = _config;
