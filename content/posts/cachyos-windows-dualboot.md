---
title: "CachyOS + Windows 双系统需要知道的事"
date: 2026-09-29T15:30:00+08:00
draft: false
tags: ["CachyOS", "Linux", "双系统"]
summary: "btrfs 自动快照、limine 引导、共用的 NTFS Steam 库、安全启动和远程桌面：我这套 CachyOS + Windows 双系统的配置记录，以及踩过的几个坑。"
ShowToc: true
TocOpen: false
---

前些年我一直觉得 Linux 桌面没什么意思。功能和 UI 都偏简陋，个人 PC 上除了终端之外的部分用起来很不顺手，所以我常年只用没有 GUI 的 server 发行版，桌面该是 Windows 还是 Windows。改观来自 Steam Deck，首发抢到一台之后，SteamOS 把这套东西包装得能直接开箱玩游戏，才让我重新看了一遍 Linux 桌面生态。

真正让我动双系统念头的是显卡。CachyOS 的内核调度加上现在比较完备的 Mesa 驱动，A 卡在 Linux 上通过 Proton 跑部分 3A 游戏时，帧数和 1% low 帧表现甚至比原生 Windows 更稳。对用 A 卡玩游戏的人来说，这比折腾美化有说服力得多。

下面是这套双系统的安装和日常配置笔记，记一下自己实际踩过的几个问题。

## 安装

CachyOS 的安装器我几乎全程用的默认选项，用下来省了很多事。

文件系统用默认的 btrfs。装好后 `snapper`、`snap-pac` 和 `limine-snapper-sync` 都是现成的，装包、系统升级前后会自动打写时复制（CoW）增量快照，几乎不额外占空间，并自动同步进引导菜单。万一升挂了，重启进 Limine 菜单先从旧快照启动，确认系统没问题后再在系统里执行还原就行。

引导器同样用默认的 Limine，轻量，起得快。唯一要注意的是 `boot` / ESP 分区：有条件就别和 Windows 放在同一块物理硬盘上，避免 Windows 大版本更新重写引导时顺手把 Linux 引导冲掉。真被冲掉也别慌，btrfs 快照管不到 ESP，拿 U 盘进 CachyOS live 环境把 Limine 重装一遍就好，根分区里的数据还在。

桌面环境选默认的 KDE Plasma，功能全，Wayland 生态也比较成熟了。

## 先装个 AI agent

进系统后我做的第一件事是装个 AI agent：codex、opencode、dsh 都行。装完你会发现这台机器上值得交给它的事很多，AUR、fstab、驱动、输入法都能丢给它查和配。不想花钱就用 opencode，自带免费模型，日常够用。

CachyOS 默认 shell 是 `fish`，交代环境的时候记得把这点说清楚，`fish` 的配置文件路径和环境变量写法跟 `bash` 不一样。后面大部分系统配置我都交给 agent 跑命令，不过关键改动还是会自己核对一遍原理；涉及引导和磁盘固件的部分没让它碰，原因后面安全启动那节再说。

## 中文输入法

装 `fcitx5` 和 `fcitx5-chinese-addons`，配置前同样跟 agent 说清楚是 KDE Plasma Wayland + `fish`。

在 KDE Plasma Wayland 下，输入法由 KWin 通过 `text-input` 协议拉起：在系统设置里把「虚拟键盘」选成 `Fcitx 5`（同时确认没有再配一份 XDG 自启动以免冲突），原生 Wayland 应用就能正常打字。环境变量方面，只需要全局配好 `XMODIFIERS=@im=fcitx` 给 XWayland 老应用兜底；`GTK_IM_MODULE` 和 `QT_IM_MODULE` 现在反而不建议全局设置，强行指定会让原生 Wayland 应用绕开 `text-input` 协议，引发候选框错位或缩放异常，Fcitx5 启动时也会弹提醒建议删掉。真遇到个别 Electron 或老旧软件没反应，再单独给那个应用加启动参数（比如 Chromium/Electron 系的 `--enable-wayland-ime`）或局部环境变量就行，配完重新登录一次生效。

## 两个系统共用一个 Steam 库

游戏不想下两遍，就让 Windows 和 Linux 认领同一个 NTFS 分区上的 Steam 库。这部分不复杂，但有几个坑需要自己留意。

Linux 7.1（2026 年 6 月发布）合入了重写的新内核 NTFS 驱动，挂载时指定 `-t ntfs` 就能直接用上，不用再折腾旧的 `ntfs3` 或用户态 FUSE。手动测试挂载记得带上自己的 `uid` 和 `gid`，不然默认是 root 属主，Steam 写不进去：

```bash
sudo mount -t ntfs -o uid=1000,gid=1000 /dev/nvme1n1p3 /mnt/games
findmnt -o SOURCE,FSTYPE,TARGET /mnt/games
```

第二条命令是给自己看的。系统里如果留过 `ntfs-3g` 的 `mount.ntfs`，挂载有可能被劫持成 `fuseblk`，确认 `FSTYPE` 实际显示的是 `ntfs` 再往下配。开机自动挂载就往 `/etc/fstab` 里加一行，把 `uid`、`gid` 和挂载参数按当前内核补全即可。

挂载之后要照 Valve 的官方教程处理 Proton 兼容层目录：[https://github.com/ValveSoftware/Proton/wiki/Using-a-NTFS-disk-with-Linux-and-Windows](https://github.com/ValveSoftware/Proton/wiki/Using-a-NTFS-disk-with-Linux-and-Windows)。

核心做法是把 `compatdata` 放到原生 Linux 分区，再软链回 NTFS 盘。Wine prefix 不仅依赖 POSIX 权限和符号链接，里面还会生成带冒号（`:`）的路径（比如 `dosdevices/c:`），冒号在 Windows/NTFS 上属于非法字符，放过去容易直接报错（`Invalid argument`），甚至触发 Windows `chkdsk` 报磁盘异常：

```bash
mkdir -p ~/.steam-compatdata
# 如果 NTFS 盘上原先已经生成过 compatdata，先把内容迁到 ~/.steam-compatdata 并删掉原目录
# 必须确保 /mnt/games/steamapps/compatdata 不存在，再创建软链（否则会链接到目录里面去）
ln -s ~/.steam-compatdata /mnt/games/steamapps/compatdata
```

官方教程没提到的一点：`shadercache` 目录同样建议按这个办法软链到 Linux 分区，不然 Steam 在 Linux 下容易反复重新下载或编译着色器缓存。

Windows 那边还有两件事得先做。一是去控制面板的电源选项里取消「启用快速启动」，否则 Windows 关机时会把 NTFS 卷标记成休眠状态，Linux 只能按只读挂载，Steam 根本写不进去。二是确认游戏盘没开 BitLocker：被加密的分区虽然在 Linux 下也能靠额外工具解开，但没法直接通过常规挂载共享游戏库，平添麻烦。

## 安全启动

装 CachyOS 之前一般要先关掉安全启动，但 Windows 这边不少网游的反作弊强制要求开启，装完双系统后还是得配回来。

不同主板的固件界面差异挺大，华硕和微星的图文资料最多，搜自己的主板型号基本都能对上。这一步不建议丢给 agent，固件菜单里改动了什么只有自己眼睛看得到，照着 CachyOS 的官方文档来：[https://wiki.cachyos.org/configuration/secure_boot_setup/](https://wiki.cachyos.org/configuration/secure_boot_setup/) ，动手前把自己改过的每个选项记下来。

出问题后的恢复顺序：如果是安全启动配置失误导致进不去 CachyOS，先回 BIOS 把安全启动关掉，通常就能恢复开机；如果是 ESP 上的引导文件被冲掉，拿 U 盘进 live 环境把 Limine 引导补回来。btrfs 快照在这里只管得着根分区，能退掉改坏的系统配置，ESP 分区里的引导文件它无能为力。

## 远程桌面

试了一圈，目前还是 moonlight + sunshine 的组合延迟和画质最好，剪贴板共享交给 KDE Connect，各自做分内的事。

Sunshine 在 KDE Wayland 下有个需要注意的兼容问题：它默认走底层 KMS 捕获（`capture = kms`）直接抓 DRM 帧缓冲，而打开 QML/OpenGL 或全屏窗口时，KWin 会动态切换 DRM plane（例如 direct scan-out）和颜色管线，Sunshine 这边跟不上变化就容易出现画面异常或串流闪退。稳妥一点的绕法是在 `~/.config/sunshine/sunshine.conf` 里加一行：

```ini
capture = kwin
```

让它改走 KWin 自己的录屏管线，代价是 HDR 串流用不了；如果一定要保留 HDR，就得继续用 KMS 捕获（或者尝试加上 `KWIN_DRM_NO_DIRECT_SCANOUT=1` 这类环境变量缓解），并在少数场景下容忍异常或闪退。

别的方案我也试过。RustDesk 性能一般，无人值守的时候不够稳；KDE 自带的 KRdp 当时（9 月底）还不支持原生 UDP 传输，而且客户端一最小化画面就容易卡死。（注：KDE Plasma 6.8 已于 2026 年 10 月中旬发布，修掉了最小化冻结的 bug，但原生 UDP 支持和部分场景下最小化后画质变糊的问题依然存在。）所以目前桌面串流还是用 Sunshine 省心。

## 现状

这套双系统用下来日常需要操心的地方不多：升级有 btrfs 自动快照兜底，游戏库两头共用，远程串流和输入法也都在正常服役。
