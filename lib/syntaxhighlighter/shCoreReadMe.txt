shCore.min是从官方下载的原版代码，其中的内容经过了压缩
shCore是未压缩的代码，也是从官网下载的，但经过了一些修改：
1. 官网版本中没有XRegExp对象，所以我从shCore.min中将这一部分代码拿过来了，所以代码还是压缩过的格式
2. 修改了1883行的代码。原来的代码在IE下使用会导致问题

所以现在shCore和shCore.min不是等价的，只能使用shCore

