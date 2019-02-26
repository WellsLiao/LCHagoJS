# 贡献规范

## Git Commit 建议规范

### Angular 规范

```bash
  <type>(<scope>): <subject> #header
  // 空一行
  <body>
  // 空一行
  <footer>
```

> * `feat`：新功能（feature）
> * `fix`：修补bug
> * `docs`：文档（documentation）
> * `style`： 格式（不影响代码运行的变动）
> * `refactor`：重构（即不是新增功能，也不是修改bug的代码变动）
> * `perf`：性能改进
> * `test`：增加测试
> * `chore`：构建过程或辅助工具的变动

### type 建议规范

如果type为feat和fix，则该 commit 将肯定出现在 Change log 之中。

其他情况（docs、chore、style、refactor、test）由你决定，要不要放入 Change log，建议是不要。

### subject 建议规范

以动词开头，使用第一人称现在时，比如change，而不是changed或changes。

第一个字母小写，结尾不加句号（.）

-----------------------------------------------------------------

## Conventional Changelog 建议规范

1. Make changes
1. Commit those changes
1. Make sure Travis turns green
1. Bump version in `package.json`
1. `conventionalChangelog`
1. Commit `package.json` and `CHANGELOG.md` files
1. Tag
1. Push

The reason why you should commit and tag after `conventionalChangelog` is that the CHANGELOG should be included in the new release, hence `gitRawCommitsOpts.from` defaults to the latest semver tag.
