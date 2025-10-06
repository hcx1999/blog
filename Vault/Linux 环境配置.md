# 环境配置
## 磁盘操作
#### ls 命令
列出当前工作目录下的所有文件/文件夹的名称
`ls -l`显示字节大小
`ls- lh`会以KB、MB等为单位进行显示更加直观
#### tree命令
`sudo apt install tree`
`tree -d`显示目录名称而非内容
#### du命令
查看当前目录和子目录文件夹/文件大小情况
du = disk usage 磁盘使用率，输出每个文件或者目录总大小
`du -h`以高可读方式打印。
`du -sh`当前目录总大小
`du -sh *`子目录大小
#### df命令
df = disk free，命令用于显示磁盘分区上的可使用的磁盘空间。默认显示单位为KB。可以利用该命令来获取硬盘被占用了多少空间，目前还剩下多少空间等信息
`df -h`以可读性高的结果展示磁盘分区上的可使用的磁盘空间
## 文件传输
#### ssh连接尝试
```
ssh -i ~/.ssh/cloud_key 用户名@内网IP
```
#### scp
##### 使用密钥传输：
```
scp -i ~/.ssh/cloud_key -r ./filedir 用户名@内网IP:~
```
##### 直接传输：
```
scp -r ./filedir 用户名@内网IP:~
```
#### sftp
##### 登录：
```
sftp -i ~/.ssh/cloud_key 用户名@内网IP
```
##### 使用：
```
put -r dir1 dir2
get -r dir1 dir2
ls
```
## 虚拟环境
### Conda
#### 安装
使用清华镜像安装miniconda
```
wget https://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
```
##### 创建
```
conda create -n [环境名称] python=[版本号]
```
##### 复制
```
conda create -n newEnv --clone oldEnv
```
##### 激活
```
conda acitvate [环境名称]
```
##### 退出
```
conda deactivate
```
##### 删除
```
conda remove -n [环境名称] --all
```
##### 查看状态
```
conda env list
conda info -e
```
##### 与终端的兼容性
如果同时使用了zsh，把这段代码添加到`~/.zshrc`中：
```bash
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
   # >>> conda init >>>
   # !! Contents within this block are managed by 'conda init' !!
   __conda_setup="$(CONDA_REPORT_ERRORS=false '/home/debian/miniconda3/bin/conda' shell.bash hook 2> /dev/null)"
   if [ $? -eq 0 ]; then
       \eval "$__conda_setup"
   else
       if [ -f "/home/debian/miniconda3/etc/profile.d/conda.sh" ]; then
           . "/home/debian/miniconda3/etc/profile.d/conda.sh"
           CONDA_CHANGEPS1=false conda activate base
       else
           \export PATH="/home/debian/miniconda3/bin:$PATH"
       fi
   fi
   unset __conda_setup
   # <<< conda init <<<
```
#### 与win11中zsh的兼容性问题：
[一个有效的解决方案](https://hlsvillager.icu/2024/09/10/a-problem-in-windows-conda-zsh/))
```bash
export PYTHONIOENCODING=UTF-8
export CONDA_EXE="$(cygpath 'C:\Users\16534\miniconda3\Scripts\conda.exe')"
export _CE_M=''
export _CE_CONDA=''
export CONDA_PYTHON_EXE="$(cygpath 'C:\Users\16534\miniconda3\python.exe')"
# Copyright (C) 2012 Anaconda, Inc
# SPDX-License-Identifier: BSD-3-Clause
__conda_exe() (
    "$CONDA_EXE" $_CE_M $_CE_CONDA "$@" | tr -d '\r'
)
__conda_hashr() {
    if [ -n "${ZSH_VERSION:+x}" ]; then
        \rehash
    elif [ -n "${POSH_VERSION:+x}" ]; then
        :  # pass
    else
        \hash -r
    fi
}
__conda_activate() {
    if [ -n "${CONDA_PS1_BACKUP:+x}" ]; then
        # Handle transition from shell activated with conda <= 4.3 to a subsequent activation
        # after conda updated to >= 4.4. See issue #6173.
        PS1="$CONDA_PS1_BACKUP"
        \unset CONDA_PS1_BACKUP
    fi
    \local ask_conda
    ask_conda="$(PS1="${PS1:-}" __conda_exe shell.posix "$@")" || \return
    \eval "$ask_conda"
    __conda_hashr
}
__conda_reactivate() {
    \local ask_conda
    ask_conda="$(PS1="${PS1:-}" __conda_exe shell.posix reactivate)" || \return
    \eval "$ask_conda"
    __conda_hashr
}
conda() {
    \local cmd="${1-__missing__}"
    case "$cmd" in
        activate|deactivate)
            __conda_activate "$@"
            ;;
        install|update|upgrade|remove|uninstall)
            __conda_exe "$@" || \return
            __conda_reactivate
            ;;
        *)
            __conda_exe "$@"
            ;;
    esac
}
if [ -z "${CONDA_SHLVL+x}" ]; then
    \export CONDA_SHLVL=0
    # In dev-mode CONDA_EXE is python.exe and on Windows
    # it is in a different relative location to condabin.
    if [ -n "${_CE_CONDA:+x}" ] && [ -n "${WINDIR+x}" ]; then
        PATH="$(\dirname "$CONDA_EXE")/condabin${PATH:+":${PATH}"}"
    else
        PATH="$(\dirname "$(\dirname "$CONDA_EXE")")/condabin${PATH:+":${PATH}"}"
    fi
    \export PATH
    # We're not allowing PS1 to be unbound. It must at least be set.
    # However, we're not exporting it, which can cause problems when starting a second shell
    # via a first shell (i.e. starting zsh from bash).
    if [ -z "${PS1+x}" ]; then
        PS1=
    fi
fi
conda activate base
```
在`.zshrc`中添加：
```bash
# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
if [ -f '/c/Users/16534/miniconda3/Scripts/conda.exe' ]; then
    export PYTHONIOENCODING=UTF-8
    source ~/conda-shell-zsh-hook.zsh
fi
if [ -f "~/miniconda3/etc/profile.d/mamba.sh" ]; then
    . "~/miniconda3/etc/profile.d/mamba.sh
fi
# <<< conda initialize <<<
```
### Python venv
python 3.6及以上自带，python 3.5及以下使用`sudo apt install python3-venv`安装。
#### 创建
```
source ./test_env/bin/activate
```
#### 启动
##### linux
```
source ./test_env/bin/activate
```
##### windows
```
.\test_env\Scripts\Activate.ps1
```
#### 退出
```
deactivate
```
## 进程管理
#### jobs
仅显示当前终端的后台作业
#### ps
Linux ps （英文全拼：process status）命令用于显示当前进程的状态，类似于 windows 的任务管理器。
- `ps aux`：显示所有进程的详细状态。
- `ps -ef | grep <pattern>`：使用`grep`命令过滤特定模式的进程。
- `ps -u <username>`：显示指定用户的进程。
- `ps -o args=`：显示完整的命令行参数。
- `ps aux --sort=-%cpu`：按CPU使用率降序显示进程。
- `ps aux --sort=-%mem`：按内存使用率降序显示进程。
#### 脱离终端
```
nohup python cifar10_cnn_torch.py > output.log 2>&1 &
```
1. **`nohup`**:
    - 表示 "no hang up"。
    - 这个命令可以让程序在终端关闭后继续运行，避免因终端断开连接而导致程序中断。
2. **`> output.log`**:
    - 将程序的标准输出（`stdout`）重定向到文件 `output.log` 中。
    - 这样可以保存程序运行时的日志信息，方便后续查看。
3. **`2>&1`**:
    - 将标准错误输出（`stderr`）重定向到标准输出（`stdout`）。
    - 这样，所有的错误信息也会被写入 `output.log` 文件中。
4. **`&`**:
    - 将命令放到后台运行。
    - 这样，终端会立即返回控制权，而程序会在后台继续运行。

可以通过`jobs`查看进程（仅限原终端）， `ps`来查看后台进程，通过`cat output.log`查看输出内容

*output.log中提示`nohup: ignoring input` 是正常行为，表示 `nohup` 忽略了标准输入。如果程序不需要输入，可以放心忽略这个提示。*
#### grep
Linux grep (global regular expression) 命令用于查找文件里符合条件的字符串或正则表达式。
grep 指令用于查找内容包含指定的范本样式的文件，如果发现某文件的内容符合所指定的范本样式，预设 grep 指令会把含有范本样式的那一列显示出来。若不指定任何文件名称，或是所给予的文件名为 -，则 grep 指令会从标准输入设备读取数据。
##### 语法
grep \[options] pattern \[files]
- pattern - 表示要查找的字符串或正则表达式。
- files - 表示要查找的文件名，可以同时查找多个文件，如果省略 files 参数，则默认从标准输入中读取数据。
**常用选项：**
- `-i`：忽略大小写进行匹配。
- `-v`：反向查找，只打印不匹配的行。
- `-n`：显示匹配行的行号。
- `-r`：递归查找子目录中的文件。
- `-l`：只打印匹配的文件名。
- `-c`：只打印匹配的行数。
**[更多][Linux grep 命令 | 菜鸟教程](https://www.runoob.com/linux/linux-comm-grep.html)()**
## 终端配置
此处以debian11为例
```bash
# 更新apt
sudo apt update
sudo apt upgrade

# 安装一些软件包
sudo apt install wget
sudo apt install git
sudo apt install vim

# 安装字体
git clone https://github.com/ryanoasis/nerd-fonts.git --depth 1
git clone https://gitee.com/chenheren/nerd-fonts.git --depth 1 # 无法使用github可以更换为gitee

# 配置字体
cd nerd-fonts
chmod +x install.sh
./install.sh

# 安装zsh, oh-my-zsh并设为默认
sudo apt install zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
chsh -s /usr/bin/zsh

# 安装powerlevel10k
cd ~/.oh-my-zsh/custom/plugins
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
git clone --depth=1 https://gitee.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k # gitee版本

# 安装zsh-syntax-highlighting插件
cd ~/.oh-my-zsh/custom/plugins/
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git
```
然后捣鼓一下`~/.zshrc`文件就可以了，我的是：
```bash
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="powerlevel10k/powerlevel10k"
plugins=(git zsh-syntax-highlighting sudo extract)
source $ZSH/oh-my-zsh.sh
```
完成。
## git和github
### git本地信任
```bash
//查看用户名
git config user.name
//查看邮箱地址
git config user.email

//修改用户名，xxx 处填写你的用户名
git config --global user.name "xxx"
//修改邮箱地址，xxx 处填写你的邮箱地址
git config --global user.email "xxx"
```
### git commit提交规范
```
feat: 新功能（feature）
fix: 修补bug
docs: 文档（documentation）
style: 格式（不影响代码运行的变动）
refactor: 重构（即不是新增功能，也不是修改bug的代码变动）
chore: 构建过程或辅助工具的变动
revert: 撤销，版本回退
perf: 性能优化
test：测试
improvement: 改进
build: 打包
ci: 持续集成
```