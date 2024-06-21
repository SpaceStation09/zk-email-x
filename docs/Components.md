# 项目组件简述

## pre 阶段

### zk-regex 生成正则电路

- [`twitter_regex.circom`](../circuits/twitter_regex.circom)

使用zk-email 提供的工具 zk-regex 生成了相关电路（见上）。使用的正则表达式：`email was meant for @([a-zA-Z0-9_]+)`

该电路会把email 原文作为input。至于output，会包含：正则匹配的结果，以及你在生成circuit的过程中，声明需要被reveal的部分。例如，在twitter 这个case中，我们会声明，我们需要reveal 邮件中需要被绑定的那个twitter username， 那么这个username 就会作为circuit的其中一个output。

### 生成input

按照zk-email的`EmailVerifier`的需求，我们需要提取邮件原始文件`xxx.eml`的信息作为zk电路的输入。此处我们使用zk-email 提供的工具库`@zk-email/helpers` 完成一个生成circuit input的脚本。

### 生成 witness

witness 实际上是zk proof生成过程中的私有输入， 我们也叫它见证。一种更容易理解的表达方式是：values of all the wires。

<blockquote>

**举例来说**:  

假设我们现在有一个函数 OUT = f(x) = (x1+x2) * x3 - x4, 函数输入为x1, x2, x3, x4。此时，我想用zkp 证明，我知道一些秘密（x1,x2,x3,x4）符合这个函数，以及这个函数的计算结果OUT，但不告诉你这个秘密是什么。那么，我们会有:  

- 函数输入：x1,x2,x3,x4
- y1 := x1 + x2
- y2 := y1 * x3
- OUT := y2 - x4

在这个case里，snark证明器的输入就会有： x1，x2，x3，x4，y1，y2，OUT。其中OUT为public input，其他的就是 private witness。

</blockquote>

### snarkjs SetUp

SetUp 过程中主要做两件事：

- 生成 proving key 和 verification key，实际上就是snarkjs 生成的`zkey`文件。
- 由可信的第三方产生一些随机数，然后调用setup的算法，产生一些公共的参数，以在prove 和 verify的过程中使用。

### 导出 Verification Key

将verification key 从`zkey` 文件中导出，以供后面verifier的单独使用。

## Prove 阶段

Prove 阶段需要证明方提供以下项目：

- witness
- proving key

然后会生成以下项目：

- `proof.json`：存储的是真正的proof
- `public.json`: 存储的是所有public input 和 output的值，以供后面verifier 验证使用。

## Verify 阶段

在node环境中，snarkjs 工具可以直接使用 verification key，proof 以及 `public.json` 来做验证。

但对于合约来说，我们需要使用snarkjs 先使用 proving key 生成一个合约版的verifier。验证时，需要传给合约的参数，可以有snarkjs和 `public.json`, `proof.json` 生成。

